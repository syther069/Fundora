/**
 * wagmi configuration
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, fallback, createConfig } from 'wagmi'
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
    [arcTestnet.id]:      fallback([
      http(arcTestnet.rpcUrls.default.http[0]),
      http('https://rpc.blockdaemon.testnet.arc.io'),
      http('https://rpc.drpc.testnet.arc.io'),
    ]),
    [arc.id]:             fallback([
      http('https://rpc.mainnet.arc.io'),
      http('https://rpc.blockdaemon.mainnet.arc.io'),
      http('https://rpc.drpc.mainnet.arc.io'),
      http('https://rpc.quicknode.mainnet.arc.io'),
    ]),
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
