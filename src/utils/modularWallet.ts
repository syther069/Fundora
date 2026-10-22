import { createPublicClient, encodeFunctionData, type Hex } from 'viem'
import { arcTestnet, arc } from 'viem/chains'
import {
  createBundlerClient,
  toWebAuthnAccount,
  type P256Credential,
  type WebAuthnAccount,
} from 'viem/account-abstraction'
import {
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
} from '@circle-fin/modular-wallets-core'
import { PROOF_SPRING_ABI, getContractAddress, ARC_MAINNET_ID, ARC_TESTNET_ID } from '../contracts/proofSpring'

const clientKey = (import.meta.env.VITE_CLIENT_KEY as string | undefined) || ''
const clientUrl = (import.meta.env.VITE_CLIENT_URL as string | undefined) || 'https://modular-sdk.circle.com/v1/rpc/w3s/buidl'

export function hasPasskeyConfig(): boolean {
  return !!clientKey && clientKey.trim().length > 0 && !clientKey.includes('placeholder')
}

export function getModularClients(activeChainId: number = ARC_TESTNET_ID) {
  const isMainnet = activeChainId === ARC_MAINNET_ID
  const targetChain = isMainnet ? arc : arcTestnet
  const chainPath = isMainnet ? '/arc' : '/arcTestnet'

  const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
  const modularTransport = toModularTransport(`${clientUrl}${chainPath}`, clientKey)

  const publicClient = createPublicClient({
    chain: targetChain,
    transport: modularTransport,
  })

  const bundlerClient = createBundlerClient({
    chain: targetChain,
    transport: modularTransport,
  })

  return { publicClient, bundlerClient, passkeyTransport }
}

/**
 * Register a new passkey credential and derive a Circle Smart Account
 */
export async function registerPasskey(username: string, activeChainId: number = ARC_TESTNET_ID) {
  const { publicClient, passkeyTransport } = getModularClients(activeChainId)

  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register,
    username: username.trim(),
  })

  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
    name: username.trim(),
  })

  return { credential, account, address: account.address }
}

/**
 * Login with an existing WebAuthn passkey
 */
export async function loginPasskey(activeChainId: number = ARC_TESTNET_ID) {
  const { publicClient, passkeyTransport } = getModularClients(activeChainId)

  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Login,
  })

  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
  })

  return { credential, account, address: account.address }
}

/**
 * Rehydrate a Circle Smart Account from an existing stored credential
 */
export async function restorePasskeyAccount(credential: P256Credential, activeChainId: number = ARC_TESTNET_ID) {
  const { publicClient } = getModularClients(activeChainId)

  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
  })

  return { account, address: account.address }
}

/**
 * Send a gasless user operation sponsored by Circle Gas Station (paymaster: true)
 */
export async function sendGaslessContractCall({
  account,
  activeChainId,
  functionName,
  args,
}: {
  account: any
  activeChainId: number
  functionName: string
  args: any[]
}) {
  const { bundlerClient } = getModularClients(activeChainId)
  const contractAddress = getContractAddress(activeChainId)

  const callData = {
    to: contractAddress as Hex,
    data: encodeFunctionData({
      abi: PROOF_SPRING_ABI,
      functionName: functionName as any,
      args: args as any,
    }),
    value: 0n,
  }

  // paymaster: true sponsors gas via Circle Gas Station on Arc
  const userOpHash = await bundlerClient.sendUserOperation({
    account,
    calls: [callData],
    paymaster: true,
  })

  const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash })
  return receipt.transactionHash
}
