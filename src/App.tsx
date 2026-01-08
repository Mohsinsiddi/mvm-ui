import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/common/Toaster'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Explorer from '@/pages/Explorer'
import BlockDetail from '@/pages/BlockDetail'
import TxDetail from '@/pages/TxDetail'
import AddressDetail from '@/pages/AddressDetail'
import Wallet from '@/pages/Wallet'
import Terminal from '@/pages/Terminal'
import NodeConnection from '@/pages/NodeConnection'
import ContractIDE from '@/pages/ContractIDE'
import WalletLab from '@/pages/WalletLab'
import VanityGenerator from '@/pages/VanityGenerator'
import TokenCreator from '@/pages/TokenCreator'
import Leaderboard from '@/pages/Leaderboard'
import WalletModal from '@/components/wallet/WalletModal'
import { useWalletStore } from '@/store/walletStore'

export default function App() {
  const { showWalletModal, setShowWalletModal } = useWalletStore()

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/block/:height" element={<BlockDetail />} />
          <Route path="/tx/:hash" element={<TxDetail />} />
          <Route path="/address/:address" element={<AddressDetail />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/node" element={<NodeConnection />} />
          <Route path="/contracts" element={<ContractIDE />} />
          <Route path="/learn/wallet" element={<WalletLab />} />
          <Route path="/learn/vanity" element={<VanityGenerator />} />
          <Route path="/tokens/create" element={<TokenCreator />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
      <WalletModal open={showWalletModal} onClose={() => setShowWalletModal(false)} />
      <Toaster />
    </BrowserRouter>
  )
}
