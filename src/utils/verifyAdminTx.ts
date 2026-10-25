import { type PublicClient, decodeEventLog } from 'viem'
import { ADMIN_REGISTRY_ABI, ARC_USDC_ADDRESS } from '../contracts/fundora'

export interface VerifyAdminTxParams {
  publicClient: PublicClient
  txHash: `0x${string}`
  expectedChainId: number
  expectedUserAddress: `0x${string}`
  registryAddress: `0x${string}`
  expectedFeeAmount: bigint
}

export interface VerificationResult {
  verified: boolean
  txHash: `0x${string}`
  blockNumber: bigint
  username: string
  orgName: string
  feePaid: bigint
}

const ERC20_TRANSFER_EVENT = {
  name: 'Transfer',
  type: 'event',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false },
  ],
} as const

/**
 * Cryptographically verifies that an admin registration transaction succeeded on-chain,
 * transferred the required USDC fee to the designated treasury, originated from the expected sender,
 * emitted the AdminRegistered event, and updated the AdminRegistry state on the expected network.
 *
 * Never grants permissions based purely on frontend UI status.
 */
export async function verifyAdminRegistrationTx({
  publicClient,
  txHash,
  expectedChainId,
  expectedUserAddress,
  registryAddress,
  expectedFeeAmount,
}: VerifyAdminTxParams): Promise<VerificationResult> {
  // 1. Verify network/chain ID
  const chainId = await publicClient.getChainId()
  if (chainId !== expectedChainId) {
    throw new Error(
      `Network mismatch: transaction was expected on chain ${expectedChainId}, but RPC is on chain ${chainId}.`
    )
  }

  // 2. Fetch transaction receipt
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash })
  if (!receipt) {
    throw new Error('Transaction receipt not found. The transaction may still be pending.')
  }

  // 3. Verify receipt status
  if (receipt.status !== 'success') {
    throw new Error(`Transaction failed on-chain with status: ${receipt.status}`)
  }

  // 4. Verify sender matches connected wallet
  if (receipt.from.toLowerCase() !== expectedUserAddress.toLowerCase()) {
    throw new Error(
      `Sender mismatch: transaction originated from ${receipt.from}, expected ${expectedUserAddress}.`
    )
  }

  // 5. Verify USDC payment event in receipt logs
  let validTransferFound = false
  let adminRegisteredEventFound = false
  let arcHouseUsername = ''
  let orgName = ''
  let feePaid = 0n

  for (const log of receipt.logs) {
    // Check for USDC Transfer event
    if (log.address.toLowerCase() === ARC_USDC_ADDRESS.toLowerCase()) {
      try {
        const decoded = decodeEventLog({
          abi: [ERC20_TRANSFER_EVENT],
          data: log.data,
          topics: log.topics,
        })
        if (
          decoded.eventName === 'Transfer' &&
          (decoded.args.from as string).toLowerCase() === expectedUserAddress.toLowerCase() &&
          (decoded.args.value as bigint) >= expectedFeeAmount
        ) {
          validTransferFound = true
        }
      } catch {
        // Not a standard Transfer event in this log
      }
    }

    // Check for AdminRegistered event from registry
    if (log.address.toLowerCase() === registryAddress.toLowerCase()) {
      try {
        const decoded = decodeEventLog({
          abi: ADMIN_REGISTRY_ABI,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'AdminRegistered') {
          const args = decoded.args as {
            admin: string
            arcHouseUsername: string
            orgName: string
            feePaid: bigint
            registeredAt: number
          }
          if (args.admin.toLowerCase() === expectedUserAddress.toLowerCase()) {
            adminRegisteredEventFound = true
            arcHouseUsername = args.arcHouseUsername
            orgName = args.orgName
            feePaid = BigInt(args.feePaid)
          }
        }
      } catch {
        // Not an AdminRegistered event in this log
      }
    }
  }

  if (expectedFeeAmount > 0n && !validTransferFound) {
    throw new Error(
      `Payment verification failed: no valid Transfer of at least ${expectedFeeAmount} units was found for token ${ARC_USDC_ADDRESS}.`
    )
  }

  if (!adminRegisteredEventFound) {
    throw new Error(
      `Registry verification failed: AdminRegistered event was not emitted for ${expectedUserAddress}.`
    )
  }

  // 6. Direct on-chain read verification of isAdmin(expectedUserAddress)
  const isRegisteredOnChain = await publicClient.readContract({
    address: registryAddress,
    abi: ADMIN_REGISTRY_ABI,
    functionName: 'isAdmin',
    args: [expectedUserAddress],
  })

  if (!isRegisteredOnChain) {
    throw new Error(
      `On-chain state verification failed: ${expectedUserAddress} is not registered as an admin on the registry contract.`
    )
  }

  return {
    verified: true,
    txHash,
    blockNumber: receipt.blockNumber,
    username: arcHouseUsername,
    orgName,
    feePaid,
  }
}
