export function formatAddress(address: string, chars = 8): string {
  if (!address) return ''
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars + 4)}...${address.slice(-chars)}`
}

export function formatHash(hash: string, chars = 8): string {
  if (!hash) return ''
  if (hash.length <= chars * 2) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

export function formatBalance(balance: number, decimals = 18): string {
  const value = balance / Math.pow(10, decimals)
  if (value === 0) return '0'
  if (value < 0.0001) return '< 0.0001'
  if (value < 1) return value.toFixed(4)
  if (value < 1000) return value.toFixed(2)
  if (value < 1000000) return `${(value / 1000).toFixed(2)}K`
  if (value < 1000000000) return `${(value / 1000000).toFixed(2)}M`
  return `${(value / 1000000000).toFixed(2)}B`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
