import { motion } from 'framer-motion'
import BlockCard from '@/components/explorer/BlockCard'
import type { Block } from '@/types'

interface LiveBlocksProps {
  blocks: Block[]
  latestBlock: Block | null
}

export default function LiveBlocks({ blocks, latestBlock }: LiveBlocksProps) {
  // Safely merge blocks, filtering out any undefined values
  const allBlocks = (() => {
    const blockList: Block[] = []
    
    // Add latest block first if it exists
    if (latestBlock && latestBlock.height !== undefined) {
      blockList.push(latestBlock)
    }
    
    // Add other blocks, filtering out the latest and any undefined
    if (blocks && Array.isArray(blocks)) {
      blocks.forEach(block => {
        if (block && block.height !== undefined) {
          // Don't add duplicate of latest block
          if (!latestBlock || block.height !== latestBlock.height) {
            blockList.push(block)
          }
        }
      })
    }
    
    return blockList.slice(0, 5)
  })()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ghost">Live Blocks</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-mist">Real-time</span>
        </div>
      </div>
      <div className="space-y-3">
        {allBlocks.length > 0 ? (
          allBlocks.map((block, i) => (
            <BlockCard 
              key={block.height} 
              block={block} 
              isNew={i === 0 && latestBlock?.height === block.height}
            />
          ))
        ) : (
          <div className="text-center py-8 text-mist">
            Waiting for blocks...
          </div>
        )}
      </div>
    </div>
  )
}