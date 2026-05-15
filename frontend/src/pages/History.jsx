import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

function shortAddr(addr) {
  if (!addr) return '—'
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`
}

export function History({ getProviderContract, walletAddress }) {
  const [historyBills, setHistoryBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function fetchHistory() {
      if (!walletAddress) {
        setHistoryBills([])
        return
      }
      setLoading(true)
      setError('')
      try {
        const { contract } = getProviderContract()
        // 1. Fetch BillCreated events where user is creator or payee
        const createdFilter = contract.filters.BillCreated(null, walletAddress)
        const payeeFilter = contract.filters.BillCreated(null, null, walletAddress)
        
        const [createdEvents, payeeEvents] = await Promise.all([
          contract.queryFilter(createdFilter, 0, 'latest'),
          contract.queryFilter(payeeFilter, 0, 'latest')
        ])

        const uniqueIds = [...new Set([...createdEvents, ...payeeEvents].map(e => e.args.billId.toString()))]

        if (uniqueIds.length === 0) {
          if (active) setHistoryBills([])
          return
        }

        // 2. Fetch all bills in parallel
        const promises = uniqueIds.map(id => 
          Promise.all([
            contract.getBillStatus(id).catch(() => null),
            contract.getBillTiming(id).catch(() => null)
          ]).then(([status, timing]) => {
            if (!status || !timing) return null
            return {
              id: id,
              creator: status[0],
              payee: status[1],
              totalAmount: ethers.formatEther(status[2]),
              shareAmount: ethers.formatEther(status[3]),
              totalContributed: ethers.formatEther(status[4]),
              contributors: status[5].toString(),
              participantCount: status[6].toString(),
              settled: status[7],
              expiresAt: Number(timing[0]),
              cancelled: timing[1],
              expired: timing[2],
            }
          })
        )

        const allBills = await Promise.all(promises)
        
        // 3. Filter for past/complete bills (settled, cancelled, or expired)
        const pastBills = allBills
          .filter(b => b !== null)
          .filter(b => b.settled || b.cancelled || b.expired)
          // sort descending by time, or just id as string comparison won't work perfectly for random IDs,
          // but let's just sort alphabetically or leave it since it's random.
          // Wait, sorting by ID won't represent time since they are random.
          // The order of events is chronological, so we can just reverse the array!
          .reverse()

        if (active) setHistoryBills(pastBills)
      } catch (err) {
        console.error('fetchHistory error:', err)
        if (active) setError(err.shortMessage || err.message || 'Failed to load history. Make sure you are connected to LiteForge')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchHistory()
    return () => { active = false }
  }, [getProviderContract, walletAddress])

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', minHeight: '50vh', marginBottom: '4rem' }}>
      <h2 className="section-title" style={{ fontSize: '32px' }}>Transaction History</h2>
      
      {!walletAddress ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Please connect your wallet to view your history.
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading history...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error)' }}>
          {error}
        </div>
      ) : historyBills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No completed, cancelled, or expired bills found for your address.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {historyBills.map(bill => {
            let stateLabel = ''
            let badgeClass = ''
            if (bill.settled) { stateLabel = 'Settled'; badgeClass = 'badge-settled' }
            else if (bill.cancelled) { stateLabel = 'Cancelled'; badgeClass = 'badge-cancelled' }
            else if (bill.expired) { stateLabel = 'Deadline Passed'; badgeClass = 'badge-expired' }

            return (
              <div key={bill.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-label)', color: 'var(--text-muted)' }}>BILL #{bill.id}</span>
                    <span className={`badge ${badgeClass}`}>{stateLabel}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Total: <span style={{ color: 'var(--text)' }}>{bill.totalAmount} zKLTC</span> • 
                    Payee: <span style={{ fontFamily: 'monospace' }}>{shortAddr(bill.payee)}</span>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-teal"
                  onClick={() => window.location.hash = `#?billId=${bill.id}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '11px' }}
                >
                  View
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
