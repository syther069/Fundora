/**
 * Arc Mainnet Deployment Script for Fundora Suite
 * Deploys AdminRegistry and FundoraEvents using viem
 *
 * Usage:
 *   npx tsx scripts/deploy-mainnet.ts [--dry-run]
 *
 * Requires in .env:
 *   PRIVATE_KEY=0x...
 */

import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arc } from 'viem/chains'
import * as fs from 'fs'
import * as path from 'path'

// Load .env if present
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length > 0) {
      const val = rest.join('=').trim()
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val
      }
    }
  }
}

const ARC_USDC = '0x3600000000000000000000000000000000000000' as const
const EXISTING_MAINNET_FUNDORA = '0x371b4b6894882082e706cd84b781bf749472a602' as const
const RPC_URL = process.env.ARC_MAINNET_RPC_URL || 'https://rpc.mainnet.arc.io'

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const rawKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY

  if (!rawKey) {
    console.error('Error: PRIVATE_KEY or DEPLOYER_PRIVATE_KEY not found in environment or .env file.')
    process.exit(1)
  }

  const formattedKey = rawKey.startsWith('0x') ? (rawKey as `0x${string}`) : (`0x${rawKey}` as `0x${string}`)
  const account = privateKeyToAccount(formattedKey)

  console.log('========================================================')
  console.log('       Fundora Arc Mainnet Deployment Suite')
  console.log('========================================================')
  console.log(`Network: Arc Mainnet (Chain ID: ${arc.id})`)
  console.log(`RPC URL: ${RPC_URL}`)
  console.log(`Deployer Account: ${account.address}`)
  console.log(`Execution Mode: ${isDryRun ? 'DRY RUN (Simulation)' : 'LIVE BROADCAST'}`)
  console.log('--------------------------------------------------------')

  const publicClient = createPublicClient({
    chain: arc,
    transport: http(RPC_URL),
  })

  const walletClient = createWalletClient({
    account,
    chain: arc,
    transport: http(RPC_URL),
  })

  // Load contract artifacts
  const adminRegistryArtifact = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'contracts/out/AdminRegistry.sol/AdminRegistry.json'), 'utf-8')
  )
  const fundoraEventsArtifact = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'contracts/out/FundoraEvents.sol/FundoraEvents.json'), 'utf-8')
  )

  const treasury = (process.env.TREASURY_ADDRESS || account.address) as `0x${string}`
  const registrationFee = 1_000_000n // 1 USDC (6 decimals)

  if (isDryRun) {
    console.log('[1/3] Simulating AdminRegistry deployment...')
    console.log(`  Args: USDC=${ARC_USDC}, Treasury=${treasury}, Fee=${registrationFee}`)
    console.log('[2/3] Simulating FundoraEvents deployment...')
    console.log(`  Args: USDC=${ARC_USDC}, Admin=${account.address}, AdminRegistry=<SimulatedAddress>`)
    console.log('[3/3] Simulating Fundora.setAdminRegistry link...')
    console.log('\nDry run completed successfully. To broadcast live, run without --dry-run.')
    return
  }

  // 1. Deploy AdminRegistry
  console.log('[1/3] Deploying AdminRegistry...')
  const deployRegistryHash = await walletClient.deployContract({
    abi: adminRegistryArtifact.abi,
    bytecode: adminRegistryArtifact.bytecode.object,
    args: [ARC_USDC, treasury, registrationFee],
  })
  console.log(`  Deploy tx submitted: ${deployRegistryHash}`)
  const registryReceipt = await publicClient.waitForTransactionReceipt({ hash: deployRegistryHash })
  const adminRegistryAddress = registryReceipt.contractAddress!
  console.log(`  ✅ AdminRegistry deployed at: ${adminRegistryAddress}`)

  // 2. Deploy FundoraEvents
  console.log('\n[2/3] Deploying FundoraEvents...')
  const deployEventsHash = await walletClient.deployContract({
    abi: fundoraEventsArtifact.abi,
    bytecode: fundoraEventsArtifact.bytecode.object,
    args: [ARC_USDC, account.address, adminRegistryAddress],
  })
  console.log(`  Deploy tx submitted: ${deployEventsHash}`)
  const eventsReceipt = await publicClient.waitForTransactionReceipt({ hash: deployEventsHash })
  const fundoraEventsAddress = eventsReceipt.contractAddress!
  console.log(`  ✅ FundoraEvents deployed at: ${fundoraEventsAddress}`)

  // 3. Link AdminRegistry in existing Fundora contract
  console.log('\n[3/3] Linking AdminRegistry in existing Fundora contract...')
  try {
    const linkHash = await walletClient.writeContract({
      address: EXISTING_MAINNET_FUNDORA,
      abi: parseAbi(['function setAdminRegistry(address _adminRegistry) external']),
      functionName: 'setAdminRegistry',
      args: [adminRegistryAddress],
    })
    console.log(`  Link tx submitted: ${linkHash}`)
    await publicClient.waitForTransactionReceipt({ hash: linkHash })
    console.log('  ✅ Existing Fundora contract updated with AdminRegistry!')
  } catch (err: unknown) {
    console.log(`  ⚠️ Note: Could not auto-link AdminRegistry in existing Fundora contract (${(err as Error).message?.slice(0, 80)}...).`)
    console.log(`  Initial admin can call setAdminRegistry('${adminRegistryAddress}') on ${EXISTING_MAINNET_FUNDORA} manually.`)
  }

  console.log('\n========================================================')
  console.log('       🎉 Arc Mainnet Deployment Summary')
  console.log('========================================================')
  console.log(`VITE_ADMIN_REGISTRY_ADDRESS_MAINNET=${adminRegistryAddress}`)
  console.log(`VITE_FUNDORA_EVENTS_ADDRESS_MAINNET=${fundoraEventsAddress}`)
  console.log('========================================================\n')
}

main().catch((err) => {
  console.error('Deployment failed:', err)
  process.exit(1)
})

