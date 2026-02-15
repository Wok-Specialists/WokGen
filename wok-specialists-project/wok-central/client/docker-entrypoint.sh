#!/bin/sh

# Replace WebSocket URL in game.js if environment variable is set
if [ -n "$WS_URL" ]; then
    echo "Configuring WebSocket URL: $WS_URL"
    sed -i "s|window.GAME_CONFIG && window.GAME_CONFIG.wsUrl ? window.GAME_CONFIG.wsUrl : 'ws://localhost:3001'|'${WS_URL}'|g" /usr/share/nginx/html/game.js
fi

# Start nginx
exec nginx -g "daemon off;"
