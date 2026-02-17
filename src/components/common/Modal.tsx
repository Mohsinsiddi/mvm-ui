import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Title shown in the header. If omitted, no header is rendered. */
  title?: string
  /** Max width class. Default: 'max-w-md' */
  maxWidth?: string
  /** Hide the default header (title + close button) */
  hideHeader?: boolean
}

export default function Modal({
  open,
  onClose,
  children,
  title,
  maxWidth = 'max-w-md',
  hideHeader = false,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            {/* Centering wrapper — flexbox avoids translate conflicts with framer-motion */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`w-full ${maxWidth} pointer-events-auto`}
                >
                  <div className="card border-deep/60">
                    {!hideHeader && (
                      <div className="flex items-center justify-between mb-4">
                        {title && (
                          <Dialog.Title className="text-lg md:text-xl font-bold text-ghost">
                            {title}
                          </Dialog.Title>
                        )}
                        <Dialog.Close asChild>
                          <button className="p-2 rounded-lg hover:bg-deep text-mist hover:text-ghost transition-colors ml-auto">
                            <X size={20} />
                          </button>
                        </Dialog.Close>
                      </div>
                    )}
                    {children}
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
