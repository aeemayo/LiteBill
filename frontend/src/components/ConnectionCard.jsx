export function ConnectionCard({ contractAddress, setContractAddress, walletAddress, connecting, onConnect }) {
  const short = (addr) => addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : ''
  return (
    <section className="card" id="connection-card">
      <div className="card-header">
        <div className="card-icon">🔌</div>
        <h2 className="card-title">Connection</h2>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="contract-address">LiteBill Contract Address</label>
        <input
          id="contract-address"
          className="field-input"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value.trim())}
          placeholder="0x…"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <button
        id="connect-wallet-btn"
        className="btn btn-primary"
        onClick={onConnect}
        disabled={connecting}
      >
        {connecting ? '⏳ Connecting…' : walletAddress ? '🔄 Reconnect Wallet' : '🦊 Connect MetaMask'}
      </button>

      {walletAddress ? (
        <div className="wallet-chip">
          <span className="wallet-dot" />
          <span className="wallet-addr" title={walletAddress}>{short(walletAddress)}</span>
          <button
            className="btn btn-sm"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
            onClick={() => navigator.clipboard.writeText(walletAddress)}
            title="Copy address"
          >
            📋
          </button>
        </div>
      ) : (
        <p className="wallet-none">
          <span>○</span> Wallet not connected
        </p>
      )}
    </section>
  )
}
