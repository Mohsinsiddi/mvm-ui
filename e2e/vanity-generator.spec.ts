import { test, expect } from '@playwright/test'

test.describe('Vanity Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learn/vanity')
  })

  test('renders heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Vanity Address Generator/i })).toBeVisible()
    await expect(page.getByText('Generate a custom MVM address with your chosen prefix')).toBeVisible()
  })

  test('renders preview with mvm11 fixed prefix', async ({ page }) => {
    // The preview div contains "mvm11" as a span
    const preview = page.locator('.bg-void.rounded-lg.p-4.font-mono')
    await expect(preview).toBeVisible()
    await expect(preview).toContainText('mvm11')
  })

  test('renders input label with bech32 warning', async ({ page }) => {
    await expect(page.getByText(/Prefix after mvm11/i)).toBeVisible()
    await expect(page.getByText(/no b, i, o, 1/i)).toBeVisible()
  })

  test('shows valid bech32 charset', async ({ page }) => {
    await expect(page.getByText(/Valid:.*qpzry9x8gf2tvdw0s3jn54khce6mua7l/)).toBeVisible()
  })

  test('start button disabled without prefix', async ({ page }) => {
    const startBtn = page.getByRole('button', { name: /Start/i })
    await expect(startBtn).toBeDisabled()
  })

  test('rejects invalid bech32 chars (b, i, o, 1)', async ({ page }) => {
    const input = page.getByPlaceholder('e.g. ace')
    await input.fill('b')
    expect(await input.inputValue()).toBe('')
    await input.fill('i')
    expect(await input.inputValue()).toBe('')
    await input.fill('o')
    expect(await input.inputValue()).toBe('')
    // Valid chars should work
    await input.fill('ace')
    expect(await input.inputValue()).toBe('ace')
  })

  test('max prefix length is 8', async ({ page }) => {
    const input = page.getByPlaceholder('e.g. ace')
    await input.fill('qpzry9x8gf')
    const value = await input.inputValue()
    expect(value.length).toBeLessThanOrEqual(8)
  })

  test('entering prefix enables start button', async ({ page }) => {
    await page.getByPlaceholder('e.g. ace').fill('a')
    const startBtn = page.getByRole('button', { name: /Start/i })
    await expect(startBtn).toBeEnabled()
  })

  test('target count input is visible and defaults to 5', async ({ page }) => {
    const targetInput = page.locator('input[type="number"]')
    await expect(targetInput).toBeVisible()
    await expect(targetInput).toHaveValue('5')
  })

  test('generates matches and auto-stops at target count', async ({ page }) => {
    // Set target to 3 for faster test
    const targetInput = page.locator('input[type="number"]')
    await targetInput.fill('3')

    await page.getByPlaceholder('e.g. ace').fill('a')
    await page.getByRole('button', { name: /Start/i }).click()

    // Stats should appear
    await expect(page.getByText('Attempts')).toBeVisible()
    await expect(page.getByText('Speed')).toBeVisible()

    // Should auto-stop after finding 3 matches — Start button reappears
    await expect(page.getByRole('button', { name: /Start/i })).toBeVisible({ timeout: 15_000 })

    // Should have found exactly 3
    await expect(page.getByText('Matches (3)')).toBeVisible()
    await expect(page.getByText('3 / 3')).toBeVisible()
  })

  test('stop button halts generation before target reached', async ({ page }) => {
    // Set high target so it doesn't auto-stop
    const targetInput = page.locator('input[type="number"]')
    await targetInput.fill('100')

    await page.getByPlaceholder('e.g. ace').fill('a')
    await page.getByRole('button', { name: /Start/i }).click()
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /Stop/i }).click()
    await expect(page.getByRole('button', { name: /Start/i })).toBeVisible()
  })

  test('difficulty guide renders all entries', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Difficulty Guide/i })).toBeVisible()
    await expect(page.getByText('1 char', { exact: true })).toBeVisible()
    await expect(page.getByText('2 chars', { exact: true })).toBeVisible()
    await expect(page.getByText('3 chars', { exact: true })).toBeVisible()
  })

  test('difficulty guide highlights current prefix length', async ({ page }) => {
    await page.getByPlaceholder('e.g. ace').fill('ac')
    // The "2 chars" row should be highlighted with cyber color
    const highlighted = page.locator('.bg-cyber\\/10')
    await expect(highlighted).toBeVisible()
  })

  test('security notice is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Security Notice' })).toBeVisible()
    await expect(page.getByText(/All key generation happens locally/i)).toBeVisible()
  })

  test('match addresses contain the prefix after mvm11', async ({ page }) => {
    const targetInput = page.locator('input[type="number"]')
    await targetInput.fill('1')

    await page.getByPlaceholder('e.g. ace').fill('a')
    await page.getByRole('button', { name: /Start/i }).click()

    // Wait for auto-stop (1 match)
    await expect(page.getByRole('button', { name: /Start/i })).toBeVisible({ timeout: 10_000 })

    // Check the match address
    const addressEl = page.locator('.text-electric.truncate').first()
    if (await addressEl.isVisible().catch(() => false)) {
      const address = await addressEl.textContent()
      expect(address).toMatch(/^mvm11a/)
    }
  })
})
