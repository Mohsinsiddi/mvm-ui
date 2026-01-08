// ============================================================
// MVM API CLIENT - MERGED VERSION
// All original methods + transaction signing via backend
// ============================================================

import { API_URL } from './constants'
import type { Block, Transaction, Account, Token, Contract, ChainStatus } from '@/types'

// ==================== SIGNING TYPES ====================

export interface SignTxRequest {
  private_key: string
  tx_type: string
  from: string
  to?: string | null
  value?: number
  nonce: number
  data?: any
}

export interface SignTxResponse {
  success: boolean
  tx_hash: string
  signature: string
  public_key: string
  error?: string
  message?: string
}

export interface SubmitTxRequest {
  tx_type: string
  from: string
  to?: string | null
  value: number
  nonce: number
  timestamp: number
  data?: any
  signature: string
  public_key: string
}

// ==================== API CLIENT CLASS ====================

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }
    
    return res.json()
  }

  // ==================== CHAIN ====================

  async getStatus(): Promise<ChainStatus> {
    return this.fetch('/status')
  }

  async getBlocks(limit = 10): Promise<{ blocks: Block[] }> {
    return this.fetch(`/blocks?limit=${limit}`)
  }

  async getBlock(height: number): Promise<{ block: Block }> {
    return this.fetch(`/block/${height}`)
  }

  async getLatestBlock(): Promise<Block> {
    return this.fetch('/block/latest')
  }

  // ==================== TRANSACTIONS ====================

  async getTransactions(limit = 20): Promise<{ transactions: Transaction[] }> {
    return this.fetch(`/txs?limit=${limit}`)
  }

  async getTransaction(hash: string): Promise<{ transaction: Transaction }> {
    return this.fetch(`/tx/${hash}`)
  }

  async getMempool(): Promise<{ count: number; transactions: Transaction[] }> {
    return this.fetch('/mempool')
  }

  // ==================== ACCOUNTS ====================

  async getBalance(address: string): Promise<{ balance: number }> {
    return this.fetch(`/balance/${address}`)
  }

  async getNonce(address: string): Promise<{ nonce: number }> {
    return this.fetch(`/nonce/${address}`)
  }

  async getPendingNonce(address: string): Promise<{ pending_nonce: number }> {
    return this.fetch(`/nonce/pending/${address}`)
  }

  async getAccount(address: string): Promise<Account> {
    return this.fetch(`/account/${address}`)
  }

  async getAddressTransactions(address: string): Promise<{ transactions: Transaction[] }> {
    return this.fetch(`/txs/${address}`)
  }

  // ==================== WALLET ====================

  async createWallet(): Promise<{ address: string; private_key: string; public_key: string }> {
    return this.fetch('/wallet/new')
  }

  async faucet(address: string): Promise<{ success: boolean; hash: string }> {
    return this.fetch(`/faucet/${address}`, { method: 'POST' })
  }

  // ==================== TOKENS ====================

  async getTokens(): Promise<{ tokens: Token[] }> {
    return this.fetch('/tokens')
  }

  async getToken(address: string): Promise<{ token: Token }> {
    return this.fetch(`/token/${address}`)
  }

  async getTokenBalance(token: string, address: string): Promise<{ balance: number }> {
    return this.fetch(`/token/${token}/balance/${address}`)
  }

  // ==================== CONTRACTS ====================

  async getContracts(): Promise<{ contracts: Contract[] }> {
    return this.fetch('/contracts')
  }

  async getContractsByCreator(address: string): Promise<{ contracts: Contract[] }> {
    return this.fetch(`/contracts/creator/${address}`)
  }

  async getContract(address: string): Promise<{
    success: boolean
    contract: Contract
    functions?: any[]
    variables?: any[]
    mappings?: any[]
    auto_methods?: any
  }> {
    return this.fetch(`/contract/${address}`)
  }

  async getContractMBI(address: string): Promise<any> {
    return this.fetch(`/contract/${address}/mbi`)
  }

  async getContractVar(address: string, name: string): Promise<{ value: any }> {
    return this.fetch(`/contract/${address}/var/${name}`)
  }

  async getContractMapping(address: string, name: string): Promise<any> {
    return this.fetch(`/contract/${address}/mapping/${name}`)
  }

  async getContractMappingValue(address: string, name: string, key: string): Promise<{ value: any }> {
    return this.fetch(`/contract/${address}/mapping/${name}/${key}`)
  }

  async callContractView(address: string, method: string, args: string[] = []): Promise<any> {
    // Backend expects comma-separated args, not JSON array
    const argsStr = args.length > 0 ? `?args=${encodeURIComponent(args.join(','))}` : ''
    return this.fetch(`/contract/${address}/call/${method}${argsStr}`)
  }

  // ==================== TRANSACTION SIGNING (VIA BACKEND) ====================

  /**
   * Sign a transaction using the backend /tx/sign endpoint
   * The backend handles all cryptography
   */
  async signTransaction(req: SignTxRequest): Promise<SignTxResponse> {
    console.log('[API] Signing transaction...', { ...req, private_key: '***' })
    
    const response = await this.fetch<SignTxResponse>('/tx/sign', {
      method: 'POST',
      body: JSON.stringify(req),
    })
    
    console.log('[API] Sign response:', { 
      success: response.success, 
      tx_hash: response.tx_hash,
      signature: response.signature?.slice(0, 20) + '...' 
    })
    return response
  }

  /**
   * Submit a signed transaction to the blockchain
   */
  async submitTransaction(tx: SubmitTxRequest): Promise<any> {
    console.log('[API] Submitting transaction...')
    
    const response = await this.fetch<any>('/tx', {
      method: 'POST',
      body: JSON.stringify(tx),
    })
    
    console.log('[API] Submit response:', response)
    return response
  }

  /**
   * Helper: Sign and submit a transaction in one call
   */
  async signAndSubmit(
    privateKey: string,
    txType: string,
    from: string,
    to: string | null,
    value: number,
    nonce: number,
    data?: any
  ): Promise<any> {
    // Build request, EXCLUDING 'to' if null (important for contract calls)
    const signReq: SignTxRequest = {
      private_key: privateKey,
      tx_type: txType,
      from,
      value,
      nonce,
      data,
    }
    // Only include 'to' if it's a real address (not null/undefined)
    if (to) {
      signReq.to = to
    }

    // Step 1: Sign
    const signResult = await this.signTransaction(signReq)

    if (!signResult.success) {
      throw new Error(signResult.message || 'Failed to sign transaction')
    }

    // Step 2: Submit (also exclude 'to' if null)
    const submitReq: SubmitTxRequest = {
      tx_type: txType,
      from,
      value,
      nonce,
      timestamp: Math.floor(Date.now() / 1000),
      data,
      signature: signResult.signature,
      public_key: signResult.public_key,
    }
    if (to) {
      submitReq.to = to
    }
    
    return this.submitTransaction(submitReq)
  }

  // ==================== CONTRACT DEPLOYMENT ====================

  /**
   * Deploy a Mosh contract (compiled JSON)
   */
  async deployContract(
    privateKey: string,
    from: string,
    contractJSON: any
  ): Promise<any> {
    // Get pending nonce
    const nonceRes = await this.getPendingNonce(from)
    const nonce = nonceRes.pending_nonce

    // Format contract data for deployment
    const deployData = {
      name: contractJSON.name,
      token: null,
      variables: contractJSON.variables.map((v: any) => ({
        name: v.name,
        type: v.var_type,
        default: v.default,
      })),
      mappings: contractJSON.mappings.map((m: any) => ({
        name: m.name,
        key_type: m.key_type,
        value_type: m.value_type,
      })),
      functions: contractJSON.functions.map((f: any) => ({
        name: f.name,
        modifiers: f.modifiers,
        args: f.args.map((a: any) => ({
          name: a.name,
          type: a.arg_type,
        })),
        body: f.body,
        returns: f.returns,
      })),
    }

    return this.signAndSubmit(
      privateKey,
      'deploy_contract',
      from,
      null,
      0,
      nonce,
      deployData
    )
  }

  /**
   * Call a contract method (write operation)
   */
  async callContract(
    privateKey: string,
    from: string,
    contractAddress: string,
    method: string,
    args: string[] = [],
    amount: number = 0
  ): Promise<any> {
    const nonceRes = await this.getPendingNonce(from)
    const nonce = nonceRes.pending_nonce

    const callData = {
      contract: contractAddress,
      method,
      args,
      amount,
    }

    // For call_contract, 'to' should be null - contract address is in data
    return this.signAndSubmit(
      privateKey,
      'call_contract',
      from,
      null,  // to is null for contract calls
      0,
      nonce,
      callData
    )
  }
}

// ==================== EXPORT SINGLETON ====================

export const api = new ApiClient(API_URL)
export default api