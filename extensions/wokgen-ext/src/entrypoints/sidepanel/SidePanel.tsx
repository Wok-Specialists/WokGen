import React, { useState, useEffect } from 'react';
import { getConfig } from '../../lib/config';
import { generateAsset, getJob, type Job } from '../../lib/api';
import type { ScrapedPage } from '../../lib/scraper';

type PanelTab = 'generate' | 'inspector' | 'links' | 'assets';

export function SidePanel() {
  const [tab, setTab] = useState<PanelTab>('generate');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'pixel' | 'vector' | 'uiux'>('pixel');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scraped, setScraped] = useState<ScrapedPage | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    getConfig().then(cfg => setHasKey(!!cfg.apiKey));
    // Listen for scraped page data from background
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'PAGE_SCRAPED') setScraped(msg.data);
    });
  }, []);

  const scrapeCurrent = async () => {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) return;
    const resp = await browser.tabs.sendMessage(activeTab.id, { type: 'SCRAPE_PAGE' });
    if (resp?.ok) setScraped(resp.data);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const newJob = await generateAsset({ prompt, mode });
      setJob(newJob);
      // Poll for completion
      const poll = setInterval(async () => {
        const updated = await getJob(newJob.id);
        setJob(updated);
        if (updated.status === 'succeeded' || updated.status === 'failed') {
          clearInterval(poll);
          setLoading(false);
        }
      }, 2000);
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  };

  const downloadAsset = async (url: string, filename: string) => {
    await browser.downloads.download({ url, filename });
  };

  return (
    <div style={{ fontFamily: '-apple-system, DM Sans, system-ui, sans-serif', background: '#0a0a0a', color: '#ededed', height: '100vh', display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '14px' }}>⬡ WokGen</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Companion</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 8px' }}>
        {(['generate', 'inspector', 'links', 'assets'] as PanelTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', padding: '8px 10px', cursor: 'pointer', fontSize: '12px',
            color: tab === t ? '#ededed' : 'rgba(255,255,255,0.4)',
            borderBottom: tab === t ? '2px solid #818cf8' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px' }}>
        {!hasKey && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '12px', marginBottom: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
            ⚠ Add your API key in the extension popup to enable generation.
          </div>
        )}

        {tab === 'generate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select value={mode} onChange={e => setMode(e.target.value as typeof mode)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '7px 10px', color: '#ededed', fontSize: '13px' }}>
              <option value="pixel">Pixel Studio</option>
              <option value="vector">Vector Studio</option>
              <option value="uiux">UI/UX Studio</option>
            </select>
            <textarea
              rows={4}
              placeholder="Describe what you want to generate…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '8px 10px', color: '#ededed', fontSize: '13px', resize: 'vertical' }}
            />
            <button
              onClick={generate}
              disabled={loading || !prompt.trim() || !hasKey}
              style={{ background: loading ? 'rgba(79,70,229,0.5)' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', padding: '9px', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Generating…' : 'Generate'}
            </button>
            {error && <p style={{ color: '#f87171', fontSize: '12px' }}>{error}</p>}
            {job && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Status: <span style={{ color: job.status === 'succeeded' ? '#34d399' : job.status === 'failed' ? '#f87171' : '#fbbf24' }}>{job.status}</span></p>
                {job.outputUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={job.outputUrl} alt="Generated" style={{ width: '100%', borderRadius: '4px' }} />
                    <button onClick={() => downloadAsset(job.outputUrl!, 'wokgen-output.png')} style={{ marginTop: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '6px 10px', color: '#ededed', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                      ↓ Download
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'inspector' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={scrapeCurrent} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '8px', color: '#ededed', fontSize: '13px', cursor: 'pointer' }}>
              🔍 Scan Current Page
            </button>
            {scraped && (
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{scraped.title} — {scraped.assets.length} assets found</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {scraped.palette.backgrounds.slice(0, 12).map((c, i) => (
                    <div key={i} title={c} style={{ width: '28px', height: '28px', borderRadius: '4px', background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Fonts: {scraped.fonts.families.slice(0, 5).join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={scrapeCurrent} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '7px', color: '#ededed', fontSize: '12px', cursor: 'pointer' }}>
              Scrape links from page
            </button>
            {scraped && (
              <>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{scraped.links.length} links found</p>
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {scraped.links.slice(0, 100).map((link, i) => (
                    <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                      <a href={link.href} target="_blank" rel="noreferrer" style={{ color: link.isExternal ? '#818cf8' : '#ededed', textDecoration: 'none', wordBreak: 'break-all' }}>
                        {link.text || link.href}
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'assets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={scrapeCurrent} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '7px', color: '#ededed', fontSize: '12px', cursor: 'pointer' }}>
              Scan page assets
            </button>
            {scraped && (
              <>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{scraped.assets.length} assets found</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {scraped.assets.filter(a => a.type === 'image').slice(0, 30).map((asset, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={asset.url} alt={asset.alt} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }} />
                      <button
                        onClick={() => downloadAsset(asset.url, `asset-${i}.${asset.format || 'png'}`)}
                        style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '3px', color: '#fff', fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
