import time
from playwright.sync_api import sync_playwright, expect

def verify_preview_header_links(page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # Register Catch-All
    page.route('**/api/v1/**', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{}'
    ))

    # Mock auth & subscription
    page.route('**/api/v1/auth/me*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"id":"user_1","email":"test@example.com","role":"BUSINESS"}'
    ))
    page.route('**/api/v1/business/subscription*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"tier":"Platinum","status":"active"}'
    ))
    page.route('**/api/v1/membership/my-membership*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"tier":{"name":"Platinum"},"status":"active"}'
    ))

    # Mock campaign
    camp_id = "5a6c31eb-3ba3-4785-b8f3-1e651600e137"
    page.route('**/api/v1/business/campaigns/claimable*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"data":[{"id":"' + camp_id + '", "name":"My Campaign", "banner_url":"", "campaign_type":"qr_code", "rewards":[]}]}'
    ))

    # Mock rewards to prevent crash
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

    print(f"Navigating to /dashboard/campaigns/preview/{camp_id}")
    # Set cookies
    context = page.context
    context.add_cookies([
        {'name': 'access', 'value': 'mock_access_token', 'domain': 'localhost', 'path': '/'},
        {'name': 'refresh', 'value': 'mock_refresh_token', 'domain': 'localhost', 'path': '/'}
    ])

    page.goto(f'http://localhost:3000/dashboard/campaigns/preview/{camp_id}')

    # Expect redirect to overview
    page.wait_for_url(f"**/dashboard/campaigns/preview/{camp_id}/overview", timeout=10000)

    print("Checking header links...")
    # Overview link
    overview_link = page.locator(f'a[href="/dashboard/campaigns/preview/{camp_id}/overview"]')
    expect(overview_link).to_be_visible()

    # Earn Points link
    earn_link = page.locator(f'a[href="/dashboard/campaigns/preview/{camp_id}/earn-points"]')
    expect(earn_link).to_be_visible()

    print("Verification complete.")

if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_preview_header_links(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path='verification/header_error.png')
        finally:
            browser.close()
