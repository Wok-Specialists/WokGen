const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wok:wokpassword@localhost:5432/wokdb',
});

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const wsConnections = new client.Gauge({
  name: 'websocket_connections_total',
  help: 'Total number of WebSocket connections'
});
register.registerMetric(wsConnections);

const playersOnline = new client.Gauge({
  name: 'players_online',
  help: 'Number of players currently online'
});
register.registerMetric(playersOnline);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    websocket: wss.clients.size >= 0
  };
  
  try {
    await pool.query('SELECT 1');
    checks.database = true;
  } catch (err) {
    console.error('Database health check failed:', err.message);
  }
  
  try {
    await redis.ping();
    checks.redis = true;
  } catch (err) {
    console.error('Redis health check failed:', err.message);
  }
  
  const status = checks.database && checks.redis ? 200 : 503;
  res.status(status).json({
    status: status === 200 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Wok Central Game Backend',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api'
    }
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// GitHub OAuth
app.get('/api/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
  const scope = 'read:user';
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(githubAuthUrl);
});

app.get('/api/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const githubUser = userResponse.data;
    
    // Check if user exists in database
    let result = await pool.query('SELECT * FROM players WHERE github_id = $1', [githubUser.id]);
    let player;
    
    if (result.rows.length === 0) {
      // Create new player
      result = await pool.query(
        'INSERT INTO players (github_id, username, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [githubUser.id, githubUser.login, githubUser.email, githubUser.avatar_url]
      );
      player = result.rows[0];
    } else {
      player = result.rows[0];
      // Update last seen
      await pool.query('UPDATE players SET last_seen = CURRENT_TIMESTAMP WHERE id = $1', [player.id]);
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: player.id, username: player.username, github_id: player.github_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/game?token=${token}`);
  } catch (err) {
    console.error('GitHub auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Player profile
app.get('/api/player/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, created_at, last_seen, total_playtime, games_played, wins FROM players WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.username, p.avatar_url, l.score, l.game_mode, l.achieved_at
      FROM leaderboard l
      JOIN players p ON l.player_id = p.id
      ORDER BY l.score DESC
      LIMIT 100
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const totalPlayers = await pool.query('SELECT COUNT(*) FROM players');
    const totalGames = await pool.query('SELECT COUNT(*) FROM game_sessions');
    const onlineNow = Array.from(gameConnections.values()).filter(p => p.online).length;
    
    res.json({
      totalPlayers: parseInt(totalPlayers.rows[0].count),
      totalGames: parseInt(totalGames.rows[0].count),
      onlineNow,
      serverUptime: process.uptime()
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Game state management
let gameConnections = new Map();

wss.on('connection', async (ws, req) => {
  const playerId = uuidv4();
  ws.playerId = playerId;
  
  console.log(`Player ${playerId} connected`);
  wsConnections.inc();
  
  // Default player info
  let playerInfo = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    color: `0x${Math.floor(Math.random()*16777215).toString(16)}`,
    username: `Player_${playerId.substr(0, 6)}`,
    online: true
  };
  
  // Check for JWT token in query params
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const result = await pool.query('SELECT * FROM players WHERE id = $1', [decoded.id]);
      if (result.rows.length > 0) {
        const player = result.rows[0];
        playerInfo.username = player.username;
        playerInfo.avatar = player.avatar_url;
        playerInfo.authenticated = true;
      }
    } catch (err) {
      console.log('Invalid token, using guest player');
    }
  }
  
  gameConnections.set(playerId, { ...playerInfo, ws });
  playersOnline.set(gameConnections.size);
  
  // Send init to new player
  const allPlayers = {};
  gameConnections.forEach((info, id) => {
    if (id !== playerId) {
      allPlayers[id] = {
        x: info.x,
        y: info.y,
        color: info.color,
        username: info.username,
        avatar: info.avatar
      };
    }
  });
  
  ws.send(JSON.stringify({
    type: 'init',
    playerId,
    player: playerInfo,
    players: allPlayers
  }));
  
  // Notify others
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'newPlayer',
        playerId,
        player: playerInfo
      }));
    }
  });
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'move':
          const player = gameConnections.get(playerId);
          if (player) {
            player.x = data.x;
            player.y = data.y;
            
            // Broadcast to others
            wss.clients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'playerMoved',
                  playerId,
                  x: data.x,
                  y: data.y
                }));
              }
            });
          }
          break;
          
        case 'chat':
          // Broadcast chat to all players
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat',
                playerId,
                username: playerInfo.username,
                message: data.message,
                timestamp: new Date().toISOString()
              }));
            }
          });
          
          // Store in database if authenticated
          if (playerInfo.authenticated) {
            const playerData = gameConnections.get(playerId);
            await pool.query(
              'INSERT INTO chat_messages (player_id, message) VALUES ($1, $2)',
              [playerData.id, data.message]
            );
          }
          break;
          
        case 'powerup':
          // Handle power-up collection
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'powerup',
                playerId,
                powerupType: data.powerupType,
                duration: data.duration
              }));
            }
          });
          break;
      }
    } catch (e) {
      console.error('Message error:', e);
    }
  });
  
  ws.on('close', async () => {
    console.log(`Player ${playerId} disconnected`);
    gameConnections.delete(playerId);
    playersOnline.set(gameConnections.size);
    wsConnections.dec();
    
    // Notify others
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'playerDisconnected',
          playerId
        }));
      }
    });
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for player ${playerId}:`, error);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`🎮 Wok Central Backend v2.0.0 running on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});
