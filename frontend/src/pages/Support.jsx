export function Support() {
  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="section-title" style={{ fontSize: '32px' }}>Support</h2>
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
        <p>Need help with LiteBill Protocol? We're here to assist you.</p>
        
        <h3 style={{ color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Community Support</h3>
        <p>
          The fastest way to get help is by opening an issue on our GitHub repository.
          Community members and maintainers actively monitor issues and pull requests.
        </p>
        
        <div style={{ marginTop: '2rem' }}>
          <a
            href="https://github.com/aeemayo/LiteBill/issues/new"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ width: 'auto', display: 'inline-flex' }}
          >
            Open a GitHub Issue
          </a>
        </div>
      </div>
    </div>
  )
}
