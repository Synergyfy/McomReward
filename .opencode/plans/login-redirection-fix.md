# Plan: Fix SSO Login Redirect to MCOM Solutions Frontend

## Problem

When clicking "Login with MCOM Solutions" on `/login`, the flow goes through the MCOM Rewards backend (`/api/v1/sso/authorize`) first, then to MCOM Central. The user wants it to redirect **directly** to MCOM Solutions/Central, bypassing the MCOM Rewards backend entirely.

Additionally, the callback route (`/auth/sso`) expects `sso_token` and `role` params, but the OAuth2 code flow delivers `code` and `state` — so the callback is broken.

## Current (broken) flow

```
/login → {MCOM Rewards backend}/sso/authorize → MCOM Central authorize → MCOM Central /login →
MCOM Central redirects to {LOYALTY_FRONTEND_URL}/auth/sso?code=...&state=...
→ /auth/sso expects sso_token + role → BROKEN
```

## Desired flow

```
/login → MCOM Central /api/v1/auth/sso/authorize?client_id=...&redirect_uri={APP_URL}/auth/callback&state=...&scope=...
→ (if no session) MCOM Central /login → user logs in →
MCOM Central redirects to {APP_URL}/auth/callback?code=...&state=...
→ /auth/callback validates state, calls backend POST /sso/exchange → backend exchanges code → tokens returned → dashboard
```

---

## Changes Required

### 1. Frontend: Update Login Page (`apps/web/src/app/login/page.tsx`)

**What:** Change `handleSsoLogin` to redirect directly to MCOM Central's authorize endpoint instead of going through the MCOM Rewards backend.

**How:**
- Generate a random `state` using `crypto.randomUUID()`
- Store it in a cookie (`sso_state`) for CSRF validation on callback
- Build the authorize URL using `NEXT_PUBLIC_MCOM_CENTRAL_API` (already available in `.env`)
- Redirect the browser to `{NEXT_PUBLIC_MCOM_CENTRAL_API}/auth/sso/authorize?client_id=...&redirect_uri={APP_URL}/auth/callback&state=...&scope=profile%20email`

**Key env vars used (all already exist):**
- `NEXT_PUBLIC_MCOM_CENTRAL_API` = `http://localhost:3010/api/v1`
- `NEXT_PUBLIC_SSO_CLIENT_ID` = `mcom-loyalty`
- `NEXT_PUBLIC_APP_URL` = `http://localhost:3005`

---

### 2. Frontend: Create New Callback Page (`apps/web/src/app/auth/callback/page.tsx`)

**What:** New page at `/auth/callback` that handles the OAuth2 callback from MCOM Central.

**How:**
- Read `code` and `state` from URL search params
- Validate `state` against the `sso_state` cookie (CSRF protection)
- If state mismatch → redirect to `/login?error=invalid_state`
- If no `code` → redirect to `/login?error=missing_code`
- Call `POST /sso/exchange` on the MCOM Rewards backend with `{ code }`
- On success → store `accessToken` and `refreshToken` in cookies, redirect based on role
- On error → redirect to `/login?error=sso_failed`
- Show loading spinner while processing (same UX as existing `/auth/sso` page)

---

### 3. Frontend: Add `useSsoExchange` Hook (`apps/web/src/services/auth/hook.ts`)

**What:** Add a new React Query mutation hook for the code exchange API call.

**How:**
- Add `ssoExchange(code: string)` function that calls `POST /sso/exchange` with `{ code }`
- Add `useSsoExchange()` hook that:
  - On success: stores `accessToken` and `refreshToken` in cookies via `js-cookie`, calls `setBearerToken`
  - Returns the mutation for use in the callback page

**Response shape (matches existing `SsoCallbackResult`):**
```typescript
{
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  role: string;
}
```

---

### 4. Backend: Add `POST /sso/exchange` Endpoint (`apps/api/src/resources/sso/sso.controller.ts`)

**What:** New endpoint that accepts an auth code and returns JWT tokens.

**How:**
- Add `@Public() @Post("exchange")` endpoint
- Accept `{ code: string }` in request body
- Validate `code` is present (throw `BadRequestException` if missing)
- Call `ssoService.exchangeCode(code)`
- Return the result (tokens + user info) as JSON
- On error → throw `UnauthorizedException`

---

### 5. Backend: Add `exchangeCode()` Method (`apps/api/src/resources/sso/sso.service.ts`)

**What:** New service method that exchanges an auth code for tokens, provisions the user, and returns JWT tokens.

**How:**
- Very similar to existing `handleCallback()` method, but:
  - Does NOT validate state (frontend already did)
  - Returns result as JSON instead of building redirect URL
  - Uses redirect_uri = `{LOYALTY_FRONTEND_URL}/auth/callback` (matches what was sent in the authorize request)
- Steps:
  1. Call `mcomCentralService.exchangeCodeForToken(code, redirectUri)` to get tokens from MCOM Central
  2. Extract user info from token response
  3. Call `jitProvisionUser(centralUser)` to create/update local user
  4. If business user, call `syncSubscriptionFromCentral()`
  5. Generate MCOM Rewards JWT access + refresh tokens
  6. Return `{ accessToken, refreshToken, userId, name, role }`

---

### 6. Backend: Update `getAuthorizeUrl` redirect_uri (`apps/api/src/resources/sso/sso.service.ts`)

**What:** Update the redirect_uri in `getAuthorizeUrl()` to use `/auth/callback` instead of `/auth/sso`.

**How:**
- Change line 77: `const redirectUri = \`${this.mallFrontendUrl}/auth/sso\`;`
- To: `const redirectUri = \`${this.mallFrontendUrl}/auth/callback\`;`
- Also update line 98 in `handleCallback()` to match

**Note:** This also affects the existing `GET /sso/authorize` → `GET /sso/callback` flow. If backward compatibility is needed, create a separate method. But since the old flow was broken anyway, updating in place is fine.

---

## Prerequisite

**MCOM Central must have `{APP_URL}/auth/callback` registered as a valid redirect_uri for the `mcom-loyalty` SSO client.**

The redirect_uri must be registered on the MCOM Solutions/Central side. In development this would be `http://localhost:3005/auth/callback`, in production `https://mcomrewards.com/auth/callback`.

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/app/login/page.tsx` | Modify | Redirect directly to MCOM Central authorize |
| `apps/web/src/app/auth/callback/page.tsx` | Create | New OAuth2 callback page |
| `apps/web/src/services/auth/hook.ts` | Modify | Add `useSsoExchange` hook |
| `apps/api/src/resources/sso/sso.controller.ts` | Modify | Add `POST /sso/exchange` endpoint |
| `apps/api/src/resources/sso/sso.service.ts` | Modify | Add `exchangeCode()` method, update redirect_uri |

---

## Verification

1. Start MCOM Central (port 3010), MCOM Rewards API (port 4000), MCOM Rewards Web (port 3005)
2. Visit `http://localhost:3005/login`
3. Click "Login with MCOM Solutions"
4. Verify: browser redirects directly to MCOM Central's authorize endpoint (not to MCOM Rewards backend)
5. If no active session on MCOM Central → verify: redirected to MCOM Central's frontend login page
6. Log in on MCOM Central → verify: redirected to `http://localhost:3005/auth/callback?code=...&state=...`
7. Verify: callback page validates state, exchanges code, stores tokens, redirects to appropriate dashboard
8. If error occurs → verify: redirected to `/login` with error message
