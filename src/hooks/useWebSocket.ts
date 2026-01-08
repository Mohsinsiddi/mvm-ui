import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL } from '@/lib/constants'
import type { Block, Transaction, WSMessage } from '@/types'

interface UseWebSocketReturn {
  isConnected: boolean
  latestBlock: Block | null
  latestTx: Transaction | null
  blocks: Block[]
  transactions: Transaction[]
  reconnect: () => void
  error: string | null
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestBlock, setLatestBlock] = useState<Block | null>(null)
  const [latestTx, setLatestTx] = useState<Transaction | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10

  const connect = useCallback(() => {
    // Don't reconnect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    try {
      console.log('🔌 Connecting to WebSocket...')
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        console.log('✅ WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          
          if (message.type === 'new_block') {
            const block = message.data as Block
            if (block && block.height !== undefined) {
              setLatestBlock(block)
              setBlocks((prev) => {
                const filtered = prev.filter(b => b && b.height !== block.height)
                return [block, ...filtered].slice(0, 20)
              })
            }
          } else if (message.type === 'new_transaction') {
            const tx = message.data as Transaction
            if (tx && tx.hash) {
              setLatestTx(tx)
              setTransactions((prev) => {
                const filtered = prev.filter(t => t && t.hash !== tx.hash)
                return [tx, ...filtered].slice(0, 50)
              })
            }
          }
        } catch (err) {
          console.error('WebSocket message error:', err)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        console.log('❌ WebSocket disconnected', event.code, event.reason)
        
        // Attempt reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current++
          console.log(`🔄 Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts.current})`)
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        } else {
          setError('Unable to connect to WebSocket after multiple attempts')
        }
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        setError('WebSocket connection error')
      }
    } catch (err) {
      console.error('WebSocket connection error:', err)
      setError('Failed to create WebSocket connection')
      
      // Attempt reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        reconnectAttempts.current++
        reconnectTimeoutRef.current = setTimeout(connect, delay)
      }
    }
  }, [])

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect requested')
    reconnectAttempts.current = 0
    setError(null)
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    // Small delay before reconnecting
    setTimeout(connect, 500)
  }, [connect])

  useEffect(() => {
    connect()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  return {
    isConnected,
    latestBlock,
    latestTx,
    blocks,
    transactions,
    reconnect,
    error,
  }
}