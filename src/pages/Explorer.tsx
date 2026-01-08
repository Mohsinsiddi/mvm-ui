import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import SearchBar from '@/components/explorer/SearchBar'
import BlockCard from '@/components/explorer/BlockCard'
import TxCard from '@/components/explorer/TxCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useBlocks, useTransactions, useTokens, useContracts } from '@/hooks/useApi'

export default function Explorer() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [activeTab, setActiveTab] = useState('blocks')
  
  const { data: blocksData, isLoading: blocksLoading } = useBlocks(20)
  const { data: txsData, isLoading: txsLoading } = useTransactions(50)
  const { data: tokensData } = useTokens()
  const { data: contractsData } = useContracts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ghost">Explorer</h1>
        <p className="text-mist mt-1">Search and browse the blockchain</p>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-1 p-1 bg-abyss rounded-lg overflow-x-auto">
          {[
            { value: 'blocks', label: 'Blocks', count: blocksData?.blocks?.length },
            { value: 'transactions', label: 'Transactions', count: txsData?.transactions?.length },
            { value: 'tokens', label: 'Tokens', count: tokensData?.tokens?.length },
            { value: 'contracts', label: 'Contracts', count: contractsData?.contracts?.length },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.value 
                  ? 'bg-cyber text-white' 
                  : 'text-mist hover:text-ghost hover:bg-deep'}`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-deep">
                  {tab.count}
                </span>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="blocks" className="mt-4">
          {blocksLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {blocksData?.blocks?.map((block) => (
                <BlockCard key={block.height} block={block} />
              ))}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="transactions" className="mt-4">
          {txsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {txsData?.transactions?.map((tx) => (
                <TxCard key={tx.hash} tx={tx} />
              ))}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="tokens" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tokensData?.tokens?.map((token) => (
              <motion.a
                key={token.address}
                href={`/address/${token.address}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber to-neon flex items-center justify-center text-white font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-ghost">{token.name}</div>
                    <div className="text-sm text-mist">{token.symbol}</div>
                  </div>
                </div>
              </motion.a>
            ))}
            {(!tokensData?.tokens || tokensData.tokens.length === 0) && (
              <div className="col-span-full text-center py-8 text-mist">
                No tokens created yet
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="contracts" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contractsData?.contracts?.map((contract) => (
              <motion.a
                key={contract.address}
                href={`/address/${contract.address}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-hover"
              >
                <div className="font-medium text-ghost">{contract.name}</div>
                <div className="text-sm text-mist font-mono mt-1">{contract.address.slice(0, 20)}...</div>
              </motion.a>
            ))}
            {(!contractsData?.contracts || contractsData.contracts.length === 0) && (
              <div className="col-span-full text-center py-8 text-mist">
                No contracts deployed yet
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
