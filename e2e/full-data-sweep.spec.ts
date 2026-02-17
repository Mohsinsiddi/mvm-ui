/**
 * Full Data Sweep — creates wallet, generates txs, screenshots ALL pages on iPhone 14
 */
import { test, expect } from '@playwright/test'

const API = 'https://mvm-chain.duckdns.org'
const MOBILE = { width: 390, height: 844 }

test.describe.configure({ mode: 'serial' })
test.use({ viewport: MOBILE })

interface Wallet {
  address: string
  private_key: string
  public_key: string
}

// Helper: call API
async function callApi(endpoint: string, method = 'GET', body?: any) {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API}${endpoint}`, opts)
  return res.json()
}

// Helper: sign + submit tx
async function sendTx(
  privateKey: string,
  txType: string,
  from: string,
  to: string | null,
  value: number,
  nonce: number,
  data?: any
) {
  const signReq: any = { private_key: privateKey, tx_type: txType, from, value, nonce, data }
  if (to) signReq.to = to

  const signRes = await callApi('/tx/sign', 'POST', signReq)
  if (!signRes.success) throw new Error(`Sign failed: ${signRes.message}`)

  const submitReq: any = {
    tx_type: txType, from, value, nonce,
    timestamp: Math.floor(Date.now() / 1000),
    data, signature: signRes.signature, public_key: signRes.public_key,
  }
  if (to) submitReq.to = to
  return callApi('/tx', 'POST', submitReq)
}

async function getNonce(address: string): Promise<number> {
  const res = await callApi(`/nonce/pending/${address}`)
  return res.pending_nonce
}

let wallet1: Wallet
let wallet2: Wallet
let txHashes: string[] = []
let tokenAddress = ''
let contractAddress = ''

// Setup: create wallets + generate transactions
test('00 - Setup: create wallets and transactions', async () => {
  test.setTimeout(120_000)

  // 1. Create two wallets
  wallet1 = await callApi('/wallet/new')
  wallet2 = await callApi('/wallet/new')
  console.log('Wallet 1:', wallet1.address)
  console.log('Wallet 2:', wallet2.address)

  // 2. Faucet wallet1 multiple times
  for (let i = 0; i < 3; i++) {
    const f = await callApi(`/faucet/${wallet1.address}`, 'POST')
    console.log(`Faucet ${i + 1}:`, f.hash)
    if (f.hash) txHashes.push(f.hash)
    await new Promise(r => setTimeout(r, 2000))
  }
  await new Promise(r => setTimeout(r, 5000))

  // 3. Transfer MVM to wallet2
  let nonce = await getNonce(wallet1.address)
  const transferRes = await sendTx(
    wallet1.private_key, 'transfer', wallet1.address, wallet2.address,
    500_000_000, nonce
  )
  console.log('Transfer:', transferRes.hash)
  if (transferRes.hash) txHashes.push(transferRes.hash)
  await new Promise(r => setTimeout(r, 3000))

  // 4. Create a token
  nonce = await getNonce(wallet1.address)
  const tokenRes = await sendTx(
    wallet1.private_key, 'create_token', wallet1.address, null, 0, nonce,
    { name: 'TestCoin', symbol: 'TST', total_supply: 1_000_000, decimals: 8 }
  )
  console.log('Create token:', tokenRes.hash)
  if (tokenRes.hash) txHashes.push(tokenRes.hash)
  await new Promise(r => setTimeout(r, 5000))

  // Find token address
  const tokensRes = await callApi(`/tokens/creator/${wallet1.address}`)
  if (tokensRes.tokens?.length > 0) {
    tokenAddress = tokensRes.tokens[0].address
    console.log('Token address:', tokenAddress)

    // 5. Transfer tokens
    nonce = await getNonce(wallet1.address)
    const tokenTransferRes = await sendTx(
      wallet1.private_key, 'transfer_token', wallet1.address, null, 0, nonce,
      { contract: tokenAddress, to: wallet2.address, amount: 250_000 }
    )
    console.log('Token transfer:', tokenTransferRes.hash)
    if (tokenTransferRes.hash) txHashes.push(tokenTransferRes.hash)
    await new Promise(r => setTimeout(r, 3000))
  }

  // 6. Deploy contract
  nonce = await getNonce(wallet1.address)
  const deployRes = await sendTx(
    wallet1.private_key, 'deploy_contract', wallet1.address, null, 0, nonce,
    {
      name: 'Counter',
      token: null,
      variables: [{ name: 'count', type: 'u256', default: 0 }],
      mappings: [],
      functions: [
        { name: 'increment', modifiers: ['mut'], args: [], body: 'count += 1; signal CountChanged(count);', returns: null },
        { name: 'get_count', modifiers: ['view'], args: [], body: 'return count;', returns: 'u256' }
      ],
    }
  )
  console.log('Deploy contract:', deployRes.hash)
  if (deployRes.hash) txHashes.push(deployRes.hash)
  await new Promise(r => setTimeout(r, 5000))

  // Find contract address
  const contractsRes = await callApi(`/contracts/creator/${wallet1.address}`)
  if (contractsRes.contracts?.length > 0) {
    contractAddress = contractsRes.contracts[0].address
    console.log('Contract address:', contractAddress)

    // 7. Call contract
    nonce = await getNonce(wallet1.address)
    const callRes = await sendTx(
      wallet1.private_key, 'call_contract', wallet1.address, null, 0, nonce,
      { contract: contractAddress, method: 'increment', args: [], amount: 0 }
    )
    console.log('Call contract:', callRes.hash)
    if (callRes.hash) txHashes.push(callRes.hash)
    await new Promise(r => setTimeout(r, 3000))
  }

  // 8. More transfers
  for (let i = 0; i < 2; i++) {
    nonce = await getNonce(wallet1.address)
    const r = await sendTx(wallet1.private_key, 'transfer', wallet1.address, wallet2.address, 100_000_000, nonce)
    if (r.hash) txHashes.push(r.hash)
    await new Promise(r => setTimeout(r, 2000))
  }

  await new Promise(r => setTimeout(r, 5000))
  console.log(`\n=== Setup complete: ${txHashes.length} txs ===`)
})

test('01 - Dashboard', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-01-dashboard.png', fullPage: true })
})

test('02 - Explorer Blocks', async ({ page }) => {
  await page.goto('/explorer')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-02-explorer-blocks.png', fullPage: true })
})

test('03 - Explorer Transactions', async ({ page }) => {
  await page.goto('/explorer')
  await page.waitForTimeout(1000)
  const tab = page.getByRole('tab', { name: /transaction/i })
  if (await tab.isVisible()) await tab.click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-03-explorer-txs.png', fullPage: true })
})

test('04 - Explorer Tokens', async ({ page }) => {
  await page.goto('/explorer')
  await page.waitForTimeout(1000)
  const tab = page.getByRole('tab', { name: /token/i })
  if (await tab.isVisible()) await tab.click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-04-explorer-tokens.png', fullPage: true })
})

test('05 - Explorer Contracts', async ({ page }) => {
  await page.goto('/explorer')
  await page.waitForTimeout(1000)
  const tab = page.getByRole('tab', { name: /contract/i })
  if (await tab.isVisible()) await tab.click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-05-explorer-contracts.png', fullPage: true })
})

test('06 - Block Detail (latest)', async ({ page }) => {
  const status = await callApi('/status')
  await page.goto(`/block/${status.height}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-06-block-detail.png', fullPage: true })
})

