import * as Toast from '@radix-ui/react-toast'
import { useState, createContext, useContext, useCallback } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastMessage {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...message, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const typeStyles = {
    success: 'border-success/50 bg-success/10',
    error: 'border-error/50 bg-error/10',
    info: 'border-electric/50 bg-electric/10',
    warning: 'border-warning/50 bg-warning/10',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast.Provider swipeDirection="right">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast.Root key={t.id} asChild forceMount>
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border ${typeStyles[t.type]} backdrop-blur-sm max-w-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Toast.Title className="font-medium text-ghost">{t.title}</Toast.Title>
                    {t.description && (
                      <Toast.Description className="text-sm text-mist mt-1">
                        {t.description}
                      </Toast.Description>
                    )}
                  </div>
                  <Toast.Close asChild>
                    <button
                      onClick={() => removeToast(t.id)}
                      className="text-mist hover:text-ghost"
                    >
                      <X size={16} />
                    </button>
                  </Toast.Close>
                </div>
              </motion.div>
            </Toast.Root>
          ))}
        </AnimatePresence>
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
