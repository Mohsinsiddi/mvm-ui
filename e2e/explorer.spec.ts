import { test, expect } from '@playwright/test'

test.describe('Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer')
  })

  test('renders heading and search bar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible()
    await expect(page.getByText('Search and browse the blockchain')).toBeVisible()
    // Search bar should be present
    await expect(page.getByPlaceholder(/search/i)).toBeVisible()
  })

  test('renders all 4 tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Blocks/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Transactions/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Tokens/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Contracts/i })).toBeVisible()
  })

  test('blocks tab is active by default and shows content', async ({ page }) => {
    const blocksTab = page.getByRole('tab', { name: /Blocks/i })
    await expect(blocksTab).toHaveAttribute('data-state', 'active')
  })

  test('switching to Transactions tab works', async ({ page }) => {
    await page.getByRole('tab', { name: /Transactions/i }).click()
    const txTab = page.getByRole('tab', { name: /Transactions/i })
    await expect(txTab).toHaveAttribute('data-state', 'active')
  })

  test('switching to Tokens tab shows tokens or empty state', async ({ page }) => {
    await page.getByRole('tab', { name: /Tokens/i }).click()
    // Either token cards or "No tokens created yet"
    const content = page.getByText(/No tokens created yet/i).or(page.locator('[class*="card-hover"]').first())
    await expect(content).toBeVisible({ timeout: 10_000 })
  })

  test('switching to Contracts tab shows contracts or empty state', async ({ page }) => {
    await page.getByRole('tab', { name: /Contracts/i }).click()
    const content = page.getByText(/No contracts deployed yet/i).or(page.locator('[class*="card-hover"]').first())
    await expect(content).toBeVisible({ timeout: 10_000 })
  })
})
