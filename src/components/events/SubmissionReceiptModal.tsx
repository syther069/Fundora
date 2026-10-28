import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Check, ArrowRight, Twitter, X } from 'lucide-react'
import type { Submission } from '../../types/events'

interface SubmissionReceiptModalProps {
  submission: Submission
  eventTitle: string
  onClose: () => void
  onViewShowcase?: () => void
}

export function SubmissionReceiptModal({
  submission,
  eventTitle,
  onClose,
  onViewShowcase,
}: SubmissionReceiptModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tweetText = `Just submitted "${submission.title}" to ${eventTitle} on @FundoraApp! Built on @ArcNetwork with native USDC escrow. 🚀 #ArcBuild`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Top celebratory gradient bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: 'linear-gradient(90deg, #1A3F75 0%, #0F766E 50%, #B45309 100%)' }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close receipt modal"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal flex items-center justify-center mx-auto mb-3.5 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h2 id="receipt-title" className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight mb-1">
            Project Entry Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Your project has been recorded and submitted to the evaluation queue for <strong>{eventTitle}</strong>.
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 sm:p-5 mb-6 space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Project Name:</span>
            <span className="font-bold text-midnight font-jakarta">{submission.title}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Entry Identifier:</span>
            <span className="font-mono font-semibold text-slate-700">{submission.id}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Submitted At:</span>
            <span className="font-medium text-slate-700">
              {new Date(submission.submittedAt * 1000).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Receiving Address:</span>
            <div className="flex items-center gap-1.5 font-mono text-midnight">
              <span>{submission.submitterAddress.slice(0, 6)}...{submission.submitterAddress.slice(-4)}</span>
              <button
                onClick={() => handleCopy(submission.submitterAddress)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Copy address"
              >
                {copied ? <Check size={12} className="text-teal" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Pull-Payment Reminder */}
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/70 text-[11px] text-teal-900 leading-relaxed mb-6">
          <strong>Pull-Claim Protection:</strong> If selected as a winning team, rewards will be unlocked for your wallet address to pull-claim in one click with zero gas via your passkey or connected wallet.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Twitter size={14} className="text-sky-500" />
            Share on X
          </a>

          {onViewShowcase && (
            <button
              onClick={() => {
                onClose()
                onViewShowcase()
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-colors shadow-sm"
            >
              View in Showcase
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
