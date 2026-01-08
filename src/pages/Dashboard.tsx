import { Box, Activity, Clock, Users, Wallet, FileCode } from 'lucide-react'
import { motion } from 'framer-motion'
import StatsCard from '@/components/common/StatsCard'
import LiveBlocks from '@/components/dashboard/LiveBlocks'
import LiveTxs from '@/components/dashboard/LiveTxs'
import TxRain from '@/components/animations/TxRain'
import BlockPulse from '@/components/animations/BlockPulse'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useStatus, useBlocks, useTransactions, useMempool } from '@/hooks/useApi'
import { formatNumber } from '@/lib/format'

export default function Dashboard() {
  const { isConnected, latestBlock, latestTx, blocks: wsBlocks, transactions: wsTxs } = useWebSocket()
  const { data: status } = useStatus()
  const { data: blocksData } = useBlocks(10)
  const { data: txsData } = useTransactions(20)
  const { data: mempool } = useMempool()

  // Safely get blocks array
  const blocks = (() => {
    if (wsBlocks && wsBlocks.length > 0) return wsBlocks
    if (blocksData?.blocks && Array.isArray(blocksData.blocks)) return blocksData.blocks
    return []
  })()

  // Safely get transactions array  
  const transactions = (() => {
    if (wsTxs && wsTxs.length > 0) return wsTxs
    if (txsData?.transactions && Array.isArray(txsData.transactions)) return txsData.transactions
    return []
  })()

  // Get current height safely
  const currentHeight = status?.height || latestBlock?.height || 0

  return (
    <div className="space-y-6">
      {/* Transaction Rain Animation */}
      <TxRain latestTx={latestTx} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ghost">Dashboard</h1>
          <p className="text-mist mt-1">Real-time blockchain overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'} animate-pulse`} />
          <span className="text-sm text-mist">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <a href="/wallet" className="card-hover text-center py-6">
          <Wallet size={32} className="mx-auto text-cyber mb-2" />
          <div className="font-medium text-ghost">My Wallet</div>
        </a>
        <a href="/explorer" className="card-hover text-center py-6">
          <Box size={32} className="mx-auto text-neon mb-2" />
          <div className="font-medium text-ghost">Explorer</div>
        </a>
        <a href="/contracts" className="card-hover text-center py-6">
          <FileCode size={32} className="mx-auto text-electric mb-2" />
          <div className="font-medium text-ghost">Contracts</div>
        </a>
        <a href="/learn/wallet" className="card-hover text-center py-6">
          <Activity size={32} className="mx-auto text-glow mb-2" />
          <div className="font-medium text-ghost">Learn</div>
        </a>
      </motion.div>
    </div>
  )
}