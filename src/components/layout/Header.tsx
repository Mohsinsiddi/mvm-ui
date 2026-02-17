import { useState, useRef, useEffect } from 'react'
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
  ChevronDown,
  Coins,
  Sparkles,
  KeyRound
} from 'lucide-react'
import Logo from './Logo'
import SearchBar from '@/components/explorer/SearchBar'
import { useWalletStore } from '@/store/walletStore'
import { formatAddress } from '@/lib/format'

// Grouped navigation for desktop dropdowns
const desktopNav = [
  { path: '/', label: 'Dashboard', icon: Home },
  {
    label: 'Explore',
    icon: Compass,
    children: [
      { path: '/explorer', label: 'Explorer', icon: Compass, desc: 'Blocks, transactions & tokens' },
      { path: '/contracts', label: 'Smart Contracts', icon: FileCode, desc: 'Deploy & interact' },
      { path: '/terminal', label: 'Terminal', icon: Terminal, desc: 'CLI interface' },
    ]
  },
  {
    label: 'Network',
    icon: Cpu,
    children: [
      { path: '/node', label: 'Node', icon: Cpu, desc: 'Connection & topology' },
      { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, desc: 'Top accounts' },
    ]
  },
  {
    label: 'Learn',
    icon: GraduationCap,
    children: [
      { path: '/learn/wallet', label: 'Wallet Lab', icon: KeyRound, desc: 'How wallets work' },
      { path: '/learn/vanity', label: 'Vanity Generator', icon: Sparkles, desc: 'Custom address prefix' },
      { path: '/tokens/create', label: 'Create Token', icon: Coins, desc: 'Deploy MVM-20 token' },
    ]
  },
]

// Flat list for mobile
const mobileNav = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/explorer', label: 'Explorer', icon: Compass },
  { path: '/contracts', label: 'Contracts', icon: FileCode },
  { path: '/terminal', label: 'Terminal', icon: Terminal },
  { path: '/node', label: 'Node', icon: Cpu },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  {
    label: 'Learn',
    icon: GraduationCap,
    children: [
      { path: '/learn/wallet', label: 'Wallet Lab' },
      { path: '/learn/vanity', label: 'Vanity Generator' },
      { path: '/tokens/create', label: 'Create Token' },
    ]
  },
]

function DropdownMenu({
  item,
  isOpen,
  onToggle,
  onClose,
  pathname
}: {
  item: any
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  pathname: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const isChildActive = item.children?.some((c: any) => pathname === c.path)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isOpen || isChildActive ? 'bg-deep text-ghost' : 'text-mist hover:text-ghost hover:bg-deep/50'}`}
      >
        <item.icon size={16} />
        {item.label}
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-56 py-1.5 bg-abyss border border-deep rounded-xl shadow-xl shadow-void/50"
          >
            {item.children.map((child: any) => {
              const Icon = child.icon
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg text-sm transition-colors
                    ${pathname === child.path
                      ? 'bg-cyber/15 text-cyber'
                      : 'text-mist hover:text-ghost hover:bg-deep'}`}
                >
                  {Icon && <Icon size={16} className="flex-shrink-0" />}
                  <div>
                    <div className="font-medium">{child.label}</div>
                    {child.desc && <div className="text-xs text-shadow mt-0.5">{child.desc}</div>}
                  </div>
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()
  const { address, isConnected, setShowWalletModal } = useWalletStore()

  return (
    <header className="sticky top-0 z-50 bg-void/80 backdrop-blur-md border-b border-deep">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {desktopNav.map((item) =>
              item.children ? (
                <DropdownMenu
                  key={item.label}
                  item={item}
                  isOpen={openDropdown === item.label}
                  onToggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  onClose={() => setOpenDropdown(null)}
                  pathname={location.pathname}
                />
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpenDropdown(null)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${location.pathname === item.path
                      ? 'bg-cyber/20 text-cyber'
                      : 'text-mist hover:text-ghost hover:bg-deep/50'}`}
                >
                  <item.icon size={16} />
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
              {mobileNav.map((item) =>
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
