from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with storage state if needed, or just clean
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Visit Campaign Page
            campaign_id = "test-campaign-123"
            print(f"Navigating to campaign page: http://localhost:3000/campaigns/{campaign_id}")
            page.goto(f"http://localhost:3000/campaigns/{campaign_id}")

            # Wait for content to load
            page.wait_for_selector("text=Exclusive Summer Rewards Extravaganza!", timeout=10000)

            # 2. Verify Debug Overlay is GONE
            # The debug overlay had "DEBUG: params=" text
            content = page.content()
            if "DEBUG: params=" in content:
                print("FAILURE: Debug overlay is still visible!")
            else:
                print("SUCCESS: Debug overlay is gone.")

            # 3. Take Screenshot
            os.makedirs("verification", exist_ok=True)
            screenshot_path = "verification/clean_campaign_page.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_campaign_page.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
