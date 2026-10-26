/**
 * Screenshots every generator's default model into `public/og` as its 1200×630 link preview.
 * Run against a fresh build with `just social-cards` whenever the app's look changes.
 */
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { PAGES } from '../src/lib/pages.ts'
import { socialCardPath } from '../src/lib/seo.ts'

const server = await preview({ preview: { port: 0, host: '127.0.0.1' } })
const origin = server.resolvedUrls!.local[0].replace(/\/$/, '')
const browser = await chromium.launch()
try {
  for (const page of PAGES) {
    const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } })
    await tab.goto(`${origin}${page.href}`)
    await tab.locator('[data-triangles]').waitFor()
    // The shadow map and the first damped camera frames settle after the mesh lands.
    await tab.waitForTimeout(1500)
    await tab.screenshot({ path: `public${socialCardPath(page)}` })
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
