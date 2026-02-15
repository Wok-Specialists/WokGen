# Smoke Tests Documentation

## Overview
The smoke test harness verifies that all critical routes, assets, and functionality are working correctly. It must pass before any revamp work begins.

## Running Smoke Tests

### Local Development
```bash
# Test against locally built files
npm run smoke

# Test against specific ports
node scripts/smoke.mjs --website-port 8080 --game-port 8081
```

### Docker Environment
```bash
# Start containers
docker compose up --build -d

# Run smoke tests against Docker
npm run smoke:docker

# Or manually
node scripts/smoke.mjs --website-port 3000 --game-port 3002
```

## What Gets Tested

### Website Routes
- `/` - Homepage returns 200 with valid HTML
- `/projects` - Projects page returns 200
- `/community` - Community page returns 200

### Content Verification
- All routes return `Content-Type: text/html`
- HTML content is valid (contains `<html` or `<!DOCTYPE`)

### Game Client
- `/` - Game loads
- `/game.js` - Game script loads with `application/javascript` MIME type
- `/node_modules/phaser/dist/phaser.min.js` - Phaser library loads

### Link Validation
- All internal links on tested pages resolve to 200
- No 404s for internal navigation

## Exit Codes
- `0` - All tests passed
- `1` - One or more tests failed

## CI Integration
```yaml
# Example GitHub Actions
- name: Run Smoke Tests
  run: npm run smoke
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port
lsof -ti:8080 | xargs kill -9
```

### Tests Failing
Check `BROKENNESS_MAP.md` for current known issues and status.
