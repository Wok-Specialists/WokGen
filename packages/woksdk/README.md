# @wokspec/sdk — WokSDK

TypeScript SDK for WokAPI, the developer API for WokGen AI platform.

## Installation

```bash
npm install @wokspec/sdk
```

## Quick Start

```typescript
import WokGen from '@wokspec/sdk';

const wok = new WokGen({ apiKey: 'YOUR_API_KEY' });

const asset = await wok.generate({
  prompt: 'pixel art wizard character, retro 16-bit style',
  mode: 'pixel',
});
console.log(asset.url);
```

## API Reference

- `wok.generate(options)` — Generate AI assets
- `wok.listAssets(options)` — List your generated assets
- `wok.chat(options)` — Chat with Eral 7c AI
- `wok.removeBackground(imageUrl)` — Remove image background
- `wok.me()` — Get user info and usage stats

## Links

- [WokAPI Docs](https://wokgen.wokspec.org/developers)
- [WokGen](https://wokgen.wokspec.org)
- [WokSpec](https://wokspec.org)
