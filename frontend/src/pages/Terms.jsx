export function Terms() {
  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title" style={{ fontSize: '32px' }}>Terms of Service</h2>
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
        <p>
          By accessing and using the LiteBill Protocol, you accept and agree to be bound by the terms and provisions of this agreement.
          LiteBill is provided "as is" and "as available" without warranty of any kind.
        </p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Smart Contract Risks</h3>
        <p>
          LiteBill uses smart contracts deployed on the LitVM LiteForge network. You acknowledge that blockchain technologies and smart contracts involve inherent risks, including but not limited to bugs, vulnerabilities, and potential loss of funds. You use the protocol entirely at your own risk.
        </p>
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. User Responsibilities</h3>
        <p>
          You are responsible for safeguarding your wallet and private keys. We cannot recover lost funds or reverse transactions executed on the blockchain. Ensure you verify payee addresses and amounts before confirming transactions.
        </p>
      </div>
    </div>
  )
}
