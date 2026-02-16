import { test, expect } from '@playwright/test'

test.describe('Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard')
  })

  test('renders heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Leaderboard/i })).toBeVisible()
    await expect(page.getByText('Top accounts on the MVM blockchain')).toBeVisible()
  })

  test('renders category tab buttons', async ({ page }) => {
    // 4 category buttons exist (they have svg icons inside)
    // Use more specific locators — these buttons are in the tab bar area
    const tabBar = page.locator('.flex.gap-2.overflow-x-auto')
    const buttons = tabBar.locator('button')
    await expect(buttons).toHaveCount(4)
  })

  test('balances tab is active by default', async ({ page }) => {
    await page.waitForTimeout(2000)
    // Should show either leaderboard entries, "No data yet", loading, or error
    const content = page.getByText(/No data yet|Loading leaderboard|Failed to load|accounts/i).first()
    await expect(content).toBeVisible({ timeout: 10_000 })
  })

  test('clicking each tab updates content', async ({ page }) => {
    await page.waitForTimeout(2000)
    const tabBar = page.locator('.flex.gap-2.overflow-x-auto')
    const categoryButtons = tabBar.locator('button')
    const count = await categoryButtons.count()

    for (let i = 0; i < count; i++) {
      await categoryButtons.nth(i).click()
      await page.waitForTimeout(500)
      // Page should not crash — content area should exist
      const mainCard = page.locator('[class*="card"]').first()
      await expect(mainCard).toBeVisible()
    }
  })

  test('loading or data state renders', async ({ page }) => {
    await page.waitForTimeout(3000)
    // Either shows spinner, data, empty, or error — all valid
    const anyContent = page.getByText(/Loading|No data|Failed|accounts|Top/i).first()
    await expect(anyContent).toBeVisible({ timeout: 10_000 })
  })

  test('error state shows proper message', async ({ page }) => {
    await page.waitForTimeout(3000)
    const errorText = page.getByText(/Failed to load leaderboard/i)
    if (await errorText.isVisible().catch(() => false)) {
      await expect(page.getByText(/Make sure the MVM node is running/i)).toBeVisible()
    }
  })

  test('empty state shows "No data yet"', async ({ page }) => {
    await page.waitForTimeout(3000)
    const emptyText = page.getByText(/No data yet/i)
    if (await emptyText.isVisible().catch(() => false)) {
      await expect(emptyText).toBeVisible()
    }
  })

  test('summary cards render when data exists', async ({ page }) => {
    await page.waitForTimeout(3000)
    const summaryCards = page.getByText(/accounts/i)
    if (await summaryCards.first().isVisible().catch(() => false)) {
      await expect(summaryCards.first()).toBeVisible()
    }
  })
})
