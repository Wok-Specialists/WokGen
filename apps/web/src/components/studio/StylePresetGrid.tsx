'use client';

interface QuickPreset {
  id: string;
  label: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  { id: 'rpg_icon',       label: 'RPG Icon'     },
  { id: 'emoji',          label: 'Emoji'        },
  { id: 'tileset',        label: 'Tileset'      },
  { id: 'sprite_sheet',   label: 'Sprite Sheet' },
  { id: 'character_idle', label: 'Character'    },
  { id: 'top_down_char',  label: 'Top-Down'     },
  { id: 'horror',         label: 'Horror'       },
  { id: 'sci_fi',         label: 'Sci-Fi'       },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function StylePresetGrid({ value, onChange }: Props) {
  return (
    <div className="pixel-studio-style-grid">
      {QUICK_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          className="pixel-studio-style-card"
          style={{
            background: value === p.id ? 'var(--accent-dim)' : 'var(--surface-overlay)',
            border: `2px solid ${value === p.id ? 'var(--accent)' : 'var(--surface-border)'}`,
            color: value === p.id ? 'var(--accent)' : 'var(--text-muted)',
          }}
          onClick={() => onChange(p.id)}
          title={p.label}
          aria-pressed={value === p.id}
        >
          <span className="pixel-studio-style-card__label">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
