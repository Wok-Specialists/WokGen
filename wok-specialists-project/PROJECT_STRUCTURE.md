# Project Structure

## Directories
- `/wok-specialists-website/` - Next.js website (port 3000)
- `/wok-central/client/` - Phaser game client (port 3002)
- `/wok-central/server/` - WebSocket game server (port 3001)

## Current Routes (Website)
- `/` - Home page
- `/projects` - Projects listing
- `/community` - Community page
- MISSING: `/game` - No game route exists in website

## Current Routes (Game Client)
- `http://localhost:3002/` - Game client served via nginx

## Services
1. Website: Next.js app on port 3000
2. Game Backend: Express + WebSocket on port 3001
3. Game Client: Nginx static on port 3002

## Issues Identified
1. No /game route in website to serve the game
2. Game client references WebSocket at localhost:3001 (won't work in Docker)
3. Game client serves node_modules directly (inefficient)
4. No root-level package.json for unified management
5. No smoke tests exist
