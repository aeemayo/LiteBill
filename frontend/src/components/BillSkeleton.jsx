export function BillSkeleton() {
  return (
    <div className="bill-status-card" id="bill-skeleton">
      <div className="bill-card-header">
        <div className="skeleton-line" style={{ width: '120px', height: '24px' }} />
        <div className="skeleton-line" style={{ width: '64px', height: '22px', borderRadius: '999px' }} />
      </div>
      <div className="progress-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div className="skeleton-line" style={{ width: '100px', height: '14px' }} />
          <div className="skeleton-line" style={{ width: '80px', height: '14px' }} />
        </div>
        <div className="skeleton-line" style={{ width: '100%', height: '6px', borderRadius: '999px' }} />
      </div>
      {[140, 160, 100, 120, 130, 90].map((w, i) => (
        <div className="bill-row" key={i} style={{ border: 'none', paddingBottom: '0.875rem' }}>
          <div className="skeleton-line" style={{ width: '80px', height: '14px' }} />
          <div className="skeleton-line" style={{ width: `${w}px`, height: '14px' }} />
        </div>
      ))}
    </div>
  )
}
