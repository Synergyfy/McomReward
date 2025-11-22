from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda msg: print(f"PAGE ERROR: {msg}"))

        # 1. Visit Campaign Page
        campaign_id = "test-campaign-123"
        target_url = f"http://localhost:3000/campaigns/{campaign_id}"
        print(f"Visiting Campaign Page: {target_url}")

        page.route("**/api/v1/campaigns/*", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body='{"id": "test-campaign-123", "name": "Test Campaign"}'
        ))

        response = page.goto(target_url)
        print(f"Page load status: {response.status}")

        page.wait_for_timeout(2000)
        page.screenshot(path="debug_campaign_page.png")

        # Check Session Storage
        storage = page.evaluate("() => sessionStorage.getItem('campaignId')")
        print(f"Session Storage campaignId: {storage}")

        if storage != campaign_id:
            print("FAILED: campaignId not found or incorrect in session storage")
            browser.close()
            return

        print("SUCCESS: Campaign ID found in session storage")
        # ... (rest skipped for debug)
        browser.close()

if __name__ == "__main__":
    run()
