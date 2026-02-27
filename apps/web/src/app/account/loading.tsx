export default function AccountLoading() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ height: '40px', width: '200px', borderRadius: '6px', background: 'var(--surface-raised)', animation: 'pulse 1.5s ease infinite' }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ height: '120px', borderRadius: '10px', background: 'var(--surface-raised)', animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  );
}