test('07 - TX Detail (Faucet)', async ({ page }) => {
  test.skip(!txHashes[0], 'No tx')
  await page.goto(`/tx/${txHashes[0]}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-07-tx-faucet.png', fullPage: true })
})

test('08 - TX Detail (Transfer)', async ({ page }) => {
  test.skip(txHashes.length < 4, 'No transfer tx')
  await page.goto(`/tx/${txHashes[3]}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-08-tx-transfer.png', fullPage: true })
})

test('09 - TX Detail (Token Creation)', async ({ page }) => {
  test.skip(txHashes.length < 5, 'No token tx')
  await page.goto(`/tx/${txHashes[4]}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-09-tx-token.png', fullPage: true })
})

test('10 - TX Detail (Contract Deploy)', async ({ page }) => {
  test.skip(txHashes.length < 7, 'No deploy tx')
  await page.goto(`/tx/${txHashes[6]}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-10-tx-deploy.png', fullPage: true })
})

test('11 - Address Detail (active wallet)', async ({ page }) => {
  test.skip(!wallet1, 'No wallet')
  await page.goto(`/address/${wallet1.address}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-11-address-detail.png', fullPage: true })
})

test('12 - Address Detail (recipient)', async ({ page }) => {
  test.skip(!wallet2, 'No wallet2')
  await page.goto(`/address/${wallet2.address}`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-12-address-detail-2.png', fullPage: true })
})

test('13 - Wallet page', async ({ page }) => {
  await page.goto('/wallet')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-13-wallet.png', fullPage: true })
})

test('14 - Contracts IDE', async ({ page }) => {
  await page.goto('/contracts')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-14-contracts-ide.png', fullPage: true })
})

test('15 - Token Creator', async ({ page }) => {
  await page.goto('/tokens/create')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-15-token-creator.png', fullPage: true })
})

test('16 - Leaderboard', async ({ page }) => {
  await page.goto('/leaderboard')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-16-leaderboard.png', fullPage: true })
})

test('17 - Wallet Lab', async ({ page }) => {
  await page.goto('/learn/wallet')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-17-wallet-lab.png', fullPage: true })
})

test('18 - Vanity Generator', async ({ page }) => {
  await page.goto('/learn/vanity')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-18-vanity.png', fullPage: true })
})

test('19 - Node Connection', async ({ page }) => {
  await page.goto('/node')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/data-sweep-19-node.png', fullPage: true })
})

test('20 - Terminal', async ({ page }) => {
  await page.goto('/terminal')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/data-sweep-20-terminal.png', fullPage: true })
})
