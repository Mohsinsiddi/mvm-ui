import { Box, Activity, Clock, Users, Wallet, FileCode, Code, Terminal, Sparkles, Key, ArrowRight, Coins } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import StatsCard from '@/components/common/StatsCard'
import LiveBlocks from '@/components/dashboard/LiveBlocks'
import LiveTxs from '@/components/dashboard/LiveTxs'
import TxRain from '@/components/animations/TxRain'
import BlockPulse from '@/components/animations/BlockPulse'
import Card from '@/components/common/Card'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useStatus, useBlocks, useTransactions, useMempool } from '@/hooks/useApi'
import { formatNumber } from '@/lib/format'

const SAMPLE_CODE = `forge Counter {
    let count: u256 = 0;
    let owner: address = msg.sender;
    map balances: address => u256;

    fn increment() mut {
        count += 1;
        signal CountChanged(count);
    }

    fn getCount() pub -> u256 {
        return count;
    }

    fn deposit() vault {
        guard(msg.value > 0, "Must send tokens");
        balances[msg.sender] += msg.value;
    }
}`

const FEATURES = [
  {
    icon: <Box size={24} />,
    title: 'Custom L1 Blockchain',
    description: 'Built from scratch in Rust with 3-second blocks, Ed25519 signing, and bech32 addresses.',
    color: 'text-cyber',
    bg: 'bg-cyber/10',
  },
  {
    icon: <Code size={24} />,
    title: 'Mosh Language',
    description: 'A unique smart contract language blending Solidity\'s model with Rust\'s syntax. Write contracts with forge, fn, guard, signal.',
    color: 'text-neon',
    bg: 'bg-neon/10',
  },
  {
    icon: <Coins size={24} />,
    title: 'MVM-20 Tokens',
    description: 'Create and deploy your own tokens with a single transaction. Full on-chain token standard.',
    color: 'text-electric',
    bg: 'bg-electric/10',
  },
  {
    icon: <Terminal size={24} />,
    title: 'Developer Tools',
    description: 'Full-featured IDE with syntax highlighting, wallet lab, vanity generator, and blockchain terminal.',
    color: 'text-glow',
    bg: 'bg-glow/10',
  },
]

const TRY_IT_CARDS = [
  { to: '/ide', icon: <Code size={24} />, label: 'Mosh IDE', desc: 'Write & deploy contracts', color: 'text-cyber' },
  { to: '/tokens/create', icon: <Coins size={24} />, label: 'Create Token', desc: 'Deploy MVM-20 tokens', color: 'text-neon' },
  { to: '/learn/wallet', icon: <Key size={24} />, label: 'Wallet Lab', desc: 'Learn key derivation', color: 'text-electric' },
  { to: '/learn/vanity', icon: <Sparkles size={24} />, label: 'Vanity Gen', desc: 'Custom addresses', color: 'text-glow' },
]

