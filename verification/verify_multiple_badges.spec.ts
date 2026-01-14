
import { test, expect } from '@playwright/test';

test('verify days left badge logic and missing date handling', async ({ page }) => {
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

  // Mock Campaigns List
  const now = new Date();

  // 1. Expiring Soon (Should have "Active" AND "3 Days Left")
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  // 2. Future (Should have "Active")
  const eightDaysFromNow = new Date(now);
  eightDaysFromNow.setDate(now.getDate() + 8);

  // 3. No Date (Should handle gracefully)

  // 4. Scheduled (Start date in future)
  const futureStart = new Date(now);
  futureStart.setDate(now.getDate() + 2);
  const futureEnd = new Date(now);
  futureEnd.setDate(now.getDate() + 10);

  const mockCampaigns = {
    data: [
      {
        id: 'camp-1',
        name: 'Expiring Soon Campaign',
        campaign_type: 'qr_code',
        campaign_message: 'Ends in 3 days',
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
        campaign_message: 'Ends in 8 days',
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
        campaign_message: 'No dates provided',
        // missing dates
        quantity: 100,
        remainingSlots: 90,
        disabled: false,
        banner_url: '',
        logo_url: '',
      },
      {
        id: 'camp-4',
        name: 'Scheduled Campaign',
        campaign_type: 'qr_code',
        campaign_message: 'Starts in 2 days',
        start_date: futureStart.toISOString(),
        end_date: futureEnd.toISOString(),
        quantity: 100,
        remainingSlots: 90,
        disabled: false,
        banner_url: '',
        logo_url: '',
      }
    ],
    total: 4,
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

  await page.waitForTimeout(1000); // Give it a sec to render

  // Verify Content
  await expect(page.getByText('My Campaigns')).toBeVisible();

  await page.screenshot({ path: 'verification/multiple_badges.png', fullPage: true });

  // Verify Badges
  // Camp 1: "Active" AND "3 Days Left"
  const camp1 = page.locator('.rounded-lg', { hasText: 'Expiring Soon Campaign' });
  await expect(camp1.getByText('Active')).toBeVisible();

  // Use regex to be more flexible (2, 3, or 4 days)
  const daysText = camp1.getByText(/Day(s)? Left/);
  await expect(daysText).toBeVisible();
  console.log('Days Left text:', await daysText.textContent());

  // Camp 2: Only "Active"
  const camp2 = page.locator('.rounded-lg', { hasText: 'Future Campaign' });
  await expect(camp2.getByText('Active')).toBeVisible();
  await expect(camp2.getByText(/Days Left/).first()).not.toBeVisible();

  // Camp 3: "No Date"
  const camp3 = page.locator('.rounded-lg', { hasText: 'No Date Campaign' });
  await expect(camp3.getByText('No Date')).toBeVisible();

  // Camp 4: "Scheduled"
  const camp4 = page.locator('.rounded-lg', { hasText: 'Scheduled Campaign' });
  await expect(camp4.getByText('Scheduled')).toBeVisible();
});
