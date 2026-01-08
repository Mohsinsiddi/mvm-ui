import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { isValidAddress } from '@/lib/crypto'

interface SearchBarProps {
  onSearch?: () => void
  autoFocus?: boolean
}

export default function SearchBar({ onSearch, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const q = query.trim()

    // Detect search type
    if (/^\d+$/.test(q)) {
      // Block number
      navigate(`/block/${q}`)
    } else if (q.startsWith('mvm1') && isValidAddress(q)) {
      // Address
      navigate(`/address/${q}`)
    } else if (/^[0-9a-fA-F]{64}$/.test(q)) {
      // Transaction hash
      navigate(`/tx/${q}`)
    } else {
      // General search - go to explorer with query
      navigate(`/explorer?q=${encodeURIComponent(q)}`)
    }

    setQuery('')
    onSearch?.()
  }

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
