import { defineContentScript } from 'wxt/sandbox';
import { scrapePage } from '../lib/scraper';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === 'SCRAPE_PAGE') {
        try {
          const result = scrapePage();
          sendResponse({ ok: true, data: result });
        } catch (e) {
          sendResponse({ ok: false, error: String(e) });
        }
      }
      return true; // keep channel open for async
    });

    console.log('[WokGen Companion] Content script loaded on', window.location.hostname);
  },
});
