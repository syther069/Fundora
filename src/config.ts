/**
 * wagmi configuration
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { arc, arcTestnet } from 'viem/chains'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(arc.id, arc.rpcUrls.default.http[0])
registerChain(arcTestnet.id, arcTestnet.rpcUrls.default.http[0])

export const config = createConfig({
  chains: [arc, arcTestnet, mainnet], // arc mainnet + testnet; mainnet needed for ENS resolution
  connectors: [injected()],
  transports: {
    [arc.id]: http(arc.rpcUrls.default.http[0]),
    [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0]),
    [mainnet.id]: http(), // ENS resolution uses mainnet
  },
})

