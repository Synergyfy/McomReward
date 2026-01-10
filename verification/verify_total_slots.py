import time
from playwright.sync_api import sync_playwright, expect

def verify_total_slots(page):
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

    page.route('**/api/v1/business/campaigns/claimable*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"data":[]}'
    ))

    # Mock business rewards for Step 2 (with wildcards for query params)
    page.route('**/api/v1/rewards/business/unadded-rewards*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"data":[]}'
    ))
    page.route('**/api/v1/rewards/business/my-added-rewards*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"data":[]}'
    ))

    # Mock business setup status
    page.route('**/api/v1/business/setup/status*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"hasReward":true,"hasCampaign":false,"hasStaff":false}'
    ))

    # Mock notifications
    page.route('**/api/v1/notifications*', lambda route: route.fulfill(
         status=200,
         content_type='application/json',
         body='{"data":[]}'
    ))

    # Mock analytics
    page.route('**/api/v1/analytics*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"totalActiveCampaigns": 0, "totalPoints":100}'
    ))


    print("Navigating to Campaign Create page...")
    # Set cookies to simulate logged in state
    context = page.context
    context.add_cookies([
        {'name': 'access', 'value': 'mock_access_token', 'domain': 'localhost', 'path': '/'},
        {'name': 'refresh', 'value': 'mock_refresh_token', 'domain': 'localhost', 'path': '/'}
    ])

    page.goto('http://localhost:3000/dashboard/campaigns/create')

    # Step 1: Select Campaign Type
    print("Waiting for Step 1 content...")
    page.wait_for_selector('text=Step 1: Choose Campaign Type', timeout=10000)

    print("Selecting QR Code Campaign...")
    # Click the card with text "QR Code Campaign"
    page.click('text=QR Code Campaign')

    # Click Next
    print("Clicking Next...")
    page.click('button:has-text("Next")')

    # Step 2: Set Campaign Details
    print("Waiting for Step 2 content...")
    page.wait_for_selector('text=Step 2: Set Campaign Details', timeout=10000)

    # Check for "Total Slots" input
    print("Checking for Total Slots input...")
    total_slots_label = page.locator('label:has-text("Total Slots")')
    expect(total_slots_label).to_be_visible()

    total_slots_input = page.locator('input#totalSlots')
    expect(total_slots_input).to_be_visible()

    print("Taking screenshot of initial state...")
    page.screenshot(path='verification/step2_initial.png')

    # Test Validation
    print("Testing validation...")
    page.fill('input#campaignName', 'Test Campaign')
    total_slots_input.fill('')

    # Click Next to trigger validation
    page.click('button:has-text("Next")')

    # Check for error message
    error_msg = page.locator('text=Total slots is required (and a campaign total)')
    expect(error_msg).to_be_visible()

    print("Taking screenshot of validation error...")
    page.screenshot(path='verification/step2_validation.png')

    # Fill valid data
    print("Filling valid data...")
    total_slots_input.fill('100')

    print("Verification complete.")

if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_total_slots(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path='verification/error.png')
        finally:
            browser.close()
