#!/usr/bin/env node
/**
 * Smoke Test Harness for Wok Specialists Project
 * 
 * Tests critical routes, MIME types, and basic functionality
 * Can run against local dev server or Docker containers
 */

import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  website: {
    port: 8080,
    distPath: path.join(PROJECT_ROOT, 'wok-specialists-website', 'dist'),
    routes: ['/', '/projects', '/community', '/game', '/docs', '/status', '/chopsticks'],
  },
  game: {
    port: 8081,
    distPath: path.join(PROJECT_ROOT, 'wok-central', 'client'),
    routes: ['/'],
    files: ['/index.html', '/game.js'],
  },
  skipServerStart: false,
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

// HTTP Request helper
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Determine MIME type
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Start static file server
function startStaticServer(port, rootPath) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Security: prevent directory traversal
      const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
      let filePath = path.join(rootPath, safePath === '/' ? 'index.html' : safePath);
      
      // Try to resolve the file with fallback logic
      const tryFiles = [];
      
      // Always try the direct file path first
      tryFiles.push(filePath);
      
      // For clean URLs without extension, try adding .html FIRST
      // This handles Next.js static export which creates page.html files
      if (!path.extname(filePath)) {
        tryFiles.push(filePath + '.html');
      }
      
      // If path is a directory, try index.html as fallback
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        tryFiles.push(path.join(filePath, 'index.html'));
      }
      
      // Find the first existing file
      let resolvedFile = null;
      for (const tryPath of tryFiles) {
        if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
          resolvedFile = tryPath;
          break;
        }
      }
      
      // Determine MIME type
      const contentType = getMimeType(resolvedFile || filePath);
      
      if (resolvedFile) {
        fs.readFile(resolvedFile, (err, content) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
    
    server.listen(port, (err) => {
      if (err) reject(err);
      else resolve(server);
    });
  });
}

// Test website routes
async function testWebsite(port) {
  log('\n--- Testing Website Routes ---', 'cyan');
  let passed = 0;
  let failed = 0;
  
  for (const route of CONFIG.website.routes) {
    try {
      const response = await httpRequest(`http://localhost:${port}${route}`);
      // Accept 200 OK and 301/302 redirects (common for trailing slash redirects)
      if (response.status === 200) {
        success(`Route ${route} returns 200`);
        passed++;
        
        // Check content type
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          success(`Route ${route} has correct Content-Type: ${contentType}`);
        } else {
          warn(`Route ${route} has unexpected Content-Type: ${contentType}`);
        }
        
        // Check for critical content
        if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html')) {
          success(`Route ${route} returns valid HTML`);
        } else {
          error(`Route ${route} does not return valid HTML`);
          failed++;
        }
      } else if (response.status === 301 || response.status === 302) {
        // Redirects are OK for routes (e.g., /projects -> /projects/)
        success(`Route ${route} returns ${response.status} (redirect to ${response.headers.location || 'unknown'})`);
        passed++;
      } else {
        error(`Route ${route} returns ${response.status}`);
        failed++;
      }
    } catch (err) {
      error(`Route ${route} failed: ${err.message}`);
      failed++;
    }
  }
  
  return { passed, failed };
}

// Test game client
async function testGame(port) {
  log('\n--- Testing Game Client ---', 'cyan');
  let passed = 0;
  let failed = 0;
  
  // Test routes
  for (const route of CONFIG.game.routes) {
    try {
      const response = await httpRequest(`http://localhost:${port}${route}`);
      if (response.status === 200) {
        success(`Game route ${route} returns 200`);
        passed++;
      } else {
        error(`Game route ${route} returns ${response.status}`);
        failed++;
      }
    } catch (err) {
      error(`Game route ${route} failed: ${err.message}`);
      failed++;
    }
  }
  
  // Test critical files
  for (const file of CONFIG.game.files) {
    try {
      const response = await httpRequest(`http://localhost:${port}${file}`);
      if (response.status === 200) {
        success(`Game file ${file} returns 200`);
        passed++;
        
        // Check MIME type for JS files
        if (file.endsWith('.js')) {
          const contentType = response.headers['content-type'] || '';
          if (contentType.includes('javascript') || contentType.includes('javascript')) {
            success(`Game file ${file} has correct MIME type: ${contentType}`);
          } else {
            warn(`Game file ${file} has unexpected MIME type: ${contentType}`);
          }
        }
      } else {
        error(`Game file ${file} returns ${response.status}`);
        failed++;
      }
    } catch (err) {
      error(`Game file ${file} failed: ${err.message}`);
      failed++;
    }
  }
  
  // Check for Phaser
  try {
    const response = await httpRequest(`http://localhost:${port}/node_modules/phaser/dist/phaser.min.js`);
    if (response.status === 200) {
      success('Phaser library loads correctly');
      passed++;
    } else {
      error(`Phaser library returns ${response.status}`);
      failed++;
    }
  } catch (err) {
    error(`Phaser library failed: ${err.message}`);
    failed++;
  }
  
  return { passed, failed };
}

