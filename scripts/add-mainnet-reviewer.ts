/**
 * add-mainnet-reviewer.ts
 *
 * Adds a reviewer to the live Fundora Grants contract on Arc Mainnet.
 * Contract: 0x371b4b6894882082e706cd84b781bf749472a602
 * Admin:    0xb5fd2471b99e9C7324309a43282a391e87585C5E
 *
 * Run with:
 *   npx tsx scripts/add-mainnet-reviewer.ts <REVIEWER_ADDRESS>
 *
 * Environment variables:
 *   PRIVATE_KEY - Admin deployer private key (hex string with 0x prefix)
 *   ARC_MAINNET_RPC_URL - (optional) defaults to https://rpc.mainnet.arc.io
 */

import { createWalletClient, createPublicClient, http, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arc } from 'viem/chains'
import { FUNDORA_ABI, FUNDORA_ADDRESS_MAINNET } from '../src/contracts/fundora'

const RPC_URL = process.env.ARC_MAINNET_RPC_URL || 'https://rpc.mainnet.arc.io'
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const targetReviewer = process.argv[2] as Address | undefined

async function main() {
  console.log('--- Arc Mainnet: Fundora Add Reviewer ---')
  console.log(`Target Contract: ${FUNDORA_ADDRESS_MAINNET}`)

  const publicClient = createPublicClient({
    chain: arc,
    transport: http(RPC_URL),
  })

  // Read current contract state
  const [admin, reviewerCount, requiredApprovals] = await Promise.all([
    publicClient.readContract({
      address: FUNDORA_ADDRESS_MAINNET,
      abi: FUNDORA_ABI,
      functionName: 'admin',
    }),
    publicClient.readContract({
      address: FUNDORA_ADDRESS_MAINNET,
      abi: FUNDORA_ABI,
      functionName: 'reviewerCount',
    }),
    publicClient.readContract({
      address: FUNDORA_ADDRESS_MAINNET,
      abi: FUNDORA_ABI,
      functionName: 'requiredApprovals',
    }),
  ])

  console.log(`Admin onchain:       ${admin}`)
  console.log(`Current Reviewers:  ${reviewerCount}`)
  console.log(`Required Approvals: ${requiredApprovals}`)

  if (!targetReviewer) {
    console.error('\nError: Reviewer address argument is required.')
    console.log('Usage: npx tsx scripts/add-mainnet-reviewer.ts <REVIEWER_ADDRESS>')
    process.exit(1)
  }

  // Check if target is already a reviewer
  const isAlready = await publicClient.readContract({
    address: FUNDORA_ADDRESS_MAINNET,
    abi: FUNDORA_ABI,
    functionName: 'isReviewer',
    args: [targetReviewer],
  })

  if (isAlready) {
    console.log(`\nAddress ${targetReviewer} is ALREADY a reviewer on Fundora Mainnet. No action needed.`)
    return
  }

  if (!PRIVATE_KEY) {
    console.log(`\nAddress ${targetReviewer} is NOT yet a reviewer.`)
    console.log('To submit this transaction, provide PRIVATE_KEY in environment, or run via cast:')
    console.log(`cast send ${FUNDORA_ADDRESS_MAINNET} "addReviewer(address)" ${targetReviewer} --rpc-url ${RPC_URL} --private-key $PRIVATE_KEY`)
    return
  }

  const account = privateKeyToAccount(PRIVATE_KEY)
  if (account.address.toLowerCase() !== admin.toLowerCase()) {
    console.error(`\nError: Private key corresponds to ${account.address}, but contract admin is ${admin}.`)
    process.exit(1)
  }

  const walletClient = createWalletClient({
    account,
    chain: arc,
    transport: http(RPC_URL),
  })

  console.log(`\nSubmitting addReviewer(${targetReviewer}) from admin ${account.address}...`)
  const hash = await walletClient.writeContract({
    address: FUNDORA_ADDRESS_MAINNET,
    abi: FUNDORA_ABI,
    functionName: 'addReviewer',
    args: [targetReviewer],
  })

  console.log(`Tx submitted: https://explorer.arc.io/tx/${hash}`)
  console.log('Waiting for block confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log(`Confirmed in block ${receipt.blockNumber} (status: ${receipt.status})`)

  const newCount = await publicClient.readContract({
    address: FUNDORA_ADDRESS_MAINNET,
    abi: FUNDORA_ABI,
    functionName: 'reviewerCount',
  })
  console.log(`Updated Reviewer Count: ${newCount}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})

