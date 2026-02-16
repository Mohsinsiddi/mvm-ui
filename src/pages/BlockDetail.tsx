import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Box, 
  Clock, 
  Hash, 
  ArrowLeft, 
  User,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useBlock } from '@/hooks/useApi'
import { formatTime, formatTimeAgo, formatHash } from '@/lib/format'
import TxCard from '@/components/explorer/TxCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import CopyButton from '@/components/common/CopyButton'

export default function BlockDetail() {
  const { height } = useParams<{ height: string }>()
  const blockHeight = parseInt(height || '0', 10)
  
  const { data, isLoading, error } = useBlock(blockHeight)
  const block = data?.block

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !block) {
    return (
      <div className="text-center py-20">
        <Box size={64} className="mx-auto text-mist mb-4" />
        <h1 className="text-2xl font-bold text-ghost mb-2">Block Not Found</h1>
        <p className="text-mist mb-6">Block #{height} does not exist</p>
        <Link to="/explorer" className="btn-primary">
          Back to Explorer
        </Link>
      </div>
    )
  }

  const txCount = block.tx_count ?? block.transactions?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/explorer"
          className="flex items-center gap-2 text-mist hover:text-ghost transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Explorer</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {blockHeight > 0 && (
            <Link
              to={`/block/${blockHeight - 1}`}
              className="p-2 rounded-lg bg-deep hover:bg-abyss text-mist hover:text-ghost transition-colors"
              title="Previous Block"
            >
              <ChevronLeft size={20} />
            </Link>
          )}
          <Link
            to={`/block/${blockHeight + 1}`}
            className="p-2 rounded-lg bg-deep hover:bg-abyss text-mist hover:text-ghost transition-colors"
            title="Next Block"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* Block Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyber to-neon">
            <Box size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ghost">
              Block #{block.height}
            </h1>
            <p className="text-mist mt-1">
              {formatTime(block.timestamp)}
            </p>
          </div>
        </div>

        {/* Block Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <InfoRow 
            icon={Hash} 
            label="Block Hash" 
            value={block.hash}
            mono
            copyable
          />
          <InfoRow 
            icon={Layers} 
            label="Previous Hash" 
            value={block.previous_hash || 'Genesis Block'}
            mono
            copyable={!!block.previous_hash}
          />
          <InfoRow 
            icon={Clock} 
            label="Timestamp" 
            value={`${formatTime(block.timestamp)} (${formatTimeAgo(block.timestamp)})`}
          />
          <InfoRow 
            icon={User} 
            label="Validator" 
            value={block.validator}
            mono
            link={`/address/${block.validator}`}
          />
          <InfoRow 
            icon={Layers} 
            label="Transactions" 
            value={`${txCount} transaction${txCount !== 1 ? 's' : ''}`}
          />
          <InfoRow 
            icon={Box} 
            label="Block Height" 
            value={block.height.toLocaleString()}
          />
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-ghost mb-4">
          Transactions ({txCount})
        </h2>
        
        {txCount === 0 ? (
          <div className="text-center py-8 text-mist">
            No transactions in this block
          </div>
        ) : (
          <div className="space-y-3">
            {block.transactions?.map((tx) => (
              <TxCard key={tx.hash} tx={tx} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Block Navigation */}
      <div className="flex items-center justify-between">
        {blockHeight > 0 ? (
          <Link
            to={`/block/${blockHeight - 1}`}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Block #{blockHeight - 1}
          </Link>
        ) : (
          <div />
        )}
        <Link
          to={`/block/${blockHeight + 1}`}
          className="btn-secondary flex items-center gap-2"
        >
          Block #{blockHeight + 1}
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  )
}

// Info Row Component
function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  mono = false,
  copyable = false,
  link
}: { 
  icon: any
  label: string
  value: string | number
  mono?: boolean
  copyable?: boolean
  link?: string
}) {
  const valueStr = String(value)
  const displayValue = mono && valueStr.length > 20 ? formatHash(valueStr, 12) : valueStr

  return (
    <div className="p-4 rounded-lg bg-deep/50">
      <div className="flex items-center gap-2 text-mist text-sm mb-1">
        <Icon size={14} />
        {label}
      </div>
      <div className="flex items-center gap-2">
        {link ? (
          <Link 
            to={link}
            className={`text-electric hover:text-ice transition-colors ${mono ? 'font-mono text-sm' : ''}`}
          >
            {displayValue}
          </Link>
        ) : (
          <span className={`text-ghost ${mono ? 'font-mono text-sm break-all' : ''}`}>
            {displayValue}
          </span>
        )}
        {copyable && <CopyButton text={valueStr} />}
      </div>
    </div>
  )
}