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
import { useState, useEffect } from 'react'
import { Documentation }     from './pages/Documentation'
import { Privacy }           from './pages/Privacy'
import { Terms }             from './pages/Terms'
import { Support }           from './pages/Support'
import { History }           from './pages/History'

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

  const [route, setRoute] = useState(window.location.hash.replace('#', '') || 'home')
  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.replace('#', '') || 'home')
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  let content;
  if (route === 'docs') {
    content = <div className="animate-in"><Documentation /></div>
  } else if (route === 'privacy') {
    content = <div className="animate-in"><Privacy /></div>
  } else if (route === 'terms') {
    content = <div className="animate-in"><Terms /></div>
  } else if (route === 'support') {
    content = <div className="animate-in"><Support /></div>
  } else if (route === 'history') {
    content = <div className="animate-in"><History getProviderContract={getProviderContract} walletAddress={walletAddress} /></div>
  } else {
    // Default Home view
    content = (
      <>
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
      </>
    )
  }

  return (
    <>
      <ErrorBoundary>
        <Navbar
          walletAddress={walletAddress}
          connecting={connecting}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
          route={route}
        />
      </ErrorBoundary>

      <div className="app-shell">
        {content}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">LiteBill</div>
          <div className="footer-copy">© 2026 LiteBill Protocol. Secured by zK-Proofs.</div>
          <div className="footer-links">
            <a href="#docs" className="footer-link">Documentation</a>
            <a href="#privacy" className="footer-link">Privacy</a>
            <a href="#terms" className="footer-link">Terms</a>
            <a href="https://github.com/aeemayo" target="_blank" rel="noreferrer" className="footer-link">Github</a>
            <a href="#support" className="footer-link">Support</a>
          </div>
        </div>
      </footer>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default App
