import { useState, useMemo } from 'react'
import { ethers } from 'ethers'

export function CreateBillCard({ onCreateBill, loading }) {
  const [payee, setPayee]               = useState('')
  const [totalLtc, setTotalLtc]         = useState('')
  const [participants, setParticipants] = useState('')
  const [useExpiry, setUseExpiry]       = useState(false)
  const [expiresAt, setExpiresAt]       = useState('')

  // Live share preview
  const sharePreview = useMemo(() => {
    const total = parseFloat(totalLtc)
    const count = parseInt(participants, 10)
    if (total > 0 && count > 0 && total % count === 0) {
      return `Each participant pays ${(total / count).toFixed(6).replace(/\.?0+$/, '')} LTC`
    }
    if (total > 0 && count > 0) return 'Total must divide equally among participants'
    return null
  }, [totalLtc, participants])

  const handleSubmit = () => {
    if (!payee || !ethers.isAddress(payee))
      return alert('Enter a valid payee address.')
    if (!totalLtc || Number(totalLtc) <= 0)
      return alert('Enter a valid total LTC amount.')
    if (!participants || Number(participants) <= 0)
      return alert('Enter a valid participant count.')
    if (useExpiry && !expiresAt)
      return alert('Set an expiry date/time or disable the expiry toggle.')

    onCreateBill({ payee, totalLtc, participantCount: participants, expiresAt: useExpiry ? expiresAt : null })
  }

  // Min datetime-local = now + 5 min
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <section className="card" id="create-bill-card">
      <div className="card-header">
        <div className="card-icon">📋</div>
        <h2 className="card-title">Create Bill</h2>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="payee-address">Payee Address</label>
        <input
          id="payee-address"
          className="field-input"
          value={payee}
          onChange={(e) => setPayee(e.target.value.trim())}
          placeholder="0x…"
          spellCheck={false}
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="field-label" htmlFor="total-ltc">Total Amount (LTC)</label>
          <input
            id="total-ltc"
            className="field-input"
            type="number"
            min="0"
            step="any"
            value={totalLtc}
            onChange={(e) => setTotalLtc(e.target.value)}
            placeholder="1.5"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="participant-count">Participants</label>
          <input
            id="participant-count"
            className="field-input"
            type="number"
            min="1"
            step="1"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="3"
          />
        </div>
      </div>

      {sharePreview && (
        <div className="share-preview">{sharePreview}</div>
      )}

      {/* Expiry toggle */}
      <div
        className="toggle-row"
        id="expiry-toggle"
        role="switch"
        aria-checked={useExpiry}
        onClick={() => setUseExpiry(v => !v)}
      >
        <span className="toggle-label">⏰ Set expiry deadline</span>
        <div className={`toggle-track${useExpiry ? ' on' : ''}`}>
          <div className="toggle-knob" />
        </div>
      </div>

      {useExpiry && (
        <div className="field">
          <label className="field-label" htmlFor="expiry-datetime">Expires At</label>
          <input
            id="expiry-datetime"
            className="field-input"
            type="datetime-local"
            min={minDatetime}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <span className="field-hint">
            After this time, the bill can no longer be contributed to and participants may claim refunds.
          </span>
        </div>
      )}

      <button
        id="create-bill-btn"
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', marginTop: '0.25rem' }}
      >
        {loading ? '⏳ Creating…' : '✦ Create Bill'}
      </button>
    </section>
  )
}
