import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { LITVM_CHAIN } from '../config'
import { LITEBILL_ABI } from '../litebillAbi'

// Contract address is set at build time via VITE_LITEBILL_ADDRESS in .env
// It is intentionally not user-editable or exposed in the UI.
const CONTRACT_ADDRESS = import.meta.env.VITE_LITEBILL_ADDRESS || ''

export function useWallet(addToast) {
  const [walletAddress, setWalletAddress] = useState('')
  const [connecting, setConnecting] = useState(false)

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
    const { provider } = getProviderContract()
    await switchToLitvm()
    await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, LITEBILL_ABI, signer)
    return { provider, signer, contract }
  }, [getProviderContract, switchToLitvm])

  const connectWallet = useCallback(async () => {
    setConnecting(true)
    try {
      const { signer } = await getSignerContract()
      const addr = await signer.getAddress()
      setWalletAddress(addr)
      addToast({ type: 'success', msg: 'Wallet connected to LitVM LiteForge.' })
    } catch (err) {
      addToast({ type: 'error', msg: err.message })
    } finally {
      setConnecting(false)
    }
  }, [getSignerContract, addToast])

  return {
    walletAddress,
    connecting,
    connectWallet,
    getProviderContract,
    getSignerContract,
  }
}