export default function Dashboard() {
  const { isConnected, latestBlock, latestTx, blocks: wsBlocks, transactions: wsTxs } = useWebSocket()
  const { data: status } = useStatus()
  const { data: blocksData } = useBlocks(10)
  const { data: txsData } = useTransactions(20)
  const { data: mempool } = useMempool()

  const blocks = (() => {
    if (wsBlocks && wsBlocks.length > 0) return wsBlocks
    if (blocksData?.blocks && Array.isArray(blocksData.blocks)) return blocksData.blocks
    return []
  })()

  const transactions = (() => {
    if (wsTxs && wsTxs.length > 0) return wsTxs
    if (txsData?.transactions && Array.isArray(txsData.transactions)) return txsData.transactions
    return []
  })()

  const currentHeight = status?.height || latestBlock?.height || 0

  return (
    <div className="space-y-8">
      <TxRain latestTx={latestTx} />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left py-8 md:py-12"
      >
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-ghost mb-4">
          Mohsin <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber via-neon to-electric">Virtual Machine</span>
        </h1>
        <p className="text-lg md:text-xl text-mist max-w-2xl mb-6">
          A custom Layer 1 blockchain built from scratch in Rust — with its own smart contract language, token standard, and developer toolkit.
        </p>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <Link to="/ide" className="btn-primary px-6 py-3 flex items-center gap-2">
            <Code size={18} />
            Try Mosh IDE
            <ArrowRight size={16} />
          </Link>
          <Link to="/explorer" className="btn-secondary px-6 py-3 flex items-center gap-2">
            <Box size={18} />
            View Explorer
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'} animate-pulse`} />
          <span className="text-sm text-mist">
            {isConnected ? 'Node Connected' : 'Connecting...'}
          </span>
        </div>
      </motion.div>

      {/* New Block Pulse */}
      {latestBlock && <BlockPulse block={latestBlock} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Block Height"
          value={formatNumber(currentHeight)}
          subtitle="Latest block"
          icon={Box}
          color="cyber"
        />
        <StatsCard
          title="Pending TXs"
          value={mempool?.count ?? status?.pending_transactions ?? 0}
          subtitle="In mempool"
          icon={Activity}
          color="warning"
        />
        <StatsCard
          title="Block Time"
          value="3s"
          subtitle="Average"
          icon={Clock}
          color="electric"
        />
        <StatsCard
          title="Nodes"
          value={`${status?.peers ?? 0} / ${status?.browsers ?? 0}`}
          subtitle="Full / Browser"
          icon={Users}
          color="success"
        />
      </div>

      {/* Live Data Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LiveBlocks blocks={blocks} latestBlock={latestBlock} />
        <LiveTxs transactions={transactions} latestTx={latestTx} />
      </div>

      {/* What is MVM? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-ghost mb-6 text-center">What is MVM?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Card key={i}>
              <div className={`p-3 rounded-lg ${f.bg} w-fit mb-3`}>
                <span className={f.color}>{f.icon}</span>
              </div>
              <h3 className="font-bold text-ghost mb-1">{f.title}</h3>
              <p className="text-sm text-mist">{f.description}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Code Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <h2 className="text-xl font-bold text-ghost mb-2">The Mosh Language</h2>
              <p className="text-sm text-mist mb-4">
                Mosh combines Solidity's contract model with Rust's clean syntax, plus unique keywords like
                <code className="text-cyber mx-1">forge</code>,
                <code className="text-cyber mx-1">guard</code>,
                <code className="text-cyber mx-1">signal</code>, and
                <code className="text-cyber mx-1">vault</code>.
              </p>
              <Link to="/ide" className="text-sm text-electric hover:text-ice flex items-center gap-1">
                Try it in the IDE <ArrowRight size={14} />
              </Link>
            </div>
            <div className="md:w-2/3 bg-[#0d1117] rounded-lg p-4 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                {SAMPLE_CODE.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-[#505070] w-6 md:w-8 text-right mr-2 md:mr-4 select-none flex-shrink-0">{i + 1}</span>
                    <MoshLine line={line} />
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Try It Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-ghost mb-6 text-center">Try It Out</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {TRY_IT_CARDS.map((card) => (
            <Link key={card.to} to={card.to} className="card-hover text-center py-4 md:py-6 group">
              <span className={`${card.color} block mx-auto mb-2`}>{card.icon}</span>
              <div className="font-medium text-ghost group-hover:text-white transition-colors text-sm md:text-base">{card.label}</div>
              <div className="text-xs text-mist mt-1">{card.desc}</div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions (existing, renamed) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link to="/wallet" className="card-hover text-center py-4 md:py-6">
          <Wallet className="mx-auto text-cyber mb-2 w-6 h-6 md:w-8 md:h-8" />
          <div className="font-medium text-ghost text-sm md:text-base">My Wallet</div>
        </Link>
        <Link to="/explorer" className="card-hover text-center py-4 md:py-6">
          <Box className="mx-auto text-neon mb-2 w-6 h-6 md:w-8 md:h-8" />
          <div className="font-medium text-ghost text-sm md:text-base">Explorer</div>
        </Link>
        <Link to="/contracts" className="card-hover text-center py-4 md:py-6">
          <FileCode className="mx-auto text-electric mb-2 w-6 h-6 md:w-8 md:h-8" />
          <div className="font-medium text-ghost text-sm md:text-base">Contracts</div>
        </Link>
        <Link to="/leaderboard" className="card-hover text-center py-4 md:py-6">
          <Activity className="mx-auto text-glow mb-2 w-6 h-6 md:w-8 md:h-8" />
          <div className="font-medium text-ghost text-sm md:text-base">Leaderboard</div>
        </Link>
      </motion.div>
    </div>
  )
}

/** Simple Mosh syntax highlighting for the code preview */
function MoshLine({ line }: { line: string }) {
  const keywords = /\b(forge|fn|let|map|guard|signal|vault|seal|pub|mut|if|else|return|transfer)\b/g
  const types = /\b(u256|u128|u64|u32|u16|u8|address|string|bool)\b/g
  const specials = /\b(msg\.sender|msg\.value|mosh\.balance|mosh\.height|mosh\.time)\b/g
  const strings = /"[^"]*"/g
  const numbers = /\b\d+\b/g
  const comments = /\/\/.*/g

  let html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Order matters — do comments first, then strings, then keywords
  html = html.replace(comments, (m) => `<span class="text-[#505070] italic">${m}</span>`)
  html = html.replace(strings, (m) => `<span class="text-[#FFB800]">${m}</span>`)
  html = html.replace(specials, (m) => `<span class="text-[#9D4EDD] italic">${m}</span>`)
  html = html.replace(keywords, (m) => `<span class="text-[#7B2CBF] font-bold">${m}</span>`)
  html = html.replace(types, (m) => `<span class="text-[#00FF88]">${m}</span>`)
  html = html.replace(numbers, (m) => {
    // Don't color numbers inside already-colored spans
    return `<span class="text-[#FF3366]">${m}</span>`
  })

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
