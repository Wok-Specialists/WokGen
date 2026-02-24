'use client';

import { useState } from 'react';
import {
  buildBrandPrompt,
  colorFromBrandName,
  type BrandWizardData,
  type VisualStyle,
  type LayoutPreference,
} from '@/lib/brand-prompt-builder';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INDUSTRIES = [
  'Technology', 'Retail', 'Food & Beverage', 'Healthcare', 'Finance',
  'Education', 'Entertainment', 'Real Estate', 'Other',
];

const STYLE_CARDS: {
  id: VisualStyle;
  label: string;
  desc: string;
  palette: string[];
}[] = [
  {
    id: 'modern_minimalist',
    label: 'Modern Minimalist',
    desc: 'Clean lines, white space, subtle typography',
    palette: ['#ffffff', '#f1f5f9', '#64748b', '#1e293b'],
  },
  {
    id: 'bold_dynamic',
    label: 'Bold & Dynamic',
    desc: 'High contrast, geometric shapes, strong presence',
    palette: ['#f97316', '#fbbf24', '#1e40af', '#111827'],
  },
  {
    id: 'elegant_premium',
    label: 'Elegant Premium',
    desc: 'Gold accents, refined typography, luxury feel',
    palette: ['#d4af37', '#f5f0e8', '#1a1a2e', '#8b7355'],
  },
  {
    id: 'playful_creative',
    label: 'Playful & Creative',
    desc: 'Vibrant colors, friendly curves, expressive',
    palette: ['#ec4899', '#a855f7', '#06b6d4', '#fbbf24'],
  },
];

const LAYOUT_OPTIONS: { id: LayoutPreference; label: string }[] = [
  { id: 'horizontal',  label: 'Horizontal' },
  { id: 'vertical',    label: 'Vertical' },
  { id: 'icon_only',   label: 'Icon Only' },
  { id: 'full_lockup', label: 'Full Lockup' },
];

