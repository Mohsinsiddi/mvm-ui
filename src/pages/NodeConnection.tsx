import { motion } from 'framer-motion'
import { 
  Cpu, 
  Globe, 
  Wifi, 
  WifiOff, 
  Server,
  Monitor,
  Smartphone,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { useStatus } from '@/hooks/useApi'
import { useWebSocket } from '@/hooks/useWebSocket'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function NodeConnection() {
  const { data: status, isLoading, refetch } = useStatus()
  const { isConnected: wsConnected, reconnect } = useWebSocket()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ghost flex items-center gap-3">
            <Cpu className="text-electric" />
            Node Connection
          </h1>
          <p className="text-mist mt-1">Learn about MVM node types and network architecture</p>
        </div>
        <button 
          onClick={() => { refetch(); reconnect(); }}
          className="btn-ghost flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Connection Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="font-semibold text-ghost mb-4 flex items-center gap-2">
            <Globe size={20} className="text-cyber" />
            API Connection
          </h3>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : status ? (
              <>
                <div className="p-2 rounded-full bg-success/20">
                  <CheckCircle size={24} className="text-success" />
                </div>
                <div>
                  <p className="font-medium text-ghost">Connected</p>
                  <p className="text-sm text-mist">Block Height: {status.height}</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-error/20">
                  <XCircle size={24} className="text-error" />
                </div>
                <div>
                  <p className="font-medium text-error">Disconnected</p>
                  <p className="text-sm text-mist">Cannot reach MVM node</p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="font-semibold text-ghost mb-4 flex items-center gap-2">
            <Wifi size={20} className="text-neon" />
            WebSocket (Real-time)
          </h3>
          <div className="flex items-center gap-3">
            {wsConnected ? (
              <>
                <div className="p-2 rounded-full bg-success/20">
                  <Wifi size={24} className="text-success" />
                </div>
                <div>
                  <p className="font-medium text-ghost">Live Connection</p>
                  <p className="text-sm text-mist">Receiving real-time updates</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-warning/20">
                  <WifiOff size={24} className="text-warning" />
                </div>
                <div>
                  <p className="font-medium text-warning">Reconnecting...</p>
                  <p className="text-sm text-mist">Using polling fallback</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Network Stats */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-ghost">{status.height}</p>
              <p className="text-sm text-mist">Block Height</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-ghost">{status.peers}</p>
              <p className="text-sm text-mist">Full Nodes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-ghost">{status.browsers}</p>
              <p className="text-sm text-mist">Browser Nodes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-ghost">{status.pending_transactions}</p>
              <p className="text-sm text-mist">Pending TXs</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Node Types Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="font-semibold text-ghost mb-6 flex items-center gap-2">
            <Info size={20} className="text-electric" />
            Node Types Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-deep">
                  <th className="text-left py-3 px-4 text-mist font-medium">Feature</th>
                  <th className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <Server size={24} className="text-cyber" />
                      <span className="text-ghost font-medium">Master Node</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <Monitor size={24} className="text-neon" />
                      <span className="text-ghost font-medium">Full Node</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <Smartphone size={24} className="text-electric" />
                      <span className="text-ghost font-medium">Browser Node</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  feature="Block Production"
                  master={true}
                  full={false}
                  browser={false}
                />
                <ComparisonRow
                  feature="Full Blockchain Data"
                  master={true}
                  full={true}
                  browser={false}
                />
                <ComparisonRow
                  feature="Transaction Validation"
                  master={true}
                  full={true}
                  browser={false}
                />
                <ComparisonRow
                  feature="API Endpoints"
                  master={true}
                  full={true}
                  browser={false}
                />
                <ComparisonRow
                  feature="WebSocket Support"
                  master={true}
                  full={true}
                  browser={false}
                />
                <ComparisonRow
                  feature="Send Transactions"
                  master={true}
                  full={true}
                  browser={true}
                />
                <ComparisonRow
                  feature="Query Blockchain"
                  master={true}
                  full={true}
                  browser={true}
                />
                <ComparisonRow
                  feature="Setup Required"
                  master="Server"
                  full="Server"
                  browser="None"
                />
                <ComparisonRow
                  feature="Trust Model"
                  master="Self"
                  full="Self"
                  browser="Master"
                />
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Network Topology */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h3 className="font-semibold text-ghost mb-6">Network Topology</h3>
          
          <div className="flex flex-col items-center py-8">
            {/* Master Node */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber to-neon flex items-center justify-center animate-glow-pulse">
                <Server size={40} className="text-white" />
              </div>
              <p className="mt-2 font-medium text-ghost">Master Node</p>
              <p className="text-xs text-mist">Block Producer</p>
            </div>

            {/* Connection Lines */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-cyber to-neon" />

            {/* Full Nodes */}
            <div className="flex items-center gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-neon" />
                  <div className="w-14 h-14 rounded-full bg-deep border-2 border-neon flex items-center justify-center">
                    <Monitor size={24} className="text-neon" />
                  </div>
                  <p className="mt-1 text-xs text-mist">Full Node {i}</p>
                </div>
              ))}
            </div>

            {/* Connection Lines */}
            <div className="flex items-center gap-8 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-0.5 h-8 bg-electric/50" />
              ))}
            </div>

            {/* Browser Nodes */}
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-deep border border-electric/50 flex items-center justify-center">
                    <Globe size={16} className="text-electric" />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-mist">Browser Nodes (You!)</p>
          </div>
        </Card>
      </motion.div>

      {/* Your Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-electric/10 to-cyber/10 border-electric/30">
          <h3 className="font-semibold text-ghost mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-electric" />
            Your Connection (Browser Node)
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Zap size={20} className="text-success" />
              </div>
              <div>
                <p className="font-medium text-ghost">Instant Setup</p>
                <p className="text-sm text-mist">No installation required. Works directly in your browser.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Shield size={20} className="text-warning" />
              </div>
              <div>
                <p className="font-medium text-ghost">Trust Model</p>
                <p className="text-sm text-mist">Relies on master node for blockchain data. Keys stay local.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-electric/20">
                <Clock size={20} className="text-electric" />
              </div>
              <div>
                <p className="font-medium text-ghost">Real-time</p>
                <p className="text-sm text-mist">WebSocket connection for live updates when available.</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Run Your Own Node */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <h3 className="font-semibold text-ghost mb-4">Run Your Own Full Node</h3>
          <p className="text-mist mb-4">
            Want to validate transactions yourself? Run a full node to participate in the network.
          </p>
          
          <div className="p-4 rounded-lg bg-deep font-mono text-sm">
            <p className="text-mist"># Clone the repository</p>
            <p className="text-ghost">git clone https://github.com/user/mvm</p>
            <p className="text-ghost">cd mvm</p>
            <p className="text-mist mt-2"># Build and run</p>
            <p className="text-ghost">cargo build --release</p>
            <p className="text-ghost">./target/release/mvm --mode full --master ws://master:8545/ws</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function ComparisonRow({ 
  feature, 
  master, 
  full, 
  browser 
}: { 
  feature: string
  master: boolean | string
  full: boolean | string
  browser: boolean | string
}) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle size={18} className="text-success mx-auto" />
      ) : (
        <XCircle size={18} className="text-error/50 mx-auto" />
      )
    }
    return <span className="text-mist text-sm">{value}</span>
  }

  return (
    <tr className="border-b border-deep/50">
      <td className="py-3 px-4 text-ghost">{feature}</td>
      <td className="py-3 px-4 text-center">{renderValue(master)}</td>
      <td className="py-3 px-4 text-center">{renderValue(full)}</td>
      <td className="py-3 px-4 text-center">{renderValue(browser)}</td>
    </tr>
  )
}