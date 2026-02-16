import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Play, Square, Copy, Check, AlertTriangle, Info, Key } from 'lucide-react'
import { generatePrivateKey, getPublicKey, getAddress } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/format'
import Card from '@/components/common/Card'

interface Match {
  address: string
  privateKey: string
  publicKey: string
  timestamp: number
}

// bech32 charset — excludes b, i, o, 1 to avoid visual ambiguity
const BECH32_CHARS = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const BECH32_SET = new Set(BECH32_CHARS)

const DIFFICULTY_GUIDE = [
  { chars: 1, label: '1 char', estimate: '~16 attempts', time: 'Instant' },
  { chars: 2, label: '2 chars', estimate: '~256 attempts', time: '< 1 second' },
  { chars: 3, label: '3 chars', estimate: '~4,096 attempts', time: '~2 seconds' },
  { chars: 4, label: '4 chars', estimate: '~65,536 attempts', time: '~30 seconds' },
  { chars: 5, label: '5 chars', estimate: '~1M attempts', time: '~5 minutes' },
  { chars: 6, label: '6 chars', estimate: '~16M attempts', time: '~1 hour' },
]

export default function VanityGenerator() {
  const [prefix, setPrefix] = useState('')
  const [targetCount, setTargetCount] = useState(5)
  const [running, setRunning] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [attempts, setAttempts] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  const runningRef = useRef(false)
  const attemptsRef = useRef(0)
  const startTimeRef = useRef(0)
  const matchCountRef = useRef(0)
  const targetCountRef = useRef(5)

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const isValidPrefix = (p: string) => p.length <= 8 && [...p].every(c => BECH32_SET.has(c))

  const generate = useCallback(() => {
    if (!runningRef.current) return

    const batchSize = 50
    for (let i = 0; i < batchSize; i++) {
      if (!runningRef.current) return

      attemptsRef.current++
      const privKey = generatePrivateKey()
      const pubKey = getPublicKey(privKey)
      const addr = getAddress(pubKey)

      // bech32 address: "mvm1" (HRP) + "1" (separator) + data = "mvm11..."
      const afterPrefix = addr.slice(5)
      if (afterPrefix.startsWith(prefix.toLowerCase())) {
        matchCountRef.current++
        setMatches(prev => [{
          address: addr,
          privateKey: privKey,
          publicKey: pubKey,
          timestamp: Date.now(),
        }, ...prev])

        // Auto-stop when target count reached
        if (matchCountRef.current >= targetCountRef.current) {
          runningRef.current = false
          setRunning(false)
          break
        }
      }
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000
    setAttempts(attemptsRef.current)
    setSpeed(elapsed > 0 ? Math.round(attemptsRef.current / elapsed) : 0)

    if (runningRef.current) {
      requestAnimationFrame(generate)
    }
  }, [prefix])

  const start = () => {
    if (!prefix || !isValidPrefix(prefix)) return
    runningRef.current = true
    attemptsRef.current = 0
    matchCountRef.current = 0
    targetCountRef.current = targetCount
    startTimeRef.current = Date.now()
    setRunning(true)
    setMatches([])
    setAttempts(0)
    setSpeed(0)
    requestAnimationFrame(generate)
  }

  const stop = () => {
    runningRef.current = false
    setRunning(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ghost flex items-center gap-3">
          <Sparkles className="text-cyber" />
          Vanity Address Generator
        </h1>
        <p className="text-mist mt-1">Generate a custom MVM address with your chosen prefix</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-lg font-bold text-ghost mb-4">Generate Address</h2>

            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-void rounded-lg p-4 font-mono text-sm">
                <span className="text-mist">mvm11</span>
                <span className="text-electric">{prefix || '...'}</span>
                <span className="text-shadow">{'x'.repeat(Math.max(0, 37 - prefix.length))}</span>
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm text-mist mb-1">
                  Prefix after mvm11 (bech32 chars only — no b, i, o, 1)
                </label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="e.g. ace"
                    value={prefix}
                    onChange={(e) => {
                      const v = e.target.value.toLowerCase()
                      if (isValidPrefix(v)) setPrefix(v)
                    }}
                    maxLength={8}
                    disabled={running}
                  />
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-mist whitespace-nowrap">Find</label>
                    <input
                      type="number"
                      className="input w-16 text-center"
                      value={targetCount}
                      onChange={(e) => setTargetCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={100}
                      disabled={running}
                    />
                  </div>
                  {running ? (
                    <button onClick={stop} className="btn-secondary flex items-center gap-2">
                      <Square size={14} /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={start}
                      disabled={!prefix}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Play size={14} /> Start
                    </button>
                  )}
                </div>
              </div>

              {/* Valid chars hint */}
              <p className="text-xs text-shadow font-mono tracking-wider">
                Valid: {BECH32_CHARS}
              </p>

              {/* Stats */}
              {(running || attempts > 0) && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-void rounded-lg p-3 text-center">
                    <p className="text-xs text-mist">Attempts</p>
                    <p className="text-lg font-bold text-ghost">{attempts.toLocaleString()}</p>
                  </div>
                  <div className="bg-void rounded-lg p-3 text-center">
                    <p className="text-xs text-mist">Speed</p>
                    <p className="text-lg font-bold text-ghost">{speed.toLocaleString()}/s</p>
                  </div>
                  <div className="bg-void rounded-lg p-3 text-center">
                    <p className="text-xs text-mist">Found</p>
                    <p className="text-lg font-bold text-success">{matches.length} <span className="text-sm text-mist font-normal">/ {targetCount}</span></p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Matches */}
          {matches.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-ghost mb-4">
                Matches ({matches.length})
              </h2>
              <div className="space-y-3">
                {matches.map((m, i) => (
                  <div key={i} className="bg-void rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-mist mb-0.5">Address</p>
                        <p className="font-mono text-xs text-electric truncate">{m.address}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(m.address, `addr-${i}`)}
                        className="p-1.5 hover:bg-deep rounded flex-shrink-0"
                      >
                        {copied === `addr-${i}` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-mist" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-mist mb-0.5 flex items-center gap-1">
                          <Key size={10} /> Private Key
                        </p>
                        <p className="font-mono text-xs text-ghost/60 truncate">{m.privateKey}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(m.privateKey, `key-${i}`)}
                        className="p-1.5 hover:bg-deep rounded flex-shrink-0"
                      >
                        {copied === `key-${i}` ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-mist" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Difficulty Guide */}
          <Card>
            <h3 className="font-bold text-ghost mb-3 flex items-center gap-2">
              <Info size={16} className="text-electric" />
              Difficulty Guide
            </h3>
            <div className="space-y-2">
              {DIFFICULTY_GUIDE.map((d) => (
                <div
                  key={d.chars}
                  className={`flex items-center justify-between text-sm p-2 rounded ${
                    prefix.length === d.chars ? 'bg-cyber/10 border border-cyber/30' : 'bg-void'
                  }`}
                >
                  <span className={prefix.length === d.chars ? 'text-cyber font-bold' : 'text-mist'}>
                    {d.label}
                  </span>
                  <span className="text-xs text-shadow">{d.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Security Warning */}
          <Card>
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-ghost mb-1">Security Notice</h3>
                <p className="text-sm text-mist">
                  All key generation happens locally in your browser. Private keys are never sent
                  to any server. However, treat generated keys with the same care as any private key —
                  anyone with access to the private key controls the wallet.
                </p>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card>
            <h3 className="font-bold text-ghost mb-2">How It Works</h3>
            <ol className="text-sm text-mist space-y-1.5 list-decimal ml-4">
              <li>Generates random private keys</li>
              <li>Derives the public key and address</li>
              <li>Checks if address starts with your prefix</li>
              <li>Repeats until a match is found</li>
            </ol>
            <p className="text-xs text-shadow mt-3">
              Longer prefixes are exponentially harder — each additional character multiplies
              the search space by ~32x.
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
