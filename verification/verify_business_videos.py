from playwright.sync_api import sync_playwright
import json

def verify_business_dashboard_videos():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # Log all requests to debug missing mocks
        page.on("request", lambda request: print(f">> {request.method} {request.url}"))
        page.on("response", lambda response: print(f"<< {response.status} {response.url}"))

        # Mock API responses

        # 1. Mock Authentication/Me
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "id": "business-1",
                "role": "BUSINESS",
                "email": "business@test.com"
            })
        ))

        # 2. Mock Training Videos
        page.route("**/api/v1/training-videos*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "items": [
                    {
                        "id": "vid-1",
                        "title": "YouTube Auto Cover",
                        "description": "Rick Astley thumbnail.",
                        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "cover_image": "",
                        "target_audience": "business",
                        "created_at": "2023-01-01T00:00:00Z"
                    },
                    {
                        "id": "vid-2",
                        "title": "Custom Cover Image",
                        "description": "Custom placeholder.",
                        "video_url": "https://example.com/video.mp4",
                        "cover_image": "https://placehold.co/600x400/orange/white?text=Custom+Cover",
                        "target_audience": "business",
                        "created_at": "2023-01-02T00:00:00Z"
                    },
                     {
                        "id": "vid-3",
                        "title": "Fallback Placeholder",
                        "description": "Default placeholder.",
                        "video_url": "https://example.com/video.mp4",
                        "cover_image": "",
                        "target_audience": "business",
                        "created_at": "2023-01-03T00:00:00Z"
                    }
                ],
                "meta": {"totalItems": 3, "itemCount": 3, "itemsPerPage": 10, "totalPages": 1, "currentPage": 1}
            })
        ))

        # 3. Mock Subscription
        page.route("**/api/v1/business/subscription", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "tier": "Gold"
            })
        ))

        # 4. Mock My Membership
        page.route("**/api/v1/membership/my-membership", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "id": "membership-1",
                "tier": {
                    "id": "tier-gold",
                    "name": "Gold"
                },
                "isTrial": False
            })
        ))

        # 5. Mock Business Profile
        page.route("**/api/v1/business/profile", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "id": "business-1",
                "name": "Test Business",
                "profileImage": "https://via.placeholder.com/50"
            })
        ))

        # 6. Mock Notifications
        page.route("**/api/v1/notifications*", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body=json.dumps({"items": [], "unreadCount": 0})
        ))

        # Set cookies
        context.add_cookies([
            {'name': 'access_token', 'value': 'dummy', 'domain': 'localhost', 'path': '/'},
            {'name': 'refresh_token', 'value': 'dummy', 'domain': 'localhost', 'path': '/'}
        ])

        try:
            print("Navigating to Business Dashboard Support page...")
            page.goto("http://localhost:3000/dashboard/support", timeout=60000)

            # Wait for content
            page.wait_for_selector("text=Support & Help Center", timeout=60000)

            # Wait for cards
            page.wait_for_selector("text=YouTube Auto Cover", timeout=10000)

            page.wait_for_timeout(2000)

            print("Taking screenshot...")
            page.screenshot(path="verification/business_dashboard_videos.png", full_page=True)
            print("Screenshot saved to verification/business_dashboard_videos.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_business_dashboard_videos()
