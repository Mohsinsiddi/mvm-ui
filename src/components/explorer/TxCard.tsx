import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import type { Transaction } from '@/types'
import { formatAddress, formatTimeAgo, formatBalance, formatHash, normalizeTxType } from '@/lib/format'
import { TX_TYPES } from '@/lib/constants'

interface TxCardProps {
  tx: Transaction
  isNew?: boolean
}

export default function TxCard({ tx, isNew }: TxCardProps) {
  const normalizedType = normalizeTxType(tx.tx_type as string)
  const txType = (TX_TYPES as Record<string, any>)[normalizedType] || { label: tx.tx_type, icon: '📄', color: 'text-mist' }

  const statusBadge = {
    Pending: 'badge-warning',
    Success: 'badge-success',
    Failed: 'badge-error',
  }[tx.status]

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      className="card-hover"
    >
      <Link to={`/tx/${tx.hash}`} className="block">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{txType.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm text-electric">{formatHash(tx.hash)}</span>
                <span className={statusBadge}>{tx.status}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-mist mt-1 flex-wrap">
                <span className="font-mono">{formatAddress(tx.from, 4)}</span>
                <ArrowRight size={14} />
                <span className="font-mono">{tx.to ? formatAddress(tx.to, 4) : 'Contract'}</span>
              </div>
            </div>
          </div>
          <div className="text-right sm:text-right">
            <div className={`text-sm font-medium ${txType.color}`}>
              {txType.label}
            </div>
            {Number(tx.value_raw ?? tx.value) > 0 && (
              <div className="text-sm text-ghost">{tx.value_raw != null ? formatBalance(tx.value_raw) : tx.value} MVM</div>
            )}
            <div className="flex items-center gap-1 text-xs text-mist mt-1 justify-end">
              <Clock size={12} />
              {formatTimeAgo(tx.timestamp)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
