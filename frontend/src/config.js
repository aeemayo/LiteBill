export const LITVM_CHAIN = {
  chainId: Number(import.meta.env.VITE_LITVM_CHAIN_ID || 1890),
  chainName: import.meta.env.VITE_LITVM_CHAIN_NAME || 'LitVM Testnet',
  rpcUrl: import.meta.env.VITE_LITVM_RPC_URL || 'https://rpc.testnet.litvm.com',
  explorerUrl: import.meta.env.VITE_LITVM_EXPLORER_URL || 'https://explorer.testnet.litvm.com',
  nativeCurrency: {
    name: import.meta.env.VITE_LITVM_CURRENCY_NAME || 'zkLTC',
    symbol: import.meta.env.VITE_LITVM_CURRENCY_SYMBOL || 'zkLTC',
    decimals: Number(import.meta.env.VITE_LITVM_CURRENCY_DECIMALS || 18),
  },
}

export function getExplorerTxUrl(txHash) {
  return `${LITVM_CHAIN.explorerUrl}/tx/${txHash}`
}