const MOODS = ['Professional', 'Energetic', 'Trustworthy', 'Creative', 'Luxury'];

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BrandWizardProps {
  onGenerate: (prompt: string, data: BrandWizardData) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BrandWizard({ onGenerate }: BrandWizardProps) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');

  // Step 1
  const [brandName,   setBrandName]   = useState('');
  const [industry,    setIndustry]    = useState('');
  const [websiteUrl,  setWebsiteUrl]  = useState('');

  // Step 2
  const [visualStyle,       setVisualStyle]       = useState<VisualStyle>('modern_minimalist');
  const [layoutPreference,  setLayoutPreference]  = useState<LayoutPreference>('horizontal');

  // Step 3
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [moods,        setMoods]        = useState<string[]>(['Professional']);

  const goNext = () => {
    setAnimDir('forward');
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setAnimDir('back');
    setStep(s => Math.max(s - 1, 0));
  };

  const toggleMood = (mood: string) => {
    setMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const handleGeneratePalette = () => {
    if (brandName.trim()) setPrimaryColor(colorFromBrandName(brandName.trim()));
  };

  const handleSubmit = () => {
    const data: BrandWizardData = {
      brandName: brandName.trim(),
      industry,
      websiteUrl: websiteUrl.trim(),
      visualStyle,
      layoutPreference,
      primaryColor,
      moods,
    };
    onGenerate(buildBrandPrompt(data), data);
  };

  const canProceedStep1 = brandName.trim().length > 0;

  const stepKeys = ['identity', 'style', 'color', 'generate'] as const;

  return (
    <div className="biz-studio-wizard">
      {/* Step indicator */}
      <div className="biz-studio-wizard-steps">
        {stepKeys.map((key, i) => (
          <div
            key={key}
            className={[
              'biz-studio-wizard-step-dot',
              i === step ? 'biz-studio-wizard-step-dot--active' : '',
              i < step   ? 'biz-studio-wizard-step-dot--done'   : '',
            ].join(' ')}
            title={['Brand Identity', 'Visual Style', 'Color Direction', 'Generate'][i]}
          />
        ))}
      </div>

      {/* Panels container */}
      <div
        className="biz-studio-wizard-panels-track"
        style={{ transform: `translateX(-${step * 100}%)` }}
        data-anim={animDir}
      >

        {/* ── Step 0: Brand Identity ─────────────────────────────────── */}
        <div className="biz-studio-wizard-panel">
          <h3 className="biz-studio-wizard-title">Brand Identity</h3>

          <div className="biz-studio-wizard-field">
            <label className="studio-label">
              Brand Name <span style={{ color: 'var(--error,#ef4444)' }}>*</span>
            </label>
            <input
              className="studio-input"
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value.slice(0, 50))}
              placeholder="e.g. TechCorp"
              maxLength={50}
            />
            <span className="biz-studio-wizard-charcount">
              {brandName.length}/50
            </span>
          </div>

          <div className="biz-studio-wizard-field">
            <label className="studio-label">Industry</label>
            <select
              className="studio-select"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            >
              <option value="">— Select industry —</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="biz-studio-wizard-field">
            <label className="studio-label">
              Website / App URL <span className="studio-label-opt">(optional)</span>
            </label>
            <input
              className="studio-input"
              type="url"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* ── Step 1: Visual Style ───────────────────────────────────── */}
        <div className="biz-studio-wizard-panel">
          <h3 className="biz-studio-wizard-title">Visual Style</h3>

          <div className="biz-studio-style-cards">
            {STYLE_CARDS.map(card => (
              <button
                key={card.id}
                type="button"
                className={[
                  'biz-studio-style-card',
                  visualStyle === card.id ? 'biz-studio-style-card--selected' : '',
                ].join(' ')}
                onClick={() => setVisualStyle(card.id)}
              >
                <div className="biz-studio-style-card__palette">
                  {card.palette.map((col, i) => (
                    <span
                      key={i}
                      className="biz-studio-style-card__swatch"
                      style={{ background: col }}
                    />
                  ))}
                </div>
                <span className="biz-studio-style-card__label">{card.label}</span>
                <span className="biz-studio-style-card__desc">{card.desc}</span>
              </button>
            ))}
          </div>

          <div className="biz-studio-wizard-field" style={{ marginTop: '1rem' }}>
            <label className="studio-label">Layout Preference</label>
            <div className="studio-preset-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {LAYOUT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`studio-preset-btn${layoutPreference === opt.id ? ' active' : ''}`}
                  onClick={() => setLayoutPreference(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step 2: Color Direction ────────────────────────────────── */}
        <div className="biz-studio-wizard-panel">
          <h3 className="biz-studio-wizard-title">Color Direction</h3>

          <div className="biz-studio-wizard-field">
            <label className="studio-label">Primary Color</label>
            <div className="biz-studio-wizard-color-row">
              <input
                type="color"
                className="biz-studio-wizard-color-input"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
              />
              <input
                className="studio-input biz-studio-wizard-hex-input"
                type="text"
                value={primaryColor}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setPrimaryColor(v);
                }}
                maxLength={7}
                placeholder="#2563eb"
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                onClick={handleGeneratePalette}
                title="Algorithmically derive color from your brand name"
                disabled={!brandName.trim()}
              >
                Generate from name
              </button>
            </div>
          </div>

          <div className="biz-studio-wizard-field">
            <label className="studio-label">Brand Mood</label>
            <div className="biz-studio-mood-toggles">
              {MOODS.map(mood => (
                <button
                  key={mood}
                  type="button"
                  className={[
                    'biz-studio-mood-toggle',
                    moods.includes(mood) ? 'biz-studio-mood-toggle--active' : '',
                  ].join(' ')}
                  onClick={() => toggleMood(mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step 3: Generate ──────────────────────────────────────── */}
        <div className="biz-studio-wizard-panel">
          <h3 className="biz-studio-wizard-title">Ready to Generate</h3>

          <div className="biz-studio-wizard-summary">
            <div className="biz-studio-wizard-summary-row">
              <span className="biz-studio-wizard-summary-key">Brand</span>
              <span className="biz-studio-wizard-summary-val">{brandName || '—'}</span>
            </div>
            {industry && (
              <div className="biz-studio-wizard-summary-row">
                <span className="biz-studio-wizard-summary-key">Industry</span>
                <span className="biz-studio-wizard-summary-val">{industry}</span>
              </div>
            )}
            <div className="biz-studio-wizard-summary-row">
              <span className="biz-studio-wizard-summary-key">Style</span>
              <span className="biz-studio-wizard-summary-val">
                {STYLE_CARDS.find(c => c.id === visualStyle)?.label}
              </span>
            </div>
            <div className="biz-studio-wizard-summary-row">
              <span className="biz-studio-wizard-summary-key">Layout</span>
              <span className="biz-studio-wizard-summary-val">
                {LAYOUT_OPTIONS.find(l => l.id === layoutPreference)?.label}
              </span>
            </div>
            <div className="biz-studio-wizard-summary-row">
              <span className="biz-studio-wizard-summary-key">Color</span>
              <span className="biz-studio-wizard-summary-val biz-studio-wizard-summary-color">
                <span
                  className="biz-studio-wizard-swatch-dot"
                  style={{ background: primaryColor }}
                />
                {primaryColor}
              </span>
            </div>
            {moods.length > 0 && (
              <div className="biz-studio-wizard-summary-row">
                <span className="biz-studio-wizard-summary-key">Mood</span>
                <span className="biz-studio-wizard-summary-val">{moods.join(', ')}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-generate biz-studio-wizard-generate-btn"
            onClick={handleSubmit}
            disabled={!brandName.trim()}
          >
            Generate Brand Assets
          </button>
        </div>

      </div>{/* end panels track */}

      {/* Navigation */}
      <div className="biz-studio-wizard-nav">
        {step > 0 && (
          <button
            type="button"
            className="btn-secondary biz-studio-wizard-back-btn"
            onClick={goBack}
          >
            ← Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 && (
          <button
            type="button"
            className="btn btn-primary biz-studio-wizard-next-btn"
            onClick={goNext}
            disabled={step === 0 && !canProceedStep1}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
