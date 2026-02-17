import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Blocks,
  Code2,
  Coins,
  Wallet,
  Terminal,
  Trophy,
  Cpu,
  KeyRound,
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
  Github,
  Globe
} from 'lucide-react'

const GITHUB_BACKEND = 'https://github.com/Mohsinsiddi/mohsin-blockchain'
const GITHUB_FRONTEND = 'https://github.com/Mohsinsiddi/mvm-ui'
const API_DOCS_URL = 'https://mvm-chain.duckdns.org'

const features = [
  {
    icon: Blocks,
    title: 'Block Explorer',
    desc: 'Browse blocks, transactions, accounts, and tokens in real-time. Search by block number, transaction hash, or address.',
    link: '/explorer',
    color: 'from-cyber to-neon',
  },
  {
    icon: Code2,
    title: 'Mosh IDE',
    desc: 'Full-featured code editor with Monaco (VS Code engine). Write, compile, and deploy Mosh smart contracts with syntax highlighting, autocomplete, and live error checking.',
    link: '/contracts',
    color: 'from-neon to-glow',
  },
  {
    icon: Coins,
    title: 'Token Creator',
    desc: 'Deploy MVM-20 tokens with a simple form. Set name, symbol, decimals, and initial supply. Track deployment in a live console.',
    link: '/tokens/create',
    color: 'from-warning to-orange-500',
  },
  {
    icon: Wallet,
    title: 'Wallet',
    desc: 'Create or import wallets. Send and receive MVM tokens, view balances, token holdings, and transaction history. QR code support for receiving.',
    link: '/wallet',
    color: 'from-electric to-ice',
  },
  {
    icon: KeyRound,
    title: 'Wallet Lab',
    desc: 'Interactive walkthrough showing how blockchain wallets work: Private Key → Public Key → SHA-256 → RIPEMD-160 → bech32 address. See each step live.',
    link: '/learn/wallet',
    color: 'from-cyber to-electric',
  },
  {
    icon: Sparkles,
    title: 'Vanity Generator',
    desc: 'Generate custom mvm1... addresses with your chosen prefix. See difficulty estimates and generate addresses in real-time.',
    link: '/learn/vanity',
    color: 'from-glow to-pink-500',
  },
  {
    icon: Terminal,
    title: 'Terminal',
    desc: 'CLI-style interface to query the blockchain. Run commands like status, blocks, balance, and more — directly from the browser.',
    link: '/terminal',
    color: 'from-success to-emerald-500',
  },
  {
    icon: Cpu,
    title: 'Node Info',
    desc: 'View node connection status, network topology, peer count, chain configuration, and WebSocket connection details.',
    link: '/node',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Rankings across 4 categories: Top Holders, Token Creators, Contract Deployers, and Most Active accounts on the network.',
    link: '/leaderboard',
    color: 'from-yellow-500 to-warning',
  },
]

const moshLanguage = [
  { keyword: 'forge', replaces: 'contract', meaning: 'Define a smart contract' },
  { keyword: 'fn', replaces: 'function', meaning: 'Define a function' },
  { keyword: 'let', replaces: 'type decl', meaning: 'State variable' },
  { keyword: 'map', replaces: 'mapping', meaning: 'Key-value mapping' },
  { keyword: 'guard', replaces: 'require', meaning: 'Assertion check' },
  { keyword: 'signal', replaces: 'emit', meaning: 'Emit event' },
  { keyword: 'vault', replaces: 'payable', meaning: 'Accept tokens' },
  { keyword: 'seal', replaces: 'onlyOwner', meaning: 'Owner-only access' },
  { keyword: 'pub', replaces: 'view', meaning: 'Read-only function' },
  { keyword: 'mut', replaces: 'write', meaning: 'State-mutating function' },
]

