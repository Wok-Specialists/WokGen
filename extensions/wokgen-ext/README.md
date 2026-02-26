# WokGen Companion Extension

Browser extension for WokGen — AI generation, asset scraping, and site inspection.

Built with [WXT](https://wxt.dev) (Manifest V3). Targets Chrome, Firefox, Safari (via Safari Web Extensions), and Edge.

## Features

- **Side Panel**: Quick generation without leaving your current tab
- **Context Menu**: Right-click images or text to send to WokGen
- **Page Inspector**: Scan any page for assets, colors, and fonts
- **Link Scraper**: Extract all links from a page
- **Asset Downloader**: Bulk download images and SVGs
- **Generation History**: View recent WokGen jobs
- **WokAPI DevTools Panel**: Inspect WokGen API calls in DevTools

## Development

```bash
npm install
npm run dev          # Chrome (dev mode with HMR)
npm run dev:firefox  # Firefox
```

## Building

```bash
npm run build          # Chrome / Edge
npm run build:firefox  # Firefox
npm run build:safari   # Safari (requires Xcode)
npm run zip            # Package for Chrome Web Store
npm run zip:firefox    # Package for Firefox Add-ons
```

## Authentication

Get your API key from [WokGen Settings](https://wokgen.wokspec.org/account/api-keys) → Developer → API Keys.

Enter it in the extension popup under **Settings**.

## Project Structure

```
src/
  lib/
    config.ts      — API key storage & config helpers
    api.ts         — WokGen API client (generate, poll jobs)
    scraper.ts     — Page scraping (assets, links, palette, fonts)
  entrypoints/
    background.ts  — Service worker (context menus, side panel)
    content.ts     — Content script (SCRAPE_PAGE message handler)
    popup/         — Toolbar popup (React)
    sidepanel/     — Side panel studio (React)
    devtools/      — DevTools panel entry
```

## Publishing

- Chrome Web Store: https://chrome.google.com/webstore/devconsole
- Firefox Add-ons: https://addons.mozilla.org/developers
