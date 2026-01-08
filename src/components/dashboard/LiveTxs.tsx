import TxCard from '@/components/explorer/TxCard'
import type { Transaction } from '@/types'

interface LiveTxsProps {
  transactions: Transaction[]
  latestTx: Transaction | null
}

export default function LiveTxs({ transactions, latestTx }: LiveTxsProps) {
  // Safely merge transactions, filtering out any undefined values
  const allTxs = (() => {
    const txList: Transaction[] = []
    
    // Add latest tx first if it exists
    if (latestTx && latestTx.hash) {
      txList.push(latestTx)
    }
    
    // Add other transactions, filtering out the latest and any undefined
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach(tx => {
        if (tx && tx.hash) {
          // Don't add duplicate of latest tx
          if (!latestTx || tx.hash !== latestTx.hash) {
            txList.push(tx)
          }
        }
      })
    }
    
    return txList.slice(0, 5)
  })()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ghost">Live Transactions</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
          <span className="text-sm text-mist">Streaming</span>
        </div>
      </div>
      <div className="space-y-3">
        {allTxs.length > 0 ? (
          allTxs.map((tx, i) => (
            <TxCard 
              key={tx.hash} 
              tx={tx} 
              isNew={i === 0 && latestTx?.hash === tx.hash}
            />
          ))
        ) : (
          <div className="text-center py-8 text-mist">
            No transactions yet. Be the first!
          </div>
        )}
      </div>
    </div>
  )
}