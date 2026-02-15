const PLAYER_SPEED = 200;
const PLAYER_SPEED_BOOST = 400;
const CHAT_COOLDOWN = 1000;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.playerId = null;
        this.player = null;
        this.otherPlayers = {};
        this.isAuthenticated = false;
        this.playerName = 'Guest';
        this.chatCooldown = 0;
        this.speedBoost = false;
        this.speedBoostTimer = null;
    }

    preload() {
        this.load.image('ship', 'https://labs.phaser.io/assets/sprites/space-baddie.png');
        this.load.image('powerup-speed', 'https://labs.phaser.io/assets/sprites/orb-red.png');
    }

    create() {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        // Determine WebSocket URL
        const wsUrl = (window.GAME_CONFIG && window.GAME_CONFIG.wsUrl) 
            ? window.GAME_CONFIG.wsUrl 
            : (token ? `ws://localhost:3001?token=${token}` : 'ws://localhost:3001');
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            this.showGameUI();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'init':
                    this.playerId = data.playerId;
                    this.playerName = data.player.username || `Player_${this.playerId.substr(0, 6)}`;
                    this.isAuthenticated = data.player.authenticated || false;
                    
                    // Update UI
                    document.getElementById('player-name').textContent = this.playerName;
                    
                    // Create local player
                    this.addPlayer(data.player, true);
                    
                    // Create existing players
                    for (const id in data.players) {
                        this.addOtherPlayer(id, data.players[id]);
                    }
                    
                    this.updateOnlineCount();
                    break;
                    
                case 'newPlayer':
                    this.addOtherPlayer(data.playerId, data.player);
                    this.updateOnlineCount();
                    this.addChatMessage('System', `${data.player.username} joined the game`, true);
                    break;
                    
                case 'playerMoved':
                    if (this.otherPlayers[data.playerId]) {
                        this.otherPlayers[data.playerId].setPosition(data.x, data.y);
                        this.updatePlayerLabel(data.playerId, data.x, data.y);
                    }
                    break;
                    
                case 'playerDisconnected':
                    if (this.otherPlayers[data.playerId]) {
                        const name = this.otherPlayers[data.playerId].username || 'A player';
                        this.otherPlayers[data.playerId].destroy();
                        if (this.otherPlayers[data.playerId].label) {
                            this.otherPlayers[data.playerId].label.destroy();
                        }
                        delete this.otherPlayers[data.playerId];
                        this.updateOnlineCount();
                        this.addChatMessage('System', `${name} left the game`, true);
                    }
                    break;
                    
                case 'chat':
                    this.addChatMessage(data.username, data.message, false, data.timestamp);
                    break;
                    
                case 'powerup':
                    this.handlePowerUp(data.playerId, data.powerupType, data.duration);
                    break;
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.addChatMessage('System', 'Connection error. Trying to reconnect...', true);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.addChatMessage('System', 'Disconnected from server', true);
        };
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Chat input handling
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        chatSend.addEventListener('click', () => this.sendChatMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Focus chat on Enter
        this.input.keyboard.on('keydown-ENTER', (event) => {
            if (document.activeElement !== chatInput) {
                event.preventDefault();
                chatInput.focus();
            }
        });
        
        // Spawn power-ups periodically
        this.time.addEvent({
            delay: 10000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });
        
        // Fetch leaderboard
        this.fetchLeaderboard();
    }
    
    addPlayer(playerInfo, isLocal = false) {
        const color = parseInt(playerInfo.color) || 0xffffff;
        this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship');
        this.player.setTint(color);
        this.player.setCollideWorldBounds(true);
        
        // Add username label
        this.playerLabel = this.add.text(playerInfo.x, playerInfo.y - 30, playerInfo.username || 'Guest', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        if (isLocal) {
            this.player.setDrag(0.95);
        }
    }

    addOtherPlayer(playerId, playerInfo) {
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'ship');
        const color = parseInt(playerInfo.color) || 0xffffff;
        otherPlayer.setTint(color);
        otherPlayer.username = playerInfo.username;
        
        // Add username label
        otherPlayer.label = this.add.text(playerInfo.x, playerInfo.y - 30, playerInfo.username || 'Unknown', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        this.otherPlayers[playerId] = otherPlayer;
    }
    
    updatePlayerLabel(playerId, x, y) {
        const player = this.otherPlayers[playerId];
        if (player && player.label) {
            player.label.setPosition(x, y - 30);
        }
    }
    
    updateOnlineCount() {
        const count = Object.keys(this.otherPlayers).length + 1;
        document.getElementById('online-count').textContent = count;
    }
    
    addChatMessage(username, message, isSystem = false, timestamp) {
        const chatMessages = document.getElementById('chat-messages');
        const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        if (isSystem) {
            messageDiv.innerHTML = `<span class="chat-text" style="color: #94a3b8; font-style: italic;">${message}</span>`;
        } else {
            messageDiv.innerHTML = `
                <span class="chat-username">${username}</span>
                <span class="chat-text">${this.escapeHtml(message)}</span>
                <span class="chat-time">${time}</span>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Limit messages
        while (chatMessages.children.length > 50) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Check cooldown
        const now = Date.now();
        if (now - this.chatCooldown < CHAT_COOLDOWN) {
            this.addChatMessage('System', 'Please wait before sending another message', true);
            return;
        }
        
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'chat',
                message: message
            }));
            chatInput.value = '';
            this.chatCooldown = now;
        }
    }
    
    spawnPowerUp() {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        const powerup = this.physics.add.image(x, y, 'powerup-speed');
        powerup.setInteractive();
        
        // Add collision with player
        this.physics.add.overlap(this.player, powerup, () => {
            this.collectPowerUp(powerup, 'speed');
        });
        
        // Remove after 10 seconds
        this.time.delayedCall(10000, () => {
            if (powerup.active) {
                powerup.destroy();
            }
        });
    }
    
    collectPowerUp(powerup, type) {
        powerup.destroy();
        
        // Show power-up indicator
        const indicator = document.getElementById('powerup-indicator');
        indicator.textContent = type === 'speed' ? '⚡ Speed Boost!' : '💎 Power Up!';
        indicator.style.display = 'block';
        
        // Apply effect
        if (type === 'speed') {
            this.speedBoost = true;
            
            // Clear existing timer
            if (this.speedBoostTimer) {
                clearTimeout(this.speedBoostTimer);
            }
            
            // Reset after 5 seconds
            this.speedBoostTimer = setTimeout(() => {
                this.speedBoost = false;
                indicator.style.display = 'none';
            }, 5000);
        }
        
        // Notify server
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'powerup',
                powerupType: type,
                duration: 5000
            }));
        }
    }
    
    handlePowerUp(playerId, type, duration) {
        if (playerId === this.playerId) return; // Already handled locally
        
        // Visual effect for other players
        if (this.otherPlayers[playerId]) {
            const player = this.otherPlayers[playerId];
            player.setScale(1.2);
            
            setTimeout(() => {
                player.setScale(1);
            }, duration);
        }
    }
    
    async fetchLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            if (response.ok) {
                const data = await response.json();
                this.updateLeaderboard(data);
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        }
    }
    
    updateLeaderboard(entries) {
        const container = document.getElementById('leaderboard-entries');
        container.innerHTML = '';
        
        entries.slice(0, 5).forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-entry';
            div.innerHTML = `
                <div>
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-name">${entry.username}</span>
                </div>
                <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
            `;
            container.appendChild(div);
        });
    }
    
    showGameUI() {
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('player-panel').classList.remove('hidden');
        document.getElementById('leaderboard').classList.remove('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
    }

    update() {
        if (this.player && this.ws.readyState === WebSocket.OPEN) {
            let moved = false;
            const speed = this.speedBoost ? PLAYER_SPEED_BOOST : PLAYER_SPEED;
            
            const newVelocity = { x: 0, y: 0 };

            if (this.cursors.left.isDown) {
                newVelocity.x = -speed;
                moved = true;
            } else if (this.cursors.right.isDown) {
                newVelocity.x = speed;
                moved = true;
            }

            if (this.cursors.up.isDown) {
                newVelocity.y = -speed;
                moved = true;
            } else if (this.cursors.down.isDown) {
                newVelocity.y = speed;
                moved = true;
            }
            
            this.player.setVelocity(newVelocity.x, newVelocity.y);
            
            // Update label position
            if (this.playerLabel) {
                this.playerLabel.setPosition(this.player.x, this.player.y - 30);
            }

            if (moved || Math.abs(this.player.body.velocity.x) > 0 || Math.abs(this.player.body.velocity.y) > 0) {
                this.ws.send(JSON.stringify({
                    type: 'move',
                    x: this.player.x,
                    y: this.player.y
                }));
            }
        }
    }
}

// Global functions
function skipAuth() {
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('player-panel').classList.remove('hidden');
    document.getElementById('leaderboard').classList.remove('hidden');
    document.getElementById('chat-container').classList.remove('hidden');
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#0f172a',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: GameScene
};

const game = new Phaser.Game(config);
