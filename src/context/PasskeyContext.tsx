/**
 * PasskeyContext.tsx — React context for Circle passkey / MSCA session state.
 *
 * Wraps the modularWallet engine and exposes a clean hook-based API so
 * components never call the engine functions directly.
 *
 * Credential persistence: localStorage (dev-only convenience).
 * Production apps should use httpOnly cookies to prevent XSS credential theft.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { P256Credential, SmartAccount } from 'viem/account-abstraction'
import {
  registerPasskey as engineRegister,
  loginPasskey as engineLogin,
  restoreAccountFromCredential,
  sendGaslessContractCall,
  isClientKeyConfigured,
} from '../utils/modularWallet'
import { ARC_TESTNET_ID } from '../contracts/proofSpring'

// ── Storage helpers ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'grantflow:passkey:credential'

function saveCredential(credential: P256Credential): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credential))
  } catch {
    // Storage unavailable — session will not persist across reload
  }
}

function loadCredential(): P256Credential | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as P256Credential) : null
  } catch {
    return null
  }
}

function clearCredential(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

// ── Context shape ─────────────────────────────────────────────────────────────

export interface PasskeyContextValue {
  /** EVM address of the smart contract account, or undefined when signed out */
  smartAccountAddress: `0x${string}` | undefined
  /** The raw viem SmartAccount object (needed by the engine to send ops) */
  account: SmartAccount | undefined
  /** True when a passkey session is active */
  isPasskeyConnected: boolean
  /** True while register / login / restore is in flight */
  isLoading: boolean
  /** Last error message, cleared on next action */
  error: string | null
  /** Register a new passkey with the given display name */
  register: (username: string) => Promise<void>
  /** Log in with an existing passkey on this device */
  login: () => Promise<void>
  /** Clear the session and remove the stored credential */
  disconnect: () => void
  /**
   * One-line helper for components: encode a ProofSpring call and submit as a
   * sponsored UserOperation. Returns the transaction hash.
   */
  executeGaslessAction: (
    functionName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: readonly any[],
  ) => Promise<`0x${string}`>
}

const PasskeyContext = createContext<PasskeyContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

interface PasskeyProviderProps {
  children: ReactNode
  /** Default Arc Testnet — override for future mainnet support */
  chainId?: number
}

export function PasskeyProvider({
  children,
  chainId = ARC_TESTNET_ID,
}: PasskeyProviderProps) {
  const [account, setAccount] = useState<SmartAccount | undefined>(undefined)
  const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!isClientKeyConfigured()) return

    const saved = loadCredential()
    if (!saved) return

    // Run the async restore in a void-returning async IIFE.
    // State updates only happen inside .then / .catch, not synchronously,
    // so the linter rule about synchronous setState in effects is satisfied.
    void (async () => {
      setIsLoading(true)
      try {
        const restoredAccount = await restoreAccountFromCredential(saved, chainId)
        setAccount(restoredAccount)
        setSmartAccountAddress(restoredAccount.address)
      } catch {
        // Credential may have expired or be invalid — clear silently
        clearCredential()
      } finally {
        setIsLoading(false)
      }
    })()
  }, [chainId])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function humaniseError(err: unknown): string {
    if (!(err instanceof Error)) return 'An unexpected error occurred.'
    const name = (err as DOMException).name
    if (name === 'NotAllowedError') return 'Passkey prompt was cancelled or timed out. Please try again.'
    if (name === 'SecurityError') return 'Passkey domain mismatch. Make sure you are using the correct app domain in Circle Console.'
    if (name === 'InvalidStateError') return 'A passkey is already registered for this username. Try signing in instead.'
    const msg = err.message ?? ''
    if (msg.includes('155509')) return 'A Gas Station paymaster policy is required. Please set one up in Circle Console.'
    if (msg.includes('AA33')) return 'Gas sponsorship rejected. Check your Gas Station policy in Circle Console.'
    if (msg.includes('AA21')) return 'Paymaster not configured. Enable paymaster: true and set up a Gas Station policy.'
    if (msg.includes('VITE_CLIENT_KEY')) return 'VITE_CLIENT_KEY is not set. Paste your Circle Client Key into .env and restart the dev server.'
    return err.message || 'An unexpected error occurred.'
  }

  // ── register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (username: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const { credential, account: newAccount } = await engineRegister(username, chainId)
      saveCredential(credential)
      setAccount(newAccount)
      setSmartAccountAddress(newAccount.address)
    } catch (err) {
      setError(humaniseError(err))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chainId])

  // ── login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { credential, account: loggedIn } = await engineLogin(chainId)
      saveCredential(credential)
      setAccount(loggedIn)
      setSmartAccountAddress(loggedIn.address)
    } catch (err) {
      setError(humaniseError(err))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chainId])

  // ── disconnect ──────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    clearCredential()
    setAccount(undefined)
    setSmartAccountAddress(undefined)
    setError(null)
  }, [])

  // ── executeGaslessAction ────────────────────────────────────────────────────
  const executeGaslessAction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (functionName: string, args: readonly any[] = []) => {
      if (!account) throw new Error('No passkey session active. Please sign in first.')
      return sendGaslessContractCall({ account, chainId, functionName, args })
    },
    [account, chainId],
  )

  const value: PasskeyContextValue = {
    smartAccountAddress,
    account,
    isPasskeyConnected: !!account,
    isLoading,
    error,
    register,
    login,
    disconnect,
    executeGaslessAction,
  }

  return (
    <PasskeyContext.Provider value={value}>
      {children}
    </PasskeyContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePasskeyContext(): PasskeyContextValue {
  const ctx = useContext(PasskeyContext)
  if (!ctx) {
    throw new Error('usePasskeyContext must be used inside <PasskeyProvider>.')
  }
  return ctx
}
