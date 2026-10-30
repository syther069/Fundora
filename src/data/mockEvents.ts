import type { Event, Submission } from '../types/events'

// Current timestamp reference (mocked to realistic relative dates)
const NOW = Math.floor(Date.now() / 1000)
const DAY = 86400

export const MOCK_EVENTS: Event[] = [
  {
    id: 'arc-stablecoin-hackathon',
    title: 'Arc Stablecoin Innovation Hackathon',
    tagline: 'Build next-generation payment, streaming, and commerce apps powered by native USDC gas on Arc.',
    description: `The Arc Stablecoin Innovation Hackathon invites builders worldwide to leverage Arc's ultra-predictable transaction fees and sub-second finality. 

### What We Are Looking For
We want real-world applications that solve genuine financial friction:
- **Streaming & Nanopayments:** Pay-per-second media, APIs, or AI agent compute.
- **Merchant Settlement:** POS integrations, invoicing, and zero-slippage commerce.
- **Programmable Escrows & DeFi:** Milestone-based funding, yield automation, and cross-chain liquidity.

### Submission Guidelines
- Must deploy smart contracts to **Arc Testnet** or **Arc Mainnet**.
- Provide a public GitHub repository with open-source license.
- Include a 2-3 minute video walkthrough or live interactive demo.
- Teams of up to 4 members are supported. All teammates will be credited in the project showcase.`,
    category: 'hackathon',
    modality: 'native_escrow',
    status: 'active',
    hostName: 'Arc Foundation',
    hostAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    hostAddress: '0x5B12Ce46C7194aD57d143bC22847224047b1Ef42',
    totalPrizePoolUsdc: 50_000_000_000n, // $50,000 USDC (6 decimals)
    contractAddress: '0xef34036dda3960a1cd57b1368329bfcf29700259',
    chainId: 5042002, // Arc Testnet
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1400&q=80',
    tags: ['DeFi', 'Payments', 'Nanopayments', 'USDC', 'Smart Accounts'],
    startDate: NOW - 10 * DAY,
    submissionDeadline: NOW + 14 * DAY + 18 * 3600, // 14 days left
    judgingDeadline: NOW + 21 * DAY,
    winnersAnnouncedDate: NOW + 24 * DAY,
    submissionsCount: 28,
    isBlindJudging: false,
    tracks: [
      {
        id: 'track-payments',
        name: 'Streamed & Nanopayments',
        description: 'Protocols and interfaces enabling continuous payment streams or sub-cent agent micropayments.',
        prizePoolUsdc: 25_000_000_000n,
        prizeTiers: [
          { id: 'p1', place: '1st Place', amountUsdc: 15_000_000_000n },
          { id: 'p2', place: '2nd Place', amountUsdc: 7_000_000_000n },
          { id: 'p3', place: '3rd Place', amountUsdc: 3_000_000_000n },
        ],
      },
      {
        id: 'track-commerce',
        name: 'Merchant & POS Solutions',
        description: 'Frictionless checkout experiences, invoicing, and real-time point-of-sale systems.',
        prizePoolUsdc: 15_000_000_000n,
        prizeTiers: [
          { id: 'c1', place: '1st Place', amountUsdc: 10_000_000_000n },
          { id: 'c2', place: '2nd Place', amountUsdc: 5_000_000_000n },
        ],
      },
      {
        id: 'track-bounties',
        name: 'Open Innovation & Tooling',
        description: 'Developer tooling, SDKs, block explorer utilities, or novel mobile wallets.',
        prizePoolUsdc: 10_000_000_000n,
        prizeTiers: [
          { id: 'b1', place: 'Track Winner', amountUsdc: 6_000_000_000n },
          { id: 'b2', place: 'Community Choice', amountUsdc: 4_000_000_000n },
        ],
      },
    ],
    rubric: [
      { id: 'r1', name: 'Arc & USDC Native Utility', description: 'Exploits Arc architecture (USDC as gas, sub-second finality, programmable accounts).', weightPercentage: 35, maxScore: 10 },
      { id: 'r2', name: 'Technical Execution & Architecture', description: 'Clean contract patterns, pull-payment security, test coverage, and documentation.', weightPercentage: 25, maxScore: 10 },
      { id: 'r3', name: 'User Experience & Polish', description: 'Responsive, accessible, fast fintech interface adhering to universal UX state contracts.', weightPercentage: 25, maxScore: 10 },
      { id: 'r4', name: 'Business Viability & Impact', description: 'Clarity of the target user, immediate market potential, and ecosystem stickiness.', weightPercentage: 15, maxScore: 10 },
    ],
    reviewers: ['0x5B12Ce46C7194aD57d143bC22847224047b1Ef42', '0xb5fd2471b99e9c7324309a43282a391e87585c5e'],
  },

  {
    id: 'arc-meme-creative-contest',
    title: 'Arc Creative & Meme Odyssey',
    tagline: 'Design viral visuals, infographics, technical explainers, or high-tier video memes celebrating Arc.',
    description: `A fast-paced creative contest for designers, animators, and crypto native creators! Produce content that communicates why Arc is the home of modern internet money.

### Submission Requirements
- Post your creation on **X (formerly Twitter)** tagging @ArcNetwork and #ArcBuild.
- Submit the direct tweet link, high-resolution media file, and your receiving Arc wallet address.
- Original artwork, motion graphics, 3D animations, and high-effort technical diagrams will be prioritized.`,
    category: 'contest',
    modality: 'native_escrow',
    status: 'active',
    hostName: 'Arc Community Guild',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    hostAddress: '0x371b4b6894882082e706cd84b781bf749472a602',
    totalPrizePoolUsdc: 5_000_000_000n, // $5,000 USDC
    contractAddress: '0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388',
    chainId: 5042002,
    bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=80',
    tags: ['Creative', 'X / Twitter', 'Video', 'Memes', 'Infographics'],
    startDate: NOW - 5 * DAY,
    submissionDeadline: NOW + 6 * DAY + 12 * 3600, // 6 days left
    judgingDeadline: NOW + 9 * DAY,
    winnersAnnouncedDate: NOW + 10 * DAY,
    submissionsCount: 42,
    isBlindJudging: false,
    tracks: [
      {
        id: 'track-motion-video',
        name: 'Motion Graphics & 3D Video',
        description: 'Short video clips, 3D renders, or motion reels explaining Arc speed & gas abstraction.',
        prizePoolUsdc: 3_000_000_000n,
        prizeTiers: [
          { id: 'mv1', place: '1st Place', amountUsdc: 1_800_000_000n },
          { id: 'mv2', place: '2nd Place', amountUsdc: 800_000_000n },
          { id: 'mv3', place: '3rd Place', amountUsdc: 400_000_000n },
        ],
      },
      {
        id: 'track-static-meme',
        name: 'Infographics & Static Memes',
        description: 'High-concept static memes, architectural diagrams, and carousel visuals.',
        prizePoolUsdc: 2_000_000_000n,
        prizeTiers: [
          { id: 'sm1', place: 'Top Visual', amountUsdc: 1_200_000_000n },
          { id: 'sm2', place: 'Community Choice', amountUsdc: 800_000_000n },
        ],
      },
    ],
    rubric: [
      { id: 'cr1', name: 'Originality & Creativity', description: 'Fresh visual metaphor and distinctive craft.', weightPercentage: 40, maxScore: 10 },
      { id: 'cr2', name: 'Clarity of Arc Messaging', description: 'Accurate representation of Arc USDC gas or sub-second finality.', weightPercentage: 35, maxScore: 10 },
      { id: 'cr3', name: 'Social Virality & Reach', description: 'Engagement, impressions, and reception across X.', weightPercentage: 25, maxScore: 10 },
    ],
    reviewers: ['0x5B12Ce46C7194aD57d143bC22847224047b1Ef42'],
  },

  {
    id: 'global-web3-ai-hackathon',
    title: 'Global Web3 × AI Hackathon 2026',
    tagline: 'Autonomous AI agents transacting autonomously onchain with Circle Gateway and Arc.',
    description: `Hosted on Devpost in partnership with leading AI and crypto research labs. This is an external partner event featured in the Fundora community directory.

Participants compete for $100,000 in total prizes across specialized agent tracks. Applications and judging are coordinated directly on Devpost.`,
    category: 'hackathon',
    modality: 'external_listing',
    status: 'active',
    hostName: 'Devpost & Autonomous Labs',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    externalUrl: 'https://devpost.com/hackathons',
    externalPlatformName: 'Devpost',
    totalPrizePoolUsdc: 100_000_000_000n, // $100,000 USDC
    bannerUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80',
    tags: ['AI Agents', 'Devpost', 'External', 'Autonomous Economy', 'Python SDK'],
    startDate: NOW - 12 * DAY,
    submissionDeadline: NOW + 18 * DAY,
    judgingDeadline: NOW + 26 * DAY,
    submissionsCount: 156,
    tracks: [
      {
        id: 'track-agent-escrows',
        name: 'Agentic Micro-Escrows',
        description: 'Autonomous agents hiring other agents and releasing escrow upon cryptographically verified proof.',
        prizePoolUsdc: 60_000_000_000n,
        prizeTiers: [
          { id: 'a1', place: 'Grand Prize', amountUsdc: 40_000_000_000n },
          { id: 'a2', place: 'Runner Up', amountUsdc: 20_000_000_000n },
        ],
      },
      {
        id: 'track-gateway-liquidity',
        name: 'Cross-Chain Agent Liquidity',
        description: 'Circle Gateway integration for instant balance abstraction across 11 chains.',
        prizePoolUsdc: 40_000_000_000n,
        prizeTiers: [
          { id: 'g1', place: '1st Place', amountUsdc: 25_000_000_000n },
          { id: 'g2', place: '2nd Place', amountUsdc: 15_000_000_000n },
        ],
      },
    ],
    rubric: [],
    reviewers: ['0x5B12Ce46C7194aD57d143bC22847224047b1Ef42', '0xb5fd2471b99e9c7324309a43282a391e87585c5e'],
  },

  {
    id: 'arc-nanopayments-sprint',
    title: 'Arc Nanopayments & Agent Sprint',
    tagline: 'High-frequency x402 payment headers and micropayment gateways on Arc testnet.',
    description: `A 72-hour developer sprint focused on testing the throughput limits and fee predictability of Arc for x402 payment-required HTTP headers. Submissions have closed and expert reviewers are currently scoring projects.`,
    category: 'hackathon',
    modality: 'native_escrow',
    status: 'judging',
    hostName: 'Arc Protocol Labs',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    hostAddress: '0x5B12Ce46C7194aD57d143bC22847224047b1Ef42',
    totalPrizePoolUsdc: 30_000_000_000n, // $30,000 USDC
    contractAddress: '0x433cc087e4daf08f7875c9621c7a3efd950ef016',
    chainId: 5042002,
    bannerUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    tags: ['x402', 'Nanopayments', 'In Judging', 'HTTP 402', 'High Throughput'],
    startDate: NOW - 20 * DAY,
    submissionDeadline: NOW - 2 * DAY, // closed 2 days ago
    judgingDeadline: NOW + 3 * DAY, // 3 days remaining in review
    winnersAnnouncedDate: NOW + 5 * DAY,
    submissionsCount: 19,
    isBlindJudging: true,
    tracks: [
      {
        id: 'track-proxy',
        name: 'Reverse Proxy & Gateway',
        description: 'Nginx and Cloudflare worker plugins for HTTP 402 USDC paywalls.',
        prizePoolUsdc: 20_000_000_000n,
        prizeTiers: [
          { id: 'np1', place: '1st Place', amountUsdc: 12_000_000_000n },
          { id: 'np2', place: '2nd Place', amountUsdc: 8_000_000_000n },
        ],
      },
      {
        id: 'track-client-sdk',
        name: 'Client Payment Interceptor',
        description: 'Fetch and Axios wrappers auto-handling 402 challenges via smart accounts.',
        prizePoolUsdc: 10_000_000_000n,
        prizeTiers: [
          { id: 'cs1', place: 'Track Winner', amountUsdc: 10_000_000_000n },
        ],
      },
    ],
    rubric: [
      { id: 'j1', name: 'Latency & Throughput', description: 'Under 100ms response time on 402 challenge resolution.', weightPercentage: 40, maxScore: 10 },
      { id: 'j2', name: 'Code Craft & Type Safety', description: 'Zero unhandled rejections, robust TypeScript types.', weightPercentage: 35, maxScore: 10 },
      { id: 'j3', name: 'Documentation & Examples', description: 'Run-in-5-minutes docker setup and README clarity.', weightPercentage: 25, maxScore: 10 },
    ],
    reviewers: ['0x5B12Ce46C7194aD57d143bC22847224047b1Ef42', '0xb5fd2471b99e9c7324309a43282a391e87585c5e'],
  },

  {
    id: 'arc-genesis-hackathon',
    title: 'Arc Genesis Builders Hackathon',
    tagline: 'The historic first community hackathon on Arc Mainnet with 3 winners awarded and claimed.',
    description: `The Arc Genesis Hackathon brought together 85 pioneering developers to build the foundational protocols of the Arc ecosystem. The event concluded successfully, with $25,000 in USDC claimed onchain by the winning teams.`,
    category: 'hackathon',
    modality: 'native_escrow',
    status: 'completed',
    hostName: 'Arc Foundation',
    hostAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    hostAddress: '0x371b4b6894882082e706cd84b781bf749472a602',
    totalPrizePoolUsdc: 25_000_000_000n, // $25,000 USDC
    contractAddress: '0x371b4b6894882082e706cd84b781bf749472a602',
    chainId: 5042, // Arc Mainnet
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
    tags: ['Genesis', 'Completed', 'Mainnet', 'Winner Showcase', 'Verified Escrow'],
    startDate: NOW - 60 * DAY,
    submissionDeadline: NOW - 30 * DAY,
    judgingDeadline: NOW - 20 * DAY,
    winnersAnnouncedDate: NOW - 18 * DAY,
    submissionsCount: 34,
    tracks: [
      {
        id: 'track-genesis-main',
        name: 'General Ecosystem Track',
        description: 'Core infrastructure and user-facing applications on Arc.',
        prizePoolUsdc: 25_000_000_000n,
        prizeTiers: [
          { id: 'g1', place: '1st Place', amountUsdc: 15_000_000_000n, winnerSubmissionId: 'sub-genesis-1', winnerAddress: '0x8b32A...49Fd', isClaimed: true },
          { id: 'g2', place: '2nd Place', amountUsdc: 7_000_000_000n, winnerSubmissionId: 'sub-genesis-2', winnerAddress: '0x42fC9...901B', isClaimed: true },
          { id: 'g3', place: '3rd Place', amountUsdc: 3_000_000_000n, winnerSubmissionId: 'sub-genesis-3', winnerAddress: '0x17dA...321C', isClaimed: true },
        ],
      },
    ],
    rubric: [],
    reviewers: ['0x5B12Ce46C7194aD57d143bC22847224047b1Ef42', '0xb5fd2471b99e9c7324309a43282a391e87585c5e'],
  },
]

