export default function EralLoading() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '80vh' }}>
      <div style={{ height: '48px', borderRadius: '6px', background: 'var(--surface-raised)', animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ flex: 1, borderRadius: '10px', background: 'var(--surface-raised)', animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ height: '60px', borderRadius: '6px', background: 'var(--surface-raised)', animation: 'pulse 1.5s ease infinite' }} />
    </div>
  );
}
