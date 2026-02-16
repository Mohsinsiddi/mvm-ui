import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Eye, EyeOff, Copy, Check, ChevronRight, Shield, Info } from 'lucide-react'
import { generatePrivateKey, getPublicKey, getAddress } from '@/lib/crypto'
import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { copyToClipboard } from '@/lib/format'
import Card from '@/components/common/Card'

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface Step {
  id: number
  title: string
  description: string
  output: string
  completed: boolean
}

export default function WalletLab() {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'Generate Private Key', description: 'Random 256-bit number (32 bytes)', output: '', completed: false },
    { id: 2, title: 'Derive Public Key', description: 'secp256k1 elliptic curve multiplication', output: '', completed: false },
    { id: 3, title: 'SHA-256 Hash', description: 'First hash of the public key', output: '', completed: false },
    { id: 4, title: 'RIPEMD-160 Hash', description: 'Second hash — shorter address', output: '', completed: false },
    { id: 5, title: 'Bech32 Encode', description: "Encode with 'mvm1' prefix", output: '', completed: false },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const handleCopy = (text: string, stepId: number) => {
    copyToClipboard(text)
    setCopied(stepId)
    setTimeout(() => setCopied(null), 2000)
  }

  const executeStep = (stepNum: number) => {
    const newSteps = [...steps]

    if (stepNum === 1) {
      const privKey = generatePrivateKey()
      newSteps[0] = { ...newSteps[0], output: privKey, completed: true }
    } else if (stepNum === 2 && steps[0].completed) {
      const pubKey = getPublicKey(steps[0].output)
      newSteps[1] = { ...newSteps[1], output: pubKey, completed: true }
    } else if (stepNum === 3 && steps[1].completed) {
      const pubBytes = hexToBytes(steps[1].output)
      const sha256Hash = sha256(pubBytes)
      newSteps[2] = { ...newSteps[2], output: bytesToHex(sha256Hash), completed: true }
    } else if (stepNum === 4 && steps[2].completed) {
      const shaBytes = hexToBytes(steps[2].output)
      const ripeHash = ripemd160(shaBytes)
      newSteps[3] = { ...newSteps[3], output: bytesToHex(ripeHash), completed: true }
    } else if (stepNum === 5 && steps[0].completed) {
      const addr = getAddress(getPublicKey(steps[0].output))
      newSteps[4] = { ...newSteps[4], output: addr, completed: true }
    }

    setSteps(newSteps)
    setCurrentStep(stepNum)
  }

  const reset = () => {
    setSteps(steps.map(s => ({ ...s, output: '', completed: false })))
    setCurrentStep(0)
    setShowPrivateKey(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ghost flex items-center gap-3">
            <Key className="text-cyber" />
            Wallet Lab
          </h1>
          <p className="text-mist mt-1">Learn how MVM wallets are created step-by-step</p>
        </div>
        <button onClick={reset} className="btn-secondary text-sm">Reset</button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step.completed ? 'bg-success/20 text-success' : currentStep >= step.id ? 'bg-cyber/20 text-cyber' : 'bg-deep text-shadow'
            }`}>
              {step.completed ? <Check size={14} /> : step.id}
            </div>
            <span className={`text-xs hidden sm:block ${step.completed ? 'text-success' : 'text-mist'}`}>
              {step.title}
            </span>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-shadow flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.id}>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    step.completed ? 'bg-success/20 text-success' : 'bg-deep text-mist'
                  }`}>
                    Step {step.id}
                  </span>
                  <h3 className="font-bold text-ghost">{step.title}</h3>
                </div>
                <p className="text-sm text-mist mb-3">{step.description}</p>

                {step.output && (
                  <div className="bg-void rounded-lg p-3 font-mono text-xs break-all relative group">
                    {step.id === 1 && !showPrivateKey ? (
                      <span className="text-shadow select-none">{'*'.repeat(64)}</span>
                    ) : (
                      <span className={step.id === 5 ? 'text-electric' : 'text-ghost'}>{step.output}</span>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {step.id === 1 && (
                        <button onClick={() => setShowPrivateKey(!showPrivateKey)} className="p-1 hover:bg-deep rounded">
                          {showPrivateKey ? <EyeOff size={12} className="text-mist" /> : <Eye size={12} className="text-mist" />}
                        </button>
                      )}
                      <button onClick={() => handleCopy(step.output, step.id)} className="p-1 hover:bg-deep rounded">
                        {copied === step.id ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-mist" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => executeStep(step.id)}
                disabled={step.completed || (step.id > 1 && !steps[step.id - 2]?.completed)}
                className="btn-primary text-sm flex-shrink-0"
              >
                {step.completed ? 'Done' : 'Execute'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Educational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-electric flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-ghost mb-1">Why This Process?</h3>
              <p className="text-sm text-mist">
                This multi-step derivation ensures your address is a compact, unique fingerprint of your public key.
                The private key never leaves your device — only the address is shared publicly.
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <Info size={20} className="text-neon flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-ghost mb-1">Key Takeaways</h3>
              <ul className="text-sm text-mist space-y-1 list-disc ml-4">
                <li>Private key = random 256-bit number</li>
                <li>Public key = derived via elliptic curve (one-way)</li>
                <li>Address = hash of public key, bech32-encoded</li>
                <li>Never share your private key</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