const txTypes = [
  { type: 'transfer', desc: 'Send native MVM tokens between addresses', gas: '21,000' },
  { type: 'create_token', desc: 'Deploy a new MVM-20 token', gas: '100,000' },
  { type: 'transfer_token', desc: 'Transfer custom MVM-20 tokens', gas: '65,000' },
  { type: 'deploy_contract', desc: 'Deploy a compiled Mosh smart contract', gas: '200,000' },
  { type: 'call_contract', desc: 'Execute a contract function', gas: '100,000' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

export default function Docs() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={28} className="text-cyber" />
          <h1 className="text-2xl md:text-3xl font-bold text-ghost">Documentation</h1>
        </div>
        <p className="text-mist">
          Everything you need to know about the MVM blockchain and explorer.
        </p>
      </motion.div>

      {/* Quick Links */}
      <motion.div {...fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/docs/api" className="card p-4 hover:border-cyber/40 transition-colors text-center group">
          <Zap size={24} className="mx-auto text-cyber mb-2" />
          <div className="text-sm font-medium text-ghost">API Docs</div>
          <div className="text-xs text-mist">Interactive reference</div>
        </Link>
        <a href={GITHUB_BACKEND} target="_blank" rel="noopener noreferrer" className="card p-4 hover:border-cyber/40 transition-colors text-center group">
          <Github size={24} className="mx-auto text-ghost mb-2" />
          <div className="text-sm font-medium text-ghost">Backend</div>
          <div className="text-xs text-mist">Rust source code</div>
        </a>
        <a href={GITHUB_FRONTEND} target="_blank" rel="noopener noreferrer" className="card p-4 hover:border-cyber/40 transition-colors text-center group">
          <Github size={24} className="mx-auto text-ghost mb-2" />
          <div className="text-sm font-medium text-ghost">Frontend</div>
          <div className="text-xs text-mist">React source code</div>
        </a>
        <a href={API_DOCS_URL} target="_blank" rel="noopener noreferrer" className="card p-4 hover:border-cyber/40 transition-colors text-center group">
          <Globe size={24} className="mx-auto text-electric mb-2" />
          <div className="text-sm font-medium text-ghost">Live API</div>
          <div className="text-xs text-mist">mvm-chain.duckdns.org</div>
        </a>
      </motion.div>

      {/* What is MVM */}
      <motion.section {...fadeUp} className="card">
        <h2 className="text-xl font-bold text-ghost mb-3">What is MVM?</h2>
        <p className="text-sm text-mist leading-relaxed">
          <strong className="text-ghost">Mohsin Virtual Machine (MVM)</strong> is a custom Layer 1 blockchain
          built from scratch in Rust. It features its own smart contract language called <strong className="text-neon">Mosh</strong>,
          a token standard (MVM-20), Ed25519 cryptography with bech32 addresses (<code className="text-electric">mvm1...</code>),
          and a full REST + WebSocket API.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Block Time', value: '3s' },
            { label: 'Consensus', value: 'PoA' },
            { label: 'Crypto', value: 'Ed25519' },
            { label: 'Storage', value: 'RocksDB' },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-lg bg-deep/50 text-center">
              <div className="text-lg font-bold text-ghost">{s.value}</div>
              <div className="text-xs text-mist">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section {...fadeUp}>
        <h2 className="text-xl font-bold text-ghost mb-4">Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.link}
              className="card group hover:border-cyber/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-ghost mb-1 group-hover:text-cyber transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-mist leading-relaxed">{f.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-cyber opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section {...fadeUp} className="card">
        <h2 className="text-xl font-bold text-ghost mb-4">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Create a Wallet', desc: 'Generate an Ed25519 keypair. Your private key derives a public key, which is hashed (SHA-256 + RIPEMD-160) and bech32-encoded into an mvm1... address.', link: '/learn/wallet' },
            { step: '2', title: 'Get Test Tokens', desc: 'Use the faucet to receive 1,000 MVM test tokens. Each address has a 1-hour cooldown between requests.', link: '/wallet' },
            { step: '3', title: 'Explore the Chain', desc: 'Browse blocks produced every 3 seconds, view transactions, search for addresses, and track token movements in real-time.', link: '/explorer' },
            { step: '4', title: 'Write Smart Contracts', desc: 'Use the Mosh IDE to write contracts in the Mosh language. Compile to MVM bytecode and deploy to the chain.', link: '/contracts' },
            { step: '5', title: 'Deploy Tokens', desc: 'Create MVM-20 tokens with custom name, symbol, decimals, and supply. Transfer them between addresses.', link: '/tokens/create' },
          ].map((s) => (
            <Link key={s.step} to={s.link} className="flex gap-4 p-3 rounded-lg hover:bg-deep/50 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-cyber/20 text-cyber font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {s.step}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-ghost group-hover:text-cyber transition-colors">{s.title}</div>
                <p className="text-xs text-mist mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Mosh Language */}
      <motion.section {...fadeUp} className="card">
        <h2 className="text-xl font-bold text-ghost mb-2">The Mosh Language</h2>
        <p className="text-sm text-mist mb-4">
          Mosh blends Solidity's contract model with Rust's syntax, plus unique keywords.
        </p>

        <div className="rounded-lg bg-deep/50 p-4 mb-4 overflow-x-auto">
          <pre className="text-xs md:text-sm font-mono text-ghost leading-relaxed whitespace-pre">{`forge Counter {
    let count: u256 = 0;
    let owner: address = msg.sender;
    map balances: address => u256;

    fn increment() mut {
        count += 1;
        signal CountChanged(count);
    }

    fn deposit() vault {
        guard(msg.value > 0, "Must send tokens");
        balances[msg.sender] += msg.value;
    }

    fn getCount() pub -> u256 {
        return count;
    }
}`}</pre>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-deep">
                <th className="text-left py-2 pr-4 text-mist font-medium">Mosh</th>
                <th className="text-left py-2 pr-4 text-mist font-medium">Replaces</th>
                <th className="text-left py-2 text-mist font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {moshLanguage.map((row) => (
                <tr key={row.keyword} className="border-b border-deep/50">
                  <td className="py-2 pr-4 font-mono text-neon">{row.keyword}</td>
                  <td className="py-2 pr-4 text-mist font-mono">{row.replaces}</td>
                  <td className="py-2 text-ghost">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Transaction Types */}
      <motion.section {...fadeUp} className="card">
        <h2 className="text-xl font-bold text-ghost mb-4">Transaction Types</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-deep">
                <th className="text-left py-2 pr-4 text-mist font-medium">Type</th>
                <th className="text-left py-2 pr-4 text-mist font-medium">Description</th>
                <th className="text-left py-2 text-mist font-medium">Gas</th>
              </tr>
            </thead>
            <tbody>
              {txTypes.map((row) => (
                <tr key={row.type} className="border-b border-deep/50">
                  <td className="py-2 pr-4 font-mono text-electric whitespace-nowrap">{row.type}</td>
                  <td className="py-2 pr-4 text-ghost">{row.desc}</td>
                  <td className="py-2 text-mist font-mono whitespace-nowrap">{row.gas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section {...fadeUp} className="card">
        <h2 className="text-xl font-bold text-ghost mb-4">Tech Stack</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-ghost mb-3 flex items-center gap-2">
              <Cpu size={16} className="text-cyber" /> Backend (Rust)
            </h3>
            <ul className="space-y-1.5 text-sm text-mist">
              <li><span className="text-ghost">Axum</span> — HTTP server & WebSocket</li>
              <li><span className="text-ghost">RocksDB</span> — Persistent blockchain storage</li>
              <li><span className="text-ghost">Ed25519-dalek</span> — Cryptographic signatures</li>
              <li><span className="text-ghost">Tokio</span> — Async runtime</li>
              <li><span className="text-ghost">bech32</span> — Address encoding</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ghost mb-3 flex items-center gap-2">
              <Globe size={16} className="text-neon" /> Frontend (React)
            </h3>
            <ul className="space-y-1.5 text-sm text-mist">
              <li><span className="text-ghost">React 18</span> + TypeScript + Vite</li>
              <li><span className="text-ghost">Tailwind CSS</span> — Custom cyber theme</li>
              <li><span className="text-ghost">Monaco Editor</span> — VS Code-powered IDE</li>
              <li><span className="text-ghost">React Query</span> — API caching & state</li>
              <li><span className="text-ghost">Framer Motion</span> — Animations</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Links */}
      <motion.section {...fadeUp} className="card">
        <h2 className="text-xl font-bold text-ghost mb-4">Links</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <a
            href={GITHUB_BACKEND}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
          >
            <Github size={20} className="text-ghost flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-ghost">Backend Source</div>
              <div className="text-xs text-mist truncate">github.com/Mohsinsiddi/mohsin-blockchain</div>
            </div>
            <ExternalLink size={14} className="text-mist flex-shrink-0 ml-auto" />
          </a>
          <a
            href={GITHUB_FRONTEND}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
          >
            <Github size={20} className="text-ghost flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-ghost">Frontend Source</div>
              <div className="text-xs text-mist truncate">github.com/Mohsinsiddi/mvm-ui</div>
            </div>
            <ExternalLink size={14} className="text-mist flex-shrink-0 ml-auto" />
          </a>
          <Link
            to="/docs/api"
            className="flex items-center gap-3 p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
          >
            <Zap size={20} className="text-cyber flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-ghost">API Reference</div>
              <div className="text-xs text-mist">Interactive endpoint documentation</div>
            </div>
            <ArrowRight size={14} className="text-mist flex-shrink-0 ml-auto" />
          </Link>
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
          >
            <Globe size={20} className="text-electric flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-ghost">Live API</div>
              <div className="text-xs text-mist truncate">mvm-chain.duckdns.org</div>
            </div>
            <ExternalLink size={14} className="text-mist flex-shrink-0 ml-auto" />
          </a>
        </div>
      </motion.section>
    </div>
  )
}
