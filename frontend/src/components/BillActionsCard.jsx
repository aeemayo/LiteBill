export function BillActionsCard({
  billIdInput, setBillIdInput, billLink,
  onLoad, onContribute, onCancel, onRefund,
  loading,
}) {
  const copyLink = async () => {
    if (!billLink) return
    try {
      await navigator.clipboard.writeText(billLink)
      alert('Bill link copied!')
    } catch {
      alert('Copy failed — copy manually from the box below.')
    }
  }

  return (
    <section className="card" id="bill-actions-card">
      <div className="card-header">
        <div className="card-icon">⚡</div>
        <h2 className="card-title">Bill Actions</h2>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="bill-id-input">Bill ID</label>
        <input
          id="bill-id-input"
          className="field-input"
          value={billIdInput}
          onChange={(e) => setBillIdInput(e.target.value.trim())}
          placeholder="e.g. 1"
          type="number"
          min="1"
        />
      </div>

      <div className="btn-row">
        <button id="load-bill-btn"    className="btn"           onClick={onLoad}       disabled={loading}>🔍 Load Bill</button>
        <button id="contribute-btn"   className="btn btn-primary" onClick={onContribute} disabled={loading}>💸 Pay My Share</button>
        <button id="cancel-bill-btn"  className="btn btn-danger" onClick={onCancel}     disabled={loading}>✕ Cancel Bill</button>
        <button id="claim-refund-btn" className="btn"           onClick={onRefund}     disabled={loading}>↩ Claim Refund</button>
        <button id="copy-link-btn"    className="btn"           onClick={copyLink}     disabled={loading || !billLink}>🔗 Copy Link</button>
      </div>

      {billLink && (
        <div className="link-box" id="bill-link-display">{billLink}</div>
      )}
    </section>
  )
}
