import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, Eye, EyeOff, AlertTriangle, Check, Loader } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { useWalletStore } from '@/store/walletStore'
import { createWallet, isValidPrivateKey, getPublicKey, getAddress } from '@/lib/crypto'
import { useCreateWallet } from '@/hooks/useApi'

interface WalletModalProps {
  open: boolean
  onClose: () => void
}

// Normalized wallet type (always camelCase)
interface NormalizedWallet {
  address: string
  privateKey: string
  publicKey: string
}

type CreationStep = 'idle' | 'generating' | 'deriving' | 'ready'

const CREATION_STEPS: { key: CreationStep; label: string }[] = [
  { key: 'generating', label: 'Generating private key...' },
  { key: 'deriving', label: 'Deriving public key & address...' },
  { key: 'ready', label: 'Wallet ready!' },
]

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const [mode, setMode] = useState<'select' | 'creating' | 'create' | 'import'>('select')
  const [privateKeyInput, setPrivateKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [newWallet, setNewWallet] = useState<NormalizedWallet | null>(null)
  const [creationStep, setCreationStep] = useState<CreationStep>('idle')

  const { setWallet } = useWalletStore()
  const createWalletMutation = useCreateWallet()

  const handleCreateWallet = async () => {
    setMode('creating')
    setCreationStep('generating')

    // Step animation
    await new Promise(r => setTimeout(r, 600))
    setCreationStep('deriving')

    try {
      let wallet: NormalizedWallet

      try {
        const apiResult = await createWalletMutation.mutateAsync()
        wallet = {
          address: apiResult.address,
          privateKey: apiResult.private_key,
          publicKey: apiResult.public_key,
        }
      } catch {
        wallet = createWallet()
      }

      await new Promise(r => setTimeout(r, 400))
      setCreationStep('ready')
      setNewWallet(wallet)
      await new Promise(r => setTimeout(r, 500))
      setMode('create')
      setCreationStep('idle')
    } catch (err) {
      setError('Failed to create wallet')
      setMode('select')
      setCreationStep('idle')
    }
  }

  const handleConfirmCreate = () => {
    if (newWallet) {
      setWallet(newWallet)
      handleClose()
    }
  }

  const handleImport = () => {
    setError('')
    if (!isValidPrivateKey(privateKeyInput)) {
      setError('Invalid private key. Must be 64 hex characters.')
      return
    }

    try {
      const publicKey = getPublicKey(privateKeyInput)
      const address = getAddress(publicKey)
      setWallet({ privateKey: privateKeyInput, publicKey, address })
      handleClose()
    } catch (err) {
      setError('Failed to import wallet')
    }
  }

  const handleClose = () => {
    setMode('select')
    setPrivateKeyInput('')
    setShowKey(false)
    setError('')
    setNewWallet(null)
    onClose()
  }

  const modalTitle = mode === 'select' ? 'Connect Wallet'
    : mode === 'creating' ? 'Creating Wallet...'
    : mode === 'create' ? 'New Wallet Created'
    : 'Import Wallet'

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle}>

            <AnimatePresence mode="wait">
              {mode === 'creating' && (
                <motion.div
                  key="creating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-8 space-y-4"
                >
                  {CREATION_STEPS.map((step) => {
                    const stepIdx = CREATION_STEPS.findIndex(s => s.key === step.key)
                    const currentIdx = CREATION_STEPS.findIndex(s => s.key === creationStep)
                    const isDone = stepIdx < currentIdx
                    const isActive = stepIdx === currentIdx
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDone ? 'bg-success/20' : isActive ? 'bg-cyber/20' : 'bg-deep'
                        }`}>
                          {isDone ? (
                            <Check size={14} className="text-success" />
                          ) : isActive ? (
                            <Loader size={14} className="text-cyber animate-spin" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-shadow" />
                          )}
                        </div>
                        <span className={`text-sm ${
                          isDone ? 'text-success' : isActive ? 'text-ghost' : 'text-shadow'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </motion.div>
              )}

              {mode === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleCreateWallet}
                    className="w-full p-3 md:p-4 rounded-lg border border-deep hover:border-cyber bg-deep/50 hover:bg-deep transition-all flex items-center gap-3"
                  >
                    <div className="p-2 md:p-3 rounded-lg bg-cyber/20">
                      <Plus size={20} className="text-cyber" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm md:text-base font-medium text-ghost">Create New Wallet</div>
                      <div className="text-xs md:text-sm text-mist">Generate a new MVM wallet</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMode('import')}
                    className="w-full p-3 md:p-4 rounded-lg border border-deep hover:border-neon bg-deep/50 hover:bg-deep transition-all flex items-center gap-3"
                  >
                    <div className="p-2 md:p-3 rounded-lg bg-neon/20">
                      <Download size={20} className="text-neon" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm md:text-base font-medium text-ghost">Import Wallet</div>
                      <div className="text-xs md:text-sm text-mist">Import with private key</div>
                    </div>
                  </button>
                </motion.div>
              )}

              {mode === 'create' && newWallet && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-warning">
                      <strong>Important!</strong> Save your private key securely. It cannot be recovered if lost!
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm text-mist mb-1.5">Address</label>
                    <div className="p-2.5 rounded-lg bg-deep font-mono text-xs md:text-sm text-electric break-all">
                      {newWallet.address}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm text-mist mb-1.5">Private Key</label>
                    <div className="p-2.5 rounded-lg bg-deep font-mono text-xs md:text-sm break-all relative pr-10">
                      <span className={showKey ? 'text-ghost' : 'blur-sm text-ghost select-none'}>
                        {newWallet.privateKey}
                      </span>
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mist hover:text-ghost"
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setMode('select')} className="btn-secondary flex-1 text-sm py-2">
                      Back
                    </button>
                    <button onClick={handleConfirmCreate} className="btn-primary flex-1 text-sm py-2">
                      I've Saved It
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === 'import' && (
                <motion.div
                  key="import"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-mist mb-2">Private Key</label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={privateKeyInput}
                        onChange={(e) => setPrivateKeyInput(e.target.value)}
                        placeholder="Enter your 64-character private key"
                        className="input pr-12 font-mono"
                      />
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-ghost"
                      >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setMode('select')} className="btn-secondary flex-1 text-sm py-2">
                      Back
                    </button>
                    <button onClick={handleImport} className="btn-primary flex-1 text-sm py-2">
                      Import
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
    </Modal>
  )
}