/**
 * wagmi configuration
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet, baseSepolia, arbitrumSepolia, sepolia, base, arbitrum } from 'wagmi/chains'
import { arcTestnet, arc } from 'viem/chains'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(arcTestnet.id, arcTestnet.rpcUrls.default.http[0])
registerChain(arc.id, arc.rpcUrls.default.http[0])

export const config = createConfig({
  // Arc chains + CCTP source chains (testnet + mainnet) + Ethereum mainnet for ENS
  chains: [arcTestnet, arc, baseSepolia, arbitrumSepolia, sepolia, base, arbitrum, mainnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]:      http(arcTestnet.rpcUrls.default.http[0]),
    [arc.id]:             http('https://rpc.mainnet.arc.io'),
    // CCTP testnet sources — use public defaults
    [baseSepolia.id]:     http(),
    [arbitrumSepolia.id]: http(),
    [sepolia.id]:         http(),
    // CCTP mainnet sources — use public defaults
    [base.id]:            http(),
    [arbitrum.id]:        http(),
    [mainnet.id]:         http(), // also needed for ENS resolution
  },
})
