import { Link } from 'react-router-dom'
import { formatAddress } from '@/lib/format'
import CopyButton from './CopyButton'

interface AddressLinkProps {
  address: string
  short?: boolean
  showCopy?: boolean
  className?: string
}

export default function AddressLink({
  address,
  short = true,
  showCopy = true,
  className = ''
}: AddressLinkProps) {
  return (
    <span className={`inline-flex items-center gap-1 min-w-0 max-w-full ${className}`}>
      <Link
        to={`/address/${address}`}
        className="font-mono text-electric hover:text-ice transition-colors truncate text-sm"
      >
        {short ? formatAddress(address) : address}
      </Link>
      {showCopy && <CopyButton text={address} />}
    </span>
  )
}
