from playwright.sync_api import sync_playwright
import json

def verify_admin_videos():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # Mock API responses for Admin

        # 1. Tiers
        page.route("**/api/v1/tiers", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([{
                "id": "tier-1",
                "name": "Gold Tier",
                "features": []
            }])
        ))

        # 2. Training Videos (GET list)
        page.route("**/api/v1/training-videos?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "items": [],
                "meta": {"totalItems": 0, "itemCount": 0, "itemsPerPage": 10, "totalPages": 1, "currentPage": 1}
            })
        ))

        # 3. Create Training Video (POST)
        page.route("**/api/v1/training-videos", lambda route: route.fulfill(
            status=201,
            content_type="application/json",
            body=json.dumps({
                "id": "new-video-1",
                "title": "Test Video",
                "description": "Test Description",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "cover_image": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                "target_audience": "business",
                "created_at": "2023-01-01T00:00:00Z"
            })
        ))

        # Mock Auth
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "id": "admin-1",
                "role": "ADMIN",
                "email": "admin@test.com"
            })
        ))

        # Set cookies
        context.add_cookies([
            {'name': 'access_token', 'value': 'dummy', 'domain': 'localhost', 'path': '/'},
            {'name': 'refresh_token', 'value': 'dummy', 'domain': 'localhost', 'path': '/'}
        ])

        try:
            print("Navigating to Admin Resources page...")
            page.goto("http://localhost:3000/admin/resources", timeout=60000)

            # Wait for page to load
            page.wait_for_selector("text=Training, Support & Resource Management", timeout=60000)

            print("Opening Add New Video modal...")
            page.click("text=Add New Video")

            print("Entering YouTube URL...")
            page.fill("input#videoUrl", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

            # Wait for effect
            page.wait_for_timeout(2000)

            print("Verifying thumbnail preview...")
            if page.locator("img[alt='Cover Preview']").is_visible():
                print("Thumbnail preview is visible!")
            else:
                print("Thumbnail preview NOT visible.")

            # Screenshot
            page.screenshot(path="verification/admin_modal_preview.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_admin.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_admin_videos()
