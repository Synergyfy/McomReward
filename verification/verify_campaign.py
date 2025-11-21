from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_campaign_flow(page: Page):
    # 1. Go to the campaign page (using the ID '1' as in the mock data)
    page.goto("http://localhost:3000/campaigns/1")

    # Wait for page to load
    page.wait_for_load_state("networkidle")

    # 2. Check for "Join Campaign & Get Reward" button (New User scenario)
    # There are two buttons (hero and sticky footer), we can pick the first one
    join_button = page.get_by_role("button", name="Join Campaign & Get Reward").first
    expect(join_button).to_be_visible()

    # 3. Click Join to open Dialog
    join_button.click()

    # 4. Verify Dialog opens and has Sign Up tab active
    expect(page.get_by_role("dialog")).to_be_visible()
    # The title might be "Join {Title}" or "Welcome Back"
    expect(page.get_by_text("Join Exclusive Summer Rewards")).to_be_visible()
    expect(page.get_by_role("button", name="Sign Up", exact=True)).to_have_class("pb-2 text-sm font-medium border-b-2 border-orange-600 text-orange-600")

    # Take screenshot of Signup Dialog
    page.screenshot(path="verification/signup_dialog.png")

    # 5. Switch to Login Tab
    page.get_by_role("button", name="Log In").click()
    expect(page.get_by_role("button", name="Log In", exact=True)).to_have_class("pb-2 text-sm font-medium border-b-2 border-orange-600 text-orange-600")

    # Take screenshot of Login Dialog
    page.screenshot(path="verification/login_dialog.png")

    # Close dialog (Click outside or press escape)
    page.keyboard.press("Escape")

    # 6. Check for "Login" button on main page (New User scenario)
    # This button was added next to the join button
    login_button = page.get_by_role("button", name="Login").first
    expect(login_button).to_be_visible()
    page.screenshot(path="verification/campaign_page_logged_out.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_campaign_flow(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