// Check for broken links in HTML
async function checkBrokenLinks(port, routes) {
  log('\n--- Checking for Broken Links ---', 'cyan');
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    try {
      const response = await httpRequest(`http://localhost:${port}${route}`);
      const html = response.data;
      
      // Find all anchor tags
      const linkMatches = html.matchAll(/href="([^"]+)"/g);
      const links = [...linkMatches].map(m => m[1]).filter(href => 
        !href.startsWith('http') && 
        !href.startsWith('#') && 
        !href.startsWith('mailto:')
      );
      
      for (const link of links) {
        // Normalize link - remove query strings and hash fragments for checking
        let normalizedLink = link.startsWith('/') ? link : `/${link}`;
        normalizedLink = normalizedLink.split('?')[0].split('#')[0]; // Remove query params and hash
        if (normalizedLink === '/') continue; // Skip root
        
        try {
          const linkResponse = await httpRequest(`http://localhost:${port}${normalizedLink}`);
          if (linkResponse.status === 200) {
            // success(`Link ${normalizedLink} from ${route} is valid`);
            passed++;
          } else if (linkResponse.status === 404) {
            error(`Broken link on ${route}: ${normalizedLink} (404)`);
            failed++;
          }
        } catch (err) {
          error(`Link check failed for ${normalizedLink} from ${route}: ${err.message}`);
          failed++;
        }
      }
    } catch (err) {
      error(`Could not check links on ${route}: ${err.message}`);
      failed++;
    }
  }
  
  log(`Checked ${passed + failed} internal links`);
  return { passed, failed };
}

// Main test runner
async function runTests() {
  log('\n========================================', 'blue');
  log('  SMOKE TEST - Wok Specialists Project', 'blue');
  log('========================================\n', 'blue');
  
  let websiteServer, gameServer;
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    if (!CONFIG.skipServerStart) {
      // Start website server
      log('Starting website server...', 'yellow');
      websiteServer = await startStaticServer(CONFIG.website.port, CONFIG.website.distPath);
      success(`Website server running on port ${CONFIG.website.port}`);
      
      // Start game server
      log('\nStarting game client server...', 'yellow');
      gameServer = await startStaticServer(CONFIG.game.port, CONFIG.game.distPath);
      success(`Game client server running on port ${CONFIG.game.port}`);
    } else {
      log('Skipping local server start (testing against external servers)', 'yellow');
    }
    
    // Test website
    const websiteResults = await testWebsite(CONFIG.website.port);
    totalPassed += websiteResults.passed;
    totalFailed += websiteResults.failed;
    
    // Test game
    const gameResults = await testGame(CONFIG.game.port);
    totalPassed += gameResults.passed;
    totalFailed += gameResults.failed;
    
    // Check for broken links
    const linkResults = await checkBrokenLinks(CONFIG.website.port, CONFIG.website.routes);
    totalPassed += linkResults.passed;
    totalFailed += linkResults.failed;
    
  } catch (err) {
    error(`Test runner failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  } finally {
    // Cleanup
    if (websiteServer) {
      websiteServer.close();
      log('\nWebsite server stopped', 'yellow');
    }
    if (gameServer) {
      gameServer.close();
      log('Game server stopped', 'yellow');
    }
  }
  
  // Summary
  log('\n========================================', 'blue');
  log('  TEST SUMMARY', 'blue');
  log('========================================', 'blue');
  log(`Total Passed: ${totalPassed}`, 'green');
  log(`Total Failed: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    log('\n✓ All smoke tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n✗ Some smoke tests failed', 'red');
    process.exit(1);
  }
}

// Handle arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Smoke Test Harness for Wok Specialists Project

Usage: node smoke.mjs [options]

Options:
  --help, -h              Show this help message
  --website-port PORT     Website server port (default: 8080)
  --game-port PORT        Game server port (default: 8081)
  --docker                Skip starting local servers (for testing Docker containers)

This script will:
  1. Start local static servers for website and game (unless --docker)
  2. Test all critical routes return HTTP 200
  3. Verify correct MIME types for JS modules
  4. Check for broken internal links
  5. Verify game assets load correctly

Examples:
  node smoke.mjs                                    # Test with local servers
  node smoke.mjs --docker --website-port 3000       # Test against Docker on port 3000
  node smoke.mjs --website-port 8080 --game-port 8081
`);
  process.exit(0);
}

// Parse port arguments
const websitePortIdx = args.indexOf('--website-port');
if (websitePortIdx !== -1 && args[websitePortIdx + 1]) {
  CONFIG.website.port = parseInt(args[websitePortIdx + 1], 10);
}

const gamePortIdx = args.indexOf('--game-port');
if (gamePortIdx !== -1 && args[gamePortIdx + 1]) {
  CONFIG.game.port = parseInt(args[gamePortIdx + 1], 10);
}

// Parse --docker flag (skip starting local servers)
if (args.includes('--docker')) {
  CONFIG.skipServerStart = true;
}

// Run tests
runTests();
