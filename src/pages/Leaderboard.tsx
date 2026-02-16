import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Coins, FileCode, Send, Loader, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLeaderboard } from '@/hooks/useApi'
import { formatAddress } from '@/lib/format'
import Card from '@/components/common/Card'

type Category = 'balances' | 'token_creators' | 'contract_deployers' | 'tx_senders'

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode; valueLabel: string }[] = [
  { key: 'balances', label: 'Top MVM Holders', icon: <Coins size={18} />, valueLabel: 'Balance' },
  { key: 'token_creators', label: 'Top Token Creators', icon: <Crown size={18} />, valueLabel: 'Tokens' },
  { key: 'contract_deployers', label: 'Top Contract Deployers', icon: <FileCode size={18} />, valueLabel: 'Contracts' },
  { key: 'tx_senders', label: 'Most Active', icon: <Send size={18} />, valueLabel: 'Transactions' },
]

const MEDAL_COLORS = ['text-warning', 'text-mist', 'text-[#CD7F32]']

function formatValue(value: number, category: Category): string {
  if (category === 'balances') {
    const mvm = value / 100_000_000
    if (mvm >= 1_000_000) return `${(mvm / 1_000_000).toFixed(1)}M`
    if (mvm >= 1_000) return `${(mvm / 1_000).toFixed(1)}K`
    if (mvm >= 1) return mvm.toFixed(2)
    return mvm.toFixed(4)
  }
  return value.toLocaleString()
}

export default function Leaderboard() {
  const { data, isLoading, error } = useLeaderboard()
  const [activeTab, setActiveTab] = useState<Category>('balances')

  const getEntries = (cat: Category): { address: string; value: number }[] => {
    if (!data?.leaderboard) return []
    const raw = data.leaderboard[`top_${cat}`]
    if (!raw || !Array.isArray(raw)) return []
    return raw.map((e: any) => ({
      address: e.address,
      value: e.balance ?? e.count ?? 0,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ghost flex items-center gap-3">
          <Trophy className="text-cyber" />
          Leaderboard
        </h1>
        <p className="text-mist mt-1">Top accounts on the MVM blockchain</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === cat.key
                ? 'bg-cyber/20 text-cyber border border-cyber/30'
                : 'bg-deep text-mist hover:text-ghost'
            }`}
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader size={20} className="animate-spin text-cyber" />
            <span className="text-mist">Loading leaderboard...</span>
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-error mb-2">Failed to load leaderboard</p>
            <p className="text-sm text-mist">Make sure the MVM node is running</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ghost">
              {CATEGORIES.find(c => c.key === activeTab)?.label}
            </h2>
            <span className="text-xs text-mist">
              {CATEGORIES.find(c => c.key === activeTab)?.valueLabel}
            </span>
          </div>

          {getEntries(activeTab).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mist">No data yet. Start making transactions!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getEntries(activeTab).map((entry, i) => (
                <div
                  key={entry.address}
                  className="flex items-center gap-3 p-3 rounded-lg bg-void hover:bg-deep transition-colors"
                >
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-deep">
                    {i < 3 ? (
                      <Trophy size={16} className={MEDAL_COLORS[i]} />
                    ) : (
                      <span className="text-shadow">{i + 1}</span>
                    )}
                  </div>

                  {/* Address */}
                  <Link
                    to={`/address/${entry.address}`}
                    className="flex-1 min-w-0"
                  >
                    <span className="font-mono text-sm text-electric hover:text-ice transition-colors truncate block">
                      {formatAddress(entry.address, 10)}
                    </span>
                  </Link>

                  {/* Value */}
                  <span className="text-sm font-bold text-ghost flex-shrink-0">
                    {formatValue(entry.value, activeTab)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const entries = getEntries(cat.key)
            const topValue = entries[0]?.value ?? 0
            return (
              <Card key={cat.key}>
                <div className="text-center">
                  <div className="flex justify-center mb-2 text-mist">{cat.icon}</div>
                  <p className="text-xs text-mist">{cat.label}</p>
                  <p className="text-xl font-bold text-ghost mt-1">
                    {entries.length > 0 ? formatValue(topValue, cat.key) : '—'}
                  </p>
                  <p className="text-xs text-shadow mt-0.5">
                    {entries.length} {entries.length === 1 ? 'account' : 'accounts'}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
