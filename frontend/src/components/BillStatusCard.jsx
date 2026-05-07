function getState(bill) {
  if (bill.settled)   return 'settled'
  if (bill.cancelled) return 'cancelled'
  if (bill.expired)   return 'expired'
  return 'open'
}
const STATE_LABEL = { open: 'Open', settled: 'Settled', cancelled: 'Cancelled', expired: 'Expired' }

function shortAddr(addr) {
  if (!addr) return '—'
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`
}

export function BillStatusCard({ bill, isListening }) {
  if (!bill) return null

  const state   = getState(bill)
  const contrib = Number(bill.totalContributed)
  const total   = Number(bill.totalAmount)
  const pct     = total > 0 ? Math.min((contrib / total) * 100, 100) : 0

  const expiryStr = bill.expiresAt
    ? new Date(bill.expiresAt * 1000).toLocaleString()
    : 'None'

  return (
    <div className="bill-status-card">
      <div className="bill-card-header">
        <div className="bill-header-left">
          <div className="bill-card-title">Bill Status</div>
        </div>
        <div className="bill-header-badges">
          <span className={`badge badge-${state}`}>{STATE_LABEL[state]}</span>
          {isListening && (
            <span className="live-indicator">
              <span className="live-dot" /> LIVE
            </span>
          )}
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-labels">
          <span>{contrib} / {total} zKLTC</span>
          <span>{bill.contributors}/{bill.participantCount} contributors</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bill-rows">
        {[
          ['Creator',     shortAddr(bill.creator),          false],
          ['Payee',       shortAddr(bill.payee),            false],
          ['Total',       `${bill.totalAmount} zKLTC`,      true],
          ['Per share',   `${bill.shareAmount} zKLTC`,      false],
          ['Contributed', `${bill.totalContributed} zKLTC`, false],
          ['Expires',     expiryStr,                        false],
        ].map(([lbl, val, accent]) => (
          <div className="bill-row" key={lbl}>
            <span className="bill-row-label">{lbl}</span>
            <span className={`bill-row-value${accent ? ' accent' : ''}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
