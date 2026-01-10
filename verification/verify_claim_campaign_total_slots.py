import time
from playwright.sync_api import sync_playwright, expect

def verify_claim_campaign_total_slots(page):
    # Log console messages
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # Register Catch-All first (so it's checked last)
    # Mock generic API to return success for anything else
    page.route('**/api/v1/**', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{}'
    ))

    # Mock authentication and subscription
    page.route('**/api/v1/auth/me*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"id":"user_1","email":"test@example.com","role":"BUSINESS"}'
    ))

    # Mock membership/subscription
    page.route('**/api/v1/membership/my-membership*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"tier":{"name":"Platinum","configuration":{"quotas":{"maxActiveCampaigns":10}}},"status":"active","isTrial":false}'
    ))

    page.route('**/api/v1/business/subscription*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"tier":"Platinum","status":"active"}'
    ))

    # Mock claimable campaigns (for the modal/hook if called)
    page.route('**/api/v1/business/campaigns/claimable*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"data":[{"id":"camp_1", "name":"Claimable Campaign", "banner_url":"/mock.jpg", "campaign_type":"qr_code", "rewards":[], "startDate":"2023-01-01T00:00:00Z", "endDate":"2023-12-31T23:59:59Z"}]}'
    ))

    # Mock business rewards for SelectRewardModal (unadded and my-added)
    # Important: Provide at least one reward so we can select it and proceed to the dates step.
    mock_rewards_body = '{"data":[{"id":"rew_1", "title":"Mock Reward", "pointRequired":100, "is_points_enabled":true}]}'
    page.route('**/api/v1/rewards/business/unadded-rewards*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body=mock_rewards_body
    ))
    page.route('**/api/v1/rewards/business/my-added-rewards*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body=mock_rewards_body
    ))
    page.route('**/api/v1/rewards/business/rewards*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body=mock_rewards_body
    ))

    # Mock Claim Campaign POST
    page.route('**/api/v1/business/campaigns/camp_1/claim', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"id":"new_camp_1", "name":"Claimed Campaign"}'
    ))

    print("Navigating to Campaign Preview page...")
    # Set cookies to simulate logged in state
    context = page.context
    context.add_cookies([
        {'name': 'access', 'value': 'mock_access_token', 'domain': 'localhost', 'path': '/'},
        {'name': 'refresh', 'value': 'mock_refresh_token', 'domain': 'localhost', 'path': '/'}
    ])

    # Go directly to the preview page for the mock campaign
    page.goto('http://localhost:3000/dashboard/campaigns/preview/camp_1/overview')

    # Wait for "Claim Campaign" button
    print("Waiting for Claim Campaign button...")
    claim_btn = page.locator('button:has-text("Claim Campaign")')
    expect(claim_btn).to_be_visible(timeout=10000)

    # Click Claim
    print("Clicking Claim...")
    claim_btn.click()

    # Select Reward Modal should open
    print("Waiting for Select Reward Modal...")
    page.wait_for_selector('text=Select Rewards', timeout=5000)

    # Select a reward
    print("Selecting a reward (clicking checkbox directly)...")
    # Click the checkbox by ID
    page.click('#rew_1')

    # Wait a bit for state update
    time.sleep(0.5)

    # Click Next
    print("Clicking Next...")
    next_btn = page.locator('button:has-text("Next")')
    expect(next_btn).to_be_enabled()
    next_btn.click()

    # Should now be on "Set Campaign Dates" step
    print("Waiting for Set Campaign Dates step...")
    page.wait_for_selector('text=Set Campaign Dates', timeout=5000)

    # Verify Total Slots input exists
    print("Checking for Total Slots input...")
    total_slots_label = page.locator('label:has-text("Total Slots")')
    expect(total_slots_label).to_be_visible()

    total_slots_input = page.locator('input[placeholder="e.g. 100"]')
    expect(total_slots_input).to_be_visible()

    print("Filling Total Slots...")
    total_slots_input.fill('50')

    print("Taking screenshot...")
    page.screenshot(path='verification/claim_campaign_total_slots.png')

    print("Verification complete.")

if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_claim_campaign_total_slots(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path='verification/error_claim.png')
        finally:
            browser.close()
