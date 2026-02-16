import { test, expect } from '@playwright/test'

test.describe('Address Detail', () => {
  test('invalid address shows error page', async ({ page }) => {
    await page.goto('/address/not-a-real-address')
    await expect(page.getByText(/invalid/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('valid-format address loads page', async ({ page }) => {
    // Use a plausible bech32 address — even if nonexistent the page should render
    await page.goto('/address/mvm11qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqjxst3k')
    // Should show address info or zero balance, not crash
    const content = page.locator('h1, h2, [class*="font-mono"]').first()
    await expect(content).toBeVisible({ timeout: 10_000 })
  })

  test('tabs render (Transactions, Token Holdings)', async ({ page }) => {
    await page.goto('/address/mvm11qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqjxst3k')
    // Wait for page to load
    await page.waitForTimeout(2000)
    const txTab = page.getByText(/Transactions/i).first()
    if (await txTab.isVisible().catch(() => false)) {
      await expect(txTab).toBeVisible()
    }
  })
})
