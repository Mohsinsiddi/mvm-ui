import { Github, Twitter, Globe } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-deep bg-void/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-mist max-w-md">
              MVM Explorer - Explore the Mohsin Virtual Machine blockchain. 
              View blocks, transactions, tokens, and smart contracts.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-ghost mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/explorer" className="text-mist hover:text-electric transition-colors">Blocks</a></li>
              <li><a href="/explorer" className="text-mist hover:text-electric transition-colors">Transactions</a></li>
              <li><a href="/contracts" className="text-mist hover:text-electric transition-colors">Contracts</a></li>
              <li><a href="/tokens/create" className="text-mist hover:text-electric transition-colors">Tokens</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium text-ghost mb-4">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/learn/wallet" className="text-mist hover:text-electric transition-colors">Wallet Lab</a></li>
              <li><a href="/learn/vanity" className="text-mist hover:text-electric transition-colors">Vanity Generator</a></li>
              <li><a href="/node" className="text-mist hover:text-electric transition-colors">Run a Node</a></li>
              <li><a href="/terminal" className="text-mist hover:text-electric transition-colors">Terminal</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-deep flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-mist">
            © 2024 MVM. Built by <a href="https://0xmohsin.dev" className="text-electric hover:text-ice">Mohsin</a>
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-mist hover:text-electric transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-mist hover:text-electric transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-mist hover:text-electric transition-colors">
              <Globe size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
