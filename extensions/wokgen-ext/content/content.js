// WokGen Content Script v2
(function() {
  'use strict';
  
  // ─── Asset Harvester ────────────────────────────────────────────────────────
  function harvestAssets() {
    const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
      type: 'image',
      src: img.src,
      alt: img.alt || '',
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    })).filter(i => i.src && !i.src.startsWith('data:'));
    
    const videos = Array.from(document.querySelectorAll('video[src], video source[src]')).map(el => ({
      type: 'video',
      src: el.src,
    })).filter(v => v.src);
    
    const colors = extractColors();
    
    return { images, videos, colors, url: location.href, title: document.title };
  }
  
  function extractColors() {
    const colors = new Set();
    const rules = [];
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.style) rules.push(rule.style.cssText);
          }
        } catch(e) {}
      }
    } catch(e) {}
    
    const colorRx = /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g;
    rules.forEach(r => { const m = r.match(colorRx); if (m) m.forEach(c => colors.add(c)); });
    
    return Array.from(colors).slice(0, 20);
  }
  
  // ─── Page Info ───────────────────────────────────────────────────────────────
  function getPageInfo() {
    const ogTags = {};
    document.querySelectorAll('meta[property^="og:"], meta[name]').forEach(m => {
      const key = m.getAttribute('property') || m.getAttribute('name');
      const val = m.getAttribute('content');
      if (key && val) ogTags[key] = val;
    });
    return {
      url: location.href,
      title: document.title,
      description: ogTags['description'] || ogTags['og:description'] || '',
      ogTags,
      selectedText: window.getSelection()?.toString() || '',
    };
  }
  
  // ─── Eral Panel ──────────────────────────────────────────────────────────────
  let eralPanel = null;
  
  function createEralPanel() {
    if (eralPanel) { eralPanel.style.display = 'flex'; return; }
    
    const panel = document.createElement('div');
    panel.id = 'wokgen-eral-panel';
    panel.innerHTML = `
      <div class="wg-panel-header">
        <span class="wg-panel-title">Eral 7c</span>
        <span class="wg-panel-badge">WokGen</span>
        <button class="wg-panel-close" id="wg-close-panel">✕</button>
      </div>
      <div class="wg-panel-messages" id="wg-messages">
        <div class="wg-msg wg-msg-assistant">Hi! I'm Eral 7c. Ask me anything about this page, or highlight text to analyze it.</div>
      </div>
      <div class="wg-panel-input-row">
        <input type="text" id="wg-input" placeholder="Ask Eral about this page..." />
        <button id="wg-send">→</button>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      #wokgen-eral-panel {
        position: fixed; top: 80px; right: 0; width: 320px; height: 480px;
        background: #111113; border: 1px solid rgba(255,255,255,0.1);
        border-right: none; border-radius: 12px 0 0 12px;
        display: flex; flex-direction: column; z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: -4px 0 24px rgba(0,0,0,0.4);
        animation: wg-slide-in 200ms ease;
      }
      @keyframes wg-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
      .wg-panel-header { display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); gap: 8px; flex-shrink: 0; }
      .wg-panel-title { font-weight: 700; font-size: 14px; color: #fff; }
      .wg-panel-badge { font-size: 10px; font-weight: 600; color: #a78bfa; background: rgba(167,139,250,0.1); padding: 2px 7px; border-radius: 999px; border: 1px solid rgba(167,139,250,0.2); margin-right: auto; }
      .wg-panel-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 14px; padding: 4px; border-radius: 4px; transition: color 0.15s; }
      .wg-panel-close:hover { color: #fff; }
      .wg-panel-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .wg-msg { padding: 9px 12px; border-radius: 8px; font-size: 13px; line-height: 1.5; max-width: 90%; word-wrap: break-word; }
      .wg-msg-user { background: rgba(167,139,250,0.15); color: #e9d5ff; align-self: flex-end; border: 1px solid rgba(167,139,250,0.2); }
      .wg-msg-assistant { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.87); border: 1px solid rgba(255,255,255,0.07); }
      .wg-panel-input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
      #wg-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 13px; outline: none; }
      #wg-input:focus { border-color: rgba(167,139,250,0.4); }
      #wg-send { background: #a78bfa; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 14px; cursor: pointer; font-weight: 600; transition: background 0.15s; }
      #wg-send:hover { background: #8b5cf6; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(panel);
    eralPanel = panel;
    
    document.getElementById('wg-close-panel').addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    document.getElementById('wg-send').addEventListener('click', sendToEral);
    document.getElementById('wg-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') sendToEral();
    });
  }
  
  function addMessage(role, text) {
    const msgs = document.getElementById('wg-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = `wg-msg wg-msg-${role}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  
  async function sendToEral() {
    const input = document.getElementById('wg-input');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';
    addMessage('user', text);
    addMessage('assistant', '...');
    
    // Send to background for API call
    chrome.runtime.sendMessage({ action: 'eralChat', message: text, pageContext: getPageInfo() }, response => {
      const msgs = document.getElementById('wg-messages');
      if (msgs) {
        const last = msgs.lastElementChild;
        if (last) last.textContent = response?.reply || 'Sign in to WokGen to chat with Eral 7c.';
      }
    });
  }
  
  // ─── Message Listener ────────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getPageInfo') {
      sendResponse(getPageInfo());
    } else if (message.action === 'harvestAssets') {
      sendResponse(harvestAssets());
    } else if (message.action === 'openEralPanel') {
      createEralPanel();
      // Pre-fill with selected text if any
      const sel = window.getSelection()?.toString();
      if (sel && document.getElementById('wg-input')) {
        document.getElementById('wg-input').value = `About this text: "${sel.slice(0, 200)}"`;
      }
      sendResponse({ ok: true });
    }
    return true;
  });
})();
