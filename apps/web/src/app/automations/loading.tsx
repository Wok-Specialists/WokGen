export default function AutomationsLoading() {
  return (
    <div className="page-loading-wrap aml-wrap">
      <div className="page-loading-skeleton aml-title" />
      <div className="aml-list">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="page-loading-skeleton aml-item" />
        ))}
      </div>
    </div>
  );
}
