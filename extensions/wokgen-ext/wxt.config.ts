import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'WokGen Companion',
    description: 'AI generation, asset scraping, and site inspection powered by WokGen.',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'contextMenus',
      'sidePanel',
      'downloads',
      'clipboardRead',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'WokGen Companion',
      default_popup: 'popup.html',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
    devtools_page: 'devtools.html',
  },
});
