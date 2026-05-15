export const LITVM_CHAIN = {
  chainId: Number(import.meta.env.VITE_LITVM_CHAIN_ID || 4441),
  chainName: import.meta.env.VITE_LITVM_CHAIN_NAME || 'LitVM LiteForge',
  rpcUrl: import.meta.env.VITE_LITVM_RPC_URL || 'https://liteforge.rpc.caldera.xyz/http',
  wsUrl: import.meta.env.VITE_LITVM_WS_URL || 'wss://liteforge.rpc.caldera.xyz/ws',
  explorerUrl: import.meta.env.VITE_LITVM_EXPLORER_URL || 'https://liteforge.explorer.caldera.xyz',
  nativeCurrency: {
    name: import.meta.env.VITE_LITVM_CURRENCY_NAME || 'zKLTC',
    symbol: import.meta.env.VITE_LITVM_CURRENCY_SYMBOL || 'zKLTC',
    decimals: Number(import.meta.env.VITE_LITVM_CURRENCY_DECIMALS || 18),
  },
}

export const HISTORY_LOOKBACK_BLOCKS = Number(
  import.meta.env.VITE_HISTORY_LOOKBACK_BLOCKS || 200000
)

export function getExplorerTxUrl(txHash) {
  return `${LITVM_CHAIN.explorerUrl}/tx/${txHash}`
}
