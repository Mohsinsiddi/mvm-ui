import { motion, AnimatePresence } from 'framer-motion'
import { Box } from 'lucide-react'
import type { Block } from '@/types'

interface BlockPulseProps {
  block: Block | null
}

export default function BlockPulse({ block }: BlockPulseProps) {
  if (!block || block.height === undefined) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={block.height}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyber/20 to-neon/20 border border-cyber/30"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(123, 44, 191, 0.4)',
              '0 0 0 20px rgba(123, 44, 191, 0)',
            ],
          }}
          transition={{ duration: 1, repeat: 2 }}
          className="p-3 rounded-lg bg-cyber"
        >
          <Box size={24} className="text-white" />
        </motion.div>
        <div>
          <div className="text-sm text-mist">New Block</div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-ghost"
          >
            #{block.height}
          </motion.div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm text-mist">
            {block.tx_count ?? block.transactions?.length ?? 0} transactions
          </div>
          <div className="text-xs text-cyber font-mono">
            {block.hash ? `${block.hash.slice(0, 16)}...` : ''}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}