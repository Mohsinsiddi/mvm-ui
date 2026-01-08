import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useStatus } from '@/hooks/useApi'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function NetworkStatus() {
  const { data: status, isError, isLoading, refetch } = useStatus()
  const { isConnected: wsConnected, reconnect } = useWebSocket()

  // Determine network state
  const isBlockchainDown = isError || (!isLoading && !status)
  const isBlockchainStale = status && status.height === 0
  const isWebSocketDown = !wsConnected

  // Don't show anything if everything is fine
  if (!isBlockchainDown && !isBlockchainStale && !isWebSocketDown) {
    return null
  }

  const handleRetry = () => {
    refetch()
    reconnect()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        {/* Blockchain Down */}
        {(isBlockchainDown || isBlockchainStale) && (
          <div className="bg-error/10 border-b border-error/30">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-error/20">
                    <AlertTriangle size={18} className="text-error" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-error">
                      {isBlockchainDown ? 'Blockchain Unavailable' : 'Blockchain Starting'}
                    </p>
                    <p className="text-xs text-error/70">
                      {isBlockchainDown 
                        ? 'Cannot connect to MVM node. Make sure the blockchain is running on port 8545.'
                        : 'Block height is 0. The blockchain may be initializing...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error/20 hover:bg-error/30 text-error text-sm transition-colors"
                >
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WebSocket Down (only show if blockchain is up) */}
        {!isBlockchainDown && !isBlockchainStale && isWebSocketDown && (
          <div className="bg-warning/10 border-b border-warning/30">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <WifiOff size={16} className="text-warning" />
                  <p className="text-sm text-warning">
                    Real-time updates disconnected. Reconnecting...
                  </p>
                </div>
                <button
                  onClick={reconnect}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-warning/20 hover:bg-warning/30 text-warning text-sm transition-colors"
                >
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Reconnect</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}