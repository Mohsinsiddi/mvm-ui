import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Transaction } from '@/types'
import { TX_TYPES } from '@/lib/constants'

interface TxRainProps {
  latestTx: Transaction | null
}

interface RainDrop {
  id: string
  icon: string
  x: number
}

export default function TxRain({ latestTx }: TxRainProps) {
  const [drops, setDrops] = useState<RainDrop[]>([])

  useEffect(() => {
    if (latestTx) {
      const txType = TX_TYPES[latestTx.tx_type] || { icon: '📄' }
      const newDrop: RainDrop = {
        id: latestTx.hash,
        icon: txType.icon,
        x: Math.random() * 80 + 10, // 10-90% of width
      }
      
      setDrops(prev => [...prev, newDrop])
      
      // Remove after animation
      setTimeout(() => {
        setDrops(prev => prev.filter(d => d.id !== newDrop.id))
      }, 4000)
    }
  }, [latestTx])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ y: -50, x: `${drop.x}vw`, opacity: 0 }}
            animate={{ y: '100vh', opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'linear' }}
            className="absolute text-2xl"
          >
            {drop.icon}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
