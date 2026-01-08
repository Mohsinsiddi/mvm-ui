export interface Block {
  height: number
  hash: string
  previous_hash: string
  timestamp: number
  transactions: Transaction[]
  validator: string
  tx_count: number
}

export interface Transaction {
  hash: string
  tx_type: 'transfer' | 'create_token' | 'transfer_token' | 'deploy_contract' | 'call_contract'
  from: string
  to: string | null
  value: number
  nonce: number
  timestamp: number
  status: 'Pending' | 'Success' | 'Failed'
  gas_used?: number
  error?: string
  data?: any
}

export interface Account {
  address: string
  balance: number
  nonce: number
}

export interface Token {
  address: string
  name: string
  symbol: string
  total_supply: number
  decimals: number
  owner: string
}

export interface Contract {
  address: string
  name: string
  owner: string
  code: any
}

export interface WalletState {
  address: string | null
  privateKey: string | null
  publicKey: string | null
  isConnected: boolean
}

export interface ChainStatus {
  chain_id: string
  height: number
  pending_transactions: number
  peers: number
  browsers: number
}

export interface WSMessage {
  type: 'new_block' | 'new_transaction'
  data: Block | Transaction
}
