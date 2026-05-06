export function Navbar({ walletAddress, connecting, onConnect }) {
  const short = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

  return (
    <nav className="navbar" role="navigation" aria-label="Site navigation">
      <div className="navbar-brand">
        <div className="navbar-logo">Ł</div>
        <span className="navbar-name">LiteBill</span>
      </div>

      <div className="navbar-actions">
        {walletAddress ? (
          <button
            id="wallet-reconnect-btn"
            className="btn navbar-wallet-btn navbar-wallet-connected"
            onClick={onConnect}
            disabled={connecting}
            title={walletAddress}
          >
            <span className="wallet-dot" />
            {short(walletAddress)}
          </button>
        ) : (
          <button
            id="connect-wallet-btn"
            className="btn btn-primary navbar-wallet-btn"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? '⏳ Connecting…' : '🦊 Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  )
}
