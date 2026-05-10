import { useState, useMemo } from 'react'
import { ethers } from 'ethers'

export function CreateBillCard({ onCreateBill, loading }) {
  const [payee, setPayee]               = useState('')
  const [totalLtc, setTotalLtc]         = useState('')
  const [participants, setParticipants] = useState('')
  const [useExpiry, setUseExpiry]       = useState(false)
  const [expiresAt, setExpiresAt]       = useState('')

  const sharePreview = useMemo(() => {
    const total = parseFloat(totalLtc)
    const count = parseInt(participants, 10)
    if (total > 0 && count > 0 && total % count === 0)
      return `Each participant pays ${(total / count).toFixed(6).replace(/\.?0+$/, '')} zKLTC`
    if (total > 0 && count > 0) return 'Total must divide equally among participants'
    return null
  }, [totalLtc, participants])

  const handleSubmit = () => {
    if (!payee || !ethers.isAddress(payee))
      return alert('Enter a valid payee address.')
    if (!totalLtc || Number(totalLtc) <= 0)
      return alert('Enter a valid total zKLTC amount.')
    if (!participants || Number(participants) <= 0)
      return alert('Enter a valid participant count.')
    if (useExpiry && !expiresAt)
      return alert('Set an expiry date/time or disable the expiry toggle.')
    onCreateBill({ payee, totalLtc, participantCount: participants, expiresAt: useExpiry ? expiresAt : null })
  }

  const [minDatetime] = useState(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })

  return (
    <div className="glass-card">
      {/* Payee */}
      <div className="field">
        <label className="field-label" htmlFor="payee-address">Payee Address</label>
        <input
          id="payee-address"
          className="field-input"
          value={payee}
          onChange={(e) => setPayee(e.target.value.trim())}
          placeholder="0x..."
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* Amount + Participants */}
      <div className="grid-2">
        <div className="field">
          <label className="field-label" htmlFor="total-ltc">Total Amount (zKLTC)</label>
          <input
            id="total-ltc"
            className="field-input"
            type="number"
            min="0"
            step="any"
            value={totalLtc}
            onChange={(e) => setTotalLtc(e.target.value)}
            placeholder="0.00"
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
            placeholder="2"
          />
        </div>
      </div>

      {sharePreview && <div className="share-preview">{sharePreview}</div>}

      {/* Expiry toggle */}
      <div
        className="toggle-row"
        id="expiry-toggle"
        role="switch"
        aria-checked={useExpiry}
        onClick={() => setUseExpiry(v => !v)}
      >
        <span className="toggle-label">Set expiry deadline</span>
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
            After this time the bill can no longer be contributed to and participants may claim refunds.
          </span>
        </div>
      )}

      <button
        id="create-bill-btn"
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Creating…' : 'Create Bill'}
      </button>
    </div>
  )
}
