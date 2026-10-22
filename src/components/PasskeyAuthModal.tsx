import { useState } from 'react'
import { X, Fingerprint, Sparkles, Shield, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { usePasskey } from '../context/PasskeyContext'

interface PasskeyAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PasskeyAuthModal({ isOpen, onClose }: PasskeyAuthModalProps) {
  const { register, login, isLoading, hasConfig, isPasskeyConnected, smartAccountAddress, username, disconnect } = usePasskey()
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register')
  const [handle, setHandle] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!handle.trim()) {
      setErrorMsg('Please enter a username or handle.')
      return
    }

    try {
      await register(handle.trim())
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Biometric registration failed'
      setErrorMsg(msg)
    }
  }

  const handleLogin = async () => {
    setErrorMsg(null)
    try {
      await login()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Biometric login failed'
      setErrorMsg(msg)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passkey-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all"
        style={{
          background: 'var(--warm-surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 25px 50px -12px rgba(1, 75, 170, 0.18)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          aria-label="Close passkey dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{
              background: 'linear-gradient(135deg, #014BAA 0%, #27187E 100%)',
              color: '#ffffff',
            }}
          >
            <Fingerprint size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2
                id="passkey-modal-title"
                className="font-extrabold text-lg sm:text-xl tracking-tight"
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  color: 'var(--ink)',
                  letterSpacing: '-0.025em',
                }}
              >
                Passkey Smart Account
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
              >
                Gasless
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Powered by Circle Modular Wallets & Gas Station on Arc
            </p>
          </div>
        </div>

        {/* If already connected */}
        {isPasskeyConnected ? (
          <div className="space-y-4">
            <div
              className="p-4 rounded-2xl space-y-2 border"
              style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--teal)' }}>
                <CheckCircle2 size={16} />
                <span>Passkey Connected</span>
              </div>
              {username && (
                <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                  {username}
                </div>
              )}
              <div className="text-xs font-mono break-all text-muted">
                {smartAccountAddress}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                disconnect()
                onClose()
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border"
              style={{
                background: 'transparent',
                borderColor: 'var(--coral)',
                color: 'var(--coral)',
              }}
            >
              Disconnect Passkey Account
            </button>
          </div>
        ) : (
          <>
            {/* Missing API Key Notice (Graceful fallback) */}
            {!hasConfig && (
              <div
                className="mb-4 p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5"
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  color: '#92400e',
                }}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={14} />
                  <span>Circle Client Key Needed for Live WebAuthn</span>
                </div>
                <p>
                  To initiate biometric Passkeys with Arc Testnet RPC, configure <code className="px-1 py-0.5 rounded bg-amber-100 font-mono text-[11px]">VITE_CLIENT_KEY</code> in <code className="px-1 py-0.5 rounded bg-amber-100 font-mono text-[11px]">.env</code> from your{' '}
                  <a
                    href="https://console.circle.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold"
                  >
                    Circle Console
                  </a>.
                </p>
              </div>
            )}

            {/* Tab switch */}
            <div
              className="flex items-center p-1 rounded-xl mb-4 border"
              style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
              role="tablist"
            >
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(null) }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register' ? 'shadow-xs' : 'text-muted hover:text-ink'
                }`}
                style={{
                  background: activeTab === 'register' ? 'var(--brand)' : 'transparent',
                  color: activeTab === 'register' ? '#ffffff' : 'var(--muted)',
                }}
                role="tab"
                aria-selected={activeTab === 'register'}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(null) }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login' ? 'shadow-xs' : 'text-muted hover:text-ink'
                }`}
                style={{
                  background: activeTab === 'login' ? 'var(--brand)' : 'transparent',
                  color: activeTab === 'login' ? '#ffffff' : 'var(--muted)',
                }}
                role="tab"
                aria-selected={activeTab === 'login'}
              >
                Sign In
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                className="mb-3.5 p-3 rounded-xl border text-xs flex items-start gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                  color: '#b91c1c',
                }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab Content: Register */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label
                    htmlFor="passkey-handle"
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--subtle)' }}
                  >
                    Builder Handle / Username
                  </label>
                  <input
                    id="passkey-handle"
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. dev-researcher"
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      background: 'var(--warm-bg-1)',
                      borderColor: 'var(--border)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>

                {/* Gasless Feature Benefit */}
                <div
                  className="p-3 rounded-xl border space-y-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(1, 75, 170, 0.05) 0%, rgba(39, 24, 126, 0.05) 100%)',
                    borderColor: 'var(--brand-border)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--brand)' }}>
                    <Sparkles size={14} />
                    <span>Zero Gas & Zero Seed Phrases</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted">
                    No MetaMask or ETH needed. Your Smart Account uses biometric WebAuthn (TouchID/FaceID) and gas is sponsored on Arc.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #014BAA 0%, #27187E 100%)',
                    color: '#ffffff',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Creating Smart Account…</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint size={16} />
                      <span>Create Account with Biometrics</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab Content: Login */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <div
                  className="p-3.5 rounded-xl border text-xs leading-relaxed space-y-1"
                  style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--ink)' }}>
                    <Shield size={14} />
                    <span>Authenticate Device</span>
                  </div>
                  <p className="text-muted text-[11px]">
                    Touch your fingerprint sensor or look into your camera to restore your existing Circle Smart Account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #014BAA 0%, #27187E 100%)',
                    color: '#ffffff',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Verifying Passkey…</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint size={16} />
                      <span>Sign In with Biometrics</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
