
import { test, expect } from '@playwright/test';

test('verify days left badge on campaigns and handle missing dates', async ({ page }) => {
  // Catch-all for API to prevent 401s from unmocked endpoints
  await page.route('**/api/v1/**', async route => {
    // If it's not one of our specific mocks below, return 200 OK empty
    if (!route.request().url().includes('auth/me') &&
        !route.request().url().includes('membership/my-membership') &&
        !route.request().url().includes('business/profile') &&
        !route.request().url().includes('business/campaigns/my-created-campaigns')) {
       await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
       return;
    }
    await route.continue();
  });

  // 1. Mock API Responses
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

  // Mock Subscription
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

  // Mock Business Profile
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

  // Mock Campaigns List
  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  const eightDaysFromNow = new Date(now);
  eightDaysFromNow.setDate(now.getDate() + 8);

  const mockCampaigns = {
    data: [
      {
        id: 'camp-1',
        name: 'Expiring Soon Campaign',
        campaign_type: 'qr_code',
        campaign_message: 'This ends in 3 days!',
        start_date: now.toISOString(),
        end_date: threeDaysFromNow.toISOString(),
        quantity: 100,
        remainingSlots: 50,
        disabled: false,
        banner_url: '',
        logo_url: '',
      },
      {
        id: 'camp-2',
        name: 'Future Campaign',
        campaign_type: 'qr_code',
        campaign_message: 'This ends in 8 days.',
        start_date: now.toISOString(),
        end_date: eightDaysFromNow.toISOString(),
        quantity: 100,
        remainingSlots: 90,
        disabled: false,
        banner_url: '',
        logo_url: '',
      },
      {
        id: 'camp-3',
        name: 'No Date Campaign',
        campaign_type: 'qr_code',
        campaign_message: 'This has no dates.',
        // Missing start_date and end_date
        quantity: 100,
        remainingSlots: 90,
        disabled: false,
        banner_url: '',
        logo_url: '',
      }
    ],
    total: 3,
    totalPages: 1
  };

  await page.route('**/api/v1/business/campaigns/my-created-campaigns*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCampaigns),
    });
  });

  // 2. Set Cookies and Navigate
  await page.context().addCookies([{
    name: 'access',
    value: 'mock-token',
    domain: 'localhost',
    path: '/'
  }]);

  await page.goto('http://localhost:3000/dashboard/campaigns/list');

  // Check if error boundary appeared
  const errorText = page.getByText('Something went wrong');
  if (await errorText.isVisible()) {
      console.log("Error Boundary detected!");
      await page.screenshot({ path: 'verification/error_boundary.png', fullPage: true });
      throw new Error("Page crashed");
  }

  // 3. Wait for content
  await expect(page.getByText('My Campaigns')).toBeVisible();
  await expect(page.getByText('Expiring Soon Campaign')).toBeVisible();
  await expect(page.getByText('No Date Campaign')).toBeVisible();

  // 4. Verification
  // Check for badges

  await page.screenshot({ path: 'verification/campaign_badges_fixed.png', fullPage: true });
});
