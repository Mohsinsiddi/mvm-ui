import { test, expect } from '@playwright/test'

// iPhone 14 viewport
const MOBILE = { width: 390, height: 844 }

const pages = [
  { name: 'dashboard', path: '/' },
  { name: 'explorer', path: '/explorer' },
  { name: 'terminal', path: '/terminal' },
  { name: 'node', path: '/node' },
  { name: 'contracts', path: '/contracts' },
  { name: 'wallet', path: '/wallet' },
  { name: 'leaderboard', path: '/leaderboard' },
  { name: 'wallet-lab', path: '/learn/wallet' },
  { name: 'vanity', path: '/learn/vanity' },
  { name: 'token-creator', path: '/tokens/create' },
]

test.describe('Mobile Responsive - iPhone 14 (390x844)', () => {
  test.use({ viewport: MOBILE })

  for (const page of pages) {
    test(`${page.name} - no horizontal overflow`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1000)

      // Screenshot
      await p.screenshot({
        path: `e2e/screenshots/mobile-${page.name}.png`,
        fullPage: true,
      })

      // Check no horizontal overflow
      const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await p.evaluate(() => document.documentElement.clientWidth)

      expect(scrollWidth, `${page.name}: scrollWidth(${scrollWidth}) should be <= clientWidth(${clientWidth})`).toBeLessThanOrEqual(clientWidth)
    })

    test(`${page.name} - viewport screenshot`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1000)

      await p.screenshot({
        path: `e2e/screenshots/mobile-${page.name}-viewport.png`,
        fullPage: false,
      })
    })
  }

  test('header - mobile menu works', async ({ page: p }) => {
    await p.goto('/', { waitUntil: 'networkidle' })

    // Desktop nav should be hidden
    const desktopNav = p.locator('nav.hidden.lg\\:flex')
    await expect(desktopNav).toBeHidden()

    // Mobile menu button should be visible
    const menuButton = p.locator('button.lg\\:hidden').first()
    await expect(menuButton).toBeVisible()

    await menuButton.click()
    await p.waitForTimeout(500)

    await p.screenshot({
      path: 'e2e/screenshots/mobile-header-menu-open.png',
      fullPage: false,
    })
  })

  test('contracts IDE - tabs visible', async ({ page: p }) => {
    await p.goto('/contracts', { waitUntil: 'networkidle' })
    await p.waitForTimeout(1000)

    // Scroll down to see full page
    await p.screenshot({
      path: 'e2e/screenshots/mobile-contracts-top.png',
      fullPage: false,
    })

    // Check tabs are not overflowing
    const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await p.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })
})

test.describe('Desktop - 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const page of pages) {
    test(`${page.name} - desktop screenshot`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1000)

      await p.screenshot({
        path: `e2e/screenshots/desktop-${page.name}.png`,
        fullPage: true,
      })
    })
  }
})
