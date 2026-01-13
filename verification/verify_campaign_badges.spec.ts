
import { test, expect } from '@playwright/test';

test('verify days left badge on campaigns', async ({ page }) => {
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
      }
    ],
    total: 2,
    totalPages: 1
  };

  await page.route('**/api/v1/business/campaigns/my-created-campaigns*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCampaigns),
    });
  });

  // Mock other endpoints to prevent errors
  await page.route('**/api/v1/business/tier-usage', async route => route.fulfill({ json: {} }));
  await page.route('**/api/v1/business-dashboard/analytics', async route => route.fulfill({ json: { totalActiveCampaigns: 5 } }));
  await page.route('**/api/v1/notifications*', async route => route.fulfill({ json: { data: [], unreadCount: 0 } }));
  await page.route('**/api/v1/business/campaigns/claimable*', async route => route.fulfill({ json: { data: [] } }));
  await page.route('**/api/v1/business/campaigns/my-claimed-campaigns*', async route => route.fulfill({ json: { data: [] } }));


  // 2. Set Cookies and Navigate
  await page.context().addCookies([{
    name: 'access',
    value: 'mock-token',
    domain: 'localhost',
    path: '/'
  }]);

  await page.goto('http://localhost:3000/dashboard/campaigns/list');

  // 3. Wait for content
  await expect(page.getByText('My Campaigns')).toBeVisible();
  await expect(page.getByText('Expiring Soon Campaign')).toBeVisible();

  // 4. Verification
  // Check for "3 Days Left" badge on the first card
  // Check for "Active" badge on the second card (since > 7 days)

  await page.screenshot({ path: 'verification/campaign_badges.png', fullPage: true });
});
