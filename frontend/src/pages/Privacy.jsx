export function Privacy() {
  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title" style={{ fontSize: '32px' }}>Privacy Policy</h2>
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Data Collection</h3>
        <p>
          LiteBill Protocol is a decentralized application. We do not collect, store, or process any personal data on centralized servers.
          All transaction data, including wallet addresses and bill details, are stored on the public LitVM LiteForge blockchain.
        </p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Blockchain Transparency</h3>
        <p>
          Because LiteBill operates on a public ledger, any transactions you make, including creating bills, contributing, and claiming refunds, are publicly visible and permanently recorded.
        </p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Third-Party Services</h3>
        <p>
          We use decentralized RPC endpoints and standard web3 wallet providers (like MetaMask). Their privacy policies govern how they handle your data when interacting with the blockchain.
        </p>
      </div>
    </div>
  )
}
