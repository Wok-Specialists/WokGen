# Brokenness Map - PHASE 2 COMPLETE

**Test Date:** 2026-02-15  
**Status:** ✅ BASELINE ESTABLISHED

## Summary
- **Total Tests:** 42
- **Passed:** 42 (100%)
- **Failed:** 0 (0%)
- **Status:** ✅ ALL TESTS PASSING

## Fixed Issues

### ✅ Clean URL Routing
- **Problem:** Next.js exports HTML files as `page.html` but static server wasn't configured to serve them
- **Solution:** Updated static server to try `.html` extension for clean URLs
- **Files Changed:** `scripts/smoke.mjs`

### ✅ Favicon Links
- **Problem:** Next.js generates favicon URLs with query strings (`/favicon.ico?favicon.0b3bf435.ico`)
- **Solution:** Updated link checker to strip query strings before checking
- **Files Changed:** `scripts/smoke.mjs`

### ✅ Missing Game Route
- **Problem:** No /game route existed to serve the game client
- **Solution:** Created `/game` page with iframe embedding the game client
- **Files Changed:** 
  - `wok-specialists-website/src/app/game/page.tsx` (new)
  - `wok-specialists-website/src/app/layout.tsx` (updated nav)

### ✅ Broken Internal Links
- **Problem:** `/projects/chopsticks` link pointed to non-existent page
- **Solution:** Temporarily removed link (will re-add in Phase 5)
- **Files Changed:** `wok-specialists-website/src/app/projects/page.tsx`

## Current State

### Website Routes (All Working)
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ 200 OK | Homepage |
| `/projects` | ✅ 200 OK | Projects listing |
| `/community` | ✅ 200 OK | Community page |
| `/game` | ✅ 200 OK | Game iframe |

### Game Client (All Working)
| Asset | Status | Notes |
|-------|--------|-------|
| `/` | ✅ 200 OK | Game HTML |
| `/game.js` | ✅ 200 OK + JS MIME | Game logic |
| `/node_modules/phaser/dist/phaser.min.js` | ✅ 200 OK | Phaser library |

## Known Issues (Deferred to Later Phases)

1. **WebSocket Hardcoded URL:** Game client uses `ws://localhost:3001` - needs environment-based config for Docker
2. **Game Theme:** NES theme should be scoped to /game only
3. **Visual Design:** Site needs professional revamp

## Phase 2 Exit Criteria
- ✅ `npm run smoke` passes (100%)
- ✅ /game works and loads correctly
- ✅ No console errors on initial load
- ✅ All routes return 200
- ✅ All critical assets have correct MIME types

**PHASE 2 COMPLETE - Ready for Phase 3 (Dockerize)**
