function getStateKey(bill) {
  if (bill.settled)   return 'settled'
  if (bill.cancelled) return 'cancelled'
  if (bill.expired)   return 'expired'
  return 'open'
}

const STATE_LABEL = { open: 'Open', settled: 'Settled', cancelled: 'Cancelled', expired: 'Expired' }

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 10)}…${addr.slice(-8)}` : '—'
}

export function BillStatusCard({ bill, isListening }) {
  if (!bill) return null

  const state    = getStateKey(bill)
  const total    = parseFloat(bill.totalAmount)
  const contrib  = parseFloat(bill.totalContributed)
  const pct      = total > 0 ? Math.min((contrib / total) * 100, 100) : 0
  const complete = pct >= 100

  const expiryStr = bill.expiresAt
    ? new Date(bill.expiresAt * 1000).toLocaleString()
    : 'None'

  return (
    <section className="card" id="bill-status-card">
      <div className="bill-header">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div className="card-icon">📊</div>
          <h2 className="card-title">Bill Status</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className={`badge badge-${state}`}>{STATE_LABEL[state]}</span>
          {isListening && (
            <span className="live-indicator">
              <span className="live-dot" /> LIVE
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-wrap">
        <div className="progress-labels">
          <span>{contrib} / {bill.totalAmount} zKLTC</span>
          <span>{bill.contributors}/{bill.participantCount} contributors</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill${complete ? ' complete' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="bill-rows">
        {[
          ['Creator', shortAddr(bill.creator), false],
          ['Payee',   shortAddr(bill.payee),   false],
          ['Total',       `${bill.totalAmount} zKLTC`,      true],
          ['Per share',   `${bill.shareAmount} zKLTC`,      false],
          ['Contributed', `${bill.totalContributed} zKLTC`, false],
          ['Expires', expiryStr, false],
        ].map(([lbl, val, accent]) => (
          <div className="bill-row" key={lbl}>
            <span className="bill-row-lbl">{lbl}</span>
            <span className={`bill-row-val${accent ? ' accent' : ''}`} title={val}>{val}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