export const MOCK_SUBMISSIONS: Record<string, Submission[]> = {
  'arc-stablecoin-hackathon': [
    {
      id: 'sub-stream-pay',
      eventId: 'arc-stablecoin-hackathon',
      trackId: 'track-payments',
      title: 'HydroPay: Real-Time USDC Stream Invoicing',
      tagline: 'Continuous salary and subscription streams settled on Arc with zero gas volatility.',
      description: 'HydroPay is a modern web application enabling remote teams and freelancers to stream USDC by the second. Leverages Arc native gas so recipients never require separate native tokens to withdraw or redirect streams.',
      submitterAddress: '0x9482F5a600a7b448b598C9F8094324f9E3A5c079',
      submitterName: 'Elena Rostova',
      teamMembers: [
        { name: 'Elena Rostova', role: 'Smart Contracts & Lead', handle: '@elena_dev' },
        { name: 'Kaelen Vance', role: 'Frontend & Web3 UX', handle: '@kaelen_v' },
        { name: 'Maya Lin', role: 'Product Design', handle: '@mayadesign' },
      ],
      demoUrl: 'https://hydropay.arc.network',
      repoUrl: 'https://github.com/hydropay/arc-contracts',
      mediaUrls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'],
      submittedAt: NOW - 3 * DAY,
    },
    {
      id: 'sub-agent-tab',
      eventId: 'arc-stablecoin-hackathon',
      trackId: 'track-payments',
      title: 'TabFlow: Machine-to-Machine Nanopayment Channels',
      tagline: 'High-density micro-escrows for AI agents paying for LLM tokens and API inference.',
      description: 'Autonomous agents can open an onchain tab on Arc, stream payments per 1,000 prompt tokens, and close the balance with signature receipts.',
      submitterAddress: '0x3429cD07B129cfE03A1b37B474581C659427fE19',
      submitterName: 'David Zhang',
      teamMembers: [
        { name: 'David Zhang', role: 'Full Stack Engineer', handle: '@dzhang_ai' },
      ],
      demoUrl: 'https://tabflow.dev',
      repoUrl: 'https://github.com/dzhang/tabflow',
      mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'],
      submittedAt: NOW - 1 * DAY,
    },
    {
      id: 'sub-terminal-pos',
      eventId: 'arc-stablecoin-hackathon',
      trackId: 'track-commerce',
      title: 'ArcPoint: Instant QR In-Person Merchant POS',
      tagline: 'Sub-500ms in-store QR checkout with biometric authorization on Arc.',
      description: 'Turns any iPad or Android tablet into a commercial point-of-sale terminal with zero merchant processing fees, streaming settlements immediately in USDC.',
      submitterAddress: '0x712aE7134988fB7216aC106d84B781bF749472a6',
      submitterName: 'Marcus Bell',
      teamMembers: [
        { name: 'Marcus Bell', role: 'Mobile Lead', handle: '@mbell_crypto' },
        { name: 'Sarah Chen', role: 'Backend Engineer', handle: '@schen_dev' },
      ],
      demoUrl: 'https://arcpoint.xyz',
      repoUrl: 'https://github.com/arcpoint/pos-app',
      mediaUrls: ['https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=800&q=80'],
      submittedAt: NOW - 5 * DAY,
    },
  ],

  'arc-genesis-hackathon': [
    {
      id: 'sub-genesis-1',
      eventId: 'arc-genesis-hackathon',
      trackId: 'track-genesis-main',
      title: 'ArcLend: Institutional USDC Liquidity Vaults',
      tagline: 'Fixed-term borrow and lending markets with automated collateral liquidations.',
      description: 'The premier mainnet money market on Arc. Over $2.4M in total liquidity locked during the hackathon period.',
      submitterAddress: '0x8b32A2b9049Fd4429f4309a43282a391e87585c5e',
      submitterName: 'Vikram Seth',
      teamMembers: [
        { name: 'Vikram Seth', role: 'Founding Engineer', handle: '@vikram_defi' },
        { name: 'Anya Taylor', role: 'Smart Contract Auditor', handle: '@anya_sec' },
      ],
      demoUrl: 'https://arclend.finance',
      repoUrl: 'https://github.com/arclend/core',
      mediaUrls: ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80'],
      submittedAt: NOW - 35 * DAY,
      totalScore: 9.6,
      rank: 1,
      prizeAmountUsdc: 15_000_000_000n,
      claimTxHash: '0x448a0a8ad34372769102d87a6c9379665b1adb37d675685350baf09da718496c',
    },
    {
      id: 'sub-genesis-2',
      eventId: 'arc-genesis-hackathon',
      trackId: 'track-genesis-main',
      title: 'PulsePass: Gasless Event Ticketing',
      tagline: 'Cryptographic NFT event tickets signed with FaceID and paid in USDC.',
      description: 'Eliminates ticket scalping while delivering Web2-grade onboarding: users generate a smart wallet in 3 seconds and enter concerts without paying gas.',
      submitterAddress: '0x42fC987216aC106d84B781bF749472a6901B8b2A',
      submitterName: 'Chloe Dubois',
      teamMembers: [
        { name: 'Chloe Dubois', role: 'Product Lead', handle: '@chloe_ux' },
      ],
      demoUrl: 'https://pulsepass.io',
      repoUrl: 'https://github.com/pulsepass/contracts',
      mediaUrls: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'],
      submittedAt: NOW - 34 * DAY,
      totalScore: 9.1,
      rank: 2,
      prizeAmountUsdc: 7_000_000_000n,
      claimTxHash: '0x5d68fc6caaf6217a9a6b0e68b2c9fff145ed84360501d635c610971c5018fb20',
    },
    {
      id: 'sub-genesis-3',
      eventId: 'arc-genesis-hackathon',
      trackId: 'track-genesis-main',
      title: 'ArcGraph: Real-Time Ecosystem Analytics Indexer',
      tagline: 'High-speed event indexing and GraphQL query engine for Arc testnet and mainnet.',
      description: 'Indexes all smart contract events on Arc in real-time with sub-second WebSocket updates.',
      submitterAddress: '0x17dA433cc087e4daf08f7875c9621c7a3efd950ef',
      submitterName: 'Leo Martinez',
      teamMembers: [
        { name: 'Leo Martinez', role: 'Infrastructure', handle: '@leo_data' },
      ],
      demoUrl: 'https://arcgraph.xyz',
      repoUrl: 'https://github.com/arcgraph/node',
      mediaUrls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'],
      submittedAt: NOW - 32 * DAY,
      totalScore: 8.7,
      rank: 3,
      prizeAmountUsdc: 3_000_000_000n,
      claimTxHash: '0x7b1adb37d675685350baf09da718496c448a0a8ad34372769102d87a6c937966',
    },
  ],
}
