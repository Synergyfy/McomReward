import { test, expect } from '@playwright/test';

test.describe('Campaigns Page Filters', () => {
  test('should verify campaigns filters, sort, and pagination', async ({ page }) => {
    // Navigate to campaigns page
    await page.goto('http://localhost:3000/campaigns');

    // Check initial request (default params)
    const initialRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/v1/campaigns/all/public') &&
      request.url().includes('limit=10') &&
      request.url().includes('page=1')
    );
    await page.reload();
    const initialRequest = await initialRequestPromise;
    expect(initialRequest.url()).toContain('limit=10');
    expect(initialRequest.url()).toContain('page=1');

    // Test Search
    const searchInput = page.locator('input[placeholder="Search for campaigns..."]');
    await searchInput.fill('Test Campaign');

    const searchRequestPromise = page.waitForRequest(request =>
      request.url().includes('search=Test+Campaign')
    );
    await searchInput.press('Enter');
    const searchRequest = await searchRequestPromise;
    expect(searchRequest.url()).toContain('search=Test+Campaign');

    // Test Sort
    // Since default is DESC ("Newest First"), look for that trigger
    const sortTrigger = page.locator('button:has-text("Newest First")');
    await expect(sortTrigger).toBeVisible();
    await sortTrigger.click();

    // Select "Oldest First"
    const sortRequestPromise = page.waitForRequest(request =>
        request.url().includes('sort=ASC')
    );
    await page.getByRole('option', { name: 'Oldest First' }).click();
    const sortRequest = await sortRequestPromise;
    expect(sortRequest.url()).toContain('sort=ASC');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'verification/campaigns_page_filters.png', fullPage: true });
  });
});
