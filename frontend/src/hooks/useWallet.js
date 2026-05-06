import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { LITVM_CHAIN } from '../config'
import { LITEBILL_ABI } from '../litebillAbi'

// Contract address is set at build time via VITE_LITEBILL_ADDRESS in .env
// It is intentionally not user-editable or exposed in the UI.
const CONTRACT_ADDRESS = import.meta.env.VITE_LITEBILL_ADDRESS || ''

export function useWallet(addToast) {
  const [walletAddress, setWalletAddress] = useState('')
  const [connecting, setConnecting] = useState(false)

  // ── Listen for account/chain changes from the wallet ─────────────
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User locked MetaMask or removed the account — treat as disconnect
        setWalletAddress('')
      } else {
        setWalletAddress(accounts[0])
      }
    }

    const handleChainChanged = () => {
      // Chain switched — reset so user re-validates on next action
      setWalletAddress('')
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────
  const getProviderContract = useCallback(() => {
    if (!window.ethereum) throw new Error('No browser wallet detected. Please install MetaMask.')
    if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS))
      throw new Error('LiteBill contract address is not configured. Set VITE_LITEBILL_ADDRESS in .env and rebuild.')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, LITEBILL_ABI, provider)
    return { provider, contract }
  }, [])

  const switchToLitvm = useCallback(async () => {
    const chainHex = `0x${LITVM_CHAIN.chainId.toString(16)}`
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      })
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainHex,
            chainName: LITVM_CHAIN.chainName,
            nativeCurrency: LITVM_CHAIN.nativeCurrency,
            rpcUrls: [LITVM_CHAIN.rpcUrl, LITVM_CHAIN.wsUrl].filter(Boolean),
            blockExplorerUrls: [LITVM_CHAIN.explorerUrl],
          }],
        })
      } else {
        throw err
      }
    }
  }, [])

  const getSignerContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No browser wallet detected. Please install MetaMask.')
    // Always explicitly request accounts — ensures the wallet popup fires every time
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (!accounts || accounts.length === 0) throw new Error('No accounts returned from wallet.')
    await switchToLitvm()
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, LITEBILL_ABI, signer)
    return { provider, signer, contract }
  }, [switchToLitvm])

  // ── Connect ───────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      addToast({ type: 'error', msg: 'No browser wallet detected. Please install MetaMask.' })
      return
    }
    setConnecting(true)
    try {
      const { signer } = await getSignerContract()
      const addr = await signer.getAddress()
      setWalletAddress(addr)
      addToast({ type: 'success', msg: 'Wallet connected to LitVM LiteForge.' })
    } catch (err) {
      // User rejected or error — do not persist a stale address
      setWalletAddress('')
      addToast({ type: 'error', msg: err.message })
    } finally {
      setConnecting(false)
    }
  }, [getSignerContract, addToast])

  // ── Disconnect ────────────────────────────────────────────────────
  // wallet_revokePermissions (EIP-2255) actually revokes eth_accounts in
  // MetaMask so the site loses connection at the wallet level too.
  // Falls back gracefully for wallets that don't support it.
  const disconnectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch {
        // Wallet doesn't support revokePermissions — clear local state only
      }
    }
    setWalletAddress('')
    addToast({ type: 'info', msg: 'Wallet disconnected.' })
  }, [addToast])

  return {
    walletAddress,
    connecting,
    connectWallet,
    disconnectWallet,
    getProviderContract,
    getSignerContract,
  }
}
