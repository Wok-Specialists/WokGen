const WOKGEN_BASE = 'https://wokgen.wokspec.org';

document.addEventListener('DOMContentLoaded', () => {
  // ─── Tab switching ───────────────────────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });

  // ─── Analyze button ──────────────────────────────────────────────────────────
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url) {
          chrome.tabs.create({
            url: `${WOKGEN_BASE}/tools/og-analyzer?url=${encodeURIComponent(tab.url)}`
          });
        }
      });
    });
  }

  // ─── Eral Panel button ───────────────────────────────────────────────────────
  const eralPanelBtn = document.getElementById('eral-panel-btn');
  if (eralPanelBtn) {
    eralPanelBtn.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'openEralPanel' });
        window.close();
      }
    });
  }

  // ─── Asset harvester ─────────────────────────────────────────────────────────
  const harvestBtn = document.getElementById('harvest-btn');
  if (harvestBtn) {
    harvestBtn.addEventListener('click', loadAssets);
  }
});

async function loadAssets() {
  const assetsList = document.getElementById('assets-list');
  if (!assetsList) return;
  assetsList.innerHTML = '<div class="empty-state">Scanning...</div>';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'harvestAssets' });
    if (!result?.images?.length) {
      assetsList.innerHTML = '<div class="empty-state">No images found on this page.</div>';
      return;
    }
    assetsList.innerHTML = `<div class="asset-grid">${
      result.images.slice(0, 12).map(img => `
        <div class="asset-item">
          <img src="${img.src}" onerror="this.style.display='none'" loading="lazy" />
          <div class="asset-actions">
            <a href="${img.src}" download class="btn-small">Save</a>
          </div>
        </div>
      `).join('')
    }</div>`;
  } catch(e) {
    assetsList.innerHTML = '<div class="empty-state">Click the extension on a regular webpage.</div>';
  }
}
