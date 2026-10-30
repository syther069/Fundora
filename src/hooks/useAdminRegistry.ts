import { useReadContract, useAccount } from 'wagmi'
import {
  ADMIN_REGISTRY_ABI,
  getAdminRegistryAddress,
  getAdminRegistrationFee,
} from '../contracts/fundora'
import { useActiveChainId, useContractAdmin } from './useFundora'
import { loadOrganizerProfile } from '../components/ApplyAdminModal'

const POLL_INTERVAL = 12_000

export interface AdminProfileData {
  arcHouseUsername: string
  orgName: string
  grantDescription: string
  estimatedBudget: bigint
  numWinners: number
  prizePoolDetails: string
  registeredAt: number
  feePaid: bigint
}

/**
 * Checks if an address is registered in the AdminRegistry on the active network
 */
export function useIsRegisteredAdmin(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  const registryAddress = getAdminRegistryAddress(chainId)

  return useReadContract({
    address: registryAddress,
    abi: ADMIN_REGISTRY_ABI,
    functionName: 'isAdmin',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: POLL_INTERVAL,
    },
    chainId,
  })
}

/**
 * Fetches the admin's detailed profile from the AdminRegistry
 */
export function useAdminProfile(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  const registryAddress = getAdminRegistryAddress(chainId)

  return useReadContract({
    address: registryAddress,
    abi: ADMIN_REGISTRY_ABI,
    functionName: 'getAdminProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: POLL_INTERVAL,
    },
    chainId,
  })
}

/**
 * Reads the required registration fee from the AdminRegistry contract,
 * with fallback to client-side constants (10 USDC on Testnet, 1 USDC on Mainnet)
 */
export function useAdminRegistrationFee() {
  const chainId = useActiveChainId()
  const registryAddress = getAdminRegistryAddress(chainId)

  const { data: onchainFee, ...rest } = useReadContract({
    address: registryAddress,
    abi: ADMIN_REGISTRY_ABI,
    functionName: 'registrationFee',
    chainId,
  })

  const fee = onchainFee !== undefined ? (onchainFee) : getAdminRegistrationFee(chainId)

  return { fee, ...rest }
}

/**
 * Returns total number of registered admins on the active network
 */
export function useAdminCount() {
  const chainId = useActiveChainId()
  const registryAddress = getAdminRegistryAddress(chainId)

  return useReadContract({
    address: registryAddress,
    abi: ADMIN_REGISTRY_ABI,
    functionName: 'adminCount',
    chainId,
  })
}

/**
 * Unified admin check:
 * - isPlatformAdmin: msg.sender is the initial/contract admin of Fundora
 * - isRegisteredAdmin: msg.sender is registered in AdminRegistry (onchain)
 * - hasLocalProfile: msg.sender completed the organiser profile wizard (localStorage)
 * - isAdmin: true if any condition is met
 */
export function useUnifiedIsAdmin() {
  const { address } = useAccount()
  const { data: contractAdmin, isLoading: adminLoading } = useContractAdmin()
  const { data: isRegistered, isLoading: registeredLoading, refetch: refetchRegistered } = useIsRegisteredAdmin(address)

  const isPlatformAdmin = !!(
    address &&
    contractAdmin &&
    address.toLowerCase() === (contractAdmin as string).toLowerCase()
  )

  const isRegisteredAdmin = !!isRegistered

  // Check localStorage organiser profile (created via the Apply as Organiser wizard)
  const hasLocalProfile = !!(address && loadOrganizerProfile(address))

  const isAdmin = isPlatformAdmin || isRegisteredAdmin || hasLocalProfile

  return {
    isAdmin,
    isPlatformAdmin,
    isRegisteredAdmin,
    hasLocalProfile,
    isLoading: adminLoading || registeredLoading,
    refetch: refetchRegistered,
  }
}
