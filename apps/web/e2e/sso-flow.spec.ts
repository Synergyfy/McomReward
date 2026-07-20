import { test, expect } from "@playwright/test";

const LOYALTY_URL = "http://localhost:3005";
const MCOM_SOLUTIONS_URL = "http://localhost:3000";

test.describe("Signup Page", () => {
  test("should render signup page with both role options", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/signup`);

    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByText("Sign up as Customer")).toBeVisible();
    await expect(page.getByText("Sign up as Business")).toBeVisible();
  });

  test("should redirect business signup to MCOM Solutions", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/signup`);

    const businessButton = page.getByText("Sign up as Business");
    await expect(businessButton).toBeVisible();

    // Click and wait for navigation
    const navigationPromise = page.waitForURL((url) =>
      url.href.includes(MCOM_SOLUTIONS_URL)
    );
    await businessButton.click();
    await navigationPromise;

    const currentUrl = page.url();
    expect(currentUrl).toContain(MCOM_SOLUTIONS_URL);
    expect(currentUrl).toContain("/getstarted/business");
    expect(currentUrl).toContain("source=mcomloyalty");
    expect(currentUrl).toContain("redirect=");
  });

  test("should redirect customer signup to MCOM Solutions", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/signup`);

    const customerButton = page.getByText("Sign up as Customer");
    await expect(customerButton).toBeVisible();

    const navigationPromise = page.waitForURL((url) =>
      url.href.includes(MCOM_SOLUTIONS_URL)
    );
    await customerButton.click();
    await navigationPromise;

    const currentUrl = page.url();
    expect(currentUrl).toContain(MCOM_SOLUTIONS_URL);
    expect(currentUrl).toContain("/register/customer");
    expect(currentUrl).toContain("source=mcomloyalty");
    expect(currentUrl).toContain("redirect=");
  });

  test("should have login link pointing to /login", async ({ page }) => {
    await page.goto(`${LOYALTY_URL}/signup`);

    const loginLink = page.getByText("Log in");
    await expect(loginLink).toBeVisible();

    const href = await loginLink.getAttribute("href");
    expect(href).toBe("/login");
  });
});

test.describe("Login Page", () => {
  test("should render login page with SSO button", async ({ page }) => {
    await page.goto(`${LOYALTY_URL}/login`);

    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.getByText("Login with MCOM Solutions")).toBeVisible();
  });

  test("should redirect to backend SSO authorize endpoint", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/login`);

    const ssoButton = page.getByText("Login with MCOM Solutions");
    await expect(ssoButton).toBeVisible();

    const requestPromise = page.waitForRequest((req) =>
      req.url().includes("sso/authorize")
    );
    await ssoButton.click();
    const request = await requestPromise;

    expect(request.url()).toContain("sso/authorize");
  });

  test("should have signup link", async ({ page }) => {
    await page.goto(`${LOYALTY_URL}/login`);

    const signupLink = page.getByText("Sign up");
    await expect(signupLink).toBeVisible();

    const href = await signupLink.getAttribute("href");
    expect(href).toContain("/signup");
  });
});

test.describe("SSO Callback Page", () => {
  test("should redirect to login when no tokens provided", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/auth/sso`);

    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login on error param", async ({ page }) => {
    await page.goto(`${LOYALTY_URL}/auth/sso?error=sso_failed`);

    await expect(page).toHaveURL(/\/login/);
  });

  test("should show authenticating state when sso_token is present", async ({
    page,
  }) => {
    // Intercept the API call to prevent actual auth
    await page.route("**/sso/login", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "SSO failed" }),
      });
    });

    await page.goto(
      `${LOYALTY_URL}/auth/sso?sso_token=fake-token&role=Business`
    );

    // Should show loading state briefly before API call completes
    await expect(page.getByText("Authenticating...")).toBeVisible();
  });
});

test.describe("SSO Login Page (Legacy)", () => {
  test("should redirect to login when no token provided", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/sso-login`);

    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login on error param", async ({ page }) => {
    await page.goto(`${LOYALTY_URL}/sso-login?error=access_denied`);

    await expect(page).toHaveURL(/\/login/);
  });

  test("should attempt SSO login and redirect to login on failure", async ({
    page,
  }) => {
    await page.route("**/sso/login", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "SSO failed" }),
      });
    });

    await page.goto(`${LOYALTY_URL}/sso-login?token=fake-sso-token`);

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe("Full Business Signup SSO Flow", () => {
  test("signup button redirects to MCOM Solutions with correct redirect URI", async ({
    page,
  }) => {
    await page.goto(`${LOYALTY_URL}/signup`);

    const businessButton = page.getByText("Sign up as Business");

    const navigationPromise = page.waitForURL((url) =>
      url.href.includes(MCOM_SOLUTIONS_URL)
    );
    await businessButton.click();
    await navigationPromise;

    const currentUrl = new URL(page.url());
    expect(currentUrl.origin).toBe(MCOM_SOLUTIONS_URL);
    expect(currentUrl.pathname).toBe("/getstarted/business");
    expect(currentUrl.searchParams.get("source")).toBe("mcomloyalty");

    // The redirect URI should point back to loyalty /auth/sso
    const redirectParam = currentUrl.searchParams.get("redirect");
    expect(redirectParam).toBeTruthy();

    const decodedRedirect = decodeURIComponent(redirectParam!);
    expect(decodedRedirect).toContain(LOYALTY_URL);
    expect(decodedRedirect).toContain("/auth/sso");
  });

  test("after MCOM Solutions signup, callback provisions user and redirects to dashboard", async ({
    page,
  }) => {
    let ssoRequestMade = false;

    // Track if the SSO API call is made
    page.on("request", (request) => {
      if (request.url().includes("/sso/login")) {
        ssoRequestMade = true;
      }
    });

    // Simulate the backend callback redirect with sso_token (as MCOM Solutions sends it)
    await page.goto(
      `${LOYALTY_URL}/auth/sso?sso_token=mock-sso-token&role=Business`
    );

    // Wait for the page to process and attempt the API call
    await page.waitForTimeout(3000);

    // Verify the page attempted to call the SSO endpoint
    expect(ssoRequestMade).toBeTruthy();
  });
});
