import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Chain
export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: () => api.getStatus(),
    refetchInterval: 3000,
  })
}

export function useBlocks(limit = 10) {
  return useQuery({
    queryKey: ['blocks', limit],
    queryFn: () => api.getBlocks(limit),
    refetchInterval: 3000,
  })
}

export function useBlock(height: number) {
  return useQuery({
    queryKey: ['block', height],
    queryFn: () => api.getBlock(height),
    enabled: height > 0,
  })
}

export function useLatestBlock() {
  return useQuery({
    queryKey: ['latestBlock'],
    queryFn: () => api.getLatestBlock(),
    refetchInterval: 3000,
  })
}

// Transactions
export function useTransactions(limit = 20) {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: () => api.getTransactions(limit),
    refetchInterval: 3000,
  })
}

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => api.getTransaction(hash),
    enabled: !!hash,
  })
}

export function useMempool() {
  return useQuery({
    queryKey: ['mempool'],
    queryFn: () => api.getMempool(),
    refetchInterval: 2000,
  })
}

// Account
export function useBalance(address: string) {
  return useQuery({
    queryKey: ['balance', address],
    queryFn: () => api.getBalance(address),
    enabled: !!address,
    refetchInterval: 5000,
  })
}

export function useAccount(address: string) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: () => api.getAccount(address),
    enabled: !!address,
  })
}

export function useAddressTransactions(address: string) {
  return useQuery({
    queryKey: ['addressTxs', address],
    queryFn: () => api.getAddressTransactions(address),
    enabled: !!address,
  })
}

// Wallet
export function useCreateWallet() {
  return useMutation({
    mutationFn: () => api.createWallet(),
  })
}

export function useFaucet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (address: string) => api.faucet(address),
    onSuccess: (_, address) => {
      queryClient.invalidateQueries({ queryKey: ['balance', address] })
      queryClient.invalidateQueries({ queryKey: ['addressTxs', address] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

// Tokens
export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: () => api.getTokens(),
  })
}

export function useToken(address: string) {
  return useQuery({
    queryKey: ['token', address],
    queryFn: () => api.getToken(address),
    enabled: !!address,
  })
}

// Contracts
export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: () => api.getContracts(),
  })
}

export function useContract(address: string) {
  return useQuery({
    queryKey: ['contract', address],
    queryFn: () => api.getContract(address),
    enabled: !!address,
  })
}

export function useContractMBI(address: string) {
  return useQuery({
    queryKey: ['contractMBI', address],
    queryFn: () => api.getContractMBI(address),
    enabled: !!address,
  })
}

// Leaderboard
export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.getLeaderboard(),
    refetchInterval: 10000,
  })
}

// Contract Events
export function useContractEvents(address: string) {
  return useQuery({
    queryKey: ['contractEvents', address],
    queryFn: () => api.getContractEvents(address),
    enabled: !!address,
  })
}

// Transaction submission
export function useSubmitTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tx: any) => api.submitTransaction(tx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mempool'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
