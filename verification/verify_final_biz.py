
import re
from playwright.sync_api import sync_playwright, expect

def verify_flows(page):
    # Mocking
    page.route("**/api/v1/qr-plaques", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{"id":"new-001", "name":"Created Plaque", "status":"ACTIVE"}'''
    ))
    page.route("**/api/v1/qr-plaques?**", lambda route: route.fulfill(
        status=200, body='''[]'''
    ))
    page.route("**/api/v1/business/subscription", lambda route: route.fulfill(
        status=200, body='''{"tier": {"name": "Gold", "qrCodeCount": 100}}'''
    ))

    # Test Business Create
    print("Testing Business Create...")
    page.goto("http://localhost:3000/dashboard/my-assets/qr-plaques/create")

    expect(page.get_by_text("Create QR Plaque")).to_be_visible()
    page.get_by_label("Name of the QR Plaque").fill("Business Created Test")

    with page.expect_request(lambda r: "/api/v1/qr-plaques" in r.url and r.method == "POST") as req:
        page.get_by_role("button", name="Save Template").click()

    print(f"Business Create POST Data: {req.value.post_data}")
    assert "Business Created Test" in req.value.post_data
    print("Business Create Verified.")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        verify_flows(page)
        print("ALL TESTS PASSED")
    except Exception as e:
        print(f"Test Failed: {e}")
    finally:
        browser.close()
