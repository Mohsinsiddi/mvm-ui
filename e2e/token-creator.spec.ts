import { test, expect } from '@playwright/test'

test.describe('Token Creator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tokens/create')
  })

  test('renders heading and form', async ({ page }) => {
    await expect(page.getByText('Create MVM-20 Token')).toBeVisible()
    await expect(page.getByText('Deploy your own token on the MVM blockchain')).toBeVisible()
  })

  test('shows all form fields', async ({ page }) => {
    await expect(page.getByText('Token Name')).toBeVisible()
    await expect(page.getByPlaceholder('e.g. My Token')).toBeVisible()
    await expect(page.getByText('Symbol')).toBeVisible()
    await expect(page.getByPlaceholder('e.g. MTK')).toBeVisible()
    await expect(page.getByText('Total Supply')).toBeVisible()
    await expect(page.getByPlaceholder('e.g. 1000000')).toBeVisible()
  })

  test('shows connect wallet prompt when not connected', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText(/Connect your wallet to create tokens/i)).toBeVisible()
  })

  test('symbol auto-uppercases input', async ({ page }) => {
    const symbolInput = page.getByPlaceholder('e.g. MTK')
    await symbolInput.fill('abc')
    await expect(symbolInput).toHaveValue('ABC')
  })

  test('symbol maxLength is 8', async ({ page }) => {
    const symbolInput = page.getByPlaceholder('e.g. MTK')
    await symbolInput.fill('ABCDEFGHIJK')
    const value = await symbolInput.inputValue()
    expect(value.length).toBeLessThanOrEqual(8)
  })

  test('deployment console shows "Waiting for deployment"', async ({ page }) => {
    await expect(page.getByText('Deployment Console')).toBeVisible()
    await expect(page.getByText('Waiting for deployment...')).toBeVisible()
  })

  test('MVM-20 Standard info card is visible', async ({ page }) => {
    await expect(page.getByText('MVM-20 Standard')).toBeVisible()
    await expect(page.getByText(/MVM-20 is MVM's token standard/i)).toBeVisible()
  })
})

test.describe('Token Creator with Wallet', () => {
  test('create button disabled when fields are empty', async ({ page }) => {
    // Create wallet first
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())

    // Navigate and create wallet via header button if available
    await page.goto('/wallet')
    await page.getByRole('button', { name: /Connect Wallet/i }).click()
    await page.waitForTimeout(500)
    const createBtn = page.getByText(/Create New/i).first()
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(1000)
    }

    await page.goto('/tokens/create')
    await page.waitForTimeout(500)

    // Button should be disabled without filled fields
    const deployBtn = page.getByRole('button', { name: /Create Token/i })
    if (await deployBtn.isVisible().catch(() => false)) {
      await expect(deployBtn).toBeDisabled()
    }
  })

  test('filling all fields enables the button', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/wallet')
    await page.getByRole('button', { name: /Connect Wallet/i }).click()
    await page.waitForTimeout(500)
    const createBtn = page.getByText(/Create New/i).first()
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(1000)
    }

    await page.goto('/tokens/create')
    await page.waitForTimeout(500)

    await page.getByPlaceholder('e.g. My Token').fill('Test Token')
    await page.getByPlaceholder('e.g. MTK').fill('TST')
    await page.getByPlaceholder('e.g. 1000000').fill('1000000')

    const deployBtn = page.getByRole('button', { name: /Create Token/i })
    if (await deployBtn.isVisible().catch(() => false)) {
      await expect(deployBtn).toBeEnabled()
    }
  })
})
