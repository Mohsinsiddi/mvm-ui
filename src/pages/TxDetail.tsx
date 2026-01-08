import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  ArrowRight,
  Hash,
  Clock,
  User,
  Wallet,
  Fuel,
  FileCode,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Box,
  Coins
} from 'lucide-react'
import { useTransaction } from '@/hooks/useApi'
import { formatTime, formatTimeAgo, formatBalance, formatAddress } from '@/lib/format'
import { TX_TYPES } from '@/lib/constants'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import CopyButton from '@/components/common/CopyButton'
import AddressLink from '@/components/common/AddressLink'

export default function TxDetail() {
  const { hash } = useParams<{ hash: string }>()
  
  const { data, isLoading, error } = useTransaction(hash || '')
  const tx = data?.transaction

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !tx) {
    return (
      <div className="text-center py-20">
        <Hash size={64} className="mx-auto text-mist mb-4" />
        <h1 className="text-2xl font-bold text-ghost mb-2">Transaction Not Found</h1>
        <p className="text-mist mb-6">Transaction {hash?.slice(0, 16)}... does not exist</p>
        <Link to="/explorer" className="btn-primary">
          Back to Explorer
        </Link>
      </div>
    )
  }

  const txType = TX_TYPES[tx.tx_type] || { label: tx.tx_type, icon: '📄', color: 'text-mist' }
  
  const statusConfig = {
    Pending: { icon: ClockIcon, color: 'text-warning', bg: 'bg-warning/20', label: 'Pending' },
    Success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/20', label: 'Success' },
    Failed: { icon: XCircle, color: 'text-error', bg: 'bg-error/20', label: 'Failed' },
  }
  const status = statusConfig[tx.status] || statusConfig.Pending

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Link 
        to="/explorer"
        className="flex items-center gap-2 text-mist hover:text-ghost transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Explorer</span>
      </Link>

      {/* Transaction Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{txType.icon}</span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-ghost">
                  {txType.label}
                </h1>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${status.bg} ${status.color}`}>
                  <status.icon size={14} />
                  {status.label}
                </span>
              </div>
              <p className="text-mist text-sm mt-1 font-mono">
                {tx.hash.slice(0, 24)}...
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Flow */}
        <div className="p-4 rounded-xl bg-deep/50 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {/* From */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs text-mist mb-1">From</p>
              <AddressLink address={tx.from} short={false} />
            </div>
            
            {/* Arrow & Value */}
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-cyber/20">
                <ArrowRight size={24} className="text-cyber" />
              </div>
              {tx.value > 0 && (
                <div className="mt-2 px-4 py-1 rounded-full bg-success/20 text-success font-mono text-sm">
                  {formatBalance(tx.value)} MVM
                </div>
              )}
            </div>
            
            {/* To */}
            <div className="flex-1 text-center md:text-right">
              <p className="text-xs text-mist mb-1">To</p>
              {tx.to ? (
                <AddressLink address={tx.to} short={false} />
              ) : (
                <span className="text-neon font-medium">Contract Creation</span>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <InfoRow 
            icon={Hash} 
            label="Transaction Hash" 
            value={tx.hash}
            mono
            copyable
          />
          <InfoRow 
            icon={Clock} 
            label="Timestamp" 
            value={`${formatTime(tx.timestamp)} (${formatTimeAgo(tx.timestamp)})`}
          />
          <InfoRow 
            icon={User} 
            label="From" 
            value={tx.from}
            mono
            copyable
            link={`/address/${tx.from}`}
          />
          <InfoRow 
            icon={Wallet} 
            label="To" 
            value={tx.to || 'Contract Creation'}
            mono
            copyable={!!tx.to}
            link={tx.to ? `/address/${tx.to}` : undefined}
          />
          <InfoRow 
            icon={Coins} 
            label="Value" 
            value={`${formatBalance(tx.value)} MVM`}
          />
          <InfoRow 
            icon={Hash} 
            label="Nonce" 
            value={tx.nonce}
          />
          {tx.gas_used !== undefined && (
            <InfoRow 
              icon={Fuel} 
              label="Gas Used" 
              value={tx.gas_used.toLocaleString()}
            />
          )}
          <InfoRow 
            icon={FileCode} 
            label="Transaction Type" 
            value={txType.label}
          />
        </div>

        {/* Error Message */}
        {tx.status === 'Failed' && tx.error && (
          <div className="mt-4 p-4 rounded-lg bg-error/10 border border-error/30">
            <p className="text-sm text-error font-medium mb-1">Error Message</p>
            <p className="text-sm text-error/80 font-mono">{tx.error}</p>
          </div>
        )}
      </motion.div>

      {/* Transaction Data */}
      {tx.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
            <FileCode size={20} className="text-neon" />
            Transaction Data
          </h2>
          <div className="p-4 rounded-lg bg-deep overflow-x-auto">
            <pre className="text-sm text-ghost font-mono whitespace-pre-wrap">
              {JSON.stringify(tx.data, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Related Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4"
      >
        <Link
          to={`/address/${tx.from}`}
          className="card-hover flex-1 min-w-[200px] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber/20">
              <User size={20} className="text-cyber" />
            </div>
            <div>
              <p className="text-sm text-mist">Sender Address</p>
              <p className="font-mono text-sm text-electric">{formatAddress(tx.from, 8)}</p>
            </div>
          </div>
        </Link>
        
        {tx.to && (
          <Link
            to={`/address/${tx.to}`}
            className="card-hover flex-1 min-w-[200px] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon/20">
                <Wallet size={20} className="text-neon" />
              </div>
              <div>
                <p className="text-sm text-mist">Recipient Address</p>
                <p className="font-mono text-sm text-electric">{formatAddress(tx.to, 8)}</p>
              </div>
            </div>
          </Link>
        )}
      </motion.div>
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
            className={`text-electric hover:text-ice transition-colors truncate ${mono ? 'font-mono text-sm' : ''}`}
          >
            {valueStr}
          </Link>
        ) : (
          <span className={`text-ghost truncate ${mono ? 'font-mono text-sm' : ''}`}>
            {valueStr}
          </span>
        )}
        {copyable && <CopyButton text={valueStr} />}
      </div>
    </div>
  )
}