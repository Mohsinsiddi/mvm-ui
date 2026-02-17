import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { isValidAddress } from '@/lib/crypto'

interface SearchBarProps {
  onSearch?: () => void
  autoFocus?: boolean
  /** Inline mode for Explorer page (no card wrapper) */
  inline?: boolean
}

export default function SearchBar({ onSearch, autoFocus, inline }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    const q = query.trim()

    // Detect search type
    if (/^\d+$/.test(q)) {
      navigate(`/block/${q}`)
    } else if (q.startsWith('mvm1') && isValidAddress(q)) {
      navigate(`/address/${q}`)
    } else if (/^[0-9a-fA-F]{64}$/.test(q)) {
      navigate(`/tx/${q}`)
    } else {
      navigate(`/explorer?q=${encodeURIComponent(q)}`)
    }

    setQuery('')
    onSearch?.()
  }

  if (inline) {
    return (
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address, tx hash, block number..."
            className="input pl-12 pr-12"
            autoFocus={autoFocus}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-mist hover:text-ghost"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-mist">
          Search: Block number • Address (mvm1...) • TX hash • Token symbol
        </div>
      </form>
    )
  }

  // Modal card style
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl bg-abyss/95 border border-deep shadow-2xl shadow-void/60 overflow-hidden">
        <form onSubmit={handleSearch} className="px-4 md:px-5 py-4 space-y-3">
          {/* Input row */}
          <div className="flex items-center gap-2">
            <Search size={18} className="text-mist flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search address, tx hash, block..."
              className="flex-1 min-w-0 bg-transparent text-ghost text-sm md:text-base placeholder:text-shadow outline-none"
              autoFocus={autoFocus}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-mist hover:text-ghost hover:bg-deep transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {/* Search button — full width on mobile */}
          <button
            type="submit"
            disabled={!query.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyber text-white text-sm font-medium hover:bg-cyber/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Search size={16} />
            Search
          </button>
        </form>

        {/* Hints */}
        <div className="px-4 md:px-5 py-3 border-t border-deep/60 flex flex-wrap gap-2">
          <span className="text-[11px] text-shadow">Try:</span>
          <button
            type="button"
            onClick={() => { setQuery('1'); }}
            className="text-[11px] px-2 py-0.5 rounded-md bg-deep/80 text-mist hover:text-ghost transition-colors"
          >
            Block number
          </button>
          <button
            type="button"
            onClick={() => { setQuery('mvm1'); }}
            className="text-[11px] px-2 py-0.5 rounded-md bg-deep/80 text-mist hover:text-ghost transition-colors"
          >
            Address (mvm1...)
          </button>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[11px] px-2 py-0.5 rounded-md bg-deep/80 text-mist hover:text-ghost transition-colors"
          >
            TX hash
          </button>
        </div>

        {/* Keyboard shortcut */}
        <div className="px-4 md:px-5 py-2 border-t border-deep/40">
          <span className="text-[11px] text-shadow">Press Enter to search</span>
        </div>
      </div>
    </div>
  )
}
