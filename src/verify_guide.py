
import time
from playwright.sync_api import Page, expect, sync_playwright

def test_guide_logic(page: Page):
    # 1. Setup Context
    context = page.context
    context.add_cookies([
        {"name": "access", "value": "dummy-token", "domain": "localhost", "path": "/"},
        {"name": "refresh", "value": "dummy-refresh-token", "domain": "localhost", "path": "/"}
    ])

    # 2. Base API Mock (Catch-all to prevent 401s)
    page.route("**/api/v1/**", lambda route: route.fulfill(status=200, json={}))

    # 3. Specific Mock: Profile (Needed for layout)
    page.route("**/api/v1/business/profile", lambda route: route.fulfill(json={
        "id": "biz-123", "name": "Test Business", "role": "Business", "isOnboarded": True,
        "email": "test@business.com", "phone": "1234567890", "address": "123 Test St",
        "socialMedia": [], "uniqueCode": "TEST1", "referralCapacity": 100,
        "affiliateCode": "AFF1", "referralPoints": "10", "reputationPoints": "100",
        "isDisabled": False, "totalPointsEarned": 0, "totalPointsRedeemed": 0
    }))

    # 4. Helper to set setup status
    def mock_status(has_reward=False, has_campaign=False, has_staff=False):
        # We define a handler that captures these values
        def handler(route):
            route.fulfill(json={
                "hasReward": has_reward,
                "hasCampaign": has_campaign,
                "hasStaff": has_staff
            })
        # Register on top of existing routes (most recent wins)
        page.route("**/api/v1/business/setup/status", handler)

    # --- Case 1: All False -> Reward Step ---
    print("Test Case 1: All False -> Expect REWARD")
    mock_status(False, False, False)

    page.goto("http://localhost:3000/dashboard", timeout=60000)

    # Check Text
    reward_locator = page.locator("text=Navigate to the Rewards section")
    expect(reward_locator).to_be_visible(timeout=30000)
    expect(page.locator("text=Step 1 of 3")).to_be_visible()

    page.screenshot(path="/home/jules/verification/guide_case1.png")
    print("Case 1 Passed")

    # --- Case 2: Reward True -> Campaign Step ---
    print("Test Case 2: Reward True -> Expect CAMPAIGN")
    mock_status(has_reward=True, has_campaign=False, has_staff=False)

    page.reload()

    campaign_locator = page.locator("text=Next, go to Campaigns")
    expect(campaign_locator).to_be_visible(timeout=30000)
    expect(page.locator("text=Step 2 of 3")).to_be_visible()

    page.screenshot(path="/home/jules/verification/guide_case2.png")
    print("Case 2 Passed")

    # --- Case 3: Reward & Campaign True -> Staff Step ---
    print("Test Case 3: Reward & Campaign True -> Expect STAFF")
    mock_status(has_reward=True, has_campaign=True, has_staff=False)

    page.reload()

    staff_locator = page.locator("text=Manage your team by adding Staff")
    expect(staff_locator).to_be_visible(timeout=30000)
    expect(page.locator("text=Step 3 of 3")).to_be_visible()

    page.screenshot(path="/home/jules/verification/guide_case3.png")
    print("Case 3 Passed")

    # --- Case 4: All True -> Completed (Hidden) ---
    print("Test Case 4: All True -> Expect HIDDEN")
    mock_status(has_reward=True, has_campaign=True, has_staff=True)

    page.reload()

    # Wait a bit for layout to settle, ensure guide doesn't appear
    page.locator("text=Overview").wait_for()

    guide_header = page.locator("text=Setup Assistant")
    expect(guide_header).not_to_be_visible(timeout=10000)

    page.screenshot(path="/home/jules/verification/guide_case4.png")
    print("Case 4 Passed")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            test_guide_logic(page)
        except Exception as e:
            print(f"Test Failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
            raise e
        finally:
            browser.close()
