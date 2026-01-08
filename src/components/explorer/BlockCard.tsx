import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Box, Clock, Hash } from 'lucide-react'
import type { Block } from '@/types'
import { formatTimeAgo, formatHash } from '@/lib/format'

interface BlockCardProps {
  block: Block
  isNew?: boolean
}

export default function BlockCard({ block, isNew }: BlockCardProps) {
  // Guard against undefined block
  if (!block || block.height === undefined) {
    return null
  }

  const txCount = block.tx_count ?? block.transactions?.length ?? 0
  const blockHash = block.hash || ''

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.95 } : false}
      animate={{ opacity: 1, scale: 1 }}
      className="card-hover"
    >
      <Link to={`/block/${block.height}`} className="block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isNew ? 'bg-cyber/20 animate-pulse' : 'bg-deep'}`}>
              <Box size={20} className={isNew ? 'text-cyber' : 'text-mist'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-ghost">#{block.height}</span>
                {isNew && <span className="badge-success">New</span>}
              </div>
              <div className="flex items-center gap-2 text-sm text-mist mt-1">
                <Hash size={12} />
                <span className="font-mono">{formatHash(blockHash)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-ghost">{txCount} txs</div>
            <div className="flex items-center gap-1 text-xs text-mist mt-1">
              <Clock size={12} />
              {block.timestamp ? formatTimeAgo(block.timestamp) : 'just now'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}