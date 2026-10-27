import artifact from '../../contracts/out/AdminRegistry.sol/AdminRegistry.json'

// Deployed on Arc Testnet — update after each redeployment
export const ADMIN_REGISTRY_ADDRESS =
  (import.meta.env.VITE_ADMIN_REGISTRY_ADDRESS as `0x${string}` | undefined) ??
  ('0x0000000000000000000000000000000000000000')

export const ADMIN_REGISTRY_ABI = artifact.abi
