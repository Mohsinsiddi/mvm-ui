import { test, expect } from '@playwright/test'

test.describe('Transaction Detail', () => {
  test('invalid tx hash shows not found', async ({ page }) => {
    await page.goto('/tx/invalidhash123')
    await expect(page.getByText(/Transaction Not Found|not found|error/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('page renders heading or error state', async ({ page }) => {
    await page.goto('/tx/abc')
    // Should show either tx detail or not found — page should not crash
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })
})
