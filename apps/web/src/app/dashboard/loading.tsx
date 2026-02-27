export default function DashboardLoading() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: '120px', borderRadius: '10px', background: 'var(--surface-card)', animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  );
}
