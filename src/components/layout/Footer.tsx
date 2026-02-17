import { Github, Twitter, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-deep bg-void/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-mist max-w-md">
              MVM Explorer — Explore the Mohsin Virtual Machine blockchain.
              View blocks, transactions, tokens, and smart contracts.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-medium text-ghost mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explorer" className="text-mist hover:text-electric transition-colors">Explorer</Link></li>
              <li><Link to="/contracts" className="text-mist hover:text-electric transition-colors">Smart Contracts</Link></li>
              <li><Link to="/tokens/create" className="text-mist hover:text-electric transition-colors">Create Token</Link></li>
              <li><Link to="/terminal" className="text-mist hover:text-electric transition-colors">Terminal</Link></li>
              <li><Link to="/leaderboard" className="text-mist hover:text-electric transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-medium text-ghost mb-4">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/learn/wallet" className="text-mist hover:text-electric transition-colors">Wallet Lab</Link></li>
              <li><Link to="/learn/vanity" className="text-mist hover:text-electric transition-colors">Vanity Generator</Link></li>
              <li><Link to="/docs" className="text-mist hover:text-electric transition-colors">Documentation</Link></li>
              <li><Link to="/docs/api" className="text-mist hover:text-electric transition-colors">API Reference</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium text-ghost mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/Mohsinsiddi/mohsin-blockchain" target="_blank" rel="noopener noreferrer" className="text-mist hover:text-electric transition-colors">Backend Source</a></li>
              <li><a href="https://github.com/Mohsinsiddi/mvm-ui" target="_blank" rel="noopener noreferrer" className="text-mist hover:text-electric transition-colors">Frontend Source</a></li>
              <li><a href="https://mvm-chain.duckdns.org" target="_blank" rel="noopener noreferrer" className="text-mist hover:text-electric transition-colors">Live API</a></li>
              <li><Link to="/node" className="text-mist hover:text-electric transition-colors">Node Info</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-deep flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-mist">
            Built by <a href="https://0xmohsin.dev" target="_blank" rel="noopener noreferrer" className="text-electric hover:text-ice">Mohsin</a>
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Mohsinsiddi" target="_blank" rel="noopener noreferrer" className="text-mist hover:text-electric transition-colors">
              <Github size={20} />
            </a>
            <a href="https://twitter.com/0xMohsin" target="_blank" rel="noopener noreferrer" className="text-mist hover:text-electric transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://0xmohsin.dev" target="_blank" rel="noopener noreferrer" className="text-mist hover:text-electric transition-colors">
              <Globe size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
