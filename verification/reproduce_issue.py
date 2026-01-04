
import json
from playwright.sync_api import sync_playwright

def verify_rewards_prefilling():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Set cookies for localhost:3000
        context.add_cookies([
            {"name": "access", "value": "mock_access_token", "domain": "localhost", "path": "/"},
            {"name": "refresh", "value": "mock_refresh_token", "domain": "localhost", "path": "/"},
            {"name": "access", "value": "mock_access_token", "url": "http://localhost:3000"},
            {"name": "refresh", "value": "mock_refresh_token", "url": "http://localhost:3000"}
        ])

        page = context.new_page()

        # Catch-all
        page.route("**/api/v1/**", lambda route: route.fulfill(status=200, body="{}"))

        # Auth & Sub
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(status=200, body=json.dumps({"id": "user1", "role": "business"})))
        page.route("**/api/v1/business/setup/status", lambda route: route.fulfill(status=200, body=json.dumps({"hasCampaign": True})))
        page.route("**/api/v1/business/subscription", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"tier": "Pro", "isTrial": False, "expiresAt": "2099-12-31T23:59:59Z"})
        ))
        page.route("**/api/v1/tiers/my-subscription", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"tier": {"name": "Pro", "configuration": {"quotas": {"maxActiveCampaigns": 100}}}, "isTrial": False, "expiresAt": "2099-12-31T23:59:59Z"})
        ))

        # Mock Campaign with an attached reward that is NOT in the default reward list
        campaign_reward_id = "reward_hidden_123"
        campaign_reward_title = "My Special Hidden Reward"

        page.route("**/api/v1/campaigns/camp_with_hidden_reward**", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body=json.dumps({
                "id": "camp_with_hidden_reward",
                "name": "Campaign with Hidden Reward",
                "campaign_type": "qr_code",
                "campaign_message": "Test",
                "start_date": "2024-01-01T00:00:00Z",
                "end_date": "2025-12-31T00:00:00Z",
                "quantity": 100,
                "audience_type": "all",
                "disabled": False,
                "banner_url": "",
                "logo_url": "",
                "businessRewards": [
                    {
                        "id": campaign_reward_id,
                        "title": campaign_reward_title,
                        "pointRequired": 100,
                        "description": "desc",
                        "image": "",
                        "quantity": 10,
                        "disabled": False
                    }
                ]
             })
        ))

        # Mock Business Rewards List - DOES NOT INCLUDE the above reward
        page.route("**/api/v1/rewards/business/my-added-rewards**", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "data": [
                    {"id": "reward_visible_1", "title": "Visible Reward A"},
                    {"id": "reward_visible_2", "title": "Visible Reward B"}
                ],
                "total": 2,
                "page": 1,
                "limit": 100,
                "totalPages": 1
            })
        ))

        # Mocks for other calls
        page.route("**/api/v1/business/tiers/usage", lambda route: route.fulfill(status=200, body=json.dumps({"features": {"campaigns": {"used": 0}}})))

        try:
            print("Navigating to Edit Campaign...")
            page.goto("http://localhost:3000/dashboard/campaigns/edit/camp_with_hidden_reward", wait_until="domcontentloaded")

            # Click Next to go to Step 2
            page.wait_for_selector("button:has-text('Next')", timeout=10000)
            page.click("button:has-text('Next')")

            # Wait for Step 2
            page.wait_for_selector("text=Step 2: Set Campaign Details", timeout=10000)

            # 1. Verify that the "Rewards to Attach" dropdown shows the selected reward as a value (tag)
            # React Select usually renders selected values in a specific div.
            # We look for the text of the title.
            print("Checking if hidden reward is selected...")

            # Wait a moment for effects to run
            page.wait_for_timeout(2000)

            try:
                # Expect to see the text in the "multi value" container
                page.wait_for_selector(f"text={campaign_reward_title}", timeout=5000)
                print(f"SUCCESS: Found '{campaign_reward_title}' in the UI.")
            except:
                print(f"FAILURE: Did not find '{campaign_reward_title}' in the UI.")
                page.screenshot(path="verification/failed_reward_display.png")

            page.screenshot(path="verification/step2_rewards.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_rewards_prefilling()
