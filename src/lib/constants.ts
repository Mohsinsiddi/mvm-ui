export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8545'
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8545/ws'
export const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || 'MVM Mainnet'
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || 'mvm-mainnet'

export const TX_TYPES = {
  transfer: { label: 'Transfer', icon: '💸', color: 'text-electric' },
  create_token: { label: 'Create Token', icon: '🪙', color: 'text-warning' },
  transfer_token: { label: 'Token Transfer', icon: '🔄', color: 'text-neon' },
  deploy_contract: { label: 'Deploy', icon: '📝', color: 'text-glow' },
  call_contract: { label: 'Contract Call', icon: '⚡', color: 'text-success' },
}

export const STORAGE_KEYS = {
  WALLET: 'mvm_wallet',
  THEME: 'mvm_theme',
  SETTINGS: 'mvm_settings',
}
