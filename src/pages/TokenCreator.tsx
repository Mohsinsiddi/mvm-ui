import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, Loader, CheckCircle, XCircle, Copy, Check, Zap, Info, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useWalletStore } from '@/store/walletStore'
import { formatAddress, copyToClipboard } from '@/lib/format'
import Card from '@/components/common/Card'

export default function TokenCreator() {
  const { address, privateKey, isConnected } = useWalletStore()
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [supply, setSupply] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)

  // Fetch balance when connected
  useEffect(() => {
    if (!isConnected || !address) { setBalance(null); return }
    api.getBalance(address).then(res => setBalance(res.balance || 0)).catch(() => setBalance(null))
  }, [isConnected, address])

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-15), `[${time}] ${msg}`])
  }

  // Gas cost for CreateToken: 100,000 gas * 1,000 gas_price = 100,000,000
  const CREATE_TOKEN_GAS_COST = 100_000_000

  const handleCreate = async () => {
    if (!isConnected || !address || !privateKey) return
    if (!name.trim() || !symbol.trim() || !supply) {
      setError('Please fill in all fields')
      return
    }

    setDeploying(true)
    setError('')
    setResult(null)
    setLogs([])

    try {
      addLog('Starting MVM-20 token deployment...')
      addLog(`Token: ${name.trim()} (${symbol.trim()})`)
      addLog(`Supply: ${supply}`)

      // Check balance before submitting
      addLog('Checking wallet balance...')
      const balanceRes = await api.getBalance(address)
      const balance = balanceRes.balance || 0

      if (balance < CREATE_TOKEN_GAS_COST) {
        const needed = (CREATE_TOKEN_GAS_COST / 1e8).toFixed(1)
        const have = (balance / 1e8).toFixed(4)
        throw new Error(`Insufficient balance: need ${needed} MVM for gas, have ${have} MVM. Use the faucet to get tokens first.`)
      }
      addLog(`Balance: ${(balance / 1e8).toFixed(4)} MVM ✓`)

      const nonceRes = await api.getPendingNonce(address)
      const currentNonce = nonceRes.pending_nonce
      addLog(`Nonce: ${currentNonce}`)

      const tokenData = { name: name.trim(), symbol: symbol.trim(), total_supply: parseInt(supply) }

      const signResult = await api.signTransaction({
        private_key: privateKey,
        tx_type: 'create_token',
        from: address,
        to: address,
        value: 0,
        nonce: currentNonce,
        data: tokenData,
      })
      addLog(`Signed: ${signResult.tx_hash?.slice(0, 16)}...`)

      const submitResult = await api.submitTransaction({
        tx_type: 'create_token',
        from: address,
        to: address,
        value: 0,
        nonce: currentNonce,
        timestamp: Math.floor(Date.now() / 1000),
        data: tokenData,
        signature: signResult.signature,
        public_key: signResult.public_key,
      })

      addLog(`TX submitted: ${submitResult.hash || submitResult.tx_hash}`)
      addLog('Waiting for confirmation...')
      await new Promise(resolve => setTimeout(resolve, 4000))

      const account = await api.getAccount(address) as any
      const tokens = account?.tokens_created || []
      const newToken = tokens.find((t: any) => t.name === name.trim() && t.symbol === symbol.trim())

      if (newToken) {
        addLog(`Token deployed at: ${newToken.address}`)
        setResult(newToken)
      } else {
        addLog('Token created successfully!')
        setResult({ name: name.trim(), symbol: symbol.trim(), supply })
      }
    } catch (err: any) {
      const msg = err?.message || 'Deployment failed'
      addLog(`Error: ${msg}`)
      setError(msg)
    } finally {
      setDeploying(false)
    }
  }

  const handleCopy = (text: string) => {
    copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ghost flex items-center gap-3">
          <Coins className="text-cyber" />
          Create MVM-20 Token
        </h1>
        <p className="text-mist mt-1">Deploy your own token on the MVM blockchain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-bold text-ghost mb-4">Token Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-mist mb-1">Token Name</label>
                <input
                  className="input"
                  placeholder="e.g. My Token"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={deploying}
                />
              </div>
              <div>
                <label className="block text-sm text-mist mb-1">Symbol</label>
                <input
                  className="input"
                  placeholder="e.g. MTK"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  maxLength={8}
                  disabled={deploying}
                />
              </div>
              <div>
                <label className="block text-sm text-mist mb-1">Total Supply</label>
                <input
                  className="input"
                  placeholder="e.g. 1000000"
                  type="number"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  disabled={deploying}
                />
              </div>

              {!isConnected ? (
                <p className="text-warning text-sm">Connect your wallet to create tokens</p>
              ) : (
                <>
                  {balance !== null && (
                    <div className={`text-sm flex items-center justify-between p-2 rounded ${balance < CREATE_TOKEN_GAS_COST ? 'bg-error/10 border border-error/30' : 'bg-void'}`}>
                      <span className="text-mist">Your Balance</span>
                      <span className={balance < CREATE_TOKEN_GAS_COST ? 'text-error font-bold' : 'text-ghost font-mono'}>
                        {(balance / 1e8).toFixed(4)} MVM
                      </span>
                    </div>
                  )}
                  {balance !== null && balance < CREATE_TOKEN_GAS_COST && (
                    <div className="flex items-center gap-2 text-warning text-sm">
                      <AlertTriangle size={14} />
                      <span>Insufficient balance. Need at least 1.0 MVM for gas. Use the faucet first.</span>
                    </div>
                  )}
                  <button
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    onClick={handleCreate}
                    disabled={deploying || !name || !symbol || !supply || (balance !== null && balance < CREATE_TOKEN_GAS_COST)}
                  >
                    {deploying ? (
                      <><Loader size={16} className="animate-spin" /> Deploying...</>
                    ) : (
                      <><Zap size={16} /> Create Token</>
                    )}
                  </button>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-error text-sm">
                  <XCircle size={14} /> {error}
                </div>
              )}
            </div>
          </Card>

          {/* Info Card */}
          <Card>
            <div className="flex items-start gap-3">
              <Info size={20} className="text-electric flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-ghost mb-1">MVM-20 Standard</h3>
                <p className="text-sm text-mist">
                  MVM-20 is MVM's token standard. All supply is minted to your wallet on creation.
                  Tokens are stored on-chain and can be transferred between any MVM addresses.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results + Console */}
        <div className="space-y-4">
          {result && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-success" />
                <h2 className="text-lg font-bold text-ghost">Token Created!</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mist">Name</span>
                  <span className="text-ghost">{result.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist">Symbol</span>
                  <span className="text-ghost">{result.symbol}</span>
                </div>
                {result.address && (
                  <div className="flex justify-between items-center">
                    <span className="text-mist">Address</span>
                    <button
                      onClick={() => handleCopy(result.address)}
                      className="flex items-center gap-1 text-electric hover:text-ice"
                    >
                      <span className="font-mono text-xs">{formatAddress(result.address)}</span>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Console */}
          <Card>
            <h2 className="text-sm font-bold text-mist mb-2 flex items-center gap-2">
              <span className="text-cyber">$</span> Deployment Console
            </h2>
            <div className="bg-void rounded-lg p-3 h-48 md:h-64 overflow-y-auto font-mono text-xs space-y-0.5">
              {logs.length === 0 ? (
                <p className="text-shadow">Waiting for deployment...</p>
              ) : (
                logs.map((log, i) => (
                  <LogLine key={i} log={log} />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function LogLine({ log }: { log: string }) {
  const isError = log.includes('Error:')
  const isSuccess = log.includes('✓') || log.includes('successfully') || log.includes('deployed at:')
  const isTxHash = log.includes('TX submitted:') || log.includes('Signed:')
  const isWaiting = log.includes('Waiting') || log.includes('Checking')

  const color = isError
    ? 'text-error'
    : isSuccess
    ? 'text-success'
    : isTxHash
    ? 'text-cyber'
    : isWaiting
    ? 'text-warning'
    : 'text-ghost/80'

  // Make addresses and hashes clickable
  const addressMatch = log.match(/deployed at: (mvm1[a-z0-9]+)/)
  const hashMatch = log.match(/TX submitted: ([a-f0-9]+)/)

  if (addressMatch) {
    const addr = addressMatch[1]
    const before = log.slice(0, log.indexOf(addr))
    return (
      <div className={color}>
        {before}
        <a href={`/address/${addr}`} className="text-electric hover:text-ice underline">{addr}</a>
      </div>
    )
  }

  if (hashMatch) {
    const hash = hashMatch[1]
    const before = log.slice(0, log.indexOf(hash))
    return (
      <div className={color}>
        {before}
        <a href={`/tx/${hash}`} className="text-electric hover:text-ice underline">{hash}</a>
      </div>
    )
  }

  return <div className={color}>{log}</div>
}
