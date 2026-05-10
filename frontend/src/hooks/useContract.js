import { useState, useCallback, useEffect, useRef } from 'react'
import { ethers } from 'ethers'

export function useContract(getProviderContract, getSignerContract, addToast) {
  const [bill, setBill] = useState(null)
  const [billIdInput, setBillIdInput] = useState('')
  const [loading, setLoading] = useState(false)

  // Keep refs so event handlers always see fresh values
  const billIdRef = useRef(billIdInput)
  const listenerContractRef = useRef(null)
  useEffect(() => { billIdRef.current = billIdInput }, [billIdInput])

  // ── Read URL param on mount ────────────────────────────────────
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('billId')
    if (id) setBillIdInput(id)
  }, [])

  // ── Sync bill link into URL bar ───────────────────────────────
  useEffect(() => {
    const url = new URL(window.location.href)
    if (billIdInput) {
      url.searchParams.set('billId', billIdInput)
    } else {
      url.searchParams.delete('billId')
    }
    window.history.replaceState({}, '', url.toString())
  }, [billIdInput])

  // ── Helpers ───────────────────────────────────────────────────
  const parseBill = (status, timing) => ({
    creator:          status[0],
    payee:            status[1],
    totalAmount:      ethers.formatEther(status[2]),
    shareAmount:      ethers.formatEther(status[3]),
    totalContributed: ethers.formatEther(status[4]),
    contributors:     status[5].toString(),
    participantCount: status[6].toString(),
    settled:          status[7],
    expiresAt:        Number(timing[0]),
    cancelled:        timing[1],
    expired:          timing[2],
  })

  // ── Fetch bill ────────────────────────────────────────────────
  const fetchBill = useCallback(async (forcedId) => {
    const id = forcedId ?? billIdRef.current
    if (!id) { addToast({ type: 'error', msg: 'Enter a bill ID.' }); return }
    setLoading(true)
    try {
      const { contract } = getProviderContract()
      const [status, timing] = await Promise.all([
        contract.getBillStatus(id),
        contract.getBillTiming(id),
      ])
      setBill(parseBill(status, timing))
    } catch (err) {
      setBill(null)
      addToast({ type: 'error', msg: err.shortMessage || err.message })
    } finally {
      setLoading(false)
    }
  }, [getProviderContract, addToast])

  // ── Create bill ───────────────────────────────────────────────
  const createBill = useCallback(async ({ payee, totalLtc, participantCount, expiresAt }) => {
    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const totalWei = ethers.parseEther(totalLtc)
      const count = Number(participantCount)

      let tx
      if (expiresAt) {
        const unixExpiry = Math.floor(new Date(expiresAt).getTime() / 1000)
        tx = await contract.createBillWithExpiry(payee, totalWei, count, unixExpiry)
      } else {
        tx = await contract.createBill(payee, totalWei, count)
      }

      const receipt = await tx.wait()
      const event = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log) } catch { return null } })
        .find(e => e?.name === 'BillCreated')

      const newId = event?.args?.billId?.toString()
      if (newId) setBillIdInput(newId)

      addToast({ type: 'success', msg: `Bill created${newId ? ` (ID: ${newId})` : ''}.`, txHash: tx.hash })
      if (newId) await fetchBill(newId)
      return true
    } catch (err) {
      addToast({ type: 'error', msg: err.shortMessage || err.message })
      return false
    } finally {
      setLoading(false)
    }
  }, [getSignerContract, fetchBill, addToast])

  // ── Contribute ────────────────────────────────────────────────
  const contribute = useCallback(async (billId) => {
    if (!billId) { addToast({ type: 'error', msg: 'Enter a bill ID.' }); return }
    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const currentBill = await contract.getBillStatus(billId)
      const shareAmount = currentBill[3]
      const tx = await contract.contribute(billId, { value: shareAmount })
      await tx.wait()
      addToast({ type: 'success', msg: 'Contribution successful.', txHash: tx.hash })
      await fetchBill(billId)
    } catch (err) {
      addToast({ type: 'error', msg: err.shortMessage || err.message })
    } finally {
      setLoading(false)
    }
  }, [getSignerContract, fetchBill, addToast])

  // ── Cancel bill ───────────────────────────────────────────────
  const cancelBill = useCallback(async (billId) => {
    if (!billId) { addToast({ type: 'error', msg: 'Enter a bill ID.' }); return }
    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const tx = await contract.cancelBill(billId)
      await tx.wait()
      addToast({ type: 'success', msg: 'Bill cancelled.', txHash: tx.hash })
      await fetchBill(billId)
    } catch (err) {
      addToast({ type: 'error', msg: err.shortMessage || err.message })
    } finally {
      setLoading(false)
    }
  }, [getSignerContract, fetchBill, addToast])

  // ── Claim refund ──────────────────────────────────────────────
  const claimRefund = useCallback(async (billId) => {
    if (!billId) { addToast({ type: 'error', msg: 'Enter a bill ID.' }); return }
    setLoading(true)
    try {
      const { contract } = await getSignerContract()
      const tx = await contract.claimRefund(billId)
      await tx.wait()
      addToast({ type: 'success', msg: 'Refund claimed.', txHash: tx.hash })
      await fetchBill(billId)
    } catch (err) {
      addToast({ type: 'error', msg: err.shortMessage || err.message })
    } finally {
      setLoading(false)
    }
  }, [getSignerContract, fetchBill, addToast])

  // ── Real-time event listeners ─────────────────────────────────
  const stopListeners = useCallback(() => {
    const c = listenerContractRef.current
    if (!c) return
    try { c.removeAllListeners() } catch { /* already removed or provider gone */ }
    listenerContractRef.current = null
  }, [])

  const startListeners = useCallback((billId) => {
    if (!billId) return
    stopListeners()

    let contract
    try {
      const result = getProviderContract()
      contract = result.contract
    } catch { return }

    listenerContractRef.current = contract

    const refresh = (eventBillId) => {
      if (eventBillId.toString() === billId) {
        fetchBill(billId)
      }
    }

    contract.on('ContributionMade', (id) => refresh(id))
    contract.on('BillSettled',      (id) => refresh(id))
    contract.on('BillCancelled',    (id) => refresh(id))
  }, [getProviderContract, fetchBill, stopListeners])

  // Start/restart listeners whenever the viewed bill or contract changes
  useEffect(() => {
    if (billIdInput) {
      startListeners(billIdInput)
    }
    return stopListeners
  }, [billIdInput, startListeners, stopListeners])

  const billLink = billIdInput
    ? (() => {
        const u = new URL(window.location.href)
        u.searchParams.set('billId', billIdInput)
        return u.toString()
      })()
    : ''

  const isListening = !!listenerContractRef.current

  return {
    bill, setBill,
    billIdInput, setBillIdInput,
    billLink,
    loading,
    isListening,
    fetchBill, createBill, contribute, cancelBill, claimRefund,
  }
}
