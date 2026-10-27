import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useReadContract,
  usePublicClient,
} from 'wagmi'
import { isAddress, parseUnits, formatUnits } from 'viem'
import {
  ShieldCheck,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ARC_TESTNET_ID,
  ARC_MAINNET_ID,
  ARC_USDC_ADDRESS,
  ADMIN_REGISTRY_ABI,
  getAdminRegistryAddress,
  getAdminRegistrationFee,
} from '../contracts/fundora'
import { useIsRegisteredAdmin } from '../hooks/useAdminRegistry'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { verifyAdminRegistrationTx } from '../utils/verifyAdminTx'
import { parseOnchainError } from '../utils/errors'

interface Props {
  onClose: () => void
  onSuccessRedirect: () => void
}

const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

type Step = 'form' | 'approving' | 'registering' | 'verifying' | 'success'

export function ApplyAdminModal({ onClose, onSuccessRedirect }: Props) {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient()

  // Network selection: derived from active chain (no effect needed)
  const [_manualTargetChainId, setTargetChainId] = useState<number>(
    chainId === ARC_MAINNET_ID ? ARC_MAINNET_ID : ARC_TESTNET_ID
  )
  // Sync when wallet chain changes by deriving the effective target from chainId when it is an Arc chain
  const targetChainId = (chainId === ARC_MAINNET_ID || chainId === ARC_TESTNET_ID) ? chainId : _manualTargetChainId

  const isTestnet = targetChainId === ARC_TESTNET_ID
  const feeAmount = getAdminRegistrationFee(targetChainId)
  const feeDisplay = isTestnet ? '10 USDC' : '1 USDC'
  const registryAddress = getAdminRegistryAddress(targetChainId)

  // Check if already registered on the selected network
  const { data: isAlreadyRegistered, refetch: refetchIsAdmin } = useIsRegisteredAdmin(address)

  // Form state
  const [username, setUsername] = useState('')
  const [adminWallet, setAdminWallet] = useState(() => address ?? '')
  const [orgName, setOrgName] = useState('')
  const [grantDesc, setGrantDesc] = useState('')
  const [budgetUsdc, setBudgetUsdc] = useState('')
  const [numWinners, setNumWinners] = useState('')
  const [prizePoolDetails, setPrizePoolDetails] = useState('')

  // Flow & verification state
  const [step, setStep] = useState<Step>('form')
  const [verifiedTxHash, setVerifiedTxHash] = useState<`0x${string}` | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // adminWallet is pre-populated from connected address; user can override it

  // Read applicant USDC balance
  const { data: usdcBalanceData, refetch: _refetchBalance } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: targetChainId,
    query: { enabled: !!address },
  })
  const usdcBalance = usdcBalanceData !== undefined ? (usdcBalanceData) : 0n
  const hasSufficientUsdc = usdcBalance >= feeAmount

  // Read allowance for AdminRegistry
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, registryAddress] : undefined,
    chainId: targetChainId,
    query: { enabled: !!address },
  })
  const allowance = allowanceData !== undefined ? (allowanceData) : 0n
  const needsApproval = allowance < feeAmount

  // Write contract hooks for Approve
  const { writeContract: writeApprove, data: approveTxHash, isPending: approvePending } = useWriteContract()
  const { isLoading: approveConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  // Write contract hooks for Register
  const { writeContract: writeRegister, data: registerTxHash, isPending: registerPending } = useWriteContract()
  const {
    isLoading: registerConfirming,
    isSuccess: registerSuccess,
    error: _registerReceiptError,
  } = useWaitForTransactionReceipt({
    hash: registerTxHash,
  })

  // Form validation
  const validUsername = username.trim().length > 0
  const validWallet = isAddress(adminWallet)
  const validOrg = orgName.trim().length > 0
  const validDesc = grantDesc.trim().length > 0
  const parsedBudget = (() => {
    try {
      const val = parseUnits(budgetUsdc.trim(), 6)
      return val > 0n ? val : null
    } catch {
      return null
    }
  })()
  const validBudget = parsedBudget !== null

  const isFormValid = validUsername && validWallet && validOrg && validDesc && validBudget
  const isWrongChain = chainId !== targetChainId

  // Handle post-approve transition — step is derived below (no setState in effect needed)
  // refetchAllowance is called via void to satisfy floating-promises
  useEffect(() => {
    if (!approveSuccess) return
    toast.success('USDC spending approved!')
    void refetchAllowance()
  }, [approveSuccess, refetchAllowance])

  // Derive step from approve/register success to avoid set-state-in-effect
  // (setStep('form') after approve is implicit — approveSuccess just cleared the approve UI)

  // Handle register transaction mining -> trigger strict verification
  useEffect(() => {
    if (!registerSuccess || !registerTxHash || !publicClient || !address) return
    // verificationError is null when registration starts; only set on failure via .catch

    verifyAdminRegistrationTx({
      publicClient,
      txHash: registerTxHash,
      expectedChainId: targetChainId,
      expectedUserAddress: address,
      registryAddress,
      expectedFeeAmount: feeAmount,
    })
      .then(() => {
        setVerifiedTxHash(registerTxHash)
        setStep('success')
        void refetchIsAdmin()
        toast.success('Admin registration verified and approved on-chain!')
      })
      .catch((err: Error) => {
        const msg = err.message || 'On-chain verification failed'
        setVerificationError(msg)
        toast.error(msg)
        setStep('form')
      })
  }, [registerSuccess, registerTxHash, publicClient, address, targetChainId, registryAddress, feeAmount, refetchIsAdmin])

  const handleNetworkSelect = (id: number) => {
    setTargetChainId(id)
    if (chainId !== id) {
      switchChain({ chainId: id })
    }
  }

  const handleApprove = () => {
    if (isWrongChain) {
      switchChain({ chainId: targetChainId })
      return
    }
    setStep('approving')
    writeApprove(
      {
        address: ARC_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [registryAddress, feeAmount],
        chainId: targetChainId,
      },
      {
        onSuccess: () => setStep('form'),
        onError: (err) => {
          toast.error(parseOnchainError(err))
          setStep('form')
        },
      }
    )
  }

  const handleRegister = () => {
    if (isWrongChain) {
      switchChain({ chainId: targetChainId })
      return
    }
    if (!isFormValid || !parsedBudget) {
      toast.error('Please complete all required fields.')
      return
    }
    if (!hasSufficientUsdc) {
      toast.error(`Insufficient USDC balance. You need at least ${feeDisplay}.`)
      return
    }

    const winnersCount = numWinners ? parseInt(numWinners, 10) || 0 : 0

    setStep('registering')
    writeRegister(
      {
        address: registryAddress,
        abi: ADMIN_REGISTRY_ABI,
        functionName: 'registerAdmin',
        args: [
          username.trim().startsWith('@') ? username.trim().slice(1) : username.trim(),
          orgName.trim(),
          grantDesc.trim(),
          parsedBudget,
          winnersCount,
          prizePoolDetails.trim(),
        ],
        chainId: targetChainId,
      },
      {
        onSuccess: () => setStep('verifying'),
        onError: (err) => {
          toast.error(parseOnchainError(err))
          setStep('form')
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-admin-modal-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="card w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border"
        style={{
          background: 'var(--warm-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Top gradient header bar */}
        <div
          className="h-2 w-full shrink-0"
          style={{
            background: isTestnet
              ? 'linear-gradient(90deg, #0d9488 0%, #6366f1 100%)'
              : 'linear-gradient(90deg, #6366f1 0%, #d97706 100%)',
          }}
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--brand-light)',
                color: 'var(--brand)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 id="apply-admin-modal-title" className="font-jakarta font-extrabold text-lg" style={{ color: 'var(--ink)' }}>
                Apply as an Admin
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Register on-chain to launch and manage grants on Arc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors btn-focus"
            aria-label="Close modal"
          >
            <X size={18} style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Success state */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
              >
                <CheckCircle2 size={34} />
              </div>

              <div className="space-y-1">
                <h3 className="font-jakarta font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>
                  You are now an Approved Admin!
                </h3>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
                  Your registration fee and profile have been cryptographically verified on {isTestnet ? 'Arc Testnet' : 'Arc Mainnet'}.
                  You can now create and manage grant rounds immediately.
                </p>
              </div>

              {verifiedTxHash && (
                <div
                  className="rounded-xl p-3 border inline-flex items-center gap-2 text-xs font-mono"
                  style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
                >
                  <span style={{ color: 'var(--muted)' }}>Receipt Tx:</span>
                  <a
                    href={buildTxExplorerUrl(targetChainId, verifiedTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    {`${verifiedTxHash.slice(0, 10)}…${verifiedTxHash.slice(-8)}`}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={() => {
                    onClose()
                    onSuccessRedirect()
                  }}
                  className="btn btn-primary btn-md btn-focus mx-auto w-full sm:w-auto px-8"
                >
                  <Sparkles size={16} />
                  Open Admin Panel
                </button>
              </div>
            </motion.div>
          )}

          {/* Already registered state */}
          {step !== 'success' && isAlreadyRegistered && (
            <div
              className="rounded-2xl p-5 border text-center space-y-3"
              style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
            >
              <div className="flex items-center justify-center gap-2 font-bold text-sm" style={{ color: 'var(--teal)' }}>
                <CheckCircle2 size={16} />
                Already Registered as Admin
              </div>
              <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
                Your connected wallet ({address?.slice(0, 6)}…{address?.slice(-4)}) is already registered and verified on{' '}
                {isTestnet ? 'Arc Testnet' : 'Arc Mainnet'}. No duplicate payment is required.
              </p>
              <button
                onClick={() => {
                  onClose()
                  onSuccessRedirect()
                }}
                className="btn btn-primary btn-sm btn-focus mx-auto"
              >
                Go to Admin Panel
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Standard Form */}
          {step !== 'success' && !isAlreadyRegistered && (
            <>
              {/* Network Selector Tabs */}
              <div>
                <label className="label-caps block mb-1.5">Select Network</label>
                <div
                  className="grid grid-cols-2 gap-2 p-1 rounded-2xl border"
                  style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
                >
                  <button
                    id="network-testnet-btn"
                    type="button"
                    onClick={() => handleNetworkSelect(ARC_TESTNET_ID)}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all btn-focus"
                    style={
                      isTestnet
                        ? { background: 'var(--teal)', color: '#fff', boxShadow: 'var(--shadow-sm)' }
                        : { color: 'var(--muted)' }
                    }
                  >
                    <span>Arc Testnet</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
                      style={isTestnet ? { background: 'rgba(255,255,255,0.2)' } : { background: 'var(--warm-surface)' }}
                    >
                      10 USDC
                    </span>
                  </button>

                  <button
                    id="network-mainnet-btn"
                    type="button"
                    onClick={() => handleNetworkSelect(ARC_MAINNET_ID)}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all btn-focus"
                    style={
                      !isTestnet
                        ? { background: 'var(--brand)', color: '#fff', boxShadow: 'var(--shadow-sm)' }
                        : { color: 'var(--muted)' }
                    }
                  >
                    <span>Arc Mainnet</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
                      style={!isTestnet ? { background: 'rgba(255,255,255,0.2)' } : { background: 'var(--warm-surface)' }}
                    >
                      1 USDC
                    </span>
                  </button>
                </div>
              </div>

              {/* Chain mismatch prompt */}
              {isWrongChain && isConnected && (
                <div
                  className="rounded-xl p-3 border flex items-center justify-between gap-3 text-xs"
                  style={{ background: 'var(--amber-light)', borderColor: 'var(--amber-border)' }}
                >
                  <span style={{ color: 'var(--amber)' }} className="font-semibold">
                    Wallet is connected to chain {chainId}. Switch to {isTestnet ? 'Arc Testnet' : 'Arc Mainnet'} to proceed.
                  </span>
                  <button
                    type="button"
                    onClick={() => switchChain({ chainId: targetChainId })}
                    className="btn btn-xs btn-focus shrink-0"
                    style={{ background: 'var(--amber)', color: '#fff' }}
                  >
                    Switch Network
                  </button>
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-4">
                {/* Arc House Username */}
                <div>
                  <label htmlFor="apply-username" className="label-caps block mb-1">
                    Arc House Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-semibold" style={{ color: 'var(--subtle)' }}>
                      @
                    </span>
                    <input
                      id="apply-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alice_arc"
                      className="input pl-8"
                      disabled={step !== 'form'}
                    />
                  </div>
                </div>

                {/* Admin Wallet Address */}
                <div>
                  <label htmlFor="apply-wallet" className="label-caps block mb-1">
                    Admin Wallet Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apply-wallet"
                    type="text"
                    value={adminWallet}
                    onChange={(e) => setAdminWallet(e.target.value)}
                    placeholder="0x..."
                    className="input font-mono text-xs"
                    disabled={step !== 'form'}
                  />
                  {!validWallet && adminWallet && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid 0x EVM address</p>
                  )}
                </div>

                {/* Org / Project Name */}
                <div>
                  <label htmlFor="apply-org" className="label-caps block mb-1">
                    Organization / Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apply-org"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Arc Community Collective"
                    className="input"
                    disabled={step !== 'form'}
                  />
                </div>

                {/* Grant Description & Purpose */}
                <div>
                  <label htmlFor="apply-desc" className="label-caps block mb-1">
                    Grant Program Description & Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="apply-desc"
                    value={grantDesc}
                    onChange={(e) => setGrantDesc(e.target.value)}
                    placeholder="Describe what initiatives this grant program will fund..."
                    rows={3}
                    className="input resize-none py-2"
                    disabled={step !== 'form'}
                  />
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="apply-budget" className="label-caps block mb-1">
                    Estimated Total Budget (USDC) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-semibold" style={{ color: 'var(--subtle)' }}>
                      $
                    </span>
                    <input
                      id="apply-budget"
                      type="text"
                      value={budgetUsdc}
                      onChange={(e) => setBudgetUsdc(e.target.value)}
                      placeholder="5000"
                      className="input pl-8 tabular-nums"
                      disabled={step !== 'form'}
                    />
                  </div>
                  {!validBudget && budgetUsdc && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid positive number</p>
                  )}
                </div>

                {/* Optional Winners & Prize Pool */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label htmlFor="apply-winners" className="label-caps block mb-1">
                      Target Winners <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>(Optional)</span>
                    </label>
                    <input
                      id="apply-winners"
                      type="number"
                      min="1"
                      step="1"
                      value={numWinners}
                      onChange={(e) => setNumWinners(e.target.value)}
                      placeholder="e.g. 3"
                      className="input tabular-nums"
                      disabled={step !== 'form'}
                    />
                  </div>

                  <div>
                    <label htmlFor="apply-prize" className="label-caps block mb-1">
                      Prize Distribution <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>(Optional)</span>
                    </label>
                    <input
                      id="apply-prize"
                      type="text"
                      value={prizePoolDetails}
                      onChange={(e) => setPrizePoolDetails(e.target.value)}
                      placeholder="e.g. 50% / 30% / 20%"
                      className="input"
                      disabled={step !== 'form'}
                    />
                  </div>
                </div>
              </div>

              {/* Fee and Balance Summary Card */}
              <div
                className="rounded-2xl p-4 border space-y-2"
                style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Registration Fee:</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                    {feeDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Your USDC Balance:</span>
                  <span className="font-mono font-medium" style={{ color: hasSufficientUsdc ? 'var(--teal)' : 'var(--coral)' }}>
                    ${formatUnits(usdcBalance, 6)} USDC
                  </span>
                </div>

                {!hasSufficientUsdc && isConnected && (
                  <div className="pt-1 flex items-center justify-between text-xs" style={{ color: 'var(--coral)' }}>
                    <span className="flex items-center gap-1 font-semibold">
                      <AlertCircle size={13} />
                      Insufficient balance
                    </span>
                    {isTestnet && (
                      <a
                        href="https://faucet.circle.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                      >
                        Get test USDC ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Verification error notice if failed */}
              {verificationError && (
                <div
                  className="rounded-xl p-3 border flex items-start gap-2 text-xs"
                  style={{ background: 'var(--coral-light)', borderColor: 'var(--coral-border)', color: 'var(--coral)' }}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Verification Warning: </span>
                    {verificationError}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {needsApproval ? (
                  <button
                    id="apply-admin-submit-btn"
                    type="button"
                    onClick={handleApprove}
                    disabled={!isFormValid || !hasSufficientUsdc || step === 'approving' || approvePending || approveConfirming}
                    className="btn btn-primary w-full py-3 text-sm font-bold btn-focus flex items-center justify-center gap-2"
                  >
                    {step === 'approving' || approvePending || approveConfirming ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Approving {feeDisplay}…
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        Step 1: Approve {feeDisplay} Spend
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    id="apply-admin-submit-btn"
                    type="button"
                    onClick={handleRegister}
                    disabled={
                      !isFormValid ||
                      !hasSufficientUsdc ||
                      step === 'registering' ||
                      step === 'verifying' ||
                      registerPending ||
                      registerConfirming
                    }
                    className="btn btn-primary w-full py-3 text-sm font-bold btn-focus flex items-center justify-center gap-2"
                  >
                    {step === 'registering' || registerPending || registerConfirming ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Confirming on-chain…
                      </>
                    ) : step === 'verifying' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Verifying receipt & permissions…
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Pay {feeDisplay} & Register as Admin
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
