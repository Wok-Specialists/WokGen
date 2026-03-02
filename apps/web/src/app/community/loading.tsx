export default function CommunityLoading() {
  return (
    <div className="page-loading-wrap cml-wrap">
      {/* Header */}
      <div className="page-loading-header cml-header-skeletons">
        <div className="page-loading-skeleton cml-header-skel-title" />
        <div className="page-loading-skeleton cml-header-skel-btn" />
      </div>
      {/* Filters */}
      <div className="cml-filter-row">
        {[80, 100, 90, 70, 110].map((w, i) => (
          <div key={i} className="page-loading-skeleton cml-filter-item" style={{ width: `${w}px` }} />
        ))}
      </div>
      {/* Grid */}
      <div className="page-loading-grid cml-grid">
        {Array(12).fill(0).map((_, i) => (
          <div key={i} className="page-loading-skeleton cml-card" />
        ))}
      </div>
    </div>
  );
}
