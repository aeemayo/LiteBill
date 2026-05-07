export function Documentation() {
  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title" style={{ fontSize: '32px' }}>Documentation</h2>
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
        <p>Welcome to the LiteBill Protocol documentation.</p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>How it Works</h3>
        <p>
          LiteBill allows groups to split expenses transparently on the LitVM LiteForge network using zKLTC.
          When a bill is created, a smart contract securely holds all contributed funds until the target amount is met.
        </p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Creating a Bill</h3>
        <p>
          1. Connect your wallet.<br />
          2. Enter the Payee Address where the funds should be sent.<br />
          3. Set the Total Amount in zKLTC and the number of Participants.<br />
          4. (Optional) Set an expiry date.<br />
          5. Click "Create Bill" and approve the transaction.
        </p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Settlement</h3>
        <p>
          Once all participants have paid their share, the contract automatically transfers the total amount to the Payee.
          If the bill expires before being fully funded, participants can claim a refund.
        </p>
      </div>
    </div>
  )
}
