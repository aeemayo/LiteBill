import { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { LITEBILL_ABI } from './litebillAbi'
import { LITVM_CHAIN, getExplorerTxUrl } from './config'
import './App.css'

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [contractAddress, setContractAddress] = useState(import.meta.env.VITE_LITEBILL_ADDRESS || '')
  const [billIdInput, setBillIdInput] = useState('')
  const [payee, setPayee] = useState('')
  const [totalLtc, setTotalLtc] = useState('')
  const [participantCount, setParticipantCount] = useState('')
  const [status, setStatus] = useState('')
  const [txHash, setTxHash] = useState('')
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(false)

  const billLink = useMemo(() => {
    if (!billIdInput) {
      return ''
    }
    const url = new URL(window.location.href)
    url.searchParams.set('billId', billIdInput)
    return url.toString()
  }, [billIdInput])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const billId = params.get('billId')
    if (billId) {
      setBillIdInput(billId)
    }
  }, [])

  const getProviderContract = () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is required')
    }
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      throw new Error('Enter a valid LiteBill contract address')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, LITEBILL_ABI, provider)
    return { provider, contract }
  }

  const getSignerContract = async () => {
    const { provider } = getProviderContract()
    await switchToLitvm()
    await provider.send('eth_requestAccounts', [])

    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, LITEBILL_ABI, signer)
    return { provider, signer, contract }
  }

  const switchToLitvm = async () => {
    const chainHex = `0x${LITVM_CHAIN.chainId.toString(16)}`

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      })
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainHex,
              chainName: LITVM_CHAIN.chainName,
              nativeCurrency: LITVM_CHAIN.nativeCurrency,
              rpcUrls: [LITVM_CHAIN.rpcUrl],
              blockExplorerUrls: [LITVM_CHAIN.explorerUrl],
            },
          ],
        })
      } else {
        throw error
      }
    }
  }

  const connectWallet = async () => {
    setStatus('')
    try {
      const { signer } = await getSignerContract()
      setWalletAddress(await signer.getAddress())
      setStatus('Wallet connected to LitVM.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const createBill = async () => {
    setStatus('')
    setTxHash('')

    if (!payee || !ethers.isAddress(payee)) {
      setStatus('Enter a valid payee address.')
      return
    }
    if (!totalLtc || Number(totalLtc) <= 0) {
      setStatus('Enter a valid total LTC amount.')
      return
    }
    if (!participantCount || Number(participantCount) <= 0) {
      setStatus('Enter a valid participant count.')
      return
    }

    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const totalWei = ethers.parseEther(totalLtc)

      const tx = await contract.createBill(payee, totalWei, Number(participantCount))
      const receipt = await tx.wait()

      const eventLog = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((parsed) => parsed && parsed.name === 'BillCreated')

      const newBillId = eventLog?.args?.billId?.toString()

      if (newBillId) {
        setBillIdInput(newBillId)
        const url = new URL(window.location.href)
        url.searchParams.set('billId', newBillId)
        window.history.replaceState({}, '', url.toString())
      }

      setTxHash(tx.hash)
      setStatus(`Bill created successfully${newBillId ? ` (ID: ${newBillId})` : ''}.`)
      if (newBillId) {
        await fetchBill(newBillId)
      }
    } catch (error) {
      setStatus(error.shortMessage || error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBill = async (forcedBillId) => {
    setStatus('')
    const targetBillId = forcedBillId || billIdInput
    if (!targetBillId) {
      setStatus('Enter a bill ID.')
      return
    }

    setLoading(true)
    try {
      const { contract } = getProviderContract()
      const [result, timing] = await Promise.all([
        contract.getBillStatus(targetBillId),
        contract.getBillTiming(targetBillId),
      ])

      const expiresAt = Number(timing[0])
      setBill({
        creator: result[0],
        payee: result[1],
        totalAmount: ethers.formatEther(result[2]),
        shareAmount: ethers.formatEther(result[3]),
        totalContributed: ethers.formatEther(result[4]),
        contributors: result[5].toString(),
        participantCount: result[6].toString(),
        settled: result[7],
        expiresAt,
        cancelled: timing[1],
        expired: timing[2],
      })
      setStatus(`Loaded bill #${targetBillId}.`)
    } catch (error) {
      setBill(null)
      setStatus(error.shortMessage || error.message)
    } finally {
      setLoading(false)
    }
  }

  const contribute = async () => {
    setStatus('')
    setTxHash('')

    if (!billIdInput) {
      setStatus('Enter a bill ID.')
      return
    }

    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const currentBill = await contract.getBillStatus(billIdInput)
      const shareAmount = currentBill[3]

      const tx = await contract.contribute(billIdInput, { value: shareAmount })
      await tx.wait()
      setTxHash(tx.hash)
      setStatus('Contribution successful.')
      await fetchBill(billIdInput)
    } catch (error) {
      setStatus(error.shortMessage || error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelBill = async () => {
    setStatus('')
    setTxHash('')

    if (!billIdInput) {
      setStatus('Enter a bill ID.')
      return
    }

    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const tx = await contract.cancelBill(billIdInput)
      await tx.wait()
      setTxHash(tx.hash)
      setStatus('Bill cancelled.')
      await fetchBill(billIdInput)
    } catch (error) {
      setStatus(error.shortMessage || error.message)
    } finally {
      setLoading(false)
    }
  }

  const claimRefund = async () => {
    setStatus('')
    setTxHash('')

    if (!billIdInput) {
      setStatus('Enter a bill ID.')
      return
    }

    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const tx = await contract.claimRefund(billIdInput)
      await tx.wait()
      setTxHash(tx.hash)
      setStatus('Refund claimed.')
      await fetchBill(billIdInput)
    } catch (error) {
      setStatus(error.shortMessage || error.message)
    } finally {
      setLoading(false)
    }
  }

  const getBillStateText = (loadedBill) => {
    if (loadedBill.settled) {
      return 'Settled'
    }
    if (loadedBill.cancelled) {
      return 'Cancelled'
    }
    if (loadedBill.expired) {
      return 'Expired'
    }
    return 'Open'
  }

  const copyLink = async () => {
    if (!billLink) {
      setStatus('Create or enter a bill ID first.')
      return
    }

    try {
      await navigator.clipboard.writeText(billLink)
      setStatus('Bill link copied.')
    } catch {
      setStatus('Unable to copy link. Copy manually from field.')
    }
  }

  return (
    <main className="app-shell">
      <h1>LiteBill</h1>
      <p className="subtitle">Group expense settlement with Litecoin on LitVM</p>

      <section className="card">
        <h2>Connection</h2>
        <label>
          LiteBill Contract Address
          <input
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value.trim())}
            placeholder="0x..."
          />
        </label>
        <button onClick={connectWallet} disabled={loading}>
          {walletAddress ? 'Reconnect Wallet' : 'Connect MetaMask'}
        </button>
        <p className="muted">{walletAddress ? `Connected: ${walletAddress}` : 'Wallet not connected'}</p>
      </section>

      <section className="card">
        <h2>Create Bill</h2>
        <div className="grid">
          <label>
            Payee Address
            <input value={payee} onChange={(e) => setPayee(e.target.value.trim())} placeholder="0x..." />
          </label>
          <label>
            Total Amount (LTC)
            <input value={totalLtc} onChange={(e) => setTotalLtc(e.target.value)} placeholder="1.5" />
          </label>
          <label>
            Participant Count
            <input value={participantCount} onChange={(e) => setParticipantCount(e.target.value)} placeholder="3" />
          </label>
        </div>
        <button onClick={createBill} disabled={loading}>Create Bill</button>
      </section>

      <section className="card">
        <h2>Bill Actions</h2>
        <label>
          Bill ID
          <input value={billIdInput} onChange={(e) => setBillIdInput(e.target.value)} placeholder="1" />
        </label>
        <div className="row">
          <button onClick={() => fetchBill()} disabled={loading}>Load Bill</button>
          <button onClick={contribute} disabled={loading}>Pay My Share</button>
          <button onClick={cancelBill} disabled={loading}>Cancel Bill</button>
          <button onClick={claimRefund} disabled={loading}>Claim Refund</button>
          <button onClick={copyLink} disabled={loading}>Copy Payment Link</button>
        </div>
        {billLink && (
          <p className="muted break">{billLink}</p>
        )}
      </section>

      {bill && (
        <section className="card">
          <h2>Bill Status</h2>
          <ul>
            <li><strong>Creator:</strong> {bill.creator}</li>
            <li><strong>Payee:</strong> {bill.payee}</li>
            <li><strong>Total:</strong> {bill.totalAmount} LTC</li>
            <li><strong>Share:</strong> {bill.shareAmount} LTC</li>
            <li><strong>Contributed:</strong> {bill.totalContributed} LTC</li>
            <li><strong>Contributors:</strong> {bill.contributors}/{bill.participantCount}</li>
            <li><strong>Expires:</strong> {bill.expiresAt ? new Date(bill.expiresAt * 1000).toLocaleString() : 'No expiry'}</li>
            <li><strong>Status:</strong> {getBillStateText(bill)}</li>
          </ul>
        </section>
      )}

      {status && <p className="status">{status}</p>}
      {txHash && (
        <p className="tx">
          Tx:{' '}
          <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noreferrer">
            {txHash}
          </a>
        </p>
      )}
    </main>
  )
}

export default App
