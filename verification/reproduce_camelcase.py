
import json
from playwright.sync_api import sync_playwright

def verify_camelcase_business_campaign():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        context.add_cookies([
            {"name": "access", "value": "mock", "domain": "localhost", "path": "/"},
            {"name": "refresh", "value": "mock", "domain": "localhost", "path": "/"},
            {"name": "access", "value": "mock", "url": "http://localhost:3000"},
            {"name": "refresh", "value": "mock", "url": "http://localhost:3000"}
        ])

        page = context.new_page()
        page.route("**/api/v1/**", lambda route: route.fulfill(status=200, body="{}"))

        # Auth & Sub
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(status=200, body=json.dumps({"id": "user1", "role": "business"})))
        page.route("**/api/v1/business/setup/status", lambda route: route.fulfill(status=200, body=json.dumps({"hasCampaign": True})))
        page.route("**/api/v1/business/subscription", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"tier": "Pro", "isTrial": False, "expiresAt": "2099-12-31"})
        ))
        page.route("**/api/v1/tiers/my-subscription", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"tier": {"name": "Pro", "configuration": {"quotas": {"maxActiveCampaigns": 100}}}, "isTrial": False})
        ))

        # Mock Campaign: Business Campaign structure but camelCase keys
        # "campaignType" instead of "campaign_type"
        # "businessRewards" populated
        # "rewards" empty or missing
        campaign_reward_title = "CamelCase Hidden Reward"

        page.route("**/api/v1/campaigns/camp_camelcase**", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body=json.dumps({
                "id": "camp_camelcase",
                "name": "CamelCase Campaign",
                "campaignType": "qr_code", # camelCase!
                # Missing campaign_type
                "campaignMessage": "Test",
                "startDate": "2024-01-01T00:00:00Z",
                "endDate": "2025-12-31T00:00:00Z",
                "quantity": 100,
                "audienceType": "all",
                "disabled": False,
                "bannerUrl": "",
                "logoUrl": "",
                "businessRewards": [
                    {
                        "id": "reward_camel_1",
                        "title": campaign_reward_title,
                        "pointRequired": 100,
                        "description": "desc",
                        "image": "",
                        "quantity": 10,
                        "disabled": False
                    }
                ],
                "rewards": [] # Empty
             })
        ))

        page.route("**/api/v1/rewards/business/my-added-rewards**", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"data": [], "total": 0})
        ))

        page.route("**/api/v1/business/tiers/usage", lambda route: route.fulfill(status=200, body=json.dumps({"features": {"campaigns": {"used": 0}}})))

        try:
            print("Navigating to Edit Campaign (CamelCase Mock)...")
            page.goto("http://localhost:3000/dashboard/campaigns/edit/camp_camelcase", wait_until="domcontentloaded")

            page.wait_for_selector("button:has-text('Next')", timeout=10000)
            page.click("button:has-text('Next')")

            page.wait_for_selector("text=Step 2: Set Campaign Details", timeout=10000)

            print("Checking if reward is selected...")
            page.wait_for_timeout(2000)

            try:
                page.wait_for_selector(f"text={campaign_reward_title}", timeout=5000)
                print(f"SUCCESS: Found '{campaign_reward_title}'.")
            except:
                print(f"FAILURE: Did not find '{campaign_reward_title}'.")
                page.screenshot(path="verification/failed_camelcase.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_camelcase_business_campaign()
