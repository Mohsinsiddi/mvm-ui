import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Check,
  Play,
  Loader,
  Send,
  Database,
  Wallet,
  Coins,
  FileCode,
  Trophy,
  Radio,
  Globe
} from 'lucide-react'
// API_URL from constants used for local dev; BASE_URL below for production
import { copyToClipboard } from '@/lib/format'

const BASE_URL = 'https://mvm-chain.duckdns.org'

type HttpMethod = 'GET' | 'POST'

interface Endpoint {
  method: HttpMethod
  path: string
  desc: string
  params?: { name: string; in: 'path' | 'query' | 'body'; type: string; desc: string; required?: boolean; default?: string }[]
  response?: string
  example?: string
}

interface EndpointGroup {
  title: string
  icon: any
  color: string
  desc: string
  endpoints: Endpoint[]
}

const apiGroups: EndpointGroup[] = [
  {
    title: 'Chain',
    icon: Database,
    color: 'text-cyber',
    desc: 'Query blockchain status, blocks, and mempool',
    endpoints: [
      {
        method: 'GET', path: '/', desc: 'Node info and available endpoints',
        response: '{ "node_id", "chain_id", "chain_name", "version", "endpoints": [...] }',
      },
      {
        method: 'GET', path: '/status', desc: 'Chain status including height, peers, and pending txs',
        response: '{ "success", "chain_id", "chain_name", "height", "pending_transactions", "peers", "node_type", "browsers" }',
      },
      {
        method: 'GET', path: '/blocks', desc: 'Recent blocks (paginated)',
        params: [{ name: 'limit', in: 'query', type: 'number', desc: 'Number of blocks to return', default: '20' }],
        response: '{ "success", "blocks": [{ "height", "hash", "previous_hash", "timestamp", "transactions", "validator", "tx_count" }] }',
      },
      {
        method: 'GET', path: '/block/:height', desc: 'Get a specific block by height',
        params: [{ name: 'height', in: 'path', type: 'number', desc: 'Block height', required: true }],
        example: '/block/1',
        response: '{ "success", "block": { "height", "hash", "previous_hash", "timestamp", "transactions", "validator", "tx_count" } }',
      },
      {
        method: 'GET', path: '/block/latest', desc: 'Get the latest block',
        response: '{ "success", "block": { ... } }',
      },
      {
        method: 'GET', path: '/mempool', desc: 'View pending transactions in the mempool',
        response: '{ "success", "pending_transactions": [...], "count" }',
      },
    ],
  },
  {
    title: 'Transactions',
    icon: Send,
    color: 'text-electric',
    desc: 'Query, sign, and submit transactions',
    endpoints: [
      {
        method: 'GET', path: '/txs', desc: 'Recent transactions (paginated)',
        params: [{ name: 'limit', in: 'query', type: 'number', desc: 'Number of transactions', default: '50' }],
        response: '{ "success", "transactions": [{ "hash", "tx_type", "from", "to", "value", "nonce", "timestamp", "status", "gas_used" }] }',
      },
      {
        method: 'GET', path: '/tx/:hash', desc: 'Get transaction details by hash',
        params: [{ name: 'hash', in: 'path', type: 'string', desc: 'Transaction hash (64 hex chars)', required: true }],
        response: '{ "success", "transaction": { "hash", "tx_type", "from", "to", "value", "nonce", "timestamp", "status", "gas_used", "block_height", "error" } }',
      },
      {
        method: 'GET', path: '/txs/:address', desc: 'All transactions for an address',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'MVM address (mvm1...)', required: true }],
        response: '{ "success", "address", "transactions": [...] }',
      },
      {
        method: 'POST', path: '/tx/sign', desc: 'Sign a transaction with a private key',
        params: [
          { name: 'private_key', in: 'body', type: 'string', desc: '64 hex char private key', required: true },
          { name: 'tx_type', in: 'body', type: 'string', desc: 'Transaction type (transfer, create_token, etc.)', required: true },
          { name: 'from', in: 'body', type: 'string', desc: 'Sender address', required: true },
          { name: 'to', in: 'body', type: 'string', desc: 'Recipient address (null for deploys)' },
          { name: 'value', in: 'body', type: 'number', desc: 'Amount in raw units' },
          { name: 'nonce', in: 'body', type: 'number', desc: 'Sender nonce', required: true },
          { name: 'data', in: 'body', type: 'object', desc: 'Extra data (contract code, token info, etc.)' },
        ],
        response: '{ "success", "tx_hash", "signature", "public_key" }',
      },
      {
        method: 'POST', path: '/tx', desc: 'Submit a signed transaction to the mempool',
        params: [
          { name: 'tx_type', in: 'body', type: 'string', desc: 'Transaction type', required: true },
          { name: 'from', in: 'body', type: 'string', desc: 'Sender address', required: true },
          { name: 'to', in: 'body', type: 'string', desc: 'Recipient address' },
          { name: 'value', in: 'body', type: 'number', desc: 'Amount in raw units' },
          { name: 'nonce', in: 'body', type: 'number', desc: 'Sender nonce', required: true },
          { name: 'tx_hash', in: 'body', type: 'string', desc: 'Transaction hash from /tx/sign', required: true },
          { name: 'signature', in: 'body', type: 'string', desc: 'Signature from /tx/sign', required: true },
          { name: 'public_key', in: 'body', type: 'string', desc: 'Public key from /tx/sign', required: true },
          { name: 'data', in: 'body', type: 'object', desc: 'Extra data matching the sign request' },
        ],
        response: '{ "success", "tx_hash", "message" }',
      },
    ],
  },
  {
    title: 'Accounts',
    icon: Wallet,
    color: 'text-neon',
    desc: 'Wallet creation, balances, nonces, and faucet',
    endpoints: [
      {
        method: 'GET', path: '/wallet/new', desc: 'Generate a new wallet (address + keypair)',
        response: '{ "success", "address", "public_key", "private_key" }',
      },
      {
        method: 'POST', path: '/faucet/:address', desc: 'Get 1,000 test MVM tokens (1h cooldown)',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'MVM address to fund', required: true }],
        response: '{ "success", "message", "tx_hash", "amount" }',
      },
      {
        method: 'GET', path: '/balance/:address', desc: 'Get account balance',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'MVM address', required: true }],
        response: '{ "success", "address", "balance", "balance_raw" }',
      },
      {
        method: 'GET', path: '/nonce/:address', desc: 'Get confirmed nonce',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'MVM address', required: true }],
        response: '{ "success", "address", "nonce" }',
      },
      {
        method: 'GET', path: '/nonce/pending/:address', desc: 'Get pending nonce (for next tx)',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'MVM address', required: true }],
        response: '{ "success", "address", "pending_nonce" }',
      },
      {
        method: 'GET', path: '/account/:address', desc: 'Full account info (balance, nonce, tokens, recent txs)',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'MVM address', required: true }],
        response: '{ "success", "account": { "address", "balance", "balance_raw", "nonce", "tokens", "recent_transactions" } }',
      },
    ],
  },
  {
    title: 'Tokens (MVM-20)',
    icon: Coins,
    color: 'text-warning',
    desc: 'Query deployed tokens, balances, and holders',
    endpoints: [
      {
        method: 'GET', path: '/tokens', desc: 'List all MVM-20 tokens',
        response: '{ "success", "tokens": [{ "address", "name", "symbol", "total_supply", "decimals", "owner" }] }',
      },
      {
        method: 'GET', path: '/tokens/creator/:address', desc: 'Tokens created by an address',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Creator address', required: true }],
        response: '{ "success", "tokens": [...] }',
      },
      {
        method: 'GET', path: '/tokens/holder/:address', desc: 'Token holdings for an address',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Holder address', required: true }],
        response: '{ "success", "holdings": [{ "token_address", "name", "symbol", "balance" }] }',
      },
      {
        method: 'GET', path: '/token/:address', desc: 'Token details',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Token contract address', required: true }],
        response: '{ "success", "token": { "address", "name", "symbol", "total_supply", "decimals", "owner" } }',
      },
      {
        method: 'GET', path: '/token/:contract/balance/:address', desc: 'Token balance for an address',
        params: [
          { name: 'contract', in: 'path', type: 'string', desc: 'Token contract address', required: true },
          { name: 'address', in: 'path', type: 'string', desc: 'Holder address', required: true },
        ],
        response: '{ "success", "balance", "formatted_balance" }',
      },
      {
        method: 'GET', path: '/token/:contract/holders', desc: 'All token holders',
        params: [{ name: 'contract', in: 'path', type: 'string', desc: 'Token contract address', required: true }],
        response: '{ "success", "holders": [{ "address", "balance" }], "holder_count" }',
      },
    ],
  },
  {
    title: 'Smart Contracts (Mosh)',
    icon: FileCode,
    color: 'text-glow',
    desc: 'Deploy, query, and interact with Mosh contracts. Read operations are free (no gas).',
    endpoints: [
      {
        method: 'GET', path: '/contracts', desc: 'List all deployed contracts',
        response: '{ "success", "contracts": [{ "address", "name", "owner", "code" }] }',
      },
      {
        method: 'GET', path: '/contracts/creator/:address', desc: 'Contracts deployed by an address',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Creator address', required: true }],
        response: '{ "success", "contracts": [...] }',
      },
      {
        method: 'GET', path: '/contract/:address', desc: 'Contract details (variables, mappings, functions)',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Contract address', required: true }],
        response: '{ "success", "contract": { "address", "name", "owner", "code", "state", "mappings", "functions" } }',
      },
      {
        method: 'GET', path: '/contract/:address/mbi', desc: 'Contract MBI (Mosh Binary Interface — like ABI)',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Contract address', required: true }],
        response: '{ "success", "mbi": { "name", "variables", "mappings", "functions" } }',
      },
      {
        method: 'GET', path: '/contract/:address/var/:name', desc: 'Read a state variable (free, no gas)',
        params: [
          { name: 'address', in: 'path', type: 'string', desc: 'Contract address', required: true },
          { name: 'name', in: 'path', type: 'string', desc: 'Variable name', required: true },
        ],
        response: '{ "success", "variable", "value", "var_type" }',
      },
      {
        method: 'GET', path: '/contract/:address/mapping/:name/:key', desc: 'Read a mapping value (free, no gas)',
        params: [
          { name: 'address', in: 'path', type: 'string', desc: 'Contract address', required: true },
          { name: 'name', in: 'path', type: 'string', desc: 'Mapping name', required: true },
          { name: 'key', in: 'path', type: 'string', desc: 'Mapping key', required: true },
        ],
        response: '{ "success", "mapping", "key", "value" }',
      },
      {
        method: 'GET', path: '/contract/:address/call/:method', desc: 'Call a view function (free, no gas)',
        params: [
          { name: 'address', in: 'path', type: 'string', desc: 'Contract address', required: true },
          { name: 'method', in: 'path', type: 'string', desc: 'Function name', required: true },
          { name: 'args', in: 'query', type: 'string', desc: 'Comma-separated arguments' },
        ],
        response: '{ "success", "result" }',
      },
      {
        method: 'GET', path: '/contract/:address/events', desc: 'Get contract events/signals',
        params: [{ name: 'address', in: 'path', type: 'string', desc: 'Contract address', required: true }],
        response: '{ "success", "events": [{ "name", "args", "block_height", "tx_hash" }] }',
      },
    ],
  },
  {
    title: 'Leaderboard',
    icon: Trophy,
    color: 'text-yellow-400',
    desc: 'Top accounts rankings',
    endpoints: [
      {
        method: 'GET', path: '/leaderboard', desc: 'Top accounts across 4 categories',
        response: '{ "success", "leaderboard": { "top_balances", "top_token_creators", "top_contract_deployers", "top_active" } }',
      },
    ],
  },
  {
    title: 'WebSocket',
    icon: Radio,
    color: 'text-success',
    desc: 'Real-time updates via WebSocket connection',
    endpoints: [
      {
        method: 'GET', path: '/ws', desc: 'WebSocket upgrade — receive live block and transaction events',
        response: 'Messages: { "type": "new_block", "block": {...} } | { "type": "new_transaction", "transaction": {...} }',
      },
    ],
  },
]

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
      method === 'GET'
        ? 'bg-success/20 text-success'
        : 'bg-electric/20 text-electric'
    }`}>
      {method}
    </span>
  )
}

function EndpointRow({ endpoint, baseUrl }: { endpoint: Endpoint; baseUrl: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})

  const buildUrl = () => {
    let url = endpoint.path
    endpoint.params?.forEach((p) => {
      if (p.in === 'path' && paramValues[p.name]) {
        url = url.replace(`:${p.name}`, paramValues[p.name])
      }
    })
    const queryParams = endpoint.params
      ?.filter((p) => p.in === 'query' && paramValues[p.name])
      .map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name])}`)
    if (queryParams?.length) {
      url += `?${queryParams.join('&')}`
    }
    return url
  }

  const handleTry = async () => {
    setLoading(true)
    setResponse(null)
    try {
      const url = `${baseUrl}${buildUrl()}`
      const res = await fetch(url)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(`curl ${baseUrl}${buildUrl()}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasPathParams = endpoint.params?.some((p) => p.in === 'path' && endpoint.path.includes(`:${p.name}`))

  return (
    <div className="border border-deep/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 md:px-4 py-3 hover:bg-deep/30 transition-colors text-left"
      >
        <MethodBadge method={endpoint.method} />
        <code className="text-xs md:text-sm text-ghost font-mono flex-1 min-w-0 truncate">{endpoint.path}</code>
        <span className="text-xs text-mist hidden sm:block flex-shrink-0 max-w-[200px] truncate">{endpoint.desc}</span>
        <ChevronDown size={14} className={`text-mist flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 md:px-4 py-4 border-t border-deep/60 space-y-4 bg-abyss/30">
              <p className="text-sm text-mist">{endpoint.desc}</p>

              {/* Parameters */}
              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.params.map((p) => (
                      <div key={p.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                          <code className="text-xs text-electric">{p.name}</code>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-deep text-mist">{p.in}</span>
                          {p.required && <span className="text-[10px] text-error">*</span>}
                        </div>
                        <span className="text-xs text-mist flex-1">{p.desc}</span>
                        {p.in !== 'body' && (
                          <input
                            type="text"
                            placeholder={p.default || p.type}
                            value={paramValues[p.name] || ''}
                            onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                            className="input text-xs py-1.5 px-2 sm:w-40 flex-shrink-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response schema */}
              {endpoint.response && (
                <div>
                  <h4 className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">Response</h4>
                  <pre className="text-xs text-mist bg-deep/50 rounded-lg p-3 overflow-x-auto">{endpoint.response}</pre>
                </div>
              )}

              {/* Try it / Copy */}
              {endpoint.method === 'GET' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleTry}
                    disabled={loading || (hasPathParams && endpoint.params?.some((p) => p.in === 'path' && p.required && !paramValues[p.name]))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber text-white text-xs font-medium hover:bg-cyber/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                    Try it
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep text-mist text-xs hover:text-ghost transition-colors"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    Copy cURL
                  </button>
                </div>
              )}

              {/* Live response */}
              {response && (
                <div>
                  <h4 className="text-xs font-semibold text-ghost uppercase tracking-wider mb-2">Response</h4>
                  <pre className="text-xs text-ghost bg-void rounded-lg p-3 overflow-x-auto max-h-80 overflow-y-auto border border-deep/40">
                    {response}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ApiDocs() {
  const [baseUrl, setBaseUrl] = useState(BASE_URL)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/docs" className="flex items-center gap-2 text-mist hover:text-ghost transition-colors mb-4">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Docs</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ghost">API Reference</h1>
            <p className="text-mist text-sm mt-1">Interactive documentation for the MVM blockchain API</p>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-mist flex-shrink-0" />
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="input text-xs py-1.5 px-3 w-full sm:w-64"
              placeholder="Base URL"
            />
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="card bg-cyber/5 border-cyber/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium text-ghost">Base URL</div>
            <code className="text-xs text-electric break-all">{baseUrl}</code>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ghost">WebSocket</div>
            <code className="text-xs text-electric break-all">{baseUrl.replace('https', 'wss').replace('http', 'ws')}/ws</code>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ghost">Format</div>
            <code className="text-xs text-mist">JSON (application/json)</code>
          </div>
        </div>
      </div>

      {/* Endpoint groups */}
      {apiGroups.map((group) => (
        <motion.section
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <group.icon size={20} className={group.color} />
            <h2 className="text-lg font-bold text-ghost">{group.title}</h2>
            <span className="text-xs text-mist ml-1">({group.endpoints.length})</span>
          </div>
          <p className="text-sm text-mist mb-3">{group.desc}</p>
          <div className="space-y-2">
            {group.endpoints.map((ep) => (
              <EndpointRow key={`${ep.method}-${ep.path}`} endpoint={ep} baseUrl={baseUrl} />
            ))}
          </div>
        </motion.section>
      ))}

      {/* Transaction flow */}
      <section className="card">
        <h2 className="text-lg font-bold text-ghost mb-3">Transaction Signing Flow</h2>
        <p className="text-sm text-mist mb-4">
          All write operations follow a 2-step sign-then-submit pattern:
        </p>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Get pending nonce', desc: 'GET /nonce/pending/:address', code: '→ { pending_nonce: 0 }' },
            { step: '2', title: 'Sign the transaction', desc: 'POST /tx/sign with private_key, tx_type, from, to, value, nonce, data', code: '→ { tx_hash, signature, public_key }' },
            { step: '3', title: 'Submit to mempool', desc: 'POST /tx with all fields + tx_hash, signature, public_key from step 2', code: '→ { success: true, tx_hash }' },
            { step: '4', title: 'Wait for inclusion', desc: 'Transaction is included in the next block (~3s). Query GET /tx/:hash to check status.', code: '→ { status: "confirmed" }' },
          ].map((s) => (
            <div key={s.step} className="flex gap-3 p-3 rounded-lg bg-deep/30">
              <div className="w-7 h-7 rounded-full bg-cyber/20 text-cyber font-bold flex items-center justify-center flex-shrink-0 text-xs">
                {s.step}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-ghost">{s.title}</div>
                <code className="text-xs text-mist">{s.desc}</code>
                <div className="text-xs text-electric mt-0.5 font-mono">{s.code}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* cURL examples */}
      <section className="card">
        <h2 className="text-lg font-bold text-ghost mb-3">Quick Examples</h2>
        <div className="space-y-4">
          {[
            { title: 'Create a wallet', cmd: `curl ${BASE_URL}/wallet/new` },
            { title: 'Get faucet tokens', cmd: `curl -X POST ${BASE_URL}/faucet/mvm1youraddress` },
            { title: 'Check balance', cmd: `curl ${BASE_URL}/balance/mvm1youraddress` },
            { title: 'Get latest block', cmd: `curl ${BASE_URL}/block/latest` },
            { title: 'List all tokens', cmd: `curl ${BASE_URL}/tokens` },
          ].map((ex) => (
            <div key={ex.title}>
              <div className="text-xs text-mist mb-1">{ex.title}</div>
              <pre className="text-xs text-ghost bg-deep/50 rounded-lg p-3 overflow-x-auto font-mono">{ex.cmd}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
