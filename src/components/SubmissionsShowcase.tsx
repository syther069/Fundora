import { useState } from 'react'
import { Search, ExternalLink, Star, UserCircle2 } from 'lucide-react'
import { useSubmissionsBatch } from '../hooks/useFundoraEvents'
import type { OnchainEventInfo } from '../contracts/fundoraEvents'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

interface SubmissionsShowcaseProps {
  event: OnchainEventInfo
}

export function SubmissionsShowcase({ event: ev }: SubmissionsShowcaseProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useSubmissionsBatch(ev.id, 0, 50)

  const submissions = ([...(data ?? [])] as unknown) as {
    id: bigint
    submitter: `0x${string}`
    metadataUri: string
    scoreSum: number
    reviewCount: number
    disqualified: boolean
  }[]

  const filtered = submissions.filter(s => {
    if (s.disqualified) return false
    if (!search) return true
    return (
      s.metadataUri.toLowerCase().includes(search.toLowerCase()) ||
      s.submitter.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (ev.submissionCount === 0) {
    return (
      <div className="rounded-2xl border p-10 text-center space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <UserCircle2 size={28} style={{ color: 'var(--subtle)' }} className="mx-auto" aria-hidden="true" />
        <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>No submissions yet</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Entries will appear here once participants submit their projects.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--subtle)' }} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search submissions…"
          className="w-full h-9 pl-8 pr-4 rounded-xl border text-sm focus:outline-none"
          style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          aria-label="Search submissions"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-sm text-center py-4" style={{ color: 'var(--coral)' }}>
          Could not load submissions. Check your connection.
        </p>
      )}

      {/* Results */}
      {!isLoading && !isError && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>
              No submissions match your search.
            </p>
          )}
          {filtered.map(sub => {
            const avgScore = sub.reviewCount > 0
              ? (sub.scoreSum / sub.reviewCount).toFixed(1)
              : null
            return (
              <div
                key={sub.id.toString()}
                className="flex items-center gap-3 rounded-xl border p-4"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                {/* Rank / index */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
                  aria-hidden="true"
                >
                  {sub.id.toString()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Submitter */}
                  <p
                    className="text-xs font-mono truncate"
                    style={{ color: 'var(--muted)' }}
                    title={sub.submitter}
                  >
                    {shortAddress(sub.submitter)}
                  </p>
                  {/* Metadata URI */}
                  {sub.metadataUri && (
                    <a
                      href={sub.metadataUri.startsWith('ipfs://')
                        ? `https://ipfs.io/ipfs/${sub.metadataUri.slice(7)}`
                        : sub.metadataUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium truncate hover:underline"
                      style={{ color: 'var(--brand)' }}
                    >
                      <ExternalLink size={10} aria-hidden="true" />
                      {sub.metadataUri.startsWith('ipfs://') ? 'View on IPFS' : sub.metadataUri}
                    </a>
                  )}
                </div>

                {/* Average score */}
                {avgScore && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={11} style={{ color: 'var(--amber)' }} aria-hidden="true" />
                    <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--amber)' }}>
                      {avgScore}/100
                    </span>
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                      ({sub.reviewCount} {sub.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
