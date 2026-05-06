export function BillSkeleton() {
  return (
    <section className="card" id="bill-skeleton">
      <div className="card-header" style={{ marginBottom: '1.25rem' }}>
        <div className="card-icon">📊</div>
        <h2 className="card-title">Bill Status</h2>
      </div>

      <div className="skel skel-head" />
      <div className="skel skel-prog" />

      {[100, 75, 90, 65, 80, 55].map((w, i) => (
        <div
          key={i}
          className="skel skel-row"
          style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </section>
  )
}
