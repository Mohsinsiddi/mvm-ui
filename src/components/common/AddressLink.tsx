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
  const displayAddress = short ? formatAddress(address) : address

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Link 
        to={`/address/${address}`}
        className="font-mono text-electric hover:text-ice transition-colors"
      >
        {displayAddress}
      </Link>
      {showCopy && <CopyButton text={address} />}
    </span>
  )
}
