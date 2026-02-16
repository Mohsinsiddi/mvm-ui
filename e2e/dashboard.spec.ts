import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders hero section with title and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Mohsin.*Virtual Machine/i })).toBeVisible()
    await expect(page.getByText(/custom Layer 1 blockchain/i).first()).toBeVisible()
  })

  test('renders CTA buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Try Mosh IDE/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /View Explorer/i })).toBeVisible()
  })

  test('displays node connection status', async ({ page }) => {
    await expect(page.getByText(/Node Connected|Connecting/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('renders stats grid with 4 cards', async ({ page }) => {
    await expect(page.getByText('Block Height')).toBeVisible()
    await expect(page.getByText('Pending TXs')).toBeVisible()
    await expect(page.getByText('Block Time')).toBeVisible()
    // "Nodes" appears multiple times (stat card + footer etc)
    await expect(page.getByText('Nodes').first()).toBeVisible()
  })

  test('renders "What is MVM?" feature cards', async ({ page }) => {
    const section = page.getByText('What is MVM?')
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(page.getByText('Custom L1 Blockchain')).toBeVisible()
    await expect(page.getByText('Mosh Language').first()).toBeVisible()
    await expect(page.getByText('MVM-20 Tokens').first()).toBeVisible()
    await expect(page.getByText('Developer Tools')).toBeVisible()
  })

  test('renders code preview section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The Mosh Language' })).toBeVisible()
    await expect(page.getByText('forge Counter').first()).toBeVisible()
  })

  test('renders "Try It Out" cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Try It Out' })).toBeVisible()
    // These are link cards — check at least some exist
    await expect(page.getByText('Mosh IDE').first()).toBeVisible()
    await expect(page.getByText('Create Token').first()).toBeVisible()
  })

  test('renders quick action links', async ({ page }) => {
    // Scroll to bottom of page to find quick actions
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    // Scope to main to avoid matching nav/footer links with same name
    const main = page.locator('main')
    await expect(main.getByRole('link', { name: /My Wallet/i })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Contracts', exact: true })).toBeVisible()
  })
})
