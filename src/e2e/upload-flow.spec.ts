import { test, expect } from '@playwright/test'

test('upload flow: upload → mock AI → PDF link visible', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('/dashboard')
  
  // Wait for page to load
  await expect(page.locator('h1')).toContainText('Dashboard')

  // Fill in the form
  await page.fill('input[placeholder="Name oder Firma"]', 'Test Kunde GmbH')
  await page.fill('textarea[placeholder*="Beschreiben Sie Ihr Projekt"]', 'Testprojekt für AngebotNow - Gartenhausbau mit Terrasse')

  // Upload a test image
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'test-image.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data')
  })

  // Submit the form
  await page.click('button[type="submit"]')

  // Wait for success message (this will be an alert in the current implementation)
  // Note: In a real implementation, you might want to use a toast notification instead
  await page.waitForTimeout(3000) // Wait for processing

  // Navigate to quotes list
  await page.goto('/angebote')

  // Check that the quote appears in the list
  await expect(page.locator('text=Test Kunde GmbH')).toBeVisible()
  
  // Check that the status shows as completed
  await expect(page.locator('text=Abgeschlossen')).toBeVisible()

  // Click on the quote to view details
  await page.click('text=Details anzeigen')

  // Check that we're on the quote detail page
  await expect(page.locator('h1')).toContainText('Angebot Details')

  // Check that the PDF download link is visible
  await expect(page.locator('text=PDF herunterladen')).toBeVisible()

  // Verify the PDF link has the correct href pattern
  const pdfLink = page.locator('a[href*=".pdf"]')
  await expect(pdfLink).toBeVisible()
})
