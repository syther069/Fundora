/**
 * modularWallet.ts — Circle Modular Wallets engine for Fundora
 *
 * Provides passkey registration, login, and gasless contract calls via
 * Circle MSCA (ERC-4337 smart account) on Arc Testnet.
 *
 * SECURITY NOTE: P256Credential is persisted in localStorage here for a
 * working demo. In production, store credentials in httpOnly cookies to
 * mitigate XSS credential theft.
 */

import { createPublicClient, encodeFunctionData } from 'viem'
import { arcTestnet } from 'viem/chains'
import {
  type P256Credential,
  type SmartAccount,
  createBundlerClient,
  toWebAuthnAccount,
} from 'viem/account-abstraction'
import {
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
} from '@circle-fin/modular-wallets-core'
import { ARC_TESTNET_ID, FUNDORA_ABI, getContractAddress } from '../contracts/fundora'

// ── Env vars ──────────────────────────────────────────────────────────────────
const CLIENT_KEY = import.meta.env.VITE_CLIENT_KEY as string | undefined
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL as string | undefined

export function isClientKeyConfigured(): boolean {
  return !!(CLIENT_KEY && CLIENT_KEY.trim() !== '' && CLIENT_KEY !== 'TEST_API_KEY:your_circle_client_key_here')
}

// ── Transport / client factory ────────────────────────────────────────────────

export interface ModularClients {
  publicClient: ReturnType<typeof createPublicClient>
  bundlerClient: ReturnType<typeof createBundlerClient>
  passkeyTransport: ReturnType<typeof toPasskeyTransport>
}

/**
 * Build the transport trio for a given chainId.
 * Currently supports Arc Testnet only; mainnet support is a future phase.
 */
export function getModularClients(chainId: number = ARC_TESTNET_ID): ModularClients {
  if (!CLIENT_KEY || !CLIENT_URL) {
    throw new Error('VITE_CLIENT_KEY or VITE_CLIENT_URL is not configured.')
  }

  // Arc Testnet → /arcTestnet path segment (per skill transport table)
  const chainPath = chainId === ARC_TESTNET_ID ? 'arcTestnet' : 'arcTestnet'
  const modularUrl = `${CLIENT_URL}/${chainPath}`

  const passkeyTransport = toPasskeyTransport(CLIENT_URL, CLIENT_KEY)
  const modularTransport = toModularTransport(modularUrl, CLIENT_KEY)

  const chain = arcTestnet // Arc Testnet only for now

  const publicClient = createPublicClient({
    chain,
    transport: modularTransport,
  })

  const bundlerClient = createBundlerClient({
    chain,
    transport: modularTransport,
  })

  return { publicClient, bundlerClient, passkeyTransport }
}

// ── Passkey registration ──────────────────────────────────────────────────────

export interface PasskeyRegistrationResult {
  credential: P256Credential
  account: SmartAccount
  address: `0x${string}`
}

/**
 * Register a new passkey and derive a Circle Smart Account from it.
 */
export async function registerPasskey(
  username: string,
  chainId: number = ARC_TESTNET_ID,
): Promise<PasskeyRegistrationResult> {
  const { publicClient, passkeyTransport } = getModularClients(chainId)

  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register,
    username,
  })

  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }),
    name: username,
  })

  return { credential, account, address: account.address }
}

// ── Passkey login ─────────────────────────────────────────────────────────────

/**
 * Log in with an existing passkey stored on this device.
 */
export async function loginPasskey(
  chainId: number = ARC_TESTNET_ID,
): Promise<PasskeyRegistrationResult> {
  const { publicClient, passkeyTransport } = getModularClients(chainId)

  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Login,
  })

  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }),
  })

  return { credential, account, address: account.address }
}

// ── Restore account from persisted credential ─────────────────────────────────

/**
 * Rebuild the smart account from a previously serialised P256Credential.
 * Used on page load to restore a session from localStorage.
 */
export async function restoreAccountFromCredential(
  credential: P256Credential,
  chainId: number = ARC_TESTNET_ID,
): Promise<SmartAccount> {
  const { publicClient } = getModularClients(chainId)

  return toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }),
  })
}

// ── Gasless contract call ─────────────────────────────────────────────────────

export interface GaslessCallParams {
  account: SmartAccount
  chainId?: number
  functionName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: readonly any[]
}

/**
 * Encode a Fundora contract call and submit it as a sponsored UserOperation.
 * Returns the transaction hash once the operation is confirmed onchain.
 */
export async function sendGaslessContractCall({
  account,
  chainId = ARC_TESTNET_ID,
  functionName,
  args = [],
}: GaslessCallParams): Promise<`0x${string}`> {
  const { bundlerClient } = getModularClients(chainId)
  const contractAddress = getContractAddress(chainId)

  // Double-cast through `unknown` to force the generic overload of encodeFunctionData.
  // This avoids TypeScript checking functionName/args against the strict const ABI union,
  // which it cannot resolve from a runtime string. The caller is responsible for passing
  // valid function names; a mismatch throws at encode time before any tx is sent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const looseAbi = FUNDORA_ABI as unknown as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (encodeFunctionData as (opts: { abi: any[]; functionName: string; args?: any[] }) => `0x${string}`)({
    abi: looseAbi,
    functionName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: args as any[],
  })

  const userOpHash = await bundlerClient.sendUserOperation({
    account,
    calls: [{ to: contractAddress, data, value: 0n }],
    paymaster: true,
  })

  const { receipt } = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })

  return receipt.transactionHash
}
