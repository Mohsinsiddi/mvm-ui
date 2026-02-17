import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Wallet as WalletIcon,
  Send,
  Download,
  Droplets,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  LogOut,
  AlertTriangle,
  ChevronDown,
  Loader
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWalletStore } from '@/store/walletStore'
import { useBalance, useAddressTransactions, useFaucet, useTokens } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { formatBalance, formatAddress, formatTimeAgo, copyToClipboard, normalizeTxType } from '@/lib/format'
import { isValidAddress } from '@/lib/crypto'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Card from '@/components/common/Card'

export default function Wallet() {
  const { address, privateKey, isConnected, setShowWalletModal, clearWallet } = useWalletStore()
  
  // If not connected, show connect prompt
  if (!isConnected || !address) {
    return <WalletNotConnected onConnect={() => setShowWalletModal(true)} />
  }

  return <WalletConnected address={address} privateKey={privateKey} onDisconnect={clearWallet} />
}

// ============================================================
// NOT CONNECTED VIEW
// ============================================================

function WalletNotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyber to-neon flex items-center justify-center animate-glow-pulse">
          <WalletIcon size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-ghost mb-2">Connect Your Wallet</h1>
        <p className="text-mist mb-6">
          Create a new wallet or import an existing one to start using MVM blockchain.
        </p>
        <button onClick={onConnect} className="btn-primary px-8 py-3 text-lg">
          Connect Wallet
        </button>
      </motion.div>
    </div>
  )
}

// ============================================================
// CONNECTED VIEW
// ============================================================

function WalletConnected({ 
  address, 
  privateKey,
  onDisconnect 
}: { 
  address: string
  privateKey: string | null
  onDisconnect: () => void 
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'receive' | 'settings'>('overview')
  
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useBalance(address)
  const { data: txsData } = useAddressTransactions(address)
  const { data: tokensData } = useTokens()
  
  const balance = balanceData?.balance ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ghost">My Wallet</h1>
          <p className="text-mist mt-1">Manage your MVM assets</p>
        </div>
        <button 
          onClick={() => refetchBalance()}
          className="btn-ghost flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-cyber/20 via-abyss to-neon/20 border-cyber/30"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-mist text-sm mb-1">Total Balance</p>
            {balanceLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <motion.h2 
                key={balance}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-4xl md:text-5xl font-bold text-ghost"
              >
                {formatBalance(balance)} <span className="text-lg sm:text-2xl text-mist">MVM</span>
              </motion.h2>
            )}
            <AddressDisplay address={address} />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab('send')}
              className="btn-primary flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
            <button 
              onClick={() => setActiveTab('receive')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Receive
            </button>
            <FaucetButton address={address} onSuccess={refetchBalance} />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-abyss rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'send', label: 'Send' },
          { id: 'receive', label: 'Receive' },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-cyber text-white' 
                : 'text-mist hover:text-ghost hover:bg-deep'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <TokenBalances address={address} tokens={tokensData?.tokens || []} />
            <RecentActivity transactions={txsData?.transactions || []} address={address} />
          </motion.div>
        )}

        {activeTab === 'send' && (
          <motion.div
            key="send"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SendForm address={address} privateKey={privateKey} balance={balance} tokens={tokensData?.tokens || []} onSuccess={refetchBalance} />
          </motion.div>
        )}

        {activeTab === 'receive' && (
          <motion.div
            key="receive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ReceiveForm address={address} />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WalletSettings 
              address={address} 
              privateKey={privateKey} 
              onDisconnect={onDisconnect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// SUB COMPONENTS
// ============================================================

function AddressDisplay({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2 mt-2 text-sm text-mist hover:text-electric transition-colors"
    >
      <span className="font-mono">{formatAddress(address, 8)}</span>
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </button>
  )
}

function FaucetButton({ address, onSuccess }: { address: string; onSuccess: () => void }) {
  const faucetMutation = useFaucet()
  const [cooldown, setCooldown] = useState(false)

  const handleFaucet = async () => {
    if (cooldown) return
    try {
      await faucetMutation.mutateAsync(address)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 60000) // 1 minute cooldown
      onSuccess()
    } catch (err) {
      console.error('Faucet error:', err)
    }
  }

  return (
    <button
      onClick={handleFaucet}
      disabled={faucetMutation.isPending || cooldown}
      className="btn-ghost flex items-center gap-2 border border-electric/30 hover:border-electric hover:bg-electric/10"
    >
      {faucetMutation.isPending ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Droplets size={18} className="text-electric" />
      )}
      <span className="text-electric">
        {cooldown ? 'Wait 1 min' : 'Faucet'}
      </span>
    </button>
  )
}

function TokenBalances({ address, tokens }: { address: string; tokens: any[] }) {
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      const balances: Record<string, number> = {}
      for (const token of tokens) {
        try {
          const res = await api.getTokenBalance(token.address, address)
          balances[token.address] = res.balance_raw
        } catch {
          balances[token.address] = 0
        }
      }
      setTokenBalances(balances)
      setLoading(false)
    }
    if (tokens.length > 0) {
      fetchBalances()
    } else {
      setLoading(false)
    }
  }, [address, tokens])

  return (
    <Card>
      <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
        <Coins size={20} className="text-neon" />
        Token Balances
      </h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (() => {
        const tokensWithBalance = tokens.filter((t) => (tokenBalances[t.address] || 0) > 0)
        return tokensWithBalance.length === 0 ? (
          <div className="text-center py-8 text-mist">
            No token balances found
          </div>
        ) : (
          <div className="space-y-3">
            {tokensWithBalance.map((token) => (
              <Link
                key={token.address}
                to={`/contracts?tab=tokens&token=${token.address}`}
                className="flex items-center justify-between p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon to-glow flex items-center justify-center text-white font-bold text-sm">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-ghost">{token.symbol}</div>
                    <div className="text-xs text-mist">{token.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-mono text-ghost">
                      {formatBalance(tokenBalances[token.address] || 0, token.decimals)}
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-mist" />
                </div>
              </Link>
            ))}
          </div>
        )
      })()}
    </Card>
  )
}

