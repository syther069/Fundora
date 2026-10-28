import { memo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ExternalLink, Clock, Users, ArrowUpRight, Trophy, Sparkles } from 'lucide-react'
import type { Event } from '../../types/events'

interface EventCardProps {
  event: Event
  onSelect: (eventId: string) => void
}

function formatUsdc(amount: bigint): string {
  const dollars = amount / 1_000_000n
  return Number(dollars).toLocaleString('en-US')
}

function getCountdownLabel(deadlineSec: number, status: string): { label: string; isUrgent: boolean } {
  const now = Math.floor(Date.now() / 1000)
  const diff = deadlineSec - now

  if (status === 'completed') {
    return { label: 'Concluded', isUrgent: false }
  }
  if (status === 'judging') {
    return { label: 'In Judging', isUrgent: false }
  }
  if (diff <= 0) {
    return { label: 'Submissions Closed', isUrgent: false }
  }

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)

  if (days > 1) {
    return { label: `${days}d left`, isUrgent: days <= 3 }
  }
  if (days === 1) {
    return { label: `1d ${hours}h left`, isUrgent: true }
  }
  return { label: `${hours}h left`, isUrgent: true }
}

export const EventCard = memo(function EventCard({ event, onSelect }: EventCardProps) {
  const { label: countdown, isUrgent } = getCountdownLabel(event.submissionDeadline, event.status)
  const _isExternal = event.modality === 'external_listing'
  const isNative = event.modality === 'native_escrow'
  const isCompleted = event.status === 'completed'
  const isJudging = event.status === 'judging'

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(event.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(event.id)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${event.title}, total prize pool $${formatUsdc(event.totalPrizePoolUsdc)} USDC`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          {/* Category Chip */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
            {event.category === 'hackathon' ? (
              <Trophy size={11} className="text-brand" aria-hidden="true" />
            ) : (
              <Sparkles size={11} className="text-amber-600" aria-hidden="true" />
            )}
            {event.category === 'hackathon' ? 'Hackathon' : 'Contest'}
          </span>

          {/* Modality Badge: Native Escrow vs External */}
          {isNative ? (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--teal-light)',
                color: 'var(--teal)',
                borderColor: 'var(--teal-border)',
              }}
              title="Prize pool is locked in an onchain Arc smart contract"
            >
              <ShieldCheck size={13} aria-hidden="true" />
              Verified Escrow
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-300/80 bg-slate-50 text-slate-600"
              title={`External listing on ${event.externalPlatformName || 'partner platform'}`}
            >
              <ExternalLink size={12} aria-hidden="true" />
              {event.externalPlatformName || 'External'}
            </span>
          )}
        </div>

        {/* Host Identity */}
        <div className="flex items-center gap-2 mb-2.5">
          {event.hostAvatar ? (
            <img
              src={event.hostAvatar}
              alt=""
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
              loading="lazy"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {event.hostName.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-slate-500 truncate">{event.hostName}</span>
        </div>

        {/* Title */}
        <h3 className="font-jakarta font-bold text-lg text-midnight tracking-tight mb-1.5 group-hover:text-brand transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Tagline */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {event.tagline}
        </p>

        {/* Track Chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {event.tracks.slice(0, 2).map((track) => (
            <span
              key={track.id}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-pale-blue/40 text-slate-700 border border-slate-200/50 truncate max-w-[170px]"
            >
              {track.name}
            </span>
          ))}
          {event.tracks.length > 2 && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              +{event.tracks.length - 2} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Financial & Operational Strip */}
      <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Total Prize Pool
          </span>
          <div className="font-mono font-bold text-xl text-midnight tabular-nums tracking-tight">
            ${formatUsdc(event.totalPrizePoolUsdc)}{' '}
            <span className="text-xs font-semibold text-slate-500 tracking-normal">USDC</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          {/* Status / Countdown */}
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                Winners Declared
              </span>
            ) : isJudging ? (
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                In Judging
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  isUrgent ? 'text-amber-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <Clock size={13} className={isUrgent ? 'text-amber-600' : 'text-slate-400'} aria-hidden="true" />
                {countdown}
              </span>
            )}
          </div>

          {/* Submissions & CTA Indicator */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-500">
              <Users size={12} className="text-slate-400" aria-hidden="true" />
              {event.submissionsCount} {event.category === 'hackathon' ? 'projects' : 'entries'}
            </span>
            <span className="text-slate-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all">
              <ArrowUpRight size={15} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
})
