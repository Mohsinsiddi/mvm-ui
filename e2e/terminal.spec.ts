import { test, expect } from '@playwright/test'

test.describe('Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/terminal')
  })

  test('renders heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Terminal/i })).toBeVisible()
    await expect(page.getByText(/Command-line interface/i)).toBeVisible()
  })

  test('shows welcome message', async ({ page }) => {
    await expect(page.getByText('MVM Terminal v1.0')).toBeVisible()
    await expect(page.getByText(/Welcome to MVM Terminal/i)).toBeVisible()
  })

  test('help panel is visible by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Available Commands/i })).toBeVisible()
  })

  test('help toggle hides and shows panel', async ({ page }) => {
    // Click Hide to close
    await page.getByRole('button', { name: /Hide/i }).click()
    await expect(page.getByRole('heading', { name: /Available Commands/i })).not.toBeVisible()

    // Click Help to reopen
    await page.getByRole('button', { name: /Help/i }).click()
    await expect(page.getByRole('heading', { name: /Available Commands/i })).toBeVisible()
  })

  test('input field accepts text', async ({ page }) => {
    const input = page.getByPlaceholder('Enter command...')
    await expect(input).toBeVisible()
    await input.fill('help')
    await expect(input).toHaveValue('help')
  })

  test('executing "help" command shows command list', async ({ page }) => {
    const input = page.getByPlaceholder('Enter command...')
    await input.fill('help')
    await input.press('Enter')

    await expect(page.getByText(/Show all available commands/i)).toBeVisible({ timeout: 5_000 })
  })

  test('unknown command shows error', async ({ page }) => {
    const input = page.getByPlaceholder('Enter command...')
    await input.fill('foobar123')
    await input.press('Enter')

    await expect(page.getByText(/Unknown command: foobar123/i)).toBeVisible({ timeout: 5_000 })
  })

  test('command with missing args shows usage', async ({ page }) => {
    const input = page.getByPlaceholder('Enter command...')
    await input.fill('block')
    await input.press('Enter')

    await expect(page.getByText(/Usage: block/i)).toBeVisible({ timeout: 5_000 })
  })

  test('quick command buttons exist', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'status', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'mempool', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'tokens', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'wallet', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'block latest', exact: true })).toBeVisible()
  })

  test('quick command button fills input', async ({ page }) => {
    await page.getByRole('button', { name: 'status', exact: true }).click()
    const input = page.getByPlaceholder('Enter command...')
    await expect(input).toHaveValue('status')
  })

  test('clear command clears terminal history', async ({ page }) => {
    const input = page.getByPlaceholder('Enter command...')

    // Run a command first
    await input.fill('help')
    await input.press('Enter')
    await page.waitForTimeout(1000)

    // Now clear
    await input.fill('clear')
    await input.press('Enter')
    await page.waitForTimeout(500)

    // History should be cleared
    const historyItems = page.locator('pre').filter({ hasText: /Show all available commands/i })
    expect(await historyItems.count()).toBe(0)
  })
})
