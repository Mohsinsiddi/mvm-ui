import * as secp256k1 from '@noble/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { bech32 } from 'bech32'

// ==================== HELPER FUNCTIONS ====================
// Browser-compatible replacements for Node.js Buffer

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ==================== WALLET FUNCTIONS ====================

export function generatePrivateKey(): string {
  const privateKey = secp256k1.utils.randomPrivateKey()
  return bytesToHex(privateKey)
}

export function getPublicKey(privateKey: string): string {
  const pubKey = secp256k1.getPublicKey(privateKey, true)
  return bytesToHex(pubKey)
}

export function getAddress(publicKey: string): string {
  const pubKeyBytes = hexToBytes(publicKey)
  const sha256Hash = sha256(pubKeyBytes)
  const ripemd160Hash = ripemd160(sha256Hash)
  const words = bech32.toWords(ripemd160Hash)
  return bech32.encode('mvm1', words)
}

export function createWallet(): { privateKey: string; publicKey: string; address: string } {
  const privateKey = generatePrivateKey()
  const publicKey = getPublicKey(privateKey)
  const address = getAddress(publicKey)
  return { privateKey, publicKey, address }
}

// ==================== VALIDATION FUNCTIONS ====================

export function isValidAddress(address: string): boolean {
  try {
    if (!address || !address.startsWith('mvm1')) return false
    // Contract addresses (mvm1contract...) and token addresses (mvm1token...) are hex-based, not bech32
    if (address.startsWith('mvm1contract') || address.startsWith('mvm1token')) {
      return /^mvm1(contract|token)[0-9a-f]+$/.test(address)
    }
    // Special addresses like mvm1faucet
    if (address === 'mvm1faucet') return true
    bech32.decode(address)
    return true
  } catch {
    return false
  }
}

export function isValidPrivateKey(key: string): boolean {
  try {
    if (!/^[0-9a-fA-F]{64}$/.test(key)) return false
    secp256k1.getPublicKey(key)
    return true
  } catch {
    return false
  }
}

// ==================== FORMAT HELPERS ====================

export function formatAddressShort(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars + 4)}...${address.slice(-chars)}`
}

export function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str)
}

export function isTxHash(str: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(str)
}