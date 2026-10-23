import { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Check,
  Copy,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  FileCode,
  Shield,
  Layers,
  Coins,
  ExternalLink,
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface DocSection {
  id: string
  title: string
  category: string
  icon: typeof BookOpen
  description: string
  content: {
    heading: string
    body: string
    subsections: {
      id: string
      title: string
      paragraphs: string[]
      codeBlock?: {
        lang: string
        filename?: string
        code: string
      }
      callout?: {
        type: 'info' | 'warning' | 'success'
        text: string
      }
    }[]
  }
}

const DOCS_DATA: DocSection[] = [
  {
    id: 'overview',
    title: 'Overview & Bitcoin Banking',
    category: 'Getting Started',
    icon: BookOpen,
    description: 'Introduction to Mezo, non-custodial Bitcoin vaults, and MUSD stablecoin liquidity.',
    content: {
      heading: 'Mezo: The Bitcoin Economic Layer',
      body: 'Mezo is a decentralized economic layer built for Bitcoin. It enables users to deposit BTC into smart vaults, borrow MUSD at 0% recurring interest, earn real yield, and spend in the real economy—all without selling a single satoshi.',
      subsections: [
        {
          id: 'what-is-mezo',
          title: 'What is Mezo?',
          paragraphs: [
            'Traditional finance and legacy crypto platforms force Bitcoin holders to choose between selling their asset (triggering capital gains and losing upside) or taking loans with recurring double-digit APRs and custodial counterparty risk.',
            'Mezo introduces sovereign Bitcoin banking. By depositing native Bitcoin or tBTC into non-custodial vaults on Arc and Mezo, users can mint MUSD—a fully collateralized, 1:1 USD-pegged stablecoin—while retaining complete ownership of their Bitcoin.',
          ],
        },
        {
          id: 'core-pillars',
          title: 'Core Product Pillars',
          paragraphs: [
            '1. Borrow: Lock BTC collateral and mint MUSD with 0% recurring interest and a 115% minimum collateral ratio (MCR).',
            '2. Earn: Deposit MUSD into the Stability Pool to absorb liquidations and earn continuous BTC and governance rewards.',
            '3. Swap: Instantly convert between BTC, MUSD, and ecosystem assets with deep pooled liquidity.',
            '4. Spend: Transact anywhere Visa/Mastercard rails operate via integrated non-custodial debit cards without selling Bitcoin.',
          ],
          callout: {
            type: 'info',
            text: 'Official rate: Borrowing MUSD incurs only a one-time 0.5% mint fee. No ongoing compounding interest is ever charged.',
          },
        },
      ],
    },
  },
  {
    id: 'borrowing',
    title: 'Borrowing & MUSD Vaults',
    category: 'Banking Mechanics',
    icon: Coins,
    description: 'Vault mechanics, collateral ratios, borrowing fee structure, and liquidation buffers.',
    content: {
      heading: 'Non-Custodial Vault Architecture',
      body: 'Borrowing on Mezo is executed through individual, isolated smart vaults. Every vault is completely independent and governed by deterministic math on Arc.',
      subsections: [
        {
          id: 'collateral-ratio',
          title: 'Collateral Ratios & Solvency',
          paragraphs: [
            'The Minimum Collateral Ratio (MCR) is 115%. This means for every $100 of MUSD minted, at least $115 worth of Bitcoin collateral must remain in your vault.',
            'We recommend maintaining a collateral ratio of 160% to 200%+ to protect against Bitcoin price fluctuations and market volatility.',
          ],
        },
        {
          id: 'borrow-code',
          title: 'Vault Contract Interface',
          paragraphs: [
            'Developers and automated agents can open, deposit, and mint directly against the VaultManager contract via standard EVM calls on Arc.',
          ],
          codeBlock: {
            lang: 'solidity',
            filename: 'IVaultManager.sol',
            code: `// Open a Bitcoin-backed vault and mint MUSD
function openVault(
    uint256 btcCollateralAmount,
    uint256 musdMintAmount
) external payable returns (uint256 vaultId);

// Add collateral to increase health factor
function depositCollateral(uint256 vaultId) external payable;

// Repay MUSD and withdraw your Bitcoin
function repayAndWithdraw(
    uint256 vaultId,
    uint256 musdRepayAmount,
    uint256 btcWithdrawAmount
) external;`,
          },
        },
      ],
    },
  },
  {
    id: 'earn',
    title: 'Stability Pool & Yield',
    category: 'Banking Mechanics',
    icon: Layers,
    description: 'Provide MUSD liquidity to the stability pool to earn BTC rewards and transaction fees.',
    content: {
      heading: 'Earning with the Stability Pool',
      body: 'The Stability Pool is the primary line of defense ensuring MUSD stability and solvency. Stability providers deposit MUSD and earn compounded yields.',
      subsections: [
        {
          id: 'how-yield-works',
          title: 'How Liquidation Yield Works',
          paragraphs: [
            'When an undercollateralized vault falls below the 115% MCR, the Stability Pool absorbs the vault debt in exchange for the liquidated Bitcoin collateral at an immediate discount (typically ~10% bonus).',
            'Stability providers receive this discounted Bitcoin directly into their balance, gradually increasing their net BTC holdings over time alongside regular token rewards.',
          ],
        },
      ],
    },
  },
  {
    id: 'contracts',
    title: 'Smart Contracts & Arc',
    category: 'Developer Reference',
    icon: FileCode,
    description: 'Contract addresses, RPC configuration, sub-second finality, and USDC gas tokens.',
    content: {
      heading: 'Deployed Contracts on Arc',
      body: 'Mezo and GrantFlow smart contracts are deployed on the high-performance Arc network, where USDC acts as the native gas token with sub-second finality.',
      subsections: [
        {
          id: 'addresses',
          title: 'Verified Deployments',
          paragraphs: [
            'All smart contracts are immutable or governed by timelocks and multi-signature committees.',
          ],
          codeBlock: {
            lang: 'json',
            filename: 'deployments.json',
            code: `{
  "network": "Arc Testnet",
  "chainId": 5042002,
  "rpcUrl": "https://rpc.testnet.arc.io",
  "nativeGasToken": "USDC (6 decimals)",
  "contracts": {
    "ProofSpring": "0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388",
    "MUSD": "0x3600000000000000000000000000000000000000",
    "VaultManager": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
  }
}`,
          },
        },
      ],
    },
  },
  {
    id: 'risk',
    title: 'Risk & Security Disclosures',
    category: 'Security & Risk',
    icon: Shield,
    description: 'Formal verification, oracle feeds, liquidation thresholds, and user risk mitigation.',
    content: {
      heading: 'Security Architecture & Risk Factors',
      body: 'Transparency and safety are foundational to Mezo. Every user should understand the mechanics of decentralized lending and market volatility before opening a vault.',
      subsections: [
        {
          id: 'liquidation-risk',
          title: 'Market Volatility & Liquidation Risk',
          paragraphs: [
            'If the market value of your Bitcoin drops such that your vault falls below the 115% Minimum Collateral Ratio, your vault will be liquidated by the Stability Pool.',
            'While you keep all previously minted MUSD, you forfeit the liquidated collateral. Always maintain a buffer of 150%-200%+ collateral ratio.',
          ],
          callout: {
            type: 'warning',
            text: 'Risk Warning: Smart contract risk is inherent in all onchain protocols. Never deposit funds you cannot afford to lose or maintain without monitoring.',
          },
        },
      ],
    },
  },
]

function CodeBlockWithCopy({ code, lang, filename }: { code: string; lang: string; filename?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d1724] text-slate-100 my-4 text-xs font-mono shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-[11px] font-semibold text-slate-400">
          {filename || lang}
        </span>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors btn-focus"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="text-[10px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function DocsPage() {
  const [activeDocId, setActiveDocId] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_DATA
    const q = searchQuery.toLowerCase()
    return DOCS_DATA.filter(
      doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.content.subsections.some(s => s.title.toLowerCase().includes(q))
    )
  }, [searchQuery])

  const activeDoc = useMemo(
    () => DOCS_DATA.find(d => d.id === activeDocId) || DOCS_DATA[0],
    [activeDocId]
  )

  const currentIndex = DOCS_DATA.findIndex(d => d.id === activeDoc.id)
  const prevDoc = currentIndex > 0 ? DOCS_DATA[currentIndex - 1] : null
  const nextDoc = currentIndex < DOCS_DATA.length - 1 ? DOCS_DATA[currentIndex + 1] : null

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Mobile drawer toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)] btn-focus"
        >
          <Menu size={18} />
          <span>Table of Contents</span>
        </button>
        <Badge variant="spring" size="sm">
          {activeDoc.title}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--surface-elevated)] border-r border-[var(--border)] p-6 transform transition-transform duration-200 lg:static lg:inset-auto lg:w-full lg:col-span-3 lg:border lg:rounded-2xl lg:p-4 lg:bg-[var(--surface-strong)] lg:transform-none ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="font-bold text-base text-[var(--ink)]">Documentation</span>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-5">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search documentation…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl text-xs bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--ink)] placeholder:text-[var(--subtle)] btn-focus"
            />
          </div>

          {/* Nav Categories */}
          <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
            {filteredDocs.length === 0 ? (
              <p className="text-xs text-[var(--muted)] p-2">No matching documentation</p>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--subtle)] block mb-2 px-2">
                  Articles
                </span>
                <ul className="space-y-1">
                  {filteredDocs.map(doc => {
                    const isActive = doc.id === activeDoc.id
                    const Icon = doc.icon
                    return (
                      <li key={doc.id}>
                        <button
                          onClick={() => {
                            setActiveDocId(doc.id)
                            setMobileDrawerOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors btn-focus ${
                            isActive
                              ? 'bg-[#122d45] text-white dark:bg-[#34d399] dark:text-[#0b131e] shadow-2xs'
                              : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]'
                          }`}
                        >
                          <Icon size={15} className="shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </nav>
        </aside>

        {/* Backdrop for mobile drawer */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Doc Content */}
        <div className="lg:col-span-6 space-y-6">
          <Card padding="lg" variant="default">
            {/* Header */}
            <div className="border-b border-[var(--border)] pb-6 mb-6">
              <Badge variant="spring" size="sm" className="mb-3">
                {activeDoc.category}
              </Badge>
              <h1 className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight mb-2">
                {activeDoc.content.heading}
              </h1>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {activeDoc.content.body}
              </p>
            </div>

            {/* Subsections */}
            <div className="space-y-8">
              {activeDoc.content.subsections.map(sub => (
                <section key={sub.id} id={sub.id} className="scroll-mt-24 space-y-3">
                  <h2 className="display font-semibold text-lg text-[var(--ink)]">
                    {sub.title}
                  </h2>
                  <div className="space-y-2 text-sm text-[var(--muted)] leading-relaxed">
                    {sub.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {sub.callout && (
                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        sub.callout.type === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/50'
                          : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50'
                      }`}
                    >
                      {sub.callout.text}
                    </div>
                  )}

                  {sub.codeBlock && (
                    <CodeBlockWithCopy
                      code={sub.codeBlock.code}
                      lang={sub.codeBlock.lang}
                      filename={sub.codeBlock.filename}
                    />
                  )}
                </section>
              ))}
            </div>

            {/* Next / Prev Navigation */}
            <div className="mt-10 pt-6 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevDoc ? (
                <button
                  onClick={() => setActiveDocId(prevDoc.id)}
                  className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] text-left transition-all btn-focus group"
                >
                  <span className="text-[11px] font-semibold text-[var(--subtle)] flex items-center gap-1 mb-1">
                    <ChevronLeft size={12} /> Previous
                  </span>
                  <span className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {prevDoc.title}
                  </span>
                </button>
              ) : <div />}

              {nextDoc ? (
                <button
                  onClick={() => setActiveDocId(nextDoc.id)}
                  className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] text-right transition-all btn-focus group"
                >
                  <span className="text-[11px] font-semibold text-[var(--subtle)] flex items-center justify-end gap-1 mb-1">
                    Next <ChevronRight size={12} />
                  </span>
                  <span className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {nextDoc.title}
                  </span>
                </button>
              ) : <div />}
            </div>
          </Card>
        </div>

        {/* Right-Hand "On This Page" Outline */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] block mb-3">
              On this page
            </span>
            <ul className="space-y-2 text-xs">
              {activeDoc.content.subsections.map(sub => (
                <li key={sub.id}>
                  <a
                    href={`#${sub.id}`}
                    className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors block py-0.5"
                  >
                    {sub.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)] space-y-2">
            <span className="font-semibold text-[var(--ink)] block">Need Help?</span>
            <p>Join the Mezo developer community and discuss smart contract parameters.</p>
            <a
              href="https://explorer.testnet.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--spring)] font-semibold hover:underline"
            >
              <span>Arc Block Explorer</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
