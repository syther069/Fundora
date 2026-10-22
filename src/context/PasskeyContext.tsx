import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { P256Credential } from 'viem/account-abstraction'
import { toast } from 'sonner'
import {
  registerPasskey,
  loginPasskey,
  restorePasskeyAccount,
  sendGaslessContractCall,
  hasPasskeyConfig,
} from '../utils/modularWallet'
import { ARC_TESTNET_ID } from '../contracts/proofSpring'

interface PasskeyContextState {
  account: any | null
  smartAccountAddress: string | null
  username: string | null
  isPasskeyConnected: boolean
  isLoading: boolean
  hasConfig: boolean
  register: (name: string) => Promise<string | undefined>
  login: () => Promise<string | undefined>
  disconnect: () => void
  executeGaslessAction: (functionName: string, args: any[]) => Promise<string>
}

const PasskeyContext = createContext<PasskeyContextState>({
  account: null,
  smartAccountAddress: null,
  username: null,
  isPasskeyConnected: false,
  isLoading: false,
  hasConfig: false,
  register: async () => undefined,
  login: async () => undefined,
  disconnect: () => {},
  executeGaslessAction: async () => '',
})

const STORAGE_CREDENTIAL_KEY = 'proofspring:passkey:credential'
const STORAGE_USER_KEY       = 'proofspring:passkey:username'

export function PasskeyProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<any | null>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasConfig = hasPasskeyConfig()

  // Restore session from localStorage on mount
  useEffect(() => {
    if (!hasConfig) return

    const rawCred = localStorage.getItem(STORAGE_CREDENTIAL_KEY)
    const storedUser = localStorage.getItem(STORAGE_USER_KEY)
    if (!rawCred) return

    try {
      const parsedCred = JSON.parse(rawCred) as P256Credential
      setIsLoading(true)
      restorePasskeyAccount(parsedCred, ARC_TESTNET_ID)
        .then(({ account: restoredAccount, address }) => {
          setAccount(restoredAccount)
          setSmartAccountAddress(address)
          if (storedUser) setUsername(storedUser)
        })
        .catch(() => {
          // Stale credential or transport changed
          localStorage.removeItem(STORAGE_CREDENTIAL_KEY)
          localStorage.removeItem(STORAGE_USER_KEY)
        })
        .finally(() => setIsLoading(false))
    } catch {
      localStorage.removeItem(STORAGE_CREDENTIAL_KEY)
    }
  }, [hasConfig])

  const register = useCallback(async (name: string) => {
    if (!hasConfig) {
      toast.error('Circle Modular Wallets client key not configured in .env')
      return
    }

    setIsLoading(true)
    try {
      const { credential, account: newAccount, address } = await registerPasskey(name, ARC_TESTNET_ID)
      localStorage.setItem(STORAGE_CREDENTIAL_KEY, JSON.stringify(credential))
      localStorage.setItem(STORAGE_USER_KEY, name)
      setAccount(newAccount)
      setSmartAccountAddress(address)
      setUsername(name)
      toast.success(`Smart Account created! Welcome, ${name}`)
      return address
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey registration cancelled.'
      toast.error(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [hasConfig])

  const login = useCallback(async () => {
    if (!hasConfig) {
      toast.error('Circle Modular Wallets client key not configured in .env')
      return
    }

    setIsLoading(true)
    try {
      const { credential, account: loggedAccount, address } = await loginPasskey(ARC_TESTNET_ID)
      localStorage.setItem(STORAGE_CREDENTIAL_KEY, JSON.stringify(credential))
      setAccount(loggedAccount)
      setSmartAccountAddress(address)
      toast.success('Signed in with Passkey!')
      return address
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Passkey login failed.'
      toast.error(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [hasConfig])

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_CREDENTIAL_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
    setAccount(null)
    setSmartAccountAddress(null)
    setUsername(null)
    toast.info('Passkey smart account disconnected.')
  }, [])

  const executeGaslessAction = useCallback(async (functionName: string, args: any[]): Promise<string> => {
    if (!account) {
      throw new Error('No passkey smart account connected.')
    }

    return await sendGaslessContractCall({
      account,
      activeChainId: ARC_TESTNET_ID,
      functionName,
      args,
    })
  }, [account])

  return (
    <PasskeyContext.Provider
      value={{
        account,
        smartAccountAddress,
        username,
        isPasskeyConnected: !!smartAccountAddress,
        isLoading,
        hasConfig,
        register,
        login,
        disconnect,
        executeGaslessAction,
      }}
    >
      {children}
    </PasskeyContext.Provider>
  )
}

export function usePasskey() {
  return useContext(PasskeyContext)
}
