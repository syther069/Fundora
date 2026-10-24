/**
 * CCTP funding utilities for Fundora cross-chain grant sponsorship.
 *
 * Uses Circle App Kit (CCTP v2 Fast Transfer) to bridge USDC from
 * Base / Arbitrum / Ethereum → Arc in a single kit.bridge() call.
 *
 * No kit key is needed for bridge operations.
 * Never call executeBridge() automatically — only from an explicit user action.
 */

import { AppKit, BridgeChain } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { BridgeResult } from '@circle-fin/app-kit'
import type { EIP1193Provider } from 'viem'

// Singleton App Kit instance — initialised once at module load.
export const appKit = new AppKit()

// ── Chain tier types ──────────────────────────────────────────────────────────

export type ChainTier = 'testnet' | 'mainnet'

export interface CCTPChainOption {
  /** wagmi / EIP-155 chain ID */
  chainId: number
  /** Human-readable label shown in the UI */
  label: string
  /** App Kit BridgeChain enum value used in kit.bridge() calls */
  appKitChain: BridgeChain
  /** testnet or mainnet tier — used to auto-select the Arc destination */
  tier: ChainTier
  /** Icon slug for @web3icons/react NetworkIcon */
  icon: string
}

// ── Supported CCTP source chains ─────────────────────────────────────────────

export const CCTP_CHAINS: CCTPChainOption[] = [
  // Testnet
  { chainId: 84532,    label: 'Base Sepolia',     appKitChain: BridgeChain.Base_Sepolia,     tier: 'testnet', icon: 'base' },
  { chainId: 421614,   label: 'Arbitrum Sepolia',  appKitChain: BridgeChain.Arbitrum_Sepolia, tier: 'testnet', icon: 'arbitrum' },
  { chainId: 11155111, label: 'Ethereum Sepolia',  appKitChain: BridgeChain.Ethereum_Sepolia, tier: 'testnet', icon: 'ethereum' },
  // Mainnet
  { chainId: 8453,     label: 'Base',              appKitChain: BridgeChain.Base,             tier: 'mainnet', icon: 'base' },
  { chainId: 42161,    label: 'Arbitrum One',       appKitChain: BridgeChain.Arbitrum,         tier: 'mainnet', icon: 'arbitrum' },
  { chainId: 1,        label: 'Ethereum',           appKitChain: BridgeChain.Ethereum,         tier: 'mainnet', icon: 'ethereum' },
]

/** Look up a CCTP chain option by its wagmi chain ID. */
export function getCCTPChain(chainId: number): CCTPChainOption | undefined {
  return CCTP_CHAINS.find(c => c.chainId === chainId)
}

// Arc chain IDs
const ARC_TESTNET_CHAIN_ID = 5042002
const ARC_MAINNET_CHAIN_ID = 5042

/** Return the App Kit BridgeChain for the Arc destination matching a given tier. */
export function arcDestChain(tier: ChainTier): BridgeChain {
  return tier === 'mainnet' ? BridgeChain.Arc : BridgeChain.Arc_Testnet
}

/** Return the Arc wagmi chain ID matching a given tier. */
export function arcDestChainId(tier: ChainTier): number {
  return tier === 'mainnet' ? ARC_MAINNET_CHAIN_ID : ARC_TESTNET_CHAIN_ID
}

// ── Step type (subset of BridgeStep from App Kit) ────────────────────────────

export type BridgeStepName = 'approve' | 'burn' | 'fetchAttestation' | 'mint'
export type BridgeStepState = 'pending' | 'in-progress' | 'success' | 'error' | 'noop'

export interface BridgeStepStatus {
  name: BridgeStepName
  state: BridgeStepState
  txHash?: string
  explorerUrl?: string
}

// ── Bridge execution ──────────────────────────────────────────────────────────

export interface ExecuteBridgeParams {
  /** EIP-1193 provider from connector.getProvider() */
  provider: EIP1193Provider
  /** App Kit BridgeChain for the source chain */
  sourceChain: BridgeChain
  /** App Kit BridgeChain for the destination chain (e.g. BridgeChain.Arc_Testnet) */
  destChain: BridgeChain
  /**
   * Amount as a decimal string with up to 6 decimal places, e.g. "50.00".
   * Must be derived from formatUnits(bigint, 6) — never a raw integer.
   */
  amountDecimal: string
}

/**
 * Execute a CCTP v2 fast transfer via Circle App Kit.
 *
 * Always wrap in try/catch. Hard errors throw; soft errors return a result
 * object with partial step data — use retryBridge(result, ...) to resume,
 * never re-call executeBridge() from scratch after a soft failure.
 *
 * Step tracking: App Kit's bridge() call is synchronous-to-completion; step
 * states are only available on the returned result.steps array after the call
 * resolves. Use the onStepUpdate callback to animate the stepper post-completion.
 */
export async function executeBridge({
  provider,
  sourceChain,
  destChain,
  amountDecimal,
}: ExecuteBridgeParams): Promise<BridgeResult> {
  const adapter = await createViemAdapterFromProvider({ provider })

  const result = await appKit.bridge({
    from: { adapter, chain: sourceChain },
    to:   { adapter, chain: destChain },
    amount: amountDecimal,
  })

  return result
}

/** Normalise BridgeStep[] from App Kit into our UI-friendly BridgeStepStatus[]. */
export function normaliseSteps(result: BridgeResult): BridgeStepStatus[] {
  return result.steps.map(s => ({
    name: s.name as BridgeStepName,
    state: (s.state === 'noop' ? 'success' : s.state) as BridgeStepState,
    txHash: s.txHash,
    explorerUrl: s.explorerUrl,
  }))
}
