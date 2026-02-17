import { test } from '@playwright/test'

const MOBILE = { width: 390, height: 844 }

test.describe('ContractIDE Mobile', () => {
  test.use({ viewport: MOBILE })

  test('deploy tab - editor view', async ({ page }) => {
    await page.goto('/contracts?tab=deploy', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: 'e2e/screenshots/mobile-ide-deploy-viewport.png',
      fullPage: false,
    })

    await page.screenshot({
      path: 'e2e/screenshots/mobile-ide-deploy-full.png',
      fullPage: true,
    })
  })
})
