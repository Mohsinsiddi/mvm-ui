import { test, expect } from '@playwright/test'

const ROUTES = [
  { path: '/', heading: 'Mohsin' },
  { path: '/explorer', heading: 'Explorer' },
  { path: '/wallet', heading: 'Wallet' },
  { path: '/terminal', heading: 'Terminal' },
  { path: '/node', heading: 'Node' },
  { path: '/contracts', heading: 'Smart Contracts' },
  { path: '/learn/wallet', heading: 'Wallet Lab' },
  { path: '/learn/vanity', heading: 'Vanity Address Generator' },
  { path: '/tokens/create', heading: 'Create MVM-20 Token' },
  { path: '/leaderboard', heading: 'Leaderboard' },
]

test.describe('All Pages Render', () => {
  for (const route of ROUTES) {
    test(`${route.path} loads without crash`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await page.goto(route.path)
      await expect(page.getByText(route.heading, { exact: false }).first()).toBeVisible({ timeout: 10_000 })
      expect(errors).toHaveLength(0)
    })
  }

  test('/block/0 (genesis) loads', async ({ page }) => {
    await page.goto('/block/0')
    // Either block detail shows or "Block Not Found"
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('/address/invalid shows error', async ({ page }) => {
    await page.goto('/address/invalidaddress')
    await expect(page.getByText(/invalid/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
