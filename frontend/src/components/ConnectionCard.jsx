export function ConnectionCard({ contractAddress, setContractAddress }) {
  return (
    <section className="card" id="connection-card">
      <div className="card-header">
        <div className="card-icon">⚙️</div>
        <h2 className="card-title">Contract Settings</h2>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
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
        <span className="field-hint">
          Address of the deployed LiteBill contract on LitVM LiteForge.
        </span>
      </div>
    </section>
  )
}
