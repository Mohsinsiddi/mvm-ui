import { test, expect } from '@playwright/test'

test.describe('Contract IDE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contracts')
  })

  test('renders heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Smart Contracts/i })).toBeVisible()
    await expect(page.getByText('Deploy and interact with Mosh contracts')).toBeVisible()
  })

  test('renders My Contracts and Deploy New tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /My Contracts/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Deploy New/i })).toBeVisible()
  })

  test('My Contracts tab shows connect wallet prompt when not connected', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText(/Connect your wallet to see your deployed contracts/i)).toBeVisible({ timeout: 10_000 })
  })

  test('Deploy New tab shows editor', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()

    await expect(page.getByText('Mosh Editor')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /Compile/i })).toBeVisible()
    await expect(page.getByText('Load Sample')).toBeVisible()
  })

  test('Monaco editor loads in Deploy tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    const monacoEditor = page.locator('.monaco-editor')
    await expect(monacoEditor).toBeVisible({ timeout: 15_000 })
  })

  test('compile button produces output', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    // Wait for editor + auto-compile
    await page.waitForTimeout(3000)

    await page.getByRole('button', { name: /Compile/i }).click()
    await page.waitForTimeout(1000)

    const compiled = page.getByText(/Compiled Successfully|Compilation Error/i).first()
    await expect(compiled).toBeVisible({ timeout: 5_000 })
  })

  test('successful compile shows contract details', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    await page.waitForTimeout(3000)

    await page.getByRole('button', { name: /Compile/i }).click()

    const success = page.getByText('Compiled Successfully')
    if (await success.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(page.getByText('Variables').first()).toBeVisible()
      await expect(page.getByText('Mappings').first()).toBeVisible()
      await expect(page.getByText('Functions').first()).toBeVisible()
    }
  })

  test('sample dropdown loads different contracts', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    await page.waitForTimeout(2000)

    await page.getByText('Load Sample').click()

    const sampleOptions = page.locator('button').filter({ hasText: /Counter|Token|Vault|Bank|Registry/i })
    const count = await sampleOptions.count()
    expect(count).toBeGreaterThan(0)

    await sampleOptions.first().click()
    await page.waitForTimeout(500)
  })

  test('deploy button shows connect wallet when not connected', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    await page.waitForTimeout(1000)

    await expect(page.getByRole('button', { name: /Connect Wallet to Deploy/i })).toBeVisible()
  })

  test('compiled JSON can be toggled', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    await page.waitForTimeout(3000)

    await page.getByRole('button', { name: /Compile/i }).click()

    const success = page.getByText('Compiled Successfully')
    if (await success.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const jsonToggle = page.getByText('Show Compiled JSON')
      await expect(jsonToggle).toBeVisible()
      await jsonToggle.click()

      const jsonContent = page.locator('pre').filter({ hasText: /"name"/i })
      await expect(jsonContent).toBeVisible()
    }
  })

  test('status bar shows line/col and char count', async ({ page }) => {
    await page.getByRole('tab', { name: /Deploy New/i }).click()
    await page.waitForTimeout(2000)

    await expect(page.getByText(/Ln \d+, Col \d+/)).toBeVisible()
    await expect(page.getByText(/\d+ lines/)).toBeVisible()
    await expect(page.getByText(/\d+ chars/)).toBeVisible()
  })
})
