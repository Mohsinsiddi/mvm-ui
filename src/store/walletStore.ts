import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface WalletStore {
  address: string | null
  privateKey: string | null
  publicKey: string | null
  isConnected: boolean
  showWalletModal: boolean
  
  setWallet: (wallet: { address: string; privateKey: string; publicKey: string }) => void
  clearWallet: () => void
  setShowWalletModal: (show: boolean) => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      address: null,
      privateKey: null,
      publicKey: null,
      isConnected: false,
      showWalletModal: false,
      
      setWallet: (wallet) => set({
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        isConnected: true,
        showWalletModal: false,
      }),
      
      clearWallet: () => set({
        address: null,
        privateKey: null,
        publicKey: null,
        isConnected: false,
      }),
      
      setShowWalletModal: (show) => set({ showWalletModal: show }),
    }),
    {
      name: STORAGE_KEYS.WALLET,
      partialize: (state) => ({
        address: state.address,
        privateKey: state.privateKey,
        publicKey: state.publicKey,
        isConnected: state.isConnected,
      }),
    }
  )
)
