export default function BillingLoading() {
  return (
    <div className="page-loading-wrap bil-wrap">
      <div className="page-loading-skeleton bil-title-skel" />
      <div className="page-loading-grid bil-grid">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="page-loading-skeleton bil-plan-card" />
        ))}
      </div>
    </div>
  );
}
