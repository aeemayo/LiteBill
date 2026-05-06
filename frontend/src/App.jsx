import { useToast, ToastContainer } from './components/Toast'
import { useWallet }        from './hooks/useWallet'
import { useContract }      from './hooks/useContract'
import { ErrorBoundary }    from './components/ErrorBoundary'
import { ConnectionCard }   from './components/ConnectionCard'
import { CreateBillCard }   from './components/CreateBillCard'
import { BillActionsCard }  from './components/BillActionsCard'
import { BillStatusCard }   from './components/BillStatusCard'
import { BillSkeleton }     from './components/BillSkeleton'

function App() {
  const { toasts, addToast, removeToast } = useToast()

  const {
    walletAddress, contractAddress, setContractAddress,
    connecting, connectWallet,
    getProviderContract, getSignerContract,
  } = useWallet(addToast)

  const {
    bill, billIdInput, setBillIdInput, billLink,
    loading, isListening,
    fetchBill, createBill, contribute, cancelBill, claimRefund,
  } = useContract(contractAddress, getProviderContract, getSignerContract, addToast)

  const showSkeleton = loading && !bill

  return (
    <>
      <main className="app-shell">
        {/* Header */}
        <header className="app-header">
          <div className="app-logo">
            <div className="app-logo-icon">Ł</div>
            <h1 className="app-title">LiteBill</h1>
          </div>
          <p className="app-subtitle">Group expense settlement with Litecoin on LitVM</p>
        </header>

        {/* Connection */}
        <ErrorBoundary>
          <ConnectionCard
            contractAddress={contractAddress}
            setContractAddress={setContractAddress}
            walletAddress={walletAddress}
            connecting={connecting}
            onConnect={connectWallet}
          />
        </ErrorBoundary>

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
