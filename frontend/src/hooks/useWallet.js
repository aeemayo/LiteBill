import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { LITVM_CHAIN } from '../config'
import { LITEBILL_ABI } from '../litebillAbi'

export function useWallet(addToast) {
  const [walletAddress, setWalletAddress] = useState('')
  const [contractAddress, setContractAddress] = useState(
    import.meta.env.VITE_LITEBILL_ADDRESS || ''
  )
  const [connecting, setConnecting] = useState(false)

  const getProviderContract = useCallback(() => {
    if (!window.ethereum) throw new Error('MetaMask is required')
    if (!contractAddress || !ethers.isAddress(contractAddress))
      throw new Error('Enter a valid LiteBill contract address')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, LITEBILL_ABI, provider)
    return { provider, contract }
  }, [contractAddress])

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
    const contract = new ethers.Contract(contractAddress, LITEBILL_ABI, signer)
    return { provider, signer, contract }
  }, [getProviderContract, switchToLitvm, contractAddress])

  const connectWallet = useCallback(async () => {
    setConnecting(true)
    try {
      const { signer } = await getSignerContract()
      const addr = await signer.getAddress()
      setWalletAddress(addr)
      addToast({ type: 'success', msg: 'Wallet connected to LitVM.' })
    } catch (err) {
      addToast({ type: 'error', msg: err.message })
    } finally {
      setConnecting(false)
    }
  }, [getSignerContract, addToast])

  return {
    walletAddress,
    contractAddress,
    setContractAddress,
    connecting,
    connectWallet,
    getProviderContract,
    getSignerContract,
  }
}
