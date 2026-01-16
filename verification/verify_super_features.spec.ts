import { test, expect } from '@playwright/test';

test('Super Business sees real redemptions and lightbox', async ({ page, context }) => {
  page.on('console', msg => console.log(msg.text()));

  await context.addCookies([
      { name: 'access', value: 'mock-token', domain: 'localhost', path: '/' },
      { name: 'refresh', value: 'mock-token', domain: 'localhost', path: '/' }
  ]);

  await page.addInitScript(() => {
    localStorage.setItem('userRole', 'Business');
    localStorage.setItem('userName', 'Super Biz');
  });

  // Mock global auth
  await page.route('**/api/v1/auth/me', async route => {
    await route.fulfill({ json: { id: 'user1', email: 'super@test.com', isSuperBusiness: true } });
  });
  await page.route('**/api/v1/business/profile*', async route => {
    await route.fulfill({ json: { id: 'bus1', isSuperBusiness: true, businessName: 'Super Biz' } });
  });

  // Mock Rewards
  await page.route('**/api/v1/matching-points/rewards/created*', async route => {
    await route.fulfill({
        json: {
            data: [{
                id: 'r1',
                title: 'Gallery Reward',
                short_description: 'Desc',
                required_points: 100,
                main_image: 'https://via.placeholder.com/150',
                gallery_images: ['https://via.placeholder.com/50']
            }],
            meta: { total: 1, page: 1, limit: 10 }
        }
    });
  });

  // Mock Redemptions
  await page.route('**/api/v1/matching-points/rewards/redeemed*', async route => {
      await route.fulfill({
          json: {
              data: [{
                  id: 'red1',
                  redeemedAt: new Date().toISOString(),
                  businessName: 'Client Biz',
                  rewardTitle: 'Gallery Reward',
                  pointsRedeemed: 100,
                  status: 'completed'
              }],
              meta: { total: 1, page: 1, limit: 10 }
          }
      });
  });

  await page.route('**/api/v1/subscriptions/my-subscription', async route => route.fulfill({ json: {} }));
  await page.route('**/api/v1/business/notifications*', async route => route.fulfill({ json: [] }));

  // Navigate
  await page.goto('http://localhost:3000/dashboard/matching-points');

  // Test Lightbox
  const thumbnail = page.locator('img[alt="gallery"]').first();
  await thumbnail.click();
  await expect(page.locator('div[role="dialog"]')).toBeVisible();
  await expect(page.locator('div[role="dialog"] img[alt="Preview"]')).toBeVisible();

  // Close Lightbox (click overlay or close button - we have a close button)
  await page.getByRole('button').filter({ has: page.locator('svg.lucide-x') }).click();
  await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

  // Test Redemptions Tab
  await page.getByRole('tab', { name: 'Redemptions' }).click();
  await expect(page.getByText('Client Biz')).toBeVisible();
});
