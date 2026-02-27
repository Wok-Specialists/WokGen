export default function ToolsLoading() {
  return (
    <div className="tool-page-root" style={{ animation: 'pulse 1.5s ease infinite' }}>
      <div className="tool-page-header">
        <div style={{ height: '1.75rem', width: '200px', borderRadius: '6px', background: 'var(--surface-raised)', marginBottom: '0.5rem' }} />
        <div style={{ height: '1rem', width: '320px', borderRadius: '4px', background: 'var(--surface-card)' }} />
      </div>
      <div className="tool-section">
        <div style={{ height: '2.5rem', borderRadius: '8px', background: 'var(--surface-hover)' }} />
      </div>
    </div>
  );
}
