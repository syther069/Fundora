import { AppKit } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { EIP1193Provider } from 'viem'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/proofSpring'

export const appKit = new AppKit()

export interface CCTPSourceChain {
  id: number
  name: string
  cctpChainName: string
  domainId: number
  isTestnet: boolean
  explorerBase: string
  badgeColor: string
}

export const CCTP_TESTNET_SOURCES: CCTPSourceChain[] = [
  {
    id: 84532,
    name: 'Base Sepolia',
    cctpChainName: 'Base_Sepolia',
    domainId: 6,
    isTestnet: true,
    explorerBase: 'https://sepolia.basescan.org',
    badgeColor: '#0052FF',
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    cctpChainName: 'Arbitrum_Sepolia',
    domainId: 3,
    isTestnet: true,
    explorerBase: 'https://sepolia.arbiscan.io',
    badgeColor: '#28A0F0',
  },
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    cctpChainName: 'Ethereum_Sepolia',
    domainId: 0,
    isTestnet: true,
    explorerBase: 'https://sepolia.etherscan.io',
    badgeColor: '#627EEA',
  },
]

export const CCTP_MAINNET_SOURCES: CCTPSourceChain[] = [
  {
    id: 8453,
    name: 'Base',
    cctpChainName: 'Base',
    domainId: 6,
    isTestnet: false,
    explorerBase: 'https://basescan.org',
    badgeColor: '#0052FF',
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    cctpChainName: 'Arbitrum',
    domainId: 3,
    isTestnet: false,
    explorerBase: 'https://arbiscan.io',
    badgeColor: '#28A0F0',
  },
  {
    id: 1,
    name: 'Ethereum Mainnet',
    cctpChainName: 'Ethereum',
    domainId: 0,
    isTestnet: false,
    explorerBase: 'https://etherscan.io',
    badgeColor: '#627EEA',
  },
]

export function getCCTPSources(activeChainId: number): CCTPSourceChain[] {
  return activeChainId === ARC_MAINNET_ID ? CCTP_MAINNET_SOURCES : CCTP_TESTNET_SOURCES
}

export function getArcCCTPChainName(activeChainId: number): string {
  return activeChainId === ARC_MAINNET_ID ? 'Arc' : 'Arc_Testnet'
}

export type BridgeStepName = 'approve' | 'burn' | 'fetchAttestation' | 'mint'

export interface BridgeProgress {
  currentStep: BridgeStepName
  status: 'idle' | 'pending' | 'success' | 'error'
  txHash?: string
  error?: string
}

export async function executeCCTPBridge({
  provider,
  sourceChainName,
  destChainName,
  amountUsdc,
  onStepChange,
}: {
  provider: EIP1193Provider
  sourceChainName: string
  destChainName: string
  amountUsdc: string
  onStepChange?: (step: BridgeStepName, txHash?: string) => void
}) {
  const adapter = await createViemAdapterFromProvider({ provider })

  const unsubscribe = (appKit as unknown as { on?: (event: string, cb: (data: any) => void) => () => void }).on?.(
    'stepChange',
    (data: { step?: { name?: string; txHash?: string } }) => {
      const stepName = data?.step?.name as BridgeStepName | undefined
      if (stepName && onStepChange) {
        onStepChange(stepName, data?.step?.txHash)
      }
    }
  )

  try {
    const result = await appKit.bridge({
      from: { adapter, chain: sourceChainName as any },
      to: { adapter, chain: destChainName as any },
      amount: amountUsdc,
    })
    return result
  } finally {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  }
}
