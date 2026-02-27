export default function BillingSection() {
  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', background: 'var(--surface-card)' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>Billing</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
        WokGen is free to use — no subscription required. For enterprise needs (dedicated
        infrastructure, SSO, white-label, custom models), contact us directly.
      </p>
      <a
        href="https://wokspec.org/consult"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 1rem',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          background: 'transparent',
          transition: 'border-color 0.15s, color 0.15s',
        }}
      >
        Enterprise enquiry →
      </a>
    </section>
  );
}
