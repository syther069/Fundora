import { motion } from 'framer-motion'
import { ShieldCheck, Twitter, ArrowRight, X } from 'lucide-react'
import type { Event } from '../../types/events'

interface EventPublishedModalProps {
  event: Event
  onClose: () => void
  onViewEvent: (eventId: string) => void
}

function formatUsdc(amount: bigint): string {
  const dollars = amount / 1_000_000n
  return Number(dollars).toLocaleString('en-US')
}

export function EventPublishedModal({ event, onClose, onViewEvent }: EventPublishedModalProps) {
  const isNative = event.modality === 'native_escrow'
  const tweetText = `Excited to announce ${event.title} on @FundoraApp with $${formatUsdc(
    event.totalPrizePoolUsdc
  )} USDC ${isNative ? 'verified onchain escrow' : 'prize pool'}! Built on @ArcNetwork. Join and submit your project! 🚀 #ArcBuild`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="published-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: 'linear-gradient(90deg, #0F766E 0%, #1A3F75 100%)' }}
        />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close published modal"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal flex items-center justify-center mx-auto mb-3.5 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h2 id="published-title" className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight mb-1">
            Event Published Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Your event is now live and accepting submissions from builders across the Arc ecosystem.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 sm:p-5 mb-6 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Event Title:</span>
            <span className="font-bold text-midnight font-jakarta">{event.title}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Escrow Status:</span>
            <span className="inline-flex items-center gap-1 text-teal font-semibold">
              <ShieldCheck size={13} /> Arc Verified Escrow
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Locked Prize Pool:</span>
            <span className="font-mono font-bold text-base text-midnight tabular-nums">
              ${formatUsdc(event.totalPrizePoolUsdc)} USDC
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Submission Deadline:</span>
            <span className="font-medium text-slate-700">
              {new Date(event.submissionDeadline * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

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

          <button
            onClick={() => {
              onClose()
              onViewEvent(event.id)
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 transition-colors shadow-sm"
          >
            View Event Detail
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
