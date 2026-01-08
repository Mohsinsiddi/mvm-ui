import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Wallet, 
  Search,
  Home,
  Compass,
  Terminal,
  Cpu,
  FileCode,
  GraduationCap,
  Trophy,
  ChevronDown
} from 'lucide-react'
import Logo from './Logo'
import SearchBar from '@/components/explorer/SearchBar'
import { useWalletStore } from '@/store/walletStore'
import { formatAddress } from '@/lib/format'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/explorer', label: 'Explorer', icon: Compass },
  { path: '/terminal', label: 'Terminal', icon: Terminal },
  { path: '/node', label: 'Node', icon: Cpu },
  { path: '/contracts', label: 'Contracts', icon: FileCode },
  { 
    label: 'Learn', 
    icon: GraduationCap,
    children: [
      { path: '/learn/wallet', label: 'Wallet Lab' },
      { path: '/learn/vanity', label: 'Vanity Generator' },
      { path: '/tokens/create', label: 'Create Token' },
    ]
  },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)
  const location = useLocation()
  const { address, isConnected, setShowWalletModal } = useWalletStore()

  return (
    <header className="sticky top-0 z-50 bg-void/80 backdrop-blur-md border-b border-deep">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => 
              item.children ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setLearnOpen(!learnOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${learnOpen ? 'bg-deep text-ghost' : 'text-mist hover:text-ghost hover:bg-deep/50'}`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform ${learnOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {learnOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-1 w-48 py-2 bg-abyss border border-deep rounded-lg shadow-lg"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setLearnOpen(false)}
                            className="block px-4 py-2 text-sm text-mist hover:text-ghost hover:bg-deep transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${location.pathname === item.path 
                      ? 'bg-cyber/20 text-cyber' 
                      : 'text-mist hover:text-ghost hover:bg-deep/50'}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-mist hover:text-ghost hover:bg-deep transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Wallet button */}
            {isConnected ? (
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber/20 text-cyber hover:bg-cyber/30 transition-colors"
              >
                <Wallet size={18} />
                <span className="hidden sm:inline font-mono text-sm">
                  {formatAddress(address!, 4)}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Wallet size={18} />
                <span className="hidden sm:inline">Connect</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-mist hover:text-ghost hover:bg-deep transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-deep bg-void/95 backdrop-blur-md"
          >
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="space-y-1">
                    <div className="px-3 py-2 text-sm font-medium text-mist flex items-center gap-2">
                      <item.icon size={18} />
                      {item.label}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block pl-10 pr-3 py-2 text-sm text-mist hover:text-ghost hover:bg-deep rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                      ${location.pathname === item.path
                        ? 'bg-cyber/20 text-cyber'
                        : 'text-mist hover:text-ghost hover:bg-deep'}`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/90 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchBar onSearch={() => setSearchOpen(false)} autoFocus />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
