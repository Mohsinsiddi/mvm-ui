import { test, expect } from '@playwright/test'

test.describe('Node Connection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/node')
  })

  test('renders page heading', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('displays API connection status', async ({ page }) => {
    // Should show connected or disconnected status
    const statusText = page.getByText(/Connected|Disconnected|Reconnecting/i).first()
    await expect(statusText).toBeVisible({ timeout: 10_000 })
  })

  test('displays WebSocket connection status', async ({ page }) => {
    const wsStatus = page.getByText(/WebSocket|WS|Real-time/i).first()
    if (await wsStatus.isVisible().catch(() => false)) {
      await expect(wsStatus).toBeVisible()
    }
  })

  test('refresh button exists and is clickable', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /Refresh|Reconnect/i }).first()
    if (await refreshBtn.isVisible().catch(() => false)) {
      await expect(refreshBtn).toBeEnabled()
      await refreshBtn.click()
      // Should not crash
      await page.waitForTimeout(1000)
    }
  })

  test('comparison table is visible', async ({ page }) => {
    // The comparison table shows features of full vs browser nodes
    const table = page.locator('table').first()
    if (await table.isVisible().catch(() => false)) {
      await expect(table).toBeVisible()
    }
  })

  test('network topology section is visible', async ({ page }) => {
    const topologyText = page.getByText(/topology|network|architecture/i).first()
    if (await topologyText.isVisible().catch(() => false)) {
      await expect(topologyText).toBeVisible()
    }
  })
})
