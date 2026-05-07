import { useState, useRef, useEffect } from 'react'

export function Navbar({ walletAddress, connecting, onConnect, onDisconnect }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const short = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleDisconnect = () => { setMenuOpen(false); onDisconnect() }
  const copyAddress = () => { navigator.clipboard.writeText(walletAddress); setMenuOpen(false) }

  return (
    <nav className="navbar" role="navigation" aria-label="Site navigation">
      <div className="navbar-brand">LiteBill</div>

      <div className="navbar-nav">
        <a href="#" className="navbar-nav-link active">Dashboard</a>
        <a href="#" className="navbar-nav-link">History</a>
      </div>

      <div className="navbar-actions">
        {walletAddress ? (
          <div className="wallet-menu-wrap" ref={menuRef}>
            <button
              id="wallet-address-btn"
              className="navbar-wallet-btn navbar-wallet-connected"
              onClick={() => setMenuOpen((o) => !o)}
              title={walletAddress}
              aria-expanded={menuOpen}
            >
              <span className="wallet-dot" />
              {short(walletAddress)}
              <span className="wallet-chevron">{menuOpen ? '▴' : '▾'}</span>
            </button>
            {menuOpen && (
              <div className="wallet-dropdown" role="menu">
                <div className="wallet-dropdown-addr">
                  <span className="wallet-dot" />
                  <span className="wallet-dropdown-addrtext">{walletAddress}</span>
                </div>
                <hr className="wallet-dropdown-divider" />
                <button id="copy-address-btn" className="wallet-dropdown-item" role="menuitem" onClick={copyAddress}>
                  📋 Copy address
                </button>
                <button id="disconnect-wallet-btn" className="wallet-dropdown-item wallet-dropdown-danger" role="menuitem" onClick={handleDisconnect}>
                  ⏏ Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            id="connect-wallet-btn"
            className="navbar-wallet-btn"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  )
}
