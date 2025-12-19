import { test, expect } from '@playwright/test';

test('Verify campaign redeem page renders HTML description correctly', async ({ page }) => {
  const campaignId = 'test-campaign-id';
  const baseUrl = 'http://localhost:3000';

  // Mock campaign details
  // Hook: useGetPublicCampaignDetails -> /campaigns/public/business-campaign/${campaignId}
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
  // Hook: useGetParticipantBalance -> /participant-campaign-balance/my-balance/${campaignId}
  await page.route(`**/api/v1/participant-campaign-balance/my-balance/${campaignId}`, async route => {
    await route.fulfill({ json: { balance: 100 } });
  });

  // Mock membership check (if needed)
  // Hook: useCheckCampaignJoinStatus -> /participant-campaign-balance/is-joined/${campaignId}
  // Though the redeem page currently doesn't seem to call this explicitly, other components might.
  await page.route(`**/api/v1/participant-campaign-balance/is-joined/${campaignId}`, async route => {
      await route.fulfill({ json: { isJoined: true } });
  });

  await page.goto(`${baseUrl}/campaigns/${campaignId}/redeem-points`);

  // Wait for the description container
  const container = page.locator('.text-gray-600').filter({ hasText: 'description' }).first();
  await expect(container).toBeVisible({ timeout: 10000 });

  const textContent = await container.textContent();
  console.log('Container text content:', textContent);

  // We assert that the HTML tags are NOT rendered as text
  // This expectation fails in the current buggy state
  expect(textContent).not.toContain('<p');
  expect(textContent).not.toContain('</p>');
  expect(textContent).not.toContain('<strong>');

  // We assert that the actual text is present
  expect(textContent).toContain('This is a bold description.');

  // We assert that the points are still present (100)
  expect(textContent).toContain('100');
});
