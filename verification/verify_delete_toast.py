import time
from playwright.sync_api import sync_playwright, expect

def verify_delete_toast():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()

        # Mock Admin Campaigns List
        page.route("**/api/v1/campaigns/admins*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''
            {
                "data": [
                    {
                        "id": "test-campaign-1",
                        "name": "Test Campaign for Deletion",
                        "campaignMessage": "This campaign will fail to delete",
                        "bannerUrl": "https://via.placeholder.com/300",
                        "logoUrl": "https://via.placeholder.com/100",
                        "campaignType": "QR_CODE",
                        "audienceType": "ALL",
                        "disabled": false
                    }
                ],
                "meta": { "total": 1, "page": 1, "limit": 10 }
            }
            '''
        ))

        # Mock Delete Campaign with Error
        def handle_delete(route):
            print(f"Intercepted DELETE request to {route.request.url}")
            route.fulfill(
                status=400,
                content_type="application/json",
                body='''
                {
                    "success": false,
                    "message": "Cannot delete this campaign template because it is currently running in one or more businesses."
                }
                '''
            )

        page.route("**/api/v1/campaigns/test-campaign-1", handle_delete)

        # Mock other potential calls to avoid errors
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(status=200, body='{"id": "admin-1", "role": "ADMIN"}'))

        # Navigate to the page
        print("Navigating to /admin/campaigns/list...")
        try:
            page.goto("http://localhost:3000/admin/campaigns/list", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")

        # Wait for campaign to appear
        print("Waiting for campaign card...")
        page.wait_for_selector("text=Test Campaign for Deletion", timeout=30000)

        # Click Delete (Trash icon)
        print("Clicking delete button...")
        # Finding the button inside the card. The button has title="Delete Campaign"
        page.click("button[title='Delete Campaign']")

        # Wait for confirmation dialog
        print("Waiting for confirmation dialog...")
        # Use a more specific selector for the modal
        page.wait_for_selector("div[role='alertdialog']", timeout=5000)

        # Click Confirm Delete
        print("Confirming delete...")
        # Target the "Delete" button specifically inside the alert dialog footer
        # The code uses AlertDialogAction with "Delete" text.
        page.click("div[role='alertdialog'] button:has-text('Delete')")

        # Wait for Toast
        print("Waiting for toast...")
        try:
            # We look for the exact message we mocked
            error_message = "Cannot delete this campaign template because it is currently running in one or more businesses."
            page.wait_for_selector(f"text={error_message}", timeout=10000)
            print("Toast appeared!")
        except Exception as e:
            print(f"Toast did not appear or text mismatch: {e}")
            page.screenshot(path="verification/failed_toast.png")
            raise e

        # Take screenshot
        page.screenshot(path="verification/delete_toast.png")
        print("Screenshot saved to verification/delete_toast.png")

        browser.close()

if __name__ == "__main__":
    verify_delete_toast()
