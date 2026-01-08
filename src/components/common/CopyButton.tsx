import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '@/lib/format'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded hover:bg-deep transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={14} className="text-success" />
      ) : (
        <Copy size={14} className="text-mist hover:text-ghost" />
      )}
    </button>
  )
}
