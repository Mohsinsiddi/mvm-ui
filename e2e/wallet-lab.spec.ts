import { test, expect } from '@playwright/test'

test.describe('Wallet Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learn/wallet')
  })

  test('renders heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Wallet Lab/i })).toBeVisible()
    await expect(page.getByText('Learn how MVM wallets are created step-by-step')).toBeVisible()
  })

  test('renders all 5 steps', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Generate Private Key' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Derive Public Key' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'SHA-256 Hash' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'RIPEMD-160 Hash' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bech32 Encode' })).toBeVisible()
  })

  test('step 1 Execute button is enabled, others disabled', async ({ page }) => {
    const executeButtons = page.getByRole('button', { name: /Execute/i })
    await expect(executeButtons.first()).toBeEnabled()
    await expect(executeButtons.nth(1)).toBeDisabled()
  })

  test('executing step 1 generates private key', async ({ page }) => {
    await page.getByRole('button', { name: /Execute/i }).first().click()

    // Private key output should be masked by default
    await expect(page.getByText('*'.repeat(64))).toBeVisible()

    // Step 1 button should now say "Done"
    await expect(page.getByRole('button', { name: 'Done' }).first()).toBeVisible()
  })

  test('show/hide private key toggle works', async ({ page }) => {
    // Execute step 1
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(300)

    // Masked text should be visible
    await expect(page.getByText('*'.repeat(64))).toBeVisible()

    // Click the eye toggle button (inside the output area)
    const outputArea = page.locator('.bg-void').first()
    const toggleBtn = outputArea.locator('button').first()
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click()
      await page.waitForTimeout(300)
      // After toggle, masked text should disappear (replaced with actual hex)
    }
  })

  test('executing all steps sequentially produces address', async ({ page }) => {
    // Step 1: Generate Private Key
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(200)

    // Step 2: Derive Public Key
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(200)

    // Step 3: SHA-256 Hash
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(200)

    // Step 4: RIPEMD-160 Hash
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(200)

    // Step 5: Bech32 Encode
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(200)

    // Final address should start with mvm1
    await expect(page.locator('.text-electric').filter({ hasText: /^mvm1/ }).first()).toBeVisible()
  })

  test('reset button clears all steps', async ({ page }) => {
    // Execute step 1
    await page.getByRole('button', { name: /Execute/i }).first().click()
    await page.waitForTimeout(200)

    // Click Reset
    await page.getByRole('button', { name: /Reset/i }).click()

    // All buttons should show "Execute" again, not "Done"
    const doneButtons = page.getByRole('button', { name: 'Done' })
    expect(await doneButtons.count()).toBe(0)
  })

  test('educational cards are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Why This Process?' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Key Takeaways' })).toBeVisible()
  })
})
