
import { test, expect } from '@playwright/test';

test('Verify standard campaign creation without dates', async ({ page }) => {
  // Mock necessary API calls
  await page.route('**/api/v1/business/campaigns/claimable**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });

  await page.route('**/api/v1/tiers**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'tier1', name: 'Standard Tier', price: 10, type: 'standard' },
      ]),
    });
  });

  await page.route('**/api/v1/rewards**', async (route) => {
     await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  // Mock campaign creation to prevent actual API call and verify payload
  await page.route('**/api/v1/campaigns', async (route) => {
    const payload = route.request().postDataJSON();
    console.log('Campaign Creation Payload:', payload);

    // Verify payload has empty strings for dates
    if (payload.start_date === '' && payload.end_date === '') {
        console.log('VERIFIED: start_date and end_date are empty strings');
        await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'new_campaign_id', name: payload.name }),
        });
    } else {
        console.error('FAILED: Dates are not empty strings', payload);
        await route.fulfill({ status: 400, body: 'Invalid payload' });
    }
  });


  // Navigate to the creation page
  // We need to set the tour param or something to trigger the wizard
  // Or just navigate to create page?
  // Based on file structure: src/app/admin/campaigns/create/page.tsx
  await page.goto('http://localhost:3000/admin/campaigns/create');

  // Step 1: Choose Plan Type
  // Select "Standard Plan"
  await page.click('text="Standard Plan"');
  // Wait for transition to step 2 (Campaign Type)
  // StepChoosePlanType calls onNext immediately

  // Step 2: Choose Campaign Type
  await expect(page.locator('text="Step 2: Choose Campaign Type"')).toBeVisible();
  // Select QR Code (default)
  await page.click('button:has-text("Next")');

  // Step 3: Select Tier
  await expect(page.locator('text="Step 3: Select Tier"')).toBeVisible();
  // Select the mock tier
  await page.click('text="Standard Tier"');
  await page.click('button:has-text("Next")');

  // Step 4: Set Campaign Details
  await expect(page.locator('text="Step 4: Set Campaign Details"')).toBeVisible();
  // Fill required fields
  await page.fill('#campaign-name-input', 'Test Standard Campaign');
  await page.fill('textarea[placeholder="What customers will see..."]', 'Test Message');
  // Select Audience Type (Members) - default might be unchecked
  // Check "Members" if not checked
  const membersCheckbox = page.locator('#members');
  if (!(await membersCheckbox.isChecked())) {
    await membersCheckbox.check();
  }

  // Select CTA Button Text (required for validation)
  await page.click('button:has-text("Select CTA text")'); // Trigger Select
  await page.click('div[role="option"]:has-text("Join Now")');

  // Ensure dates are NOT visible (standard plan)
  await expect(page.locator('text="Start Date & Time"')).not.toBeVisible();

  await page.click('button:has-text("Next")');

  // Step 5: Configure Earn Points
  await expect(page.locator('text="Step 5: Configure Earn Points"')).toBeVisible();
  await page.click('button:has-text("Next")');

  // Step 6: Configure Redeem Points
  await expect(page.locator('text="Step 6: Configure Redeem Points"')).toBeVisible();
  await page.click('button:has-text("Next")');

  // Step 7: Configure Contact Us
  await expect(page.locator('text="Step 7: Configure Contact Us"')).toBeVisible();
  await page.click('button:has-text("Next")');

  // Step 8: Configure Footer
  await expect(page.locator('text="Step 8: Configure Footer"')).toBeVisible();
  await page.click('button:has-text("Next")');

  // Step 9: Review and Create
  await expect(page.locator('text="Step 9: Review and Create Campaign"')).toBeVisible();

  // Click Create Campaign
  // This is where the validation used to block us
  // We need to capture the console log verification
  const [request] = await Promise.all([
    page.waitForRequest(req => req.url().includes('/api/v1/campaigns') && req.method() === 'POST'),
    page.click('#campaign-submit-btn')
  ]);

  const payload = request.postDataJSON();
  expect(payload.start_date).toBe('');
  expect(payload.end_date).toBe('');

  // Verify success dialog
  await expect(page.locator('text="Campaign Created Successfully!"')).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/standard_campaign_success.png' });
});
