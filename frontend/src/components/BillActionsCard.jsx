export function BillActionsCard({
  billIdInput, setBillIdInput, billLink,
  onLoad, onContribute, onCancel, onRefund,
  loading,
}) {
  const copyLink = async () => {
    if (!billLink) return
    try { await navigator.clipboard.writeText(billLink) } catch { /* ignore */ }
  }

  return (
    <div className="glass-card">
      {/* Bill ID row */}
      <div className="field">
        <label className="field-label" htmlFor="bill-id-input">Bill ID</label>
        <div className="bill-id-row">
          <input
            id="bill-id-input"
            className="field-input"
            value={billIdInput}
            onChange={(e) => setBillIdInput(e.target.value.trim())}
            placeholder="Enter Bill ID"
            type="number"
            min="1"
          />
          <button
            id="load-bill-btn"
            className="btn btn-outline-teal"
            onClick={onLoad}
            disabled={loading}
          >
            Load Bill
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="actions-grid">
        {/* Pay My Share — full width */}
        <button
          id="contribute-btn"
          className="btn btn-primary actions-full"
          onClick={onContribute}
          disabled={loading}
        >
          Pay My Share
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_balance_wallet</span>
        </button>

        {/* Cancel | Refund */}
        <button id="cancel-bill-btn" className="btn btn-danger" onClick={onCancel} disabled={loading}>
          Cancel Bill
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
        </button>
        <button id="claim-refund-btn" className="btn btn-ghost" onClick={onRefund} disabled={loading}>
          Claim Refund
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>currency_exchange</span>
        </button>

        {/* Copy Link — full width */}
        <button
          id="copy-link-btn"
          className="btn btn-ghost actions-full"
          onClick={copyLink}
          disabled={loading || !billLink}
        >
          Copy Link
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
        </button>
      </div>

      {billLink && (
        <div className="link-box" id="bill-link-display">{billLink}</div>
      )}
    </div>
  )
}
