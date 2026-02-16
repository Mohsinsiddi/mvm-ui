import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal as TerminalIcon, ChevronRight, Info, X } from 'lucide-react'
import { api } from '@/lib/api'
import { formatBalance, formatAddress, formatTimeAgo } from '@/lib/format'
import { useWalletStore } from '@/store/walletStore'

interface CommandResult {
  command: string
  output: string
  isError?: boolean
  timestamp: Date
}

const COMMANDS = {
  help: 'Show all available commands',
  status: 'Get blockchain status',
  block: 'Get block by height (usage: block <height>)',
  tx: 'Get transaction by hash (usage: tx <hash>)',
  balance: 'Get address balance (usage: balance <address>)',
  account: 'Get account details (usage: account <address>)',
  mempool: 'Show pending transactions',
  tokens: 'List all tokens',
  contracts: 'List all contracts',
  faucet: 'Request test tokens (usage: faucet <address>)',
  wallet: 'Show connected wallet info',
  clear: 'Clear terminal',
  connect: 'Open wallet connection dialog',
}

export default function Terminal() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<CommandResult[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHelp, setShowHelp] = useState(true)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { address, setShowWalletModal } = useWalletStore()

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const processCommand = async (cmd: string) => {
    const parts = cmd.trim().split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    try {
      switch (command) {
        case 'help':
          return formatHelp()

        case 'status':
          const status = await api.getStatus()
          return formatStatus(status)

        case 'block':
          if (!args[0]) return 'Usage: block <height>\nExample: block 0'
          const blockHeight = args[0] === 'latest' ? 'latest' : parseInt(args[0])
          if (blockHeight === 'latest') {
            const latestBlock = await api.getLatestBlock()
            return formatBlock(latestBlock)
          }
          const blockData = await api.getBlock(blockHeight as number)
          return formatBlock(blockData.block)

        case 'tx':
          if (!args[0]) return 'Usage: tx <hash>\nExample: tx abc123...'
          const txData = await api.getTransaction(args[0])
          return formatTransaction(txData.transaction)

        case 'balance':
          const balanceAddr = args[0] || address
          if (!balanceAddr) return 'Usage: balance <address>\nOr connect wallet first'
          const balanceData = await api.getBalance(balanceAddr)
          return `Balance: ${formatBalance(balanceData.balance)} MVM\nAddress: ${balanceAddr}`

        case 'account':
          const accountAddr = args[0] || address
          if (!accountAddr) return 'Usage: account <address>\nOr connect wallet first'
          const accountData = await api.getAccount(accountAddr)
          return formatAccount(accountData)

        case 'mempool':
          const mempool = await api.getMempool()
          return formatMempool(mempool)

        case 'tokens':
          const tokens = await api.getTokens()
          return formatTokens(tokens.tokens)

        case 'contracts':
          const contracts = await api.getContracts()
          return formatContracts(contracts.contracts)

        case 'faucet':
          const faucetAddr = args[0] || address
          if (!faucetAddr) return 'Usage: faucet <address>\nOr connect wallet first'
          const faucetResult = await api.faucet(faucetAddr)
          return `✅ Faucet successful!\nTransaction: ${faucetResult.hash}`

        case 'wallet':
          if (!address) return '❌ No wallet connected\nUse "connect" to open wallet dialog'
          const walletBalance = await api.getBalance(address)
          return `🔗 Connected Wallet\nAddress: ${address}\nBalance: ${formatBalance(walletBalance.balance)} MVM`

        case 'connect':
          setShowWalletModal(true)
          return '📱 Opening wallet connection dialog...'

        case 'clear':
          setHistory([])
          return null

        case '':
          return null

        default:
          return `❌ Unknown command: ${command}\nType "help" for available commands`
      }
    } catch (error: any) {
      throw new Error(error.message || 'Command failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const cmd = input.trim()
    setInput('')
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)
    setIsProcessing(true)
    setShowHelp(false)

    try {
      const output = await processCommand(cmd)
      if (output !== null) {
        setHistory(prev => [...prev, {
          command: cmd,
          output,
          timestamp: new Date()
        }])
      }
    } catch (error: any) {
      setHistory(prev => [...prev, {
        command: cmd,
        output: `❌ Error: ${error.message}`,
        isError: true,
        timestamp: new Date()
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      } else {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ghost flex items-center gap-3">
            <TerminalIcon className="text-cyber" />
            Terminal
          </h1>
          <p className="text-mist mt-1">Command-line interface to interact with MVM blockchain</p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="btn-ghost flex items-center gap-2"
        >
          {showHelp ? <X size={18} /> : <Info size={18} />}
          {showHelp ? 'Hide' : 'Help'}
        </button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card bg-cyber/10 border-cyber/30"
        >
          <h3 className="font-semibold text-ghost mb-3">Available Commands</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(COMMANDS).map(([cmd, desc]) => (
              <div key={cmd} className="flex items-start gap-2">
                <code className="text-electric text-sm">{cmd}</code>
                <span className="text-xs text-mist">{desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Terminal */}
      <div 
        className="card bg-void border-deep font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-deep">
          <div className="w-3 h-3 rounded-full bg-error" />
          <div className="w-3 h-3 rounded-full bg-warning" />
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="ml-2 text-mist text-xs">MVM Terminal v1.0</span>
        </div>

        {/* Output Area */}
        <div 
          ref={outputRef}
          className="h-[300px] md:h-[400px] overflow-y-auto space-y-4 mb-4"
        >
          {/* Welcome Message */}
          <div className="text-mist">
            <pre className="text-cyber text-xs leading-tight mb-2">{`
 ███╗   ███╗██╗   ██╗███╗   ███╗
 ████╗ ████║██║   ██║████╗ ████║
 ██╔████╔██║██║   ██║██╔████╔██║
 ██║╚██╔╝██║╚██╗ ██╔╝██║╚██╔╝██║
 ██║ ╚═╝ ██║ ╚████╔╝ ██║ ╚═╝ ██║
 ╚═╝     ╚═╝  ╚═══╝  ╚═╝     ╚═╝
            `}</pre>
            <p>Welcome to MVM Terminal! Type <span className="text-electric">help</span> for available commands.</p>
          </div>

          {/* Command History */}
          {history.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2 text-mist">
                <ChevronRight size={14} className="text-cyber" />
                <span className="text-ghost">{item.command}</span>
              </div>
              <pre className={`pl-5 whitespace-pre-wrap ${item.isError ? 'text-error' : 'text-ghost'}`}>
                {item.output}
              </pre>
            </div>
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-mist">
              <div className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
              Processing...
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-deep pt-3">
          <ChevronRight size={14} className="text-cyber" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-ghost outline-none placeholder-shadow"
            disabled={isProcessing}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>

      {/* Quick Commands */}
      <div className="flex flex-wrap gap-2">
        {['status', 'mempool', 'tokens', 'wallet', 'block latest'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd)
              inputRef.current?.focus()
            }}
            className="px-3 py-1.5 rounded-lg bg-deep hover:bg-abyss text-sm text-mist hover:text-ghost transition-colors font-mono"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  )
}

// Formatting helpers
function formatHelp(): string {
  return Object.entries(COMMANDS)
    .map(([cmd, desc]) => `  ${cmd.padEnd(12)} - ${desc}`)
    .join('\n')
}

function formatStatus(status: any): string {
  return `
📊 Blockchain Status
━━━━━━━━━━━━━━━━━━━━
Chain ID:     ${status.chain_id}
Block Height: ${status.height}
Pending TXs:  ${status.pending_transactions}
Full Nodes:   ${status.peers}
Browser Nodes: ${status.browsers}
`.trim()
}

function formatBlock(block: any): string {
  const txCount = block.tx_count ?? block.transactions?.length ?? 0
  return `
📦 Block #${block.height}
━━━━━━━━━━━━━━━━━━━━
Hash:      ${block.hash}
Prev Hash: ${block.previous_hash || 'Genesis'}
Validator: ${formatAddress(block.validator)}
Time:      ${formatTimeAgo(block.timestamp)}
TXs:       ${txCount}
`.trim()
}

function formatTransaction(tx: any): string {
  return `
📝 Transaction
━━━━━━━━━━━━━━━━━━━━
Hash:   ${tx.hash}
Type:   ${tx.tx_type}
Status: ${tx.status}
From:   ${formatAddress(tx.from)}
To:     ${tx.to ? formatAddress(tx.to) : 'Contract Creation'}
Value:  ${formatBalance(tx.value)} MVM
Nonce:  ${tx.nonce}
Time:   ${formatTimeAgo(tx.timestamp)}
`.trim()
}

function formatAccount(account: any): string {
  return `
👤 Account
━━━━━━━━━━━━━━━━━━━━
Address: ${account.address}
Balance: ${formatBalance(account.balance)} MVM
Nonce:   ${account.nonce}
`.trim()
}

function formatMempool(mempool: any): string {
  if (mempool.count === 0) {
    return '📭 Mempool is empty'
  }
  
  let output = `📬 Mempool (${mempool.count} transactions)\n━━━━━━━━━━━━━━━━━━━━\n`
  mempool.transactions.slice(0, 5).forEach((tx: any, i: number) => {
    output += `${i + 1}. ${tx.hash.slice(0, 16)}... (${tx.tx_type})\n`
  })
  if (mempool.count > 5) {
    output += `... and ${mempool.count - 5} more`
  }
  return output.trim()
}

function formatTokens(tokens: any[]): string {
  if (tokens.length === 0) {
    return '🪙 No tokens found'
  }
  
  let output = `🪙 Tokens (${tokens.length})\n━━━━━━━━━━━━━━━━━━━━\n`
  tokens.forEach((token, i) => {
    output += `${i + 1}. ${token.symbol.padEnd(8)} - ${token.name}\n`
  })
  return output.trim()
}

function formatContracts(contracts: any[]): string {
  if (contracts.length === 0) {
    return '📜 No contracts found'
  }
  
  let output = `📜 Contracts (${contracts.length})\n━━━━━━━━━━━━━━━━━━━━\n`
  contracts.forEach((contract, i) => {
    output += `${i + 1}. ${contract.name.padEnd(15)} - ${formatAddress(contract.address)}\n`
  })
  return output.trim()
}