function RecentActivity({ transactions, address }: { transactions: any[]; address: string }) {
  const recentTxs = transactions.slice(0, 5)

  const txMeta: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    transfer:        { label: 'Transfer',       icon: '💸', color: 'text-electric', bg: 'bg-electric/20' },
    create_token:    { label: 'Create Token',   icon: '🪙', color: 'text-warning',  bg: 'bg-warning/20' },
    transfer_token:  { label: 'Token Transfer', icon: '🔄', color: 'text-neon',     bg: 'bg-neon/20' },
    deploy_contract: { label: 'Deploy Contract', icon: '📝', color: 'text-glow',    bg: 'bg-glow/20' },
    call_contract:   { label: 'Contract Call',  icon: '⚡', color: 'text-success',  bg: 'bg-success/20' },
  }

  // Extract contract details from tx.data
  function getContractInfo(tx: any): { method?: string; contract?: string; name?: string } | null {
    const data = tx.data
    if (!data) return null
    // Backend serde format: { "CallContract": { contract, method, args } }
    if (data.CallContract) return { method: data.CallContract.method, contract: data.CallContract.contract }
    // snake_case format from as_str: { contract, method, args }
    if (data.contract && data.method) return { method: data.method, contract: data.contract }
    // Deploy contract
    if (data.DeployContract) return { name: data.DeployContract.name }
    if (data.name && !data.method) return { name: data.name }
    return null
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
        <RefreshCw size={20} className="text-electric" />
        Recent Activity
      </h3>
      {recentTxs.length === 0 ? (
        <div className="text-center py-8 text-mist">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-3">
          {recentTxs.map((tx) => {
            const isOutgoing = tx.from?.toLowerCase() === address.toLowerCase()
            const txType = normalizeTxType(tx.tx_type)
            const meta = txMeta[txType] || txMeta.transfer
            const rawValue = Number(tx.value_raw ?? tx.value ?? 0)
            const isTransfer = txType === 'transfer' || txType === 'transfer_token'
            const contractInfo = getContractInfo(tx)

            // Label: for transfers show Sent/Received, for others show tx type
            let label = meta.label
            if (isTransfer) {
              label = isOutgoing ? 'Sent' : 'Received'
            }

            // Subtitle: show contract method or contract name
            let subtitle = ''
            if (contractInfo?.method) {
              subtitle = `${contractInfo.method}()`
            } else if (contractInfo?.name) {
              subtitle = contractInfo.name
            }

            return (
              <a
                key={tx.hash}
                href={`/tx/${tx.hash}`}
                className="flex items-center justify-between p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isTransfer ? (isOutgoing ? 'bg-error/20' : 'bg-success/20') : meta.bg}`}>
                    {isTransfer ? (
                      isOutgoing ? <ArrowUpRight size={16} className="text-error" /> : <ArrowDownLeft size={16} className="text-success" />
                    ) : (
                      <span className="text-sm">{meta.icon}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-ghost">{label}</div>
                    {subtitle ? (
                      <div className="text-xs text-mist font-mono">{subtitle}</div>
                    ) : (
                      <div className="text-xs text-mist">{formatTimeAgo(tx.timestamp)}</div>
                    )}
                    {subtitle && (
                      <div className="text-xs text-mist">{formatTimeAgo(tx.timestamp)}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isTransfer && rawValue > 0 ? (
                    <div className={`font-mono ${isOutgoing ? 'text-error' : 'text-success'}`}>
                      {isOutgoing ? '-' : '+'}{formatBalance(rawValue)} MVM
                    </div>
                  ) : rawValue > 0 ? (
                    <div className="font-mono text-mist">
                      {formatBalance(rawValue)} MVM
                    </div>
                  ) : (
                    <div className={`text-sm ${meta.color}`}>{meta.label}</div>
                  )}
                  {tx.status === 'Failed' && (
                    <div className="text-xs text-error">Failed</div>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}
      {transactions.length > 5 && (
        <a
          href={`/address/${address}`}
          className="block text-center mt-4 text-sm text-electric hover:text-ice"
        >
          View all transactions →
        </a>
      )}
    </Card>
  )
}

function SendForm({ address, privateKey, balance, tokens, onSuccess }: { address: string; privateKey: string | null; balance: number; tokens: any[]; onSuccess: () => void }) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Token selection: null = native MVM, string = token address
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({})
  const [loadingTokenBal, setLoadingTokenBal] = useState(false)

  const selectedToken = tokens.find(t => t.address === selectedAsset)

  // Fetch token balances for the dropdown
  useEffect(() => {
    if (tokens.length === 0) return
    setLoadingTokenBal(true)
    const fetchAll = async () => {
      const bals: Record<string, number> = {}
      for (const t of tokens) {
        try {
          const res = await api.getTokenBalance(t.address, address)
          bals[t.address] = res.balance_raw
        } catch {
          bals[t.address] = 0
        }
      }
      setTokenBalances(bals)
      setLoadingTokenBal(false)
    }
    fetchAll()
  }, [address, tokens])

  const currentBalance = selectedAsset
    ? tokenBalances[selectedAsset] || 0
    : balance

  const currentDecimals = selectedToken?.decimals ?? 8
  const currentSymbol = selectedToken?.symbol ?? 'MVM'

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!privateKey) {
      setError('Private key not available. Please reconnect wallet.')
      return
    }

    if (!isValidAddress(to)) {
      setError('Invalid recipient address')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Invalid amount')
      return
    }

    const balanceHuman = currentBalance / Math.pow(10, currentDecimals)
    if (amountNum > balanceHuman) {
      setError(`Insufficient ${currentSymbol} balance: you have ${balanceHuman.toFixed(4)}`)
      return
    }

    // Always need MVM for gas
    if (balance < 100_000_000) {
      setError('Insufficient MVM for gas. Need at least 1.0 MVM. Use the faucet first.')
      return
    }

    setSending(true)
    try {
      let result: any

      if (selectedAsset && selectedToken) {
        // Token transfer
        const rawAmount = Math.floor(amountNum * Math.pow(10, selectedToken.decimals))
        result = await api.transferToken(privateKey, address, selectedAsset, to, rawAmount)
      } else {
        // Native MVM transfer
        const { pending_nonce } = await api.getPendingNonce(address)
        result = await api.signAndSubmit(
          privateKey,
          'transfer',
          address,
          to,
          amountNum,
          pending_nonce
        )
      }

      if (result.success || result.hash) {
        setSuccess(`Transaction sent! Hash: ${(result.hash || result.tx_hash || '').slice(0, 16)}...`)
        setTo('')
        setAmount('')
        onSuccess()
      } else {
        setError(result.message || 'Transaction failed')
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setSending(false)
    }
  }

  const setMaxAmount = () => {
    if (selectedAsset) {
      const max = currentBalance / Math.pow(10, currentDecimals)
      setAmount(max.toFixed(4))
    } else {
      const maxAmount = Math.max(0, (balance / 1e8) - 1) // Leave 1 MVM for gas
      setAmount(maxAmount.toFixed(4))
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
        <Send size={20} className="text-cyber" />
        Send {currentSymbol}
      </h3>

      <form onSubmit={handleSend} className="space-y-4">
        {/* Asset Selector */}
        <div>
          <label className="block text-sm text-mist mb-2">Asset</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="input w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedAsset ? 'bg-gradient-to-br from-neon to-glow text-white' : 'bg-gradient-to-br from-cyber to-electric text-white'
                }`}>
                  {selectedToken ? selectedToken.symbol.charAt(0) : 'M'}
                </div>
                <span className="text-ghost font-medium">{currentSymbol}</span>
                <span className="text-mist text-sm">
                  ({formatBalance(currentBalance, currentDecimals)})
                </span>
              </div>
              <ChevronDown size={16} className={`text-mist transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute z-20 mt-1 w-full bg-abyss border border-deep rounded-lg shadow-xl overflow-hidden">
                {/* Native MVM */}
                <button
                  type="button"
                  onClick={() => { setSelectedAsset(null); setShowDropdown(false); setAmount('') }}
                  className={`w-full flex items-center justify-between p-3 text-left hover:bg-deep transition-colors ${
                    !selectedAsset ? 'bg-deep' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber to-electric flex items-center justify-center text-white text-xs font-bold">M</div>
                    <span className="text-ghost font-medium">MVM</span>
                  </div>
                  <span className="font-mono text-sm text-mist">{formatBalance(balance)}</span>
                </button>

                {/* Tokens */}
                {tokens.map(t => (
                  <button
                    key={t.address}
                    type="button"
                    onClick={() => { setSelectedAsset(t.address); setShowDropdown(false); setAmount('') }}
                    className={`w-full flex items-center justify-between p-3 text-left hover:bg-deep transition-colors ${
                      selectedAsset === t.address ? 'bg-deep' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon to-glow flex items-center justify-center text-white text-xs font-bold">
                        {t.symbol.charAt(0)}
                      </div>
                      <div>
                        <span className="text-ghost font-medium">{t.symbol}</span>
                        <span className="text-mist text-xs ml-1">{t.name}</span>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-mist">
                      {loadingTokenBal ? '...' : formatBalance(tokenBalances[t.address] || 0, t.decimals)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-mist mb-2">Recipient Address</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="mvm1..."
            className="input font-mono"
          />
        </div>

        <div>
          <label className="block text-sm text-mist mb-2">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              min="0"
              className="input pr-20"
            />
            <button
              type="button"
              onClick={setMaxAmount}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-electric hover:text-ice"
            >
              MAX
            </button>
          </div>
          <p className="text-xs text-mist mt-1">
            Available: {formatBalance(currentBalance, currentDecimals)} {currentSymbol}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-sm text-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !to || !amount}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <Loader size={18} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={18} />
              Send {currentSymbol}
            </>
          )}
        </button>
      </form>
    </Card>
  )
}

function ReceiveForm({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="max-w-lg mx-auto text-center">
      <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center justify-center gap-2">
        <Download size={20} className="text-neon" />
        Receive MVM
      </h3>

      <p className="text-mist mb-6">
        Share your address to receive MVM or tokens
      </p>

      {/* QR Code */}
      <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-xl p-3 flex items-center justify-center">
        <QRCodeSVG
          value={address}
          size={168}
          bgColor="#ffffff"
          fgColor="#0d1117"
          level="M"
        />
      </div>

      {/* Address */}
      <div className="p-4 rounded-lg bg-deep">
        <p className="font-mono text-sm text-electric break-all">{address}</p>
      </div>

      <button
        onClick={handleCopy}
        className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check size={18} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={18} />
            Copy Address
          </>
        )}
      </button>
    </Card>
  )
}

function WalletSettings({ 
  address, 
  privateKey,
  onDisconnect 
}: { 
  address: string
  privateKey: string | null
  onDisconnect: () => void 
}) {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Address */}
      <Card>
        <h3 className="text-lg font-semibold text-ghost mb-4">Wallet Address</h3>
        <div className="p-3 rounded-lg bg-deep font-mono text-sm text-electric break-all">
          {address}
        </div>
        <a 
          href={`/address/${address}`}
          className="inline-flex items-center gap-2 mt-3 text-sm text-mist hover:text-electric"
        >
          <ExternalLink size={14} />
          View on Explorer
        </a>
      </Card>

      {/* Private Key */}
      <Card>
        <h3 className="text-lg font-semibold text-ghost mb-4">Private Key</h3>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
          <div className="text-sm text-warning">
            Never share your private key with anyone. Anyone with your private key can access your funds.
          </div>
        </div>
        
        {privateKey && (
          <div className="relative">
            <div className="p-3 rounded-lg bg-deep font-mono text-sm break-all">
              <span className={showPrivateKey ? 'text-ghost' : 'blur-sm text-ghost select-none'}>
                {privateKey}
              </span>
            </div>
            <button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-mist hover:text-ghost"
            >
              {showPrivateKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
      </Card>

      {/* Disconnect */}
      <Card className="border-error/30">
        <h3 className="text-lg font-semibold text-error mb-4">Danger Zone</h3>
        
        {!confirmDisconnect ? (
          <button
            onClick={() => setConfirmDisconnect(true)}
            className="btn bg-error/20 hover:bg-error/30 text-error w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Disconnect Wallet
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-mist">
              Are you sure? Make sure you have saved your private key before disconnecting.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDisconnect(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={onDisconnect}
                className="btn bg-error hover:bg-error/80 text-white flex-1"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}