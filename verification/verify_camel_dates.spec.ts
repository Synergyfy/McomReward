
import { test, expect } from '@playwright/test';

test('verify camelCase date handling for campaigns', async ({ page }) => {
  // Catch-all for API to prevent 401s
  await page.route('**/api/v1/**', async route => {
    if (!route.request().url().includes('auth/me') &&
        !route.request().url().includes('membership/my-membership') &&
        !route.request().url().includes('business/profile') &&
        !route.request().url().includes('business/campaigns/my-created-campaigns')) {
       await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
       return;
    }
    await route.continue();
  });

  // Mock API Responses
  await page.route('**/api/v1/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        role: 'business',
        isSuperBusiness: true,
      }),
    });
  });

  await page.route('**/api/v1/membership/my-membership', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tier: { name: 'Platinum', configuration: { quotas: { maxActiveCampaigns: -1 } } },
        isTrial: false
      }),
    });
  });

  await page.route('**/api/v1/business/profile', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'biz-123',
        name: 'Super Biz',
        isSuperBusiness: true
      }),
    });
  });

  // Mock Campaigns List with camelCase dates
  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  const mockCampaigns = {
    data: [
      {
        id: 'camp-camel',
        name: 'Camel Case Campaign',
        campaign_type: 'qr_code',
        campaign_message: 'Ends in 3 days',
        // USING CAMEL CASE HERE
        startDate: now.toISOString(),
        endDate: threeDaysFromNow.toISOString(),
        // OMITTING SNAKE CASE
        quantity: 100,
        remainingSlots: 50,
        disabled: false,
        banner_url: '',
        logo_url: '',
      }
    ],
    total: 1,
    totalPages: 1
  };

  await page.route('**/api/v1/business/campaigns/my-created-campaigns*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCampaigns),
    });
  });

  // Set Cookies and Navigate
  await page.context().addCookies([{
    name: 'access',
    value: 'mock-token',
    domain: 'localhost',
    path: '/'
  }]);

  await page.goto('http://localhost:3000/dashboard/campaigns/list');

  await page.waitForTimeout(1000);

  // Verify Content
  await expect(page.getByText('My Campaigns')).toBeVisible();

  await page.screenshot({ path: 'verification/camel_case_dates.png', fullPage: true });

  // Verify Badges - Should NOT say "No Date"
  const camp = page.locator('.rounded-lg', { hasText: 'Camel Case Campaign' });
  await expect(camp.getByText('Active')).toBeVisible();
  await expect(camp.getByText(/Day(s)? Left/)).toBeVisible();
  await expect(camp.getByText('No Date')).not.toBeVisible();
});
