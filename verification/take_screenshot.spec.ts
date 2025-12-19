import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify campaign redeem page renders HTML description correctly', async ({ page }) => {
  const campaignId = 'test-campaign-id';
  const baseUrl = 'http://localhost:3000';

  // Mock campaign details
  await page.route(`**/api/v1/campaigns/public/business-campaign/${campaignId}`, async route => {
    const json = {
      id: campaignId,
      name: 'Test Campaign',
      redeemRewardPageTitle: 'Redeem Your Points',
      redeemRewardPageDescription: '<p class="test-desc">This is a <strong>bold</strong> description.</p>',
      businessRewards: [],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      campaignType: 'LOYALTY', // Required for some logic
      bannerUrl: 'http://placehold.it/1',
      logoUrl: 'http://placehold.it/1',
    };
    await route.fulfill({ json });
  });

  // Mock participant balance
  await page.route(`**/api/v1/participant-campaign-balance/my-balance/${campaignId}`, async route => {
    await route.fulfill({ json: { balance: 100 } });
  });

  // Mock membership check
  await page.route(`**/api/v1/participant-campaign-balance/is-joined/${campaignId}`, async route => {
      await route.fulfill({ json: { isJoined: true } });
  });

  await page.goto(`${baseUrl}/campaigns/${campaignId}/redeem-points`);

  // Wait for the description container
  const container = page.locator('.text-gray-600').filter({ hasText: 'description' }).first();
  await expect(container).toBeVisible({ timeout: 10000 });

  // Take screenshot
  const screenshotPath = path.join('verification', 'redeem_page_fixed.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
