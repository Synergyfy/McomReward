import time
from playwright.sync_api import sync_playwright, expect

def verify_preview_page(page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # Register Catch-All
    page.route('**/api/v1/**', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{}'
    ))

    # Mock auth
    page.route('**/api/v1/auth/me*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"id":"user_1","email":"test@example.com","role":"BUSINESS"}'
    ))

    # Mock subscription
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

    # Mock claimable campaigns to return the specific campaign
    camp_id = "5a6c31eb-3ba3-4785-b8f3-1e651600e137"
    page.route('**/api/v1/business/campaigns/claimable*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='{"data":[{"id":"' + camp_id + '", "name":"My Campaign", "banner_url":"", "campaign_type":"qr_code", "rewards":[]}]}'
    ))

    print(f"Navigating to /dashboard/campaigns/preview/{camp_id}")
    # Set cookies
    context = page.context
    context.add_cookies([
        {'name': 'access', 'value': 'mock_access_token', 'domain': 'localhost', 'path': '/'},
        {'name': 'refresh', 'value': 'mock_refresh_token', 'domain': 'localhost', 'path': '/'}
    ])

    response = page.goto(f'http://localhost:3000/dashboard/campaigns/preview/{camp_id}')
    print(f"Response status: {response.status}")

    if response.status == 404:
        print("Got 404 Page Not Found from server.")
        page.screenshot(path='verification/preview_404.png')
    else:
        print("Page loaded. Waiting for redirect...")
        # Expect redirect to .../overview
        try:
            page.wait_for_url(f"**/dashboard/campaigns/preview/{camp_id}/overview", timeout=5000)
            print("Redirect successful.")
            page.screenshot(path='verification/preview_success.png')
        except:
            print("Redirect failed or timed out.")
            page.screenshot(path='verification/preview_failed.png')

if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_preview_page(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
