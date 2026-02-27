'use client';

/**
 * CmdKButton — small nav trigger to open the Command Palette.
 * Clicking dispatches a synthetic keydown event that CommandPalette listens for.
 */
export function CmdKButton() {
  const handleClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open command palette (⌘K)"
      title="Search and navigate (⌘K)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '4px 8px',
        cursor: 'pointer',
        color: 'var(--text-faint)',
        fontSize: '0.75rem',
        fontFamily: 'inherit',
        transition: 'border-color 0.12s, color 0.12s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-glow)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-faint)';
      }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="m10 10 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span className="nav-cmdk-label">Search</span>
      <kbd style={{
        fontSize: '0.65rem',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        padding: '1px 4px',
        lineHeight: 1.4,
        fontFamily: 'inherit',
      }}>⌘K</kbd>
    </button>
  );
}
