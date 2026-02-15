# Docker Configuration - PHASE 3 COMPLETE

**Status:** ✅ DOCKERIZED AND TESTED

## Services

### 1. Website (nginx)
- **Port:** 3000 (mapped to container port 80)
- **Image:** Custom nginx with static Next.js build
- **Features:**
  - Clean URL routing with `.html` fallback
  - Gzip compression
  - Proper MIME types for ES modules
  - Security headers
  - Static asset caching

### 2. Game Client (nginx)
- **Port:** 3002 (mapped to container port 80)
- **Image:** Custom nginx serving Phaser game
- **Features:**
  - Configurable WebSocket URL via `WS_URL` env var
  - Entrypoint script to inject configuration
  - Proper MIME types for JavaScript modules
  - Security headers with iframe support

### 3. Game Backend (Node.js)
- **Port:** 3001
- **Image:** Node.js with Express + WebSocket server
- **Features:**
  - WebSocket server for multiplayer
  - Player management
  - Cross-origin support for Docker networking

## Build & Run

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Testing

```bash
# Run smoke tests against Docker containers
npm run smoke:docker

# Or manually
node scripts/smoke.mjs --docker --website-port 3000 --game-port 3002
```

## Configuration

### Website Build Arguments
- `NEXT_PUBLIC_GAME_CLIENT_URL`: URL for game client iframe (default: http://localhost:3002)

### Game Client Environment Variables
- `WS_URL`: WebSocket server URL (default: ws://localhost:3001)

## Networking

All services communicate via the `wok_network` bridge network:
- Website: `http://website:80`
- Game Client: `http://game-client:80`
- Game Backend: `http://game-backend:3001`

## Exit Criteria
- ✅ `docker compose up --build` starts all services
- ✅ Website serves static files on port 3000
- ✅ Game client serves on port 3002
- ✅ Game backend WebSocket on port 3001
- ✅ Smoke tests pass against containers (100%)

**PHASE 3 COMPLETE - Ready for Phase 4**
