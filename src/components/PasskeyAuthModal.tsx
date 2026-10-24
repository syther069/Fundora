/**
 * PasskeyAuthModal.tsx — Two-tab passkey onboarding modal for Fundora.
 *
 * Tab 1 "Create New Account": nickname input + "Create Passkey" button.
 * Tab 2 "Sign In": single "Continue with Passkey" button.
 *
 * If VITE_CLIENT_KEY is missing / unconfigured, shows a setup notice instead
 * of crashing or showing a confusing error.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Shield, X, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { usePasskeyContext } from '../context/PasskeyContext'
import { isClientKeyConfigured } from '../utils/modularWallet'

interface Props {
  onClose: () => void
}

type Tab = 'create' | 'signin'

// ── Setup notice — shown when VITE_CLIENT_KEY is absent ───────────────────────
function SetupNotice() {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ background: 'var(--amber-light)', borderColor: 'var(--amber-border)' }}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--amber)' }} aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            Circle Client Key not configured
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            To use passkey sign-in, add your Circle Client Key to <code className="font-mono">.env</code>:
          </p>
          <code
            className="block text-xs font-mono px-3 py-2 rounded-lg mt-1"
            style={{ background: 'var(--warm-bg-2)', color: 'var(--ink)', border: '1px solid var(--border)' }}
          >
            VITE_CLIENT_KEY=TEST_CLIENT_KEY:…
          </code>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Then restart the dev server. Get a key at{' '}
            <a
              href="https://console.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
              style={{ color: 'var(--brand)' }}
            >
              console.circle.com
              <ExternalLink size={10} aria-hidden="true" />
            </a>
            {' '}under Keys → Client Keys. Make sure the Allowed Domain and Passkey Domain are set to this preview's hostname.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Gasless badge ─────────────────────────────────────────────────────────────
function GaslessBadge() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
      style={{
        background: 'var(--teal-light)',
        borderColor: 'var(--teal-border)',
        color: 'var(--teal)',
      }}
    >
      <Shield size={13} aria-hidden="true" />
      <span>
        <span className="font-semibold">Gasless Account:</span> All transactions sponsored on Arc via Circle Gas Station
      </span>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function PasskeyAuthModal({ onClose }: Props) {
  const { register, login, isLoading, error } = usePasskeyContext()
  const [tab, setTab] = useState<Tab>('create')
  const [username, setUsername] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const clientKeyOk = isClientKeyConfigured()
  const displayError = localError ?? error

  async function handleCreate() {
    if (!username.trim()) {
      setLocalError('Please enter a nickname.')
      return
    }
    setLocalError(null)
    try {
      await register(username.trim())
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch {
      // error already set in context
    }
  }

  async function handleSignIn() {
    setLocalError(null)
    try {
      await login()
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch {
      // error already set in context
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Passkey sign-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--warm-surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--brand-light)' }}
            >
              <Fingerprint size={18} style={{ color: 'var(--brand)' }} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--ink)' }}>
                Passkey Account
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                No seed phrase. No MetaMask.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--muted)' }}
            aria-label="Close"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ background: 'var(--warm-bg-2)' }}
            role="tablist"
          >
            {(['create', 'signin'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => { setTab(t); setLocalError(null) }}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                style={tab === t ? {
                  background: 'var(--warm-surface)',
                  color: 'var(--brand)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                } : {
                  color: 'var(--muted)',
                  background: 'transparent',
                }}
              >
                {t === 'create' ? 'Create New Account' : 'Sign In'}
              </button>
            ))}
          </div>

          {/* Setup notice if key is missing */}
          {!clientKeyOk && <SetupNotice />}

          {clientKeyOk && (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'create' ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="space-y-4"
              >
                {/* Gasless badge */}
                <GaslessBadge />

                {/* Create tab content */}
                {tab === 'create' && (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="passkey-nickname"
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: 'var(--ink)' }}
                      >
                        Nickname
                      </label>
                      <input
                        id="passkey-nickname"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate() }}
                        placeholder="e.g. alice"
                        maxLength={64}
                        disabled={isLoading || success}
                        className="w-full px-3 py-2.5 rounded-xl text-sm border transition-colors outline-none"
                        style={{
                          background: 'var(--warm-bg)',
                          borderColor: 'var(--border)',
                          color: 'var(--ink)',
                        }}
                        aria-describedby={displayError ? 'passkey-error' : undefined}
                      />
                    </div>

                    <button
                      onClick={() => void handleCreate()}
                      disabled={isLoading || success || !username.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'var(--brand)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(99,102,241,.3)',
                      }}
                    >
                      {success ? (
                        <>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          Account created!
                        </>
                      ) : isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          Waiting for biometric…
                        </>
                      ) : (
                        <>
                          <Fingerprint size={16} aria-hidden="true" />
                          Create Passkey with FaceID / TouchID
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Sign In tab content */}
                {tab === 'signin' && (
                  <button
                    onClick={() => void handleSignIn()}
                    disabled={isLoading || success}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--brand)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(99,102,241,.3)',
                    }}
                  >
                    {success ? (
                      <>
                        <CheckCircle2 size={16} aria-hidden="true" />
                        Signed in!
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                        Waiting for biometric…
                      </>
                    ) : (
                      <>
                        <Fingerprint size={16} aria-hidden="true" />
                        Continue with Passkey
                      </>
                    )}
                  </button>
                )}

                {/* Error */}
                {displayError && (
                  <div
                    id="passkey-error"
                    role="alert"
                    className="flex items-start gap-2 p-3 rounded-xl border text-xs"
                    style={{
                      background: 'var(--rose-light)',
                      borderColor: 'var(--rose-border)',
                      color: 'var(--rose)',
                    }}
                  >
                    <AlertCircle size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{displayError}</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Footer hint */}
          <p className="text-center text-xs" style={{ color: 'var(--subtle)' }}>
            Your smart account is secured by your device biometrics. No seed phrase required.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
