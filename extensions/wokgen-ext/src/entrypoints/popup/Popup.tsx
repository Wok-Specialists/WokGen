import React, { useState, useEffect } from 'react';
import { getConfig, setConfig, WOKGEN_API_BASE } from '../../lib/config';
import { getRecentJobs, type Job } from '../../lib/api';

export function Popup() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<'home' | 'jobs' | 'settings'>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfig().then(cfg => {
      setApiKey(cfg.apiKey);
      setLoading(false);
      if (cfg.apiKey) {
        getRecentJobs(5).then(setJobs).catch(() => {});
      }
    });
  }, []);

  const saveKey = async () => {
    await setConfig({ apiKey, apiBase: WOKGEN_API_BASE });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openSidePanel = () => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) browser.sidePanel.open({ tabId: tab.id });
    });
    window.close();
  };

  if (loading) return <div className="popup-loading">Loading…</div>;

  return (
    <div className="popup-root">
      <header className="popup-header">
        <span className="popup-logo">⬡ WokGen</span>
        <nav className="popup-tabs">
          {(['home', 'jobs', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'home' && (
        <div className="popup-section">
          {!apiKey ? (
            <div className="popup-onboard">
              <p>Connect your WokGen API key to get started.</p>
              <button onClick={() => setTab('settings')} className="popup-btn-primary">
                Add API Key
              </button>
            </div>
          ) : (
            <div className="popup-actions">
              <button className="popup-action-card" onClick={openSidePanel}>
                <span>🎨</span>
                <span>Open Studio Panel</span>
              </button>
              <a
                className="popup-action-card"
                href={`${WOKGEN_API_BASE}/studio/pixel`}
                target="_blank"
                rel="noreferrer"
              >
                <span>✦</span>
                <span>Open WokGen</span>
              </a>
            </div>
          )}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="popup-section">
          <p className="popup-section-title">Recent Generations</p>
          {jobs.length === 0 ? (
            <p className="popup-empty">No recent generations.</p>
          ) : (
            <ul className="popup-job-list">
              {jobs.map(job => (
                <li key={job.id} className="popup-job-item">
                  <span className={`popup-job-status popup-job-status--${job.status}`} />
                  <span className="popup-job-prompt">{job.prompt.slice(0, 60)}</span>
                  {job.outputUrl && (
                    <a href={job.outputUrl} target="_blank" rel="noreferrer" className="popup-job-view">
                      View
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="popup-section">
          <label className="popup-label">API Key</label>
          <input
            type="password"
            className="popup-input"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="wok_..."
          />
          <button className="popup-btn-primary" onClick={saveKey}>
            {saved ? '✓ Saved' : 'Save'}
          </button>
          <a
            className="popup-link"
            href={`${WOKGEN_API_BASE}/account/api-keys`}
            target="_blank"
            rel="noreferrer"
          >
            Get your API key →
          </a>
        </div>
      )}
    </div>
  );
}
