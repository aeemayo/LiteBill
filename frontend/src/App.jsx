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
    walletAddress, connecting, connectWallet,
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
      {/* Sticky top navbar with wallet connect */}
      <ErrorBoundary>
        <Navbar
          walletAddress={walletAddress}
          connecting={connecting}
          onConnect={connectWallet}
        />
      </ErrorBoundary>

      <main className="app-shell">
        <header className="app-header">
          <p className="app-subtitle">Group expense settlement with Litecoin on LitVM</p>
        </header>

        {/* Create Bill */}
        <ErrorBoundary>
          <CreateBillCard onCreateBill={createBill} loading={loading} />
        </ErrorBoundary>

        {/* Bill Actions */}
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

        {/* Bill Status / Skeleton */}
        <ErrorBoundary>
          {showSkeleton ? (
            <BillSkeleton />
          ) : (
            <BillStatusCard bill={bill} isListening={isListening} />
          )}
        </ErrorBoundary>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default App
