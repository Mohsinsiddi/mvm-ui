import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { 
  ArrowLeft,
  Wallet,
  Coins,
  FileCode,
  Activity,
  Copy,
  Check,
  ExternalLink,
  Droplets
} from 'lucide-react'
import { useAccount, useAddressTransactions, useTokens, useFaucet } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { formatBalance, formatAddress, formatTimeAgo, copyToClipboard } from '@/lib/format'
import { isValidAddress } from '@/lib/crypto'
import TxCard from '@/components/explorer/TxCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Card from '@/components/common/Card'

export default function AddressDetail() {
  const { address } = useParams<{ address: string }>()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')
  
  const { data: accountData, isLoading: accountLoading, refetch: refetchAccount } = useAccount(address || '')
  const { data: txsData, isLoading: txsLoading } = useAddressTransactions(address || '')
  const { data: tokensData } = useTokens()
  const faucetMutation = useFaucet()

  // Check if address is a contract
  const [isContract, setIsContract] = useState(false)
  const [contractInfo, setContractInfo] = useState<any>(null)

  useEffect(() => {
    const checkContract = async () => {
      if (!address) return
      try {
        const res = await api.getContract(address)
        if (res.contract) {
          setIsContract(true)
          setContractInfo(res.contract)
        }
      } catch {
        setIsContract(false)
      }
    }
    checkContract()
  }, [address])

  // Check if address is a token
  const [isToken, setIsToken] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [holderCount, setHolderCount] = useState<number>(0)

  useEffect(() => {
    const checkToken = async () => {
      if (!address) return
      try {
        const res = await api.getToken(address)
        if (res.token) {
          setIsToken(true)
          setTokenInfo(res.token)
          // Fetch holder count
          try {
            const holdersRes = await api.getTokenHolders(address)
            setHolderCount(holdersRes.holder_count ?? 0)
          } catch {}
        }
      } catch {
        setIsToken(false)
      }
    }
    checkToken()
  }, [address])

  const handleCopy = async () => {
    if (!address) return
    await copyToClipboard(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFaucet = async () => {
    if (!address) return
    try {
      await faucetMutation.mutateAsync(address)
      refetchAccount()
    } catch (err) {
      console.error('Faucet error:', err)
    }
  }

  if (!address || !isValidAddress(address)) {
    return (
      <div className="text-center py-20">
        <Wallet size={64} className="mx-auto text-mist mb-4" />
        <h1 className="text-2xl font-bold text-ghost mb-2">Invalid Address</h1>
        <p className="text-mist mb-6">The address format is invalid</p>
        <Link to="/explorer" className="btn-primary">
          Back to Explorer
        </Link>
      </div>
    )
  }

  // API returns { success, account: { balance, balance_raw, nonce, ... }, ... }
  const account = (accountData as any)?.account
  const balance = account?.balance_raw ?? 0
  const nonce = account?.nonce ?? 0
  const transactions = txsData?.transactions ?? []

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

      {/* Address Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-3 md:p-4 rounded-xl flex-shrink-0 ${
              isContract ? 'bg-gradient-to-br from-neon to-glow' :
              isToken ? 'bg-gradient-to-br from-warning to-orange-500' :
              'bg-gradient-to-br from-cyber to-neon'
            }`}>
              {isContract ? (
                <FileCode className="text-white w-6 h-6 md:w-8 md:h-8" />
              ) : isToken ? (
                <Coins className="text-white w-6 h-6 md:w-8 md:h-8" />
              ) : (
                <Wallet className="text-white w-6 h-6 md:w-8 md:h-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-ghost">
                  {isContract ? 'Contract' : isToken ? 'Token' : 'Address'}
                </h1>
                {isContract && (
                  <span className="badge bg-neon/20 text-neon">Smart Contract</span>
                )}
                {isToken && (
                  <span className="badge bg-warning/20 text-warning">{tokenInfo?.symbol}</span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs md:text-sm text-mist hover:text-electric transition-colors mt-1 max-w-full min-w-0 w-full"
              >
                <span className="font-mono truncate min-w-0">{address}</span>
                <span className="flex-shrink-0">
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={handleFaucet}
            disabled={faucetMutation.isPending}
            className="btn-ghost flex items-center gap-2 border border-electric/30 hover:border-electric hover:bg-electric/10 self-start lg:self-auto"
          >
            {faucetMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Droplets size={18} className="text-electric" />
            )}
            <span className="text-electric">Get Test MVM</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Balance"
            value={accountLoading ? '...' : `${formatBalance(balance)} MVM`}
            icon={Coins}
          />
          <StatCard
            label="Transactions"
            value={txsLoading ? '...' : transactions.length.toString()}
            icon={Activity}
          />
          <StatCard
            label="Nonce"
            value={accountLoading ? '...' : nonce.toString()}
            icon={FileCode}
          />
          {isToken && tokenInfo && (
            <StatCard
              label="Total Supply"
              value={formatBalance(tokenInfo.total_supply, tokenInfo.decimals)}
              icon={Coins}
            />
          )}
        </div>
      </motion.div>

      {/* Token Info */}
      {isToken && tokenInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-ghost mb-4">Token Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoItem label="Name" value={tokenInfo.name} />
            <InfoItem label="Symbol" value={tokenInfo.symbol} />
            <InfoItem label="Decimals" value={tokenInfo.decimals} />
            <InfoItem label="Total Supply" value={formatBalance(tokenInfo.total_supply, tokenInfo.decimals)} />
            <InfoItem label="Holders" value={holderCount.toString()} />
            <InfoItem label="Owner" value={formatAddress(tokenInfo.owner || tokenInfo.creator)} link={`/address/${tokenInfo.owner || tokenInfo.creator}`} />
          </div>
        </motion.div>
      )}

      {/* Contract Info */}
      {isContract && contractInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-ghost mb-4">Contract Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoItem label="Name" value={contractInfo.name} />
            <InfoItem label="Owner" value={formatAddress(contractInfo.owner)} link={`/address/${contractInfo.owner}`} />
          </div>
          <Link 
            to={`/contracts?address=${address}`}
            className="inline-flex items-center gap-2 mt-4 text-sm text-electric hover:text-ice"
          >
            <ExternalLink size={14} />
            View in Contract IDE
          </Link>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 p-1 bg-abyss rounded-lg overflow-x-auto">
          <Tabs.Trigger
            value="transactions"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === 'transactions' ? 'bg-cyber text-white' : 'text-mist hover:text-ghost hover:bg-deep'}`}
          >
            Transactions ({transactions.length})
          </Tabs.Trigger>
          {isToken && (
            <Tabs.Trigger
              value="token_transfers"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'token_transfers' ? 'bg-cyber text-white' : 'text-mist hover:text-ghost hover:bg-deep'}`}
            >
              Token Transfers
            </Tabs.Trigger>
          )}
          <Tabs.Trigger
            value="tokens"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === 'tokens' ? 'bg-cyber text-white' : 'text-mist hover:text-ghost hover:bg-deep'}`}
          >
            {isToken ? 'Token Holders' : 'Token Holdings'}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="transactions" className="mt-4">
          <TransactionsList transactions={transactions} address={address} loading={txsLoading} />
        </Tabs.Content>

        {isToken && (
          <Tabs.Content value="token_transfers" className="mt-4">
            <TokenTransfersList transactions={transactions} tokenAddress={address} decimals={tokenInfo?.decimals ?? 8} symbol={tokenInfo?.symbol ?? ''} />
          </Tabs.Content>
        )}

        <Tabs.Content value="tokens" className="mt-4">
          {isToken ? (
            <TokenHoldersList tokenAddress={address} decimals={tokenInfo?.decimals ?? 8} symbol={tokenInfo?.symbol ?? ''} />
          ) : (
            <TokenHoldings address={address} tokens={tokensData?.tokens || []} />
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

// Sub Components
function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="p-3 md:p-4 rounded-lg bg-deep/50">
      <div className="flex items-center gap-2 text-mist text-xs md:text-sm mb-1">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-sm md:text-lg font-semibold text-ghost truncate">{value}</div>
    </div>
  )
}

function InfoItem({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="p-3 rounded-lg bg-deep/50">
      <p className="text-xs text-mist mb-1">{label}</p>
      {link ? (
        <Link to={link} className="text-electric hover:text-ice font-mono text-sm">
          {value}
        </Link>
      ) : (
        <p className="text-ghost">{value}</p>
      )}
    </div>
  )
}

function TransactionsList({
  transactions,
  address: _address,
  loading
}: {
  transactions: any[]
  address: string
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-mist">
          No transactions found for this address
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <TxCard key={tx.hash} tx={tx} />
      ))}
    </div>
  )
}

function TokenHoldings({ address, tokens }: { address: string; tokens: any[] }) {
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalances = async () => {
      const newBalances: Record<string, number> = {}
      for (const token of tokens) {
        try {
          const res = await api.getTokenBalance(token.address, address)
          newBalances[token.address] = res.balance_raw
        } catch {
          newBalances[token.address] = 0
        }
      }
      setBalances(newBalances)
      setLoading(false)
    }
    
    if (tokens.length > 0) {
      fetchBalances()
    } else {
      setLoading(false)
    }
  }, [address, tokens])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const holdingTokens = tokens.filter(t => balances[t.address] > 0)

  if (holdingTokens.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-mist">
          No token holdings found
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {holdingTokens.map((token) => (
        <Card key={token.address} hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon to-glow flex items-center justify-center text-white font-bold">
              {token.symbol.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ghost truncate">{token.name}</div>
              <div className="text-sm text-mist">{token.symbol}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-deep">
            <div className="text-lg font-mono text-ghost">
              {formatBalance(balances[token.address], token.decimals)}
            </div>
            <div className="text-xs text-mist">{token.symbol}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function TokenHoldersList({ tokenAddress, decimals, symbol }: { tokenAddress: string; decimals: number; symbol: string }) {
  const [holders, setHolders] = useState<{ address: string; balance_raw: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHolders = async () => {
      try {
        const res = await api.getTokenHolders(tokenAddress)
        setHolders(res.holders || [])
      } catch {
        setHolders([])
      }
      setLoading(false)
    }
    fetchHolders()
  }, [tokenAddress])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (holders.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-mist">
          No holders found
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-ghost">
          Holders ({holders.length})
        </h3>
      </div>
      <div className="space-y-2">
        {holders.map((holder, i) => (
          <Link
            key={holder.address}
            to={`/address/${holder.address}`}
            className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors gap-2"
          >
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-cyber to-electric flex items-center justify-center text-white font-bold text-[10px] md:text-sm flex-shrink-0">
                {i + 1}
              </div>
              <span className="font-mono text-xs md:text-sm text-electric truncate">
                {formatAddress(holder.address, 6)}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-mono text-xs md:text-sm text-ghost">
                {formatBalance(holder.balance_raw, decimals)}
              </div>
              <div className="text-[10px] md:text-xs text-mist">{symbol}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}

function TokenTransfersList({ transactions, tokenAddress, decimals, symbol }: { transactions: any[]; tokenAddress: string; decimals: number; symbol: string }) {
  // Filter to only token-related transactions (transfer_token, create_token where data.contract matches)
  const tokenTxs = transactions.filter((tx: any) => {
    const txType = tx.tx_type?.toLowerCase?.() || ''
    if (txType === 'create_token' || txType === 'createtoken') return true
    if (txType === 'transfer_token' || txType === 'transfertoken') {
      const data = tx.data
      if (!data) return false
      const contract = data.TransferToken?.contract || data.contract
      return contract === tokenAddress
    }
    return false
  })

  if (tokenTxs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-mist">
          No token transfers yet
        </div>
      </Card>
    )
  }

  return (
    <Card>
      {/* Mobile: card layout */}
      <div className="space-y-3 md:hidden">
        {tokenTxs.map((tx: any) => {
          const data = tx.data || {}
          const transferTo = data.TransferToken?.to || data.to || '—'
          const amount = data.TransferToken?.amount || data.amount || 0
          const isCreate = tx.tx_type?.includes('create')
          return (
            <div key={tx.hash} className="p-3 rounded-lg bg-deep/30 border border-deep space-y-2">
              <div className="flex items-center justify-between">
                <Link to={`/tx/${tx.hash}`} className="text-electric hover:text-cyber font-mono text-xs">
                  {formatAddress(tx.hash, 10)}
                </Link>
                <span className={`px-2 py-0.5 rounded-full text-xs ${isCreate ? 'bg-success/20 text-success' : 'bg-neon/20 text-neon'}`}>
                  {isCreate ? 'Create' : 'Transfer'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-mist">From: <Link to={`/address/${tx.from}`} className="text-ghost font-mono">{formatAddress(tx.from, 6)}</Link></span>
                {transferTo !== '—' && <span className="text-mist">To: <Link to={`/address/${transferTo}`} className="text-ghost font-mono">{formatAddress(transferTo, 6)}</Link></span>}
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono text-ghost">{amount > 0 ? `${formatBalance(amount, decimals)} ${symbol}` : '—'}</span>
                <span className="text-mist">{formatTimeAgo(tx.timestamp)}</span>
              </div>
            </div>
          )
        })}
      </div>
      {/* Desktop: table layout */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-mist border-b border-deep">
              <th className="pb-3 pr-4">Hash</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">From</th>
              <th className="pb-3 pr-4">To</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {tokenTxs.map((tx: any) => {
              const data = tx.data || {}
              const transferTo = data.TransferToken?.to || data.to || '—'
              const amount = data.TransferToken?.amount || data.amount || 0
              return (
                <tr key={tx.hash} className="border-b border-deep/50 hover:bg-deep/30">
                  <td className="py-3 pr-4">
                    <Link to={`/tx/${tx.hash}`} className="text-electric hover:text-cyber font-mono">
                      {formatAddress(tx.hash, 8)}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      tx.tx_type?.includes('create') ? 'bg-success/20 text-success' : 'bg-neon/20 text-neon'
                    }`}>
                      {tx.tx_type?.includes('create') ? 'Create' : 'Transfer'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <Link to={`/address/${tx.from}`} className="text-mist hover:text-ghost font-mono">
                      {formatAddress(tx.from, 4)}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    {transferTo !== '—' ? (
                      <Link to={`/address/${transferTo}`} className="text-mist hover:text-ghost font-mono">
                        {formatAddress(transferTo, 4)}
                      </Link>
                    ) : (
                      <span className="text-mist">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-mono text-ghost">
                    {amount > 0 ? `${formatBalance(amount, decimals)} ${symbol}` : '—'}
                  </td>
                  <td className="py-3 text-mist">
                    {formatTimeAgo(tx.timestamp)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}