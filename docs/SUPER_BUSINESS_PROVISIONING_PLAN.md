# Super Business — Privilege Model

> **Status:** Implemented.
>
> Super Business is no longer an account type with its own provisioning flow and
> login page. It is a **privilege flag** on a normal Business account, granted or
> revoked by an admin.

## 1. Model

A Business account is created the normal way (self-service signup or Central Hub
SSO JIT provisioning). `isSuperBusiness` defaults to `false`.

An admin can grant or revoke the privilege from `/admin/users/business`. Both
actions go through a confirmation modal. The badge in the business list shows
the current state.

```
Business account (normal login / SSO)
        │
        ├── isSuperBusiness = false → normal limits, subscription checks
        └── isSuperBusiness = true  → full access (unlimited campaigns/points,
                                       no subscription checks, ...)
```

## 2. Backend

### 2.1 Admin endpoint

```
PATCH /api/v1/admin/businesses/:id/super-business
Authorization: admin
Body: { "isSuperBusiness": true | false }
```

- `apps/api/src/resources/admin/dto/set-super-business.dto.ts`
  - `isSuperBusiness: boolean` (`@IsBoolean()`).
- `apps/api/src/resources/business/controllers/admin.business.controller.ts`
  - Admin-only route (`@Roles(Role.Admin)` at the controller level).
- `apps/api/src/resources/admin/services/admin.service.ts`
  - `setSuperBusiness(id, value)`:
    - 404s if the business does not exist.
    - No-ops when the value is unchanged.
    - Saves the flag and invalidates the guard cache.
    - Logs who/what changed (business email + id).

### 2.2 Immediate grant/revoke

`RolesGuard` no longer trusts the JWT claim for this privilege:

- `apps/api/src/resources/plans/services/plan-subscription.service.ts`
  - `isSuperBusiness(businessId)` reads the flag from the DB with a short-lived
    cache (same TTL config as the subscription cache, default 15s).
  - `invalidateSuperBusinessCache(businessId)` clears it on grant/revoke.
- `apps/api/src/common/guards/roles.guard.ts`
  - Uses the DB-backed read, then stamps the fresh value onto `request.user`.

Result: a revoked user loses Super access on their next request, without waiting
for the 1-hour access token to expire.

### 2.3 Login

Unchanged. Business users continue to use the normal login / Central Hub SSO.

`AuthService.login()` still adds `isSuperBusiness` and
`hasActiveSubscription: true` to the JWT for Super Businesses so the dashboard
UI can render the right state immediately. Authorization is enforced from the DB
as described above, so a stale claim cannot preserve privileges.

## 3. Frontend

- `/admin/users/business`
  - Badge next to the business name when `isSuperBusiness` is true, with a
    **“Super Business”** tooltip.
  - Row actions: **Grant Super Business** / **Revoke Super Business**.
  - Both open the shared `ConfirmationDialog` before calling the API.
  - On success the list is invalidated/refetched and a toast is shown.

## 4. Removed

The previous dedicated flow has been deleted:

- `POST /api/v1/auth/super-business/login`
- `AuthService.validateSuperBusiness()`
- `POST /api/v1/admin/create-super-business`
- `AdminService.createSuperBusiness()`
- `BusinessService.createSuperBusiness()`
- `CreateSuperBusinessDto` (API and web)
- `/super-business/login` page and `useSuperBusinessSignIn()`
- `/admin/super-business` page, sidebar link, and `useCreateSuperBusiness()`

Existing accounts that were created through the old flow keep their
`isSuperBusiness = true` flag and now log in through the standard login. No data
migration is required.

## 5. Verification

- `apps/api` → `nest build`: passes.
- `apps/web` → `tsc --noEmit`: passes.
- Focused specs:
  - `business-provisioning.spec.ts` — normal signup still sends OTP and stays
    unverified.
  - `auth-super-business.spec.ts` — Super Business JWT claims on normal login.
  - `super-business-privilege.spec.ts` — DB-backed privilege read, cache
    invalidation on revoke, missing business handling.

Note: the repository contains pre-existing stale specs
(`business.service.spec.ts`, `auth.service.spec.ts`,
`admin.controller.spec.ts`) that fail independently of this work.
