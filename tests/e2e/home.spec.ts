import { test, expect } from '@playwright/test'
import percySnapshot from '@percy/playwright'

test.describe('Home Page Visual & Functional Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should display the Astral AI brand header', async ({ page }) => {
        await expect(page.locator('text=ASTRAL AI')).toBeVisible()
    })

    test('should have working navigation links', async ({ page }) => {
        const toolsLink = page.locator('text=Tools')
        await expect(toolsLink).toBeVisible()
        await toolsLink.click()
        await expect(page).toHaveURL(/.*tools/)
    })

    test('should take a visual snapshot', async ({ page }) => {
        // Visual Regression Check via Percy
        await percySnapshot(page, 'Astral AI Homepage - Neutral State')
    })

    test('should show auth buttons when unauthenticated', async ({ page }) => {
        await expect(page.locator('text=Get Started')).toBeVisible()
        await expect(page.locator('text=Sign In')).toBeVisible()
    })
})
