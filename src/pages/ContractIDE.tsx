import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import {
  FileCode, Play, Upload, Eye, Code, CheckCircle, XCircle, Loader,
  RefreshCw, ChevronDown, ChevronRight, Terminal, Zap, AlertTriangle,
  Copy, Check, ExternalLink, Send, BookOpen, Clock, User,
  Database, Map, Activity, Box, Coins, Droplets
} from 'lucide-react'
import { api } from '@/lib/api'
import { useWalletStore } from '@/store/walletStore'
import { formatAddress, copyToClipboard, formatTimeAgo, formatBalance } from '@/lib/format'
import { compile, SAMPLE_CONTRACTS, type CompileResult } from '@/lib/moshCompiler'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Card from '@/components/common/Card'
import MoshEditor from '@/components/ide/MoshEditor'

export default function ContractIDE() {
  const [searchParams] = useSearchParams()
  const addressParam = searchParams.get('address')
  const tabParam = searchParams.get('tab') as 'contracts' | 'tokens' | 'deploy' | null
  const tokenParam = searchParams.get('token')

  const [activeTab, setActiveTab] = useState<'contracts' | 'tokens' | 'deploy'>(tabParam || 'contracts')
  const [selectedContract, setSelectedContract] = useState<string | null>(addressParam)
  const [selectedToken, setSelectedToken] = useState<string | null>(tokenParam)
  
  const { address: walletAddress, privateKey, isConnected, setShowWalletModal } = useWalletStore()
  
  // User's contracts and tokens
  const [userContracts, setUserContracts] = useState<any[]>([])
  const [userTokens, setUserTokens] = useState<any[]>([])
  const [loadingContracts, setLoadingContracts] = useState(false)

  // Load user's contracts and tokens
  const loadUserContracts = async () => {
    if (!isConnected || !walletAddress) {
      setUserContracts([])
      setUserTokens([])
      return
    }

    setLoadingContracts(true)
    try {
      const [contractsRes, tokensRes] = await Promise.all([
        api.getContractsByCreator(walletAddress),
        api.getTokensByCreator(walletAddress),
      ])
      setUserContracts(contractsRes.contracts || [])
      setUserTokens(tokensRes.tokens || [])
    } catch (err) {
      console.error('Failed to load contracts/tokens:', err)
      setUserContracts([])
      setUserTokens([])
    } finally {
      setLoadingContracts(false)
    }
  }

  useEffect(() => {
    loadUserContracts()
  }, [isConnected, walletAddress])

  useEffect(() => {
    if (addressParam) {
      setSelectedContract(addressParam)
    }
  }, [addressParam])

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam)
    if (tokenParam) setSelectedToken(tokenParam)
  }, [tabParam, tokenParam])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ghost">Smart Contracts</h1>
          <p className="text-mist mt-1">Deploy and interact with Mosh contracts</p>
        </div>
        <button 
          onClick={loadUserContracts}
          disabled={loadingContracts}
          className="btn-ghost flex items-center gap-2"
        >
          <RefreshCw size={16} className={loadingContracts ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Main Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <Tabs.List className="flex gap-1 p-1 bg-abyss rounded-lg overflow-x-auto">
          <Tabs.Trigger
            value="contracts"
            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === 'contracts' ? 'bg-cyber text-white' : 'text-mist hover:text-ghost hover:bg-deep'}`}
          >
            <FileCode size={16} />
            <span className="hidden sm:inline">My</span> Contracts
            {userContracts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-deep hidden sm:inline">
                {userContracts.length}
              </span>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tokens"
            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === 'tokens' ? 'bg-cyber text-white' : 'text-mist hover:text-ghost hover:bg-deep'}`}
          >
            <Coins size={16} />
            <span className="hidden sm:inline">My</span> Tokens
            {userTokens.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-deep hidden sm:inline">
                {userTokens.length}
              </span>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="deploy"
            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === 'deploy' ? 'bg-cyber text-white' : 'text-mist hover:text-ghost hover:bg-deep'}`}
          >
            <Upload size={16} />
            Deploy<span className="hidden sm:inline"> New</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* My Contracts Tab */}
        <Tabs.Content value="contracts" className="mt-6">
          {!isConnected ? (
            <Card className="text-center py-12">
              <FileCode size={48} className="mx-auto text-mist mb-4" />
              <h3 className="text-lg font-medium text-ghost mb-2">Connect Wallet</h3>
              <p className="text-mist mb-4">Connect your wallet to see your deployed contracts</p>
              <button onClick={() => setShowWalletModal(true)} className="btn-primary">
                Connect Wallet
              </button>
            </Card>
          ) : loadingContracts ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : userContracts.length === 0 ? (
            <Card className="text-center py-12">
              <FileCode size={48} className="mx-auto text-mist mb-4" />
              <h3 className="text-lg font-medium text-ghost mb-2">No Contracts Yet</h3>
              <p className="text-mist mb-4">Deploy a smart contract to get started</p>
              <button onClick={() => setActiveTab('deploy')} className="btn-primary">
                Deploy Contract
              </button>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Sidebar — Contracts */}
              <div className="lg:col-span-3 space-y-2">
                {userContracts.map((contract: any) => (
                  <motion.button
                    key={contract.address}
                    onClick={() => setSelectedContract(contract.address)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedContract === contract.address
                        ? 'border-cyber bg-cyber/10'
                        : 'border-deep bg-abyss hover:border-cyber/50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedContract === contract.address ? 'bg-cyber/20' : 'bg-deep'
                      }`}>
                        <FileCode size={18} className={
                          selectedContract === contract.address ? 'text-cyber' : 'text-mist'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ghost text-sm">{contract.name}</div>
                        <div className="text-xs text-mist font-mono truncate">
                          {formatAddress(contract.address, 6)}
                        </div>
                        <div className="text-xs text-mist mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTimeAgo(contract.created_at)}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Detail Panel */}
              <div className="lg:col-span-9">
                {selectedContract ? (
                  <ContractDetail
                    address={selectedContract}
                    walletAddress={walletAddress}
                    privateKey={privateKey}
                    isConnected={isConnected}
                    onConnectWallet={() => setShowWalletModal(true)}
                  />
                ) : (
                  <Card className="text-center py-16">
                    <BookOpen size={48} className="mx-auto text-mist mb-4" />
                    <p className="text-mist">Select a contract to view details</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* My Tokens Tab */}
        <Tabs.Content value="tokens" className="mt-6">
          {!isConnected ? (
            <Card className="text-center py-12">
              <Coins size={48} className="mx-auto text-mist mb-4" />
              <h3 className="text-lg font-medium text-ghost mb-2">Connect Wallet</h3>
              <p className="text-mist mb-4">Connect your wallet to see your created tokens</p>
              <button onClick={() => setShowWalletModal(true)} className="btn-primary">
                Connect Wallet
              </button>
            </Card>
          ) : loadingContracts ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : userTokens.length === 0 ? (
            <Card className="text-center py-12">
              <Coins size={48} className="mx-auto text-mist mb-4" />
              <h3 className="text-lg font-medium text-ghost mb-2">No Tokens Yet</h3>
              <p className="text-mist mb-4">Create an MVM20 token to get started</p>
              <Link to="/tokens/create" className="btn-primary inline-flex items-center gap-2">
                Create Token
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Sidebar — Tokens */}
              <div className="lg:col-span-3 space-y-2">
                {userTokens.map((token: any) => (
                  <motion.button
                    key={token.address}
                    onClick={() => setSelectedToken(token.address)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedToken === token.address
                        ? 'border-warning bg-warning/10'
                        : 'border-deep bg-abyss hover:border-warning/50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedToken === token.address ? 'bg-warning/20' : 'bg-deep'
                      }`}>
                        <Coins size={18} className={
                          selectedToken === token.address ? 'text-warning' : 'text-mist'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ghost text-sm">{token.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-warning/20 text-warning">
                            {token.symbol}
                          </span>
                        </div>
                        <div className="text-xs text-mist font-mono truncate">
                          {formatAddress(token.address, 6)}
                        </div>
                        <div className="text-xs text-mist mt-1">
                          Supply: {formatBalance(token.total_supply, token.decimals)}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Detail Panel */}
              <div className="lg:col-span-9">
                {selectedToken ? (
                  <TokenDetail
                    token={userTokens.find((t: any) => t.address === selectedToken)!}
                    walletAddress={walletAddress}
                    privateKey={privateKey}
                    isConnected={isConnected}
                    onConnectWallet={() => setShowWalletModal(true)}
                  />
                ) : (
                  <Card className="text-center py-16">
                    <Coins size={48} className="mx-auto text-mist mb-4" />
                    <p className="text-mist">Select a token to view details and functions</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* Deploy Tab */}
        <Tabs.Content value="deploy" className="mt-6">
          <DeployContract 
            walletAddress={walletAddress}
            privateKey={privateKey}
            isConnected={isConnected}
            onConnectWallet={() => setShowWalletModal(true)}
            onDeploySuccess={(address) => {
              loadUserContracts()
              setSelectedContract(address)
              setActiveTab('contracts')
            }}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

// ============================================================
// CONTRACT DETAIL COMPONENT
// ============================================================

interface ContractDetailProps {
  address: string
  walletAddress: string | null
  privateKey: string | null
  isConnected: boolean
  onConnectWallet: () => void
}

function ContractDetail({ 
  address, 
  walletAddress, 
  privateKey, 
  isConnected,
  onConnectWallet 
}: ContractDetailProps) {
  const [contract, setContract] = useState<any>(null)
  const [mbi, setMbi] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<'overview' | 'variables' | 'mappings' | 'functions' | 'transactions'>('overview')

  // Load contract details
  useEffect(() => {
    const loadContract = async () => {
      setLoading(true)
      setError('')
      try {
        // Get contract details - includes functions, variables, mappings at top level
        const contractRes = await api.getContract(address)
        
        // The response has contract info and functions/variables/mappings at top level
        setContract(contractRes.contract || contractRes)
        
        // Build MBI from the response
        setMbi({
          functions: contractRes.functions || [],
          variables: contractRes.variables || [],
          mappings: contractRes.mappings || [],
        })
        
        // Contract transactions - skip if fails (some backends don't support this)
        try {
          const txRes = await api.getAddressTransactions(address)
          setTransactions(txRes.transactions || [])
        } catch {
          // Transactions endpoint might not work for contracts
          setTransactions([])
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load contract')
      } finally {
        setLoading(false)
      }
    }
    loadContract()
  }, [address])

  const handleCopy = async () => {
    await copyToClipboard(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <Card className="flex justify-center py-16">
        <LoadingSpinner />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-16">
        <XCircle size={48} className="mx-auto text-error mb-4" />
        <p className="text-error">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Contract Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyber/20">
                <FileCode size={24} className="text-cyber" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ghost">{contract?.name || 'Contract'}</h2>
                <div className="flex items-center gap-2 mt-1 min-w-0">
                  <code className="text-xs sm:text-sm text-electric font-mono truncate">{address}</code>
                  <button onClick={handleCopy} className="text-mist hover:text-ghost transition-colors flex-shrink-0">
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                  <Link to={`/address/${address}`} className="text-mist hover:text-cyber transition-colors flex-shrink-0">
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-2 md:gap-4 text-sm">
            <div className="text-center px-3 md:px-4 py-2 bg-deep rounded-lg">
              <div className="text-xs md:text-sm text-mist">Functions</div>
              <div className="text-base md:text-lg font-bold text-ghost">{mbi?.functions?.length || 0}</div>
            </div>
            <div className="text-center px-3 md:px-4 py-2 bg-deep rounded-lg">
              <div className="text-xs md:text-sm text-mist">Variables</div>
              <div className="text-base md:text-lg font-bold text-ghost">{mbi?.variables?.length || 0}</div>
            </div>
            <div className="text-center px-3 md:px-4 py-2 bg-deep rounded-lg">
              <div className="text-xs md:text-sm text-mist">Mappings</div>
              <div className="text-base md:text-lg font-bold text-ghost">{mbi?.mappings?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Owner & Created */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-deep text-sm">
          <div className="flex items-center gap-2 text-mist">
            <User size={14} />
            <span>Owner:</span>
            <Link to={`/address/${contract?.owner}`} className="text-electric hover:text-cyber font-mono">
              {formatAddress(contract?.owner || '', 6)}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-mist">
            <Clock size={14} />
            <span>Created:</span>
            <span className="text-ghost">{contract?.created_at ? formatTimeAgo(contract.created_at) : 'Unknown'}</span>
          </div>
        </div>
      </Card>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-abyss rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'variables', label: 'Variables', icon: Database, count: mbi?.variables?.length },
          { id: 'mappings', label: 'Mappings', icon: Map, count: mbi?.mappings?.length },
          { id: 'functions', label: 'Functions', icon: Zap, count: mbi?.functions?.length },
          { id: 'transactions', label: 'Transactions', icon: Activity, count: transactions.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'bg-cyber text-white'
                : 'text-mist hover:text-ghost hover:bg-deep'
            }`}
          >
            <tab.icon size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-deep/50">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeSection === 'overview' && (
            <ContractOverview contract={contract} mbi={mbi} transactions={transactions} />
          )}
          {activeSection === 'variables' && (
            <ContractVariables address={address} variables={mbi?.variables || []} />
          )}
          {activeSection === 'mappings' && (
            <ContractMappings address={address} mappings={mbi?.mappings || []} />
          )}
          {activeSection === 'functions' && (
            <ContractFunctions 
              address={address}
              functions={mbi?.functions || []}
              walletAddress={walletAddress}
              privateKey={privateKey}
              isConnected={isConnected}
              onConnectWallet={onConnectWallet}
            />
          )}
          {activeSection === 'transactions' && (
            <ContractTransactions transactions={transactions} contractAddress={address} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// TOKEN DETAIL COMPONENT
// ============================================================

interface TokenDetailProps {
  token: any
  walletAddress?: string | null
  privateKey?: string | null
  isConnected?: boolean
  onConnectWallet?: () => void
}

function TokenDetail({ token, walletAddress, privateKey, isConnected, onConnectWallet }: TokenDetailProps) {
  const [holders, setHolders] = useState<{ address: string; balance_raw: number }[]>([])
  const [holderCount, setHolderCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // balance_of state
  const [balanceAddr, setBalanceAddr] = useState('')
  const [balanceResult, setBalanceResult] = useState<string | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState('')

  // transfer state
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferResult, setTransferResult] = useState<string | null>(null)
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState('')

  // token transactions
  const [tokenTxs, setTokenTxs] = useState<any[]>([])
  const [txsLoading, setTxsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setTxsLoading(true)
      try {
        const [holdersRes, txsRes] = await Promise.all([
          api.getTokenHolders(token.address),
          api.getAddressTransactions(token.address).catch(() => ({ transactions: [] })),
        ])
        setHolders(holdersRes.holders || [])
        setHolderCount(holdersRes.holder_count ?? 0)
        setTokenTxs(txsRes.transactions || [])
      } catch {
        setHolders([])
        setTokenTxs([])
      }
      setLoading(false)
      setTxsLoading(false)
    }
    fetchData()
  }, [token.address])

  const handleCopy = async () => {
    await copyToClipboard(token.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBalanceOf = async () => {
    if (!balanceAddr.trim()) return
    setBalanceLoading(true)
    setBalanceError('')
    setBalanceResult(null)
    try {
      const res = await api.getTokenBalance(token.address, balanceAddr.trim())
      setBalanceResult(formatBalance(res.balance_raw, token.decimals))
    } catch (err: any) {
      setBalanceError(err.message || 'Failed to fetch balance')
    } finally {
      setBalanceLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!isConnected || !walletAddress || !privateKey) {
      onConnectWallet?.()
      return
    }
    if (!transferTo.trim() || !transferAmount.trim()) return

    setTransferLoading(true)
    setTransferError('')
    setTransferResult(null)
    try {
      // Check balance before broadcasting
      const balRes = await api.getBalance(walletAddress)
      const bal = balRes.balance_raw || 0
      if (bal < 100_000_000) {
        throw new Error(`Insufficient balance: need at least 1.0 MVM for gas, have ${(bal / 1e8).toFixed(4)} MVM. Go to /wallet to use the faucet.`)
      }

      const rawAmount = Math.floor(parseFloat(transferAmount) * Math.pow(10, token.decimals))
      const res = await api.transferToken(privateKey, walletAddress, token.address, transferTo.trim(), rawAmount)
      setTransferResult(res.hash || res.tx_hash || 'Transaction submitted')
      setTransferTo('')
      setTransferAmount('')
    } catch (err: any) {
      setTransferError(err.message || 'Transfer failed')
    } finally {
      setTransferLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Token Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-warning/20">
                <Coins size={24} className="text-warning" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-ghost">{token.name}</h2>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning font-medium">
                    {token.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 min-w-0">
                  <code className="text-xs sm:text-sm text-electric font-mono truncate">{token.address}</code>
                  <button onClick={handleCopy} className="text-mist hover:text-ghost transition-colors flex-shrink-0">
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                  <Link to={`/address/${token.address}`} className="text-mist hover:text-cyber transition-colors flex-shrink-0">
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4 pt-4 border-t border-deep">
          <div className="p-2 md:p-3 bg-deep rounded-lg text-center">
            <div className="text-xs text-mist">Total Supply</div>
            <div className="text-sm md:text-lg font-bold text-ghost truncate">{formatBalance(token.total_supply, token.decimals)}</div>
          </div>
          <div className="p-2 md:p-3 bg-deep rounded-lg text-center">
            <div className="text-xs text-mist">Decimals</div>
            <div className="text-sm md:text-lg font-bold text-ghost">{token.decimals}</div>
          </div>
          <div className="p-2 md:p-3 bg-deep rounded-lg text-center">
            <div className="text-xs text-mist">Holders</div>
            <div className="text-sm md:text-lg font-bold text-ghost">{holderCount}</div>
          </div>
          <div className="p-2 md:p-3 bg-deep rounded-lg text-center">
            <div className="text-xs text-mist">Symbol</div>
            <div className="text-sm md:text-lg font-bold text-ghost">{token.symbol}</div>
          </div>
        </div>
      </Card>

      {/* Token Functions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Read: balance_of */}
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-ghost mb-4 flex items-center gap-2 flex-wrap">
            <Eye size={18} className="text-neon" />
            Read Functions
            <span className="text-xs px-2 py-0.5 rounded-full bg-neon/20 text-neon">No gas</span>
          </h3>
          <div className="p-4 bg-deep rounded-lg space-y-3">
            <div className="font-mono text-sm text-ghost">balance_of</div>
            <input
              type="text"
              value={balanceAddr}
              onChange={(e) => setBalanceAddr(e.target.value)}
              placeholder="Enter address..."
              className="input w-full text-sm"
            />
            <button
              onClick={handleBalanceOf}
              disabled={balanceLoading || !balanceAddr.trim()}
              className="w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 bg-neon text-void hover:bg-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {balanceLoading ? <Loader size={16} className="animate-spin" /> : <Eye size={16} />}
              Read
            </button>
            {balanceResult !== null && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                <div className="text-xs text-success font-medium mb-1">Balance</div>
                <div className="font-mono text-ghost">{balanceResult} {token.symbol}</div>
              </div>
            )}
            {balanceError && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
                {balanceError}
              </div>
            )}
          </div>
        </Card>

        {/* Write: transfer */}
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-ghost mb-4 flex items-center gap-2 flex-wrap">
            <Send size={18} className="text-warning" />
            Write Functions
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">Requires sig</span>
          </h3>
          {!isConnected && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-warning flex-shrink-0" />
                <span className="text-sm text-warning">Connect wallet to transfer tokens</span>
              </div>
              <button onClick={() => onConnectWallet?.()} className="sm:ml-auto btn-primary text-sm py-1 px-3 w-full sm:w-auto">
                Connect
              </button>
            </div>
          )}
          <div className="p-4 bg-deep rounded-lg space-y-3">
            <div className="font-mono text-sm text-ghost">transfer</div>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="Recipient address..."
              className="input w-full text-sm"
            />
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder={`Amount (${token.symbol})`}
              className="input w-full text-sm"
            />
            <button
              onClick={handleTransfer}
              disabled={transferLoading || !isConnected || !transferTo.trim() || !transferAmount.trim()}
              className="w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 bg-warning text-void hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transferLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              Transfer
            </button>
            {transferResult && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                <div className="text-xs text-success font-medium mb-1">Transaction</div>
                <div className="font-mono text-ghost text-sm break-all">{transferResult}</div>
              </div>
            )}
            {transferError && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                <div className="text-sm text-error">{transferError}</div>
                {transferError.includes('Insufficient balance') && (
                  <Link to="/wallet" className="mt-2 flex items-center gap-1 text-xs text-electric hover:text-cyber transition-colors">
                    <Droplets size={12} />
                    Go to Wallet to use the faucet
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Token Transactions */}
      <Card>
        <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyber" />
          Token Transactions ({tokenTxs.length})
        </h3>
        {txsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : tokenTxs.length === 0 ? (
          <div className="text-center py-8 text-mist">No transactions yet</div>
        ) : (
          <>
          {/* Mobile: card layout */}
          <div className="space-y-3 md:hidden">
            {tokenTxs.map((tx: any) => {
              const data = tx.data || {}
              const transferToAddr = data.TransferToken?.to || data.to || null
              const amount = data.TransferToken?.amount || data.amount || 0
              const txType = tx.tx_type || ''
              const isCreate = txType.toLowerCase().includes('create')
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
                    {transferToAddr && <span className="text-mist">To: <Link to={`/address/${transferToAddr}`} className="text-ghost font-mono">{formatAddress(transferToAddr, 6)}</Link></span>}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-ghost">{amount > 0 ? `${formatBalance(amount, token.decimals)} ${token.symbol}` : '—'}</span>
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
                  const transferToAddr = data.TransferToken?.to || data.to || null
                  const amount = data.TransferToken?.amount || data.amount || 0
                  const txType = tx.tx_type || ''
                  const isCreate = txType.toLowerCase().includes('create')
                  return (
                    <tr key={tx.hash} className="border-b border-deep/50 hover:bg-deep/30">
                      <td className="py-3 pr-4">
                        <Link to={`/tx/${tx.hash}`} className="text-electric hover:text-cyber font-mono">
                          {formatAddress(tx.hash, 8)}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          isCreate ? 'bg-success/20 text-success' : 'bg-neon/20 text-neon'
                        }`}>
                          {isCreate ? 'Create' : 'Transfer'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Link to={`/address/${tx.from}`} className="text-mist hover:text-ghost font-mono">
                          {formatAddress(tx.from, 4)}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        {transferToAddr ? (
                          <Link to={`/address/${transferToAddr}`} className="text-mist hover:text-ghost font-mono">
                            {formatAddress(transferToAddr, 4)}
                          </Link>
                        ) : (
                          <span className="text-mist">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-mono text-ghost">
                        {amount > 0 ? `${formatBalance(amount, token.decimals)} ${token.symbol}` : '—'}
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
          </>
        )}
      </Card>

      {/* Holders List */}
      <Card>
        <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
          <User size={18} className="text-warning" />
          Token Holders ({holderCount})
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : holders.length === 0 ? (
          <div className="text-center py-8 text-mist">No holders found</div>
        ) : (
          <div className="space-y-2">
            {holders.map((holder, i) => (
              <Link
                key={holder.address}
                to={`/address/${holder.address}`}
                className="flex items-center justify-between p-3 rounded-lg bg-deep/50 hover:bg-deep transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="font-mono text-xs md:text-sm text-electric truncate">
                    {formatAddress(holder.address, 6)}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm md:text-base text-ghost">
                    {formatBalance(holder.balance_raw, token.decimals)}
                  </div>
                  <div className="text-xs text-mist">{token.symbol}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ============================================================
// CONTRACT OVERVIEW
// ============================================================

function ContractOverview({ contract, mbi: _mbi, transactions }: { contract: any; mbi: any; transactions: any[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Quick Stats */}
      <Card>
        <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyber" />
          Contract Activity
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-deep rounded-lg">
            <span className="text-mist">Total Transactions</span>
            <span className="font-mono text-ghost">{transactions.length}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-deep rounded-lg">
            <span className="text-mist">Contract Calls</span>
            <span className="font-mono text-ghost">
              {transactions.filter(tx => tx.tx_type === 'call_contract').length}
            </span>
          </div>
        </div>
      </Card>

      {/* Contract Info */}
      <Card>
        <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
          <Box size={18} className="text-neon" />
          Contract Info
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-deep rounded-lg">
            <span className="text-mist">Name</span>
            <span className="font-medium text-ghost">{contract?.name}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-deep rounded-lg">
            <span className="text-mist">Has Token</span>
            <span className={`font-medium ${contract?.token ? 'text-success' : 'text-mist'}`}>
              {contract?.token ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card className="md:col-span-2">
          <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
            <Clock size={18} className="text-warning" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx: any) => (
              <Link
                key={tx.hash}
                to={`/tx/${tx.hash}`}
                className="flex items-center justify-between p-3 bg-deep rounded-lg hover:bg-deep/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.tx_type === 'deploy_contract' ? 'bg-success/20' : 'bg-cyber/20'
                  }`}>
                    {tx.tx_type === 'deploy_contract' ? (
                      <Upload size={16} className="text-success" />
                    ) : (
                      <Zap size={16} className="text-cyber" />
                    )}
                  </div>
                  <div>
                    <div className="font-mono text-sm text-ghost">{formatAddress(tx.hash, 8)}</div>
                    <div className="text-xs text-mist">{tx.tx_type}</div>
                  </div>
                </div>
                <div className="text-xs text-mist">{formatTimeAgo(tx.timestamp)}</div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================================
// CONTRACT VARIABLES
// ============================================================

function ContractVariables({ address, variables }: { address: string; variables: any[] }) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadVariable = async (name: string) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    try {
      const res = await api.getContractVar(address, name)
      setValues(prev => ({ ...prev, [name]: res.value }))
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [name]: err.message || 'Failed to load' }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const loadAll = async () => {
    for (const v of variables) {
      await loadVariable(v.name)
    }
  }

  useEffect(() => {
    if (variables.length > 0) loadAll()
  }, [variables])

  if (variables.length === 0) {
    return (
      <Card className="text-center py-12">
        <Database size={48} className="mx-auto text-mist mb-4" />
        <p className="text-mist">No state variables defined</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ghost flex items-center gap-2">
          <Database size={18} className="text-neon" />
          State Variables
        </h3>
        <button onClick={loadAll} className="btn-ghost text-sm flex items-center gap-1">
          <RefreshCw size={14} />
          Refresh All
        </button>
      </div>
      
      <div className="space-y-2">
        {variables.map((v: any) => (
          <div key={v.name} className="p-4 bg-deep rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-mono text-ghost">{v.name}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-abyss text-mist">{v.type}</span>
              </div>
              <button 
                onClick={() => loadVariable(v.name)}
                disabled={loading[v.name]}
                className="text-mist hover:text-ghost transition-colors"
              >
                <RefreshCw size={14} className={loading[v.name] ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-abyss">
              {loading[v.name] ? (
                <div className="text-mist text-sm">Loading...</div>
              ) : errors[v.name] ? (
                <div className="text-error text-sm">{errors[v.name]}</div>
              ) : (
                <div className="font-mono text-electric text-lg">
                  {values[v.name] !== undefined ? String(values[v.name]) : '—'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================
// CONTRACT MAPPINGS
// ============================================================

function ContractMappings({ address, mappings }: { address: string; mappings: any[] }) {
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null)
  const [key, setKey] = useState('')
  const [value, setValue] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadMappingValue = async () => {
    if (!selectedMapping || !key.trim()) return
    
    setLoading(true)
    setError('')
    setValue(null)
    
    try {
      const res = await api.getContractMappingValue(address, selectedMapping, key.trim())
      setValue(res.value)
    } catch (err: any) {
      setError(err.message || 'Failed to load value')
    } finally {
      setLoading(false)
    }
  }

  if (mappings.length === 0) {
    return (
      <Card className="text-center py-12">
        <Map size={48} className="mx-auto text-mist mb-4" />
        <p className="text-mist">No mappings defined</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
        <Map size={18} className="text-electric" />
        Mappings
      </h3>

      {/* Mapping Selector */}
      <div className="grid gap-2 mb-4">
        {mappings.map((m: any) => (
          <button
            key={m.name}
            onClick={() => {
              setSelectedMapping(m.name)
              setValue(null)
              setError('')
            }}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedMapping === m.name
                ? 'border-electric bg-electric/10'
                : 'border-deep bg-deep hover:border-electric/50'
            }`}
          >
            <div className="font-mono text-ghost">{m.name}</div>
            <div className="text-xs text-mist mt-1">
              {m.key_type} → {m.value_type}
            </div>
          </button>
        ))}
      </div>

      {/* Key Input & Lookup */}
      {selectedMapping && (
        <div className="p-4 bg-deep rounded-lg space-y-3">
          <div className="text-sm text-mist">
            Lookup value in <span className="text-electric font-mono">{selectedMapping}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter key..."
              className="input flex-1"
            />
            <button
              onClick={loadMappingValue}
              disabled={loading || !key.trim()}
              className="btn-primary px-4"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Eye size={16} />}
            </button>
          </div>

          {/* Result */}
          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
              {error}
            </div>
          )}
          {value !== null && (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="text-xs text-success mb-1">Value:</div>
              <div className="font-mono text-ghost">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ============================================================
// CONTRACT FUNCTIONS
// ============================================================

interface ContractFunctionsProps {
  address: string
  functions: any[]
  walletAddress: string | null
  privateKey: string | null
  isConnected: boolean
  onConnectWallet: () => void
}

function ContractFunctions({ 
  address, 
  functions, 
  walletAddress, 
  privateKey, 
  isConnected,
  onConnectWallet 
}: ContractFunctionsProps) {
  if (functions.length === 0) {
    return (
      <Card className="text-center py-12">
        <Zap size={48} className="mx-auto text-mist mb-4" />
        <p className="text-mist">No functions defined</p>
      </Card>
    )
  }

  // Helper to check if function is a view function
  const isViewFunction = (f: any): boolean => {
    if (!f.modifiers || !Array.isArray(f.modifiers)) return false
    return f.modifiers.some((m: any) => {
      // Handle string modifiers
      if (typeof m === 'string') {
        return m.toLowerCase().includes('view')
      }
      // Handle object modifiers like {type: "View"}
      if (typeof m === 'object' && m !== null) {
        return Object.values(m).some((v: any) => 
          typeof v === 'string' && v.toLowerCase().includes('view')
        )
      }
      return false
    })
  }

  // Separate view and write functions
  const viewFunctions = functions.filter(isViewFunction)
  const writeFunctions = functions.filter(f => !isViewFunction(f))

  return (
    <div className="space-y-4">
      {/* View Functions */}
      {viewFunctions.length > 0 && (
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-ghost mb-4 flex items-center gap-2 flex-wrap">
            <Eye size={18} className="text-neon" />
            Read Functions
            <span className="text-xs px-2 py-0.5 rounded-full bg-neon/20 text-neon">
              No gas
            </span>
          </h3>
          <div className="space-y-3">
            {viewFunctions.map((func: any) => (
              <FunctionCard
                key={func.name}
                contractAddress={address}
                func={func}
                walletAddress={walletAddress}
                privateKey={privateKey}
                isConnected={isConnected}
                onConnectWallet={onConnectWallet}
                isView={true}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Write Functions */}
      {writeFunctions.length > 0 && (
        <Card>
          <h3 className="text-base md:text-lg font-semibold text-ghost mb-4 flex items-center gap-2 flex-wrap">
            <Send size={18} className="text-warning" />
            Write Functions
            <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
              Requires sig
            </span>
          </h3>
          {!isConnected && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-warning flex-shrink-0" />
                <span className="text-sm text-warning">Connect wallet to execute write functions</span>
              </div>
              <button onClick={onConnectWallet} className="sm:ml-auto btn-primary text-sm py-1 px-3 w-full sm:w-auto">
                Connect
              </button>
            </div>
          )}
          <div className="space-y-3">
            {writeFunctions.map((func: any) => (
              <FunctionCard
                key={func.name}
                contractAddress={address}
                func={func}
                walletAddress={walletAddress}
                privateKey={privateKey}
                isConnected={isConnected}
                onConnectWallet={onConnectWallet}
                isView={false}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================================
// FUNCTION CARD
// ============================================================

interface FunctionCardProps {
  contractAddress: string
  func: any
  walletAddress: string | null
  privateKey: string | null
  isConnected: boolean
  onConnectWallet: () => void
  isView: boolean
}

function FunctionCard({ 
  contractAddress, 
  func, 
  walletAddress, 
  privateKey, 
  isConnected,
  onConnectWallet,
  isView
}: FunctionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [args, setArgs] = useState<string[]>(func.args?.map(() => '') || [])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleCall = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      if (isView) {
        let res = await api.callContractView(contractAddress, func.name, args)
        let value = res.result ?? res.data ?? res.value
        
        // If result is null and function looks like a getter, try auto-getter
        // getCount → get_count, getValue → get_value, etc.
        if ((value === null || value === undefined) && func.name.startsWith('get')) {
          const autoGetterName = func.name.replace(/([A-Z])/g, '_$1').toLowerCase()
          // getCount → get_count
          try {
            const autoRes = await api.callContractView(contractAddress, autoGetterName, args)
            value = autoRes.result ?? autoRes.data ?? autoRes.value
          } catch {
            // Auto-getter failed, use original result
          }
        }
        
        if (value !== null && value !== undefined) {
          setResult(value)
        } else if (res.success) {
          setResult('(no return value)')
        } else {
          setResult(res)
        }
      } else {
        if (!isConnected || !walletAddress || !privateKey) {
          onConnectWallet()
          setError('Connect wallet first')
          setLoading(false)
          return
        }

        // Check balance before broadcasting
        const balRes = await api.getBalance(walletAddress)
        const bal = balRes.balance_raw || 0
        if (bal < 100_000_000) {
          throw new Error(`Insufficient balance: need at least 1.0 MVM for gas, have ${(bal / 1e8).toFixed(4)} MVM. Go to /wallet to use the faucet.`)
        }

        const res = await api.callContract(
          privateKey,
          walletAddress,
          contractAddress,
          func.name,
          args
        )
        setResult(res.hash ? `TX: ${res.hash}` : 'Success!')
      }
    } catch (err: any) {
      setError(err.message || 'Call failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isView ? 'border-neon/30' : 'border-warning/30'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-3 md:p-4 flex items-center justify-between transition-colors ${
          isView ? 'bg-neon/5 hover:bg-neon/10' : 'bg-warning/5 hover:bg-warning/10'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3 flex-wrap min-w-0">
          {expanded ? <ChevronDown size={16} className="text-mist flex-shrink-0" /> : <ChevronRight size={16} className="text-mist flex-shrink-0" />}
          <code className="font-mono font-medium text-ghost text-sm">{func.name}</code>
          {func.modifiers?.map((mod: any, idx: number) => {
            const modStr = typeof mod === 'string' ? mod : String(mod)
            const modLower = modStr.toLowerCase()
            return (
              <span key={idx} className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full hidden sm:inline ${
                modLower.includes('view') ? 'bg-neon/20 text-neon' :
                modLower.includes('public') ? 'bg-electric/20 text-electric' :
                modLower.includes('write') ? 'bg-warning/20 text-warning' :
                modLower.includes('payable') ? 'bg-sol/20 text-sol' :
                modLower.includes('owner') ? 'bg-rust/20 text-rust' :
                'bg-deep text-mist'
              }`}>
                {modStr}
              </span>
            )
          })}
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-mist flex-shrink-0">
          {func.args?.length > 0 && (
            <span>({func.args.length})</span>
          )}
          {func.returns && (
            <span className="hidden sm:inline">→ {func.returns}</span>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-3 md:p-4 space-y-3 md:space-y-4 border-t ${
              isView ? 'border-neon/30 bg-abyss' : 'border-warning/30 bg-abyss'
            }`}>
              {/* Arguments */}
              {func.args?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-mist">Arguments</div>
                  {func.args.map((arg: any, i: number) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-2 sm:items-center">
                      <label className="text-sm text-mist sm:w-24 shrink-0">
                        {arg.name}
                        <span className="text-xs text-deep ml-1">({arg.type})</span>
                      </label>
                      <input
                        type="text"
                        value={args[i] || ''}
                        onChange={(e) => {
                          const newArgs = [...args]
                          newArgs[i] = e.target.value
                          setArgs(newArgs)
                        }}
                        placeholder={`Enter ${arg.type}`}
                        className="input flex-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Call Button */}
              <button
                onClick={handleCall}
                disabled={loading || (!isView && !isConnected)}
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  isView 
                    ? 'bg-neon text-void hover:bg-neon/90' 
                    : 'bg-warning text-void hover:bg-warning/90'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : isView ? (
                  <Eye size={16} />
                ) : (
                  <Send size={16} />
                )}
                {isView ? 'Read' : 'Write'}
              </button>

              {/* Result */}
              {result !== null && (
                <div className="p-2 md:p-3 bg-success/10 border border-success/30 rounded-lg">
                  <div className="text-xs text-success font-medium mb-1">Result</div>
                  <div className="font-mono text-xs md:text-sm text-ghost break-all">
                    {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-2 md:p-3 bg-error/10 border border-error/30 rounded-lg">
                  <div className="text-xs md:text-sm text-error break-words">{error}</div>
                  {error.includes('Insufficient balance') && (
                    <Link to="/wallet" className="mt-2 flex items-center gap-1 text-xs text-electric hover:text-cyber transition-colors">
                      <Droplets size={12} />
                      Go to Wallet to use the faucet
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// CONTRACT TRANSACTIONS
// ============================================================

function ContractTransactions({ transactions, contractAddress: _contractAddress }: { transactions: any[]; contractAddress: string }) {
  if (transactions.length === 0) {
    return (
      <Card className="text-center py-12">
        <Activity size={48} className="mx-auto text-mist mb-4" />
        <p className="text-mist">No transactions yet</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-ghost mb-4 flex items-center gap-2">
        <Activity size={18} className="text-cyber" />
        Transaction History ({transactions.length})
      </h3>

      {/* Mobile: card layout */}
      <div className="space-y-3 md:hidden">
        {transactions.map((tx: any) => (
          <Link
            key={tx.hash}
            to={`/tx/${tx.hash}`}
            className="block p-3 rounded-lg bg-deep/30 border border-deep space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-electric font-mono text-xs">{formatAddress(tx.hash, 10)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                tx.tx_type === 'deploy_contract' ? 'bg-success/20 text-success' :
                tx.tx_type === 'call_contract' ? 'bg-cyber/20 text-cyber' :
                'bg-deep text-mist'
              }`}>
                {tx.tx_type}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-mist">From: <span className="text-ghost font-mono">{formatAddress(tx.from, 6)}</span></span>
              <span className="text-mist">{formatTimeAgo(tx.timestamp)}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-mist border-b border-deep">
              <th className="pb-3 pr-4">Hash</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">From</th>
              <th className="pb-3 pr-4">Value</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any) => (
              <tr key={tx.hash} className="border-b border-deep/50 hover:bg-deep/30">
                <td className="py-3 pr-4">
                  <Link to={`/tx/${tx.hash}`} className="text-electric hover:text-cyber font-mono">
                    {formatAddress(tx.hash, 8)}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    tx.tx_type === 'deploy_contract' ? 'bg-success/20 text-success' :
                    tx.tx_type === 'call_contract' ? 'bg-cyber/20 text-cyber' :
                    'bg-deep text-mist'
                  }`}>
                    {tx.tx_type}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <Link to={`/address/${tx.from}`} className="text-mist hover:text-ghost font-mono">
                    {formatAddress(tx.from, 4)}
                  </Link>
                </td>
                <td className="py-3 pr-4 font-mono text-ghost">
                  {tx.value > 0 ? formatBalance(tx.value) : '0'}
                </td>
                <td className="py-3 text-mist">
                  {formatTimeAgo(tx.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ============================================================
// DEPLOY CONTRACT COMPONENT
// ============================================================

interface DeployContractProps {
  walletAddress: string | null
  privateKey: string | null
  isConnected: boolean
  onConnectWallet: () => void
  onDeploySuccess: (address: string) => void
}

function DeployContract({ 
  walletAddress, 
  privateKey, 
  isConnected, 
  onConnectWallet,
  onDeploySuccess 
}: DeployContractProps) {
  const [code, setCode] = useState(SAMPLE_CONTRACTS.counter)
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<{ success: boolean; address?: string; error?: string } | null>(null)
  const [showSamples, setShowSamples] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  // Editor state
  const isEditing = false
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol] = useState(1)
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-20), `[${time}] ${msg}`])
  }

  // Initial compile on mount
  useEffect(() => {
    const result = compile(code)
    setCompileResult(result)
  }, []) // Only run once on mount

  const handleDeploy = async () => {
    if (!isConnected || !walletAddress || !privateKey) {
      onConnectWallet()
      return
    }

    if (!compileResult?.success || !compileResult.json) return

    setDeploying(true)
    setDeployResult(null)
    setLogs([])

    try {
      addLog('🚀 Starting deployment...')
      addLog(`📍 Wallet: ${formatAddress(walletAddress)}`)
      addLog(`📝 Contract: ${compileResult.json.name}`)

      // Check balance before broadcasting
      addLog('💰 Checking balance...')
      const balRes = await api.getBalance(walletAddress)
      const bal = balRes.balance_raw || 0
      if (bal < 100_000_000) {
        throw new Error(`Insufficient balance: need at least 1.0 MVM for gas, have ${(bal / 1e8).toFixed(4)} MVM. Use the faucet on the Wallet page first.`)
      }
      addLog(`💰 Balance: ${(bal / 1e8).toFixed(4)} MVM ✓`)

      const result = await api.deployContract(privateKey, walletAddress, compileResult.json)
      addLog(`✅ Transaction submitted: ${result.hash || result.tx_hash}`)
      
      if (result.success || result.hash) {
        addLog('⏳ Waiting for confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const contracts = await api.getContractsByCreator(walletAddress)
        const deployed = contracts.contracts?.find((c: any) => c.name === compileResult.json!.name)
        
        if (deployed) {
          addLog(`🎉 Contract deployed at: ${deployed.address}`)
          setDeployResult({ success: true, address: deployed.address })
          onDeploySuccess(deployed.address)
        } else {
          setDeployResult({ success: true })
          addLog('✅ Deployment successful!')
        }
      } else {
        throw new Error(result.message || 'Deployment failed')
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`)
      setDeployResult({ success: false, error: err.message })
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <Card className={`p-0 overflow-hidden transition-all duration-300 ${
        isEditing ? 'ring-2 ring-cyber/50 shadow-lg shadow-cyber/10' : ''
      }`}>
        {/* Editor Header */}
        <div className={`flex flex-wrap items-center justify-between gap-2 p-3 border-b transition-colors ${
          isEditing ? 'border-cyber/30 bg-cyber/5' : 'border-deep'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-cyber/20' : 'bg-deep'}`}>
              <Code size={16} className={isEditing ? 'text-cyber' : 'text-mist'} />
            </div>
            <span className="font-medium text-ghost text-sm">Mosh Editor</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Compile Button */}
            <button
              onClick={() => {
                const result = compile(code)
                setCompileResult(result)
                if (result.success) {
                  addLog('✅ Compiled successfully!')
                  addLog(`📝 Contract: ${result.json?.name}`)
                  addLog(`📊 Variables: ${result.json?.variables.length}, Functions: ${result.json?.functions.length}`)
                  console.log('Compile result:', result.json)
                } else {
                  addLog('❌ Compilation failed')
                  result.errors?.forEach((err: any) => {
                    const errMsg = typeof err === 'string' 
                      ? err 
                      : err.message 
                        ? `Line ${err.line || '?'}: ${err.message}`
                        : JSON.stringify(err)
                    addLog(`   ${errMsg}`)
                  })
                }
              }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Play size={14} />
              Compile
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowSamples(!showSamples)}
                className="btn-ghost text-sm flex items-center gap-1"
              >
                Load Sample
                <ChevronDown size={14} />
              </button>
              {showSamples && (
                <div className="absolute right-0 mt-1 w-48 py-2 bg-abyss border border-deep rounded-lg shadow-xl z-10">
                  {Object.entries(SAMPLE_CONTRACTS).map(([name, sampleCode]) => (
                    <button
                      key={name}
                      onClick={() => {
                        setCode(sampleCode)
                        setShowSamples(false)
                        setDeployResult(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-mist hover:text-ghost hover:bg-deep transition-colors"
                    >
                      {name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="h-[300px] md:h-[460px]">
          <MoshEditor
            value={code}
            onChange={(val) => setCode(val)}
            onCursorChange={(line, col) => {
              setCursorLine(line)
              setCursorCol(col)
            }}
          />
        </div>

        {/* Status Bar */}
        <div className={`flex items-center justify-between px-3 py-1.5 text-xs border-t transition-colors ${
          isEditing ? 'bg-[#161b22] border-cyber/20 text-cyber' : 'bg-abyss border-deep text-mist'
        }`}>
          <div className="flex items-center gap-3">
            <span>Ln {cursorLine}, Col {cursorCol}</span>
            <span className="hidden sm:inline">{code.split('\n').length} lines</span>
            <span className="hidden sm:inline">{code.length} chars</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-deep/50">Mosh</span>
          </div>
        </div>
      </Card>

      {/* Right Panel */}
      <div className="space-y-4">
        {/* Compile Status */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            {compileResult?.success ? (
              <CheckCircle size={24} className="text-success" />
            ) : (
              <XCircle size={24} className="text-error" />
            )}
            <div>
              <div className="font-medium text-ghost">
                {compileResult?.success ? 'Compiled Successfully' : 'Compilation Error'}
              </div>
              {compileResult?.success && compileResult.json && (
                <div className="text-sm text-mist">
                  Contract: <span className="text-electric font-mono">{compileResult.json.name}</span>
                </div>
              )}
            </div>
          </div>

          {compileResult?.errors && compileResult.errors.length > 0 && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg mb-4">
              {compileResult.errors.map((err: any, i: number) => (
                <div key={i} className="text-sm text-error">
                  {typeof err === 'string' 
                    ? err 
                    : err.message 
                      ? `Line ${err.line || '?'}: ${err.message}` 
                      : JSON.stringify(err)
                  }
                </div>
              ))}
            </div>
          )}

          {compileResult?.success && compileResult.json && (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-deep rounded-lg text-center">
                <div className="text-mist">Variables</div>
                <div className="text-lg font-bold text-ghost">{compileResult.json.variables.length}</div>
              </div>
              <div className="p-3 bg-deep rounded-lg text-center">
                <div className="text-mist">Mappings</div>
                <div className="text-lg font-bold text-ghost">{compileResult.json.mappings.length}</div>
              </div>
              <div className="p-3 bg-deep rounded-lg text-center">
                <div className="text-mist">Functions</div>
                <div className="text-lg font-bold text-ghost">{compileResult.json.functions.length}</div>
              </div>
            </div>
          )}

          {/* Show Compiled JSON */}
          {compileResult?.success && compileResult.json && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-mist hover:text-ghost flex items-center gap-2">
                <Terminal size={14} />
                Show Compiled JSON
              </summary>
              <pre className="mt-2 p-3 bg-void border border-deep rounded-lg text-xs text-ghost overflow-auto max-h-[300px]">
                {JSON.stringify(compileResult.json, null, 2)}
              </pre>
            </details>
          )}
        </Card>

        {/* Deploy Button */}
        {!isConnected ? (
          <button onClick={onConnectWallet} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <AlertTriangle size={18} />
            Connect Wallet to Deploy
          </button>
        ) : (
          <button
            onClick={handleDeploy}
            disabled={!compileResult?.success || deploying}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {deploying ? (
              <>
                <Loader size={18} className="animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Upload size={18} />
                Deploy Contract
              </>
            )}
          </button>
        )}

        {/* Deploy Result */}
        {deployResult && (
          <Card className={deployResult.success ? 'border-success/30' : 'border-error/30'}>
            {deployResult.success ? (
              <div>
                <div className="flex items-center gap-2 text-success mb-2">
                  <CheckCircle size={18} />
                  <span className="font-medium">Deployed Successfully!</span>
                </div>
                {deployResult.address && (
                  <div className="p-3 bg-deep rounded-lg">
                    <div className="text-xs text-mist mb-1">Contract Address</div>
                    <code className="text-electric font-mono break-all">{deployResult.address}</code>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-error">
                  <XCircle size={18} />
                  <span>{deployResult.error}</span>
                </div>
                {deployResult.error?.includes('Insufficient balance') && (
                  <Link
                    to="/wallet"
                    className="mt-3 flex items-center gap-2 text-sm text-electric hover:text-cyber transition-colors"
                  >
                    <Droplets size={14} />
                    Go to Wallet to use the faucet
                  </Link>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Console Logs */}
        {logs.length > 0 && (
          <Card className="p-0 overflow-hidden">
            <div className="p-3 border-b border-deep flex items-center gap-2">
              <Terminal size={16} className="text-mist" />
              <span className="text-sm font-medium text-ghost">Console</span>
            </div>
            <div className="p-3 bg-void max-h-48 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((log, i) => (
                <div key={i} className={`${
                  log.includes('❌') ? 'text-error' :
                  log.includes('✅') || log.includes('🎉') ? 'text-success' :
                  log.includes('⏳') ? 'text-warning' :
                  'text-mist'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}