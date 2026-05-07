import { useToast }          from './hooks/useToast'
import { ToastContainer }    from './components/Toast'
import { useWallet }         from './hooks/useWallet'
import { useContract }       from './hooks/useContract'
import { ErrorBoundary }     from './components/ErrorBoundary'
import { Navbar }            from './components/Navbar'
import { CreateBillCard }    from './components/CreateBillCard'
import { BillActionsCard }   from './components/BillActionsCard'
import { BillStatusCard }    from './components/BillStatusCard'
import { BillSkeleton }      from './components/BillSkeleton'

function App() {
  const { toasts, addToast, removeToast } = useToast()

  const {
    walletAddress, connecting, connectWallet, disconnectWallet,
    getProviderContract, getSignerContract,
  } = useWallet(addToast)

  const {
    bill, billIdInput, setBillIdInput, billLink,
    loading, isListening,
    fetchBill, createBill, contribute, cancelBill, claimRefund,
  } = useContract(getProviderContract, getSignerContract, addToast)

  const showSkeleton = loading && !bill

  return (
    <>
      <ErrorBoundary>
        <Navbar
          walletAddress={walletAddress}
          connecting={connecting}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
      </ErrorBoundary>

      <div className="app-shell">
        {/* Hero */}
        <header className="app-header animate-in">
          <h1 className="app-hero-title">LiteBill Protocol</h1>
          <p className="app-subtitle">
            Decentralized, secure, and transparent bill splitting powered by zero-knowledge proofs.
          </p>
        </header>

        {/* Two-column grid */}
        <div className="app-grid">
          <section>
            <h2 className="section-title">Create Bill</h2>
            <ErrorBoundary>
              <CreateBillCard onCreateBill={createBill} loading={loading} />
            </ErrorBoundary>
          </section>

          <section>
            <h2 className="section-title">Bill Actions</h2>
            <ErrorBoundary>
              <BillActionsCard
                billIdInput={billIdInput}
                setBillIdInput={setBillIdInput}
                billLink={billLink}
                onLoad={() => fetchBill()}
                onContribute={() => contribute(billIdInput)}
                onCancel={() => cancelBill(billIdInput)}
                onRefund={() => claimRefund(billIdInput)}
                loading={loading}
              />
            </ErrorBoundary>
          </section>
        </div>

        {/* Bill Status — full width below the grid */}
        {(bill || showSkeleton) && (
          <div className="bill-section animate-in">
            <ErrorBoundary>
              {showSkeleton ? <BillSkeleton /> : <BillStatusCard bill={bill} isListening={isListening} />}
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">LiteBill</div>
          <div className="footer-copy">© 2026 LiteBill Protocol. Secured by zK-Proofs.</div>
          <div className="footer-links">
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">Github</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
      </footer>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default App
