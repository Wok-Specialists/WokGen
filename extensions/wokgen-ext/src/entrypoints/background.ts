import { defineBackground } from 'wxt/sandbox';
import { getConfig } from '../lib/config';

export default defineBackground(() => {
  // Context menu: right-click on images or text selections
  browser.contextMenus.create({
    id: 'wokgen-generate-image',
    title: 'Reimagine in WokGen',
    contexts: ['image'],
  });

  browser.contextMenus.create({
    id: 'wokgen-generate-text',
    title: 'Generate in WokGen: "%s"',
    contexts: ['selection'],
  });

  browser.contextMenus.create({
    id: 'wokgen-scrape-page',
    title: 'Inspect page assets with WokGen',
    contexts: ['page'],
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const config = await getConfig();

    if (info.menuItemId === 'wokgen-generate-image' && info.srcUrl) {
      const url = new URL('/studio/pixel', config.apiBase);
      url.searchParams.set('imageUrl', info.srcUrl);
      browser.tabs.create({ url: url.toString() });
    }

    if (info.menuItemId === 'wokgen-generate-text' && info.selectionText) {
      const url = new URL('/studio/pixel', config.apiBase);
      url.searchParams.set('prompt', info.selectionText);
      browser.tabs.create({ url: url.toString() });
    }

    if (info.menuItemId === 'wokgen-scrape-page' && tab?.id) {
      browser.sidePanel.open({ tabId: tab.id });
      browser.tabs.sendMessage(tab.id, { type: 'SCRAPE_PAGE' });
    }
  });

  // Open side panel on action click
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  console.log('[WokGen Companion] Background service worker started');
});
