# WokGen Browser Extension

Bring WokGen AI tools to any page — right-click any image or selection to use WokGen tools, harvest assets, and chat with Eral 7c directly on the page.

## Features

### v2.0
- **Eral 7c Panel** — docked slide-out chat panel on any page; highlight text to pre-fill a question
- **Asset Harvester** — scan any page for images/videos and save them directly from the popup
- **Settings page** — toggle context menu items, manage your WokGen account
- **3-tab popup** — Tools, Assets, Settings

### v1 (original)
- Right-click images: Remove Background, Analyze with Eral 7c, Open in WokGen Tools
- Right-click selections: Analyze with Eral 7c
- Popup: Quick access to all WokGen tools
- Page analyzer: Scan current page with Eral 7c

## Installation (Development)

### Chrome / Edge
1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extensions/wokgen-ext/` folder

### Firefox
1. Open Firefox → `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `extensions/wokgen-ext/manifest.json`

## Context Menu Items
| Item | Context | Action |
|---|---|---|
| Remove Background with WokGen | Image | Opens BG remover with image URL |
| Analyze with Eral 7c | Image / Selection | Opens WokGen with content pre-loaded |
| Open in WokGen Tools | Image | Opens WokGen tools page |
| Open Eral 7c Panel | Page / Selection | Injects docked chat panel |
| Open WokGen | Page | Opens wokgen.wokspec.org |

## Building for Production
```
npm install && npm run build
```

## Publishing
- Chrome Web Store: https://chrome.google.com/webstore/devconsole
- Firefox Add-ons: https://addons.mozilla.org/developers
