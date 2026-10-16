# Partner Rewards API — FundOrDonate Integration Guide

Complete reference for integrating **FundOrDonate** with the **MCOM Rewards**
partner API, plus the outbound events MCOM Rewards sends back to FundOrDonate.

---

## 1. Overview

MCOM Rewards is the **rewards provider**. FundOrDonate is an **ecosystem peer**
that can:

1. **Fetch the rewards a specific user has earned.**
2. **Issue (grant) a reward to a user** — either a global MCOM catalogue reward or
   a reward that a **business owns** (the reward the business is giving them).
3. **Revoke an unused reward** — it disappears from the user's MCOM Rewards
   dashboard as well.
4. **Redeem (claim) a reward on the user's behalf** — or let the user claim it
   directly inside MCOM Rewards.

### Architecture: zero-hop service mesh

```
FundOrDonate ──(Bearer RS256 service token)──▶ MCOM Rewards
MCOM Rewards ──(Bearer RS256 service token)──▶ FundOrDonate  (lifecycle events)

             MCOM Central (control plane only)
             • mints RS256 service tokens
             • publishes JWKS at /.well-known/jwks.json
             • publishes the service registry
```

- Apps talk **DIRECTLY** to each other over HTTPS. **No request transits MCOM
  Central.**
- Authentication uses short-lived **RS256 service tokens** verified offline via
  JWKS. There are **no shared / webhook / HMAC secrets between apps**.

---

## 2. Conventions

| Item | Value |
|:--|:--|
| Base URL (MCOM Rewards) | `https://api.rewards.mcom.com` |
| Global prefix | `/api/v1` |
| Content type | `application/json` |
| Auth header | `Authorization: Bearer <service token>` |
| Optional caller header | `X-Caller-Id: fundordonate` (observability only) |
| Field casing | Request and response bodies use **camelCase** |
| Time format | ISO-8601 strings, e.g. `2026-12-31T00:00:00.000Z` |
| IDs | UUID strings |

**Panel/portal conventions (important):**

- **Unknown fields are rejected.** The API validates strictly — sending an
  undocumented field in the body or query returns `400` with a validation
  message. Send only the fields documented here.
- **Success responses are NOT wrapped.** A `2xx` returns the resource JSON
  directly. Only **errors** use the envelope in §8.
- **Response keys are camelCased automatically** (including inside `metadata` —
  e.g. `campaign_id` becomes `campaignId`).

---

## 3. Authentication

### 3.1 Mint a service token (call MCOM Rewards)

Use your Console credentials (`clientId` + `clientSecret`). Cache the token and
reuse it until near expiry.

```http
POST {MCOM_SOLUTIONS_URL}/api/v1/auth/service-token
Authorization: Basic base64("fundordonate:cs_live_xxx")
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "audience": "mcom-rewards",
  "scope": "rewards:read rewards:issue"
}
```

**Response:**

```jsonc
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...", // string (JWT)
  "token_type": "Bearer",
  "expires_in": 300                          // seconds
}
```

### 3.2 Delegated token (act on behalf of a logged-in user)

Use this when the *user* is the subject (e.g. FundOrDonate's own dashboard
listing "my MCOM rewards" for that user).

```http
POST {MCOM_SOLUTIONS_URL}/api/v1/auth/service-token/exchange
Authorization: Basic base64("fundordonate:cs_live_xxx")
Content-Type: application/json

{
  "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
  "subject_token": "<the user's MCOM SSO access token>",
  "audience": "mcom-rewards",
  "scope": "rewards:read rewards:issue"
}
```

The resulting token carries `sub` = the user id and `act.sub` = `fundordonate`.

### 3.3 Scopes used

| Scope | Grants |
|:--|:--|
| `rewards:read` | Catalogue + issuance reads |
| `rewards:issue` | Issue, redeem, revoke |
| `rewards:gift` | Platform-sponsored gifting of MCOM catalogue rewards to MCOM users (peer admins only) |

### 3.4 Verifying the events MCOM Rewards sends YOU (§6)

MCOM Rewards calls FundOrDonate with a Bearer token whose **audience is
`fundordonate`**. Verify it **offline**:

```ts
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
  new URL(`${MCOM_SOLUTIONS_URL}/.well-known/jwks.json`),
);

const { payload } = await jwtVerify(token, jwks, {
  issuer: "mcom-solutions",
  audience: "fundordonate",
  algorithms: ["RS256"],
});
const caller = payload.sub; // "mcom-rewards"
```

Do **not** expect or require any HMAC / `x-mcom-signature` header.

---

## 4. Endpoints

All paths are relative to `{base}/api/v1`.

Quick reference:

| Method | Path | Scope | Purpose |
|:--|:--|:--|:--|
| `GET` | `/partner/rewards` | `rewards:read` | List reward catalogue |
| `GET` | `/partner/rewards/{rewardId}` | `rewards:read` | Get one catalogue reward |
| `GET` | `/partner/business-rewards` | `rewards:read` | List rewards owned by a business |
| `POST` | `/partner/business-rewards/{businessRewardId}/issue` | `rewards:issue` | **Earn** — grant a business's own reward |
| `POST` | `/partner/rewards/{rewardId}/issue` | `rewards:issue` | **Earn** — issue a reward |
| `POST` | `/partner/rewards/{rewardId}/gift` | `rewards:gift` | **Admin gift** — platform-sponsored grant of an MCOM reward |
| `GET` | `/partner/issuances` | `rewards:read` | List my issuances / a user's rewards |
| `GET` | `/partner/issuances/me` | `rewards:read` | List *the user's* issuances (delegated) |
| `GET` | `/partner/issuances/{issuanceId}` | `rewards:read` | Get one issuance |
| `POST` | `/partner/issuances/{issuanceId}/redeem` | `rewards:issue` | **Claim** (FundOrDonate-initiated) |
| `POST` | `/partner/issuances/{issuanceId}/revoke` | `rewards:issue` | **Revoke** an unused reward |
| `GET` | `/me/partner-rewards` | *(user JWT)* | User's own rewards (MCOM UI) |
| `POST` | `/me/partner-rewards/{issuanceId}/claim` | *(user JWT)* | User claims in MCOM UI |

---

### 4.1 List the reward catalogue

```http
GET /api/v1/partner/rewards?page=1&limit=20&search=gift&rewardType=gift%20card
Authorization: Bearer <token>
```

**Query parameters** (`ListPartnerRewardsDto`):

| Name | Type | Required | Notes |
|:--|:--|:--|:--|
| `page` | integer | no | default `1`, min `1` |
| `limit` | integer | no | default `20`, min `1`, max `100` |
| `search` | string | no | free text on title/description, max `200` |
| `rewardType` | enum | no | see `RewardType` (§5) |
| `audience` | enum | no | see `RewardAudience` (§5) |

**Response** (`Paginated<CatalogReward>`):

```jsonc
{
  "data": [
    {
      "id": "b1f2...",                 // string (uuid)
      "title": "Amazon eGift Card",    // string
      "description": "Digital card",   // string
      "image": "https://...",          // string
      "gallery": ["https://..."],      // string[] | null
      "rewardType": "gift card",       // RewardType
      "source": "mcom vault",          // RewardSource
      "audience": "all business",      // RewardAudience
      "status": "active",              // RewardStatus ("active" | "draft")
      "value": 50,                     // number
      "maxPoints": 500,                // number | null
      "maxStampsRequired": null,       // number | null
      "isPointsEnabled": true,         // boolean
      "isStampsEnabled": false,        // boolean
      "quantity": 100,                 // number (0 = Unlimited)
      "expiresAt": "2026-12-31T00:00:00.000Z", // string | null
      "updatedAt": "2026-10-01T10:00:00.000Z"  // string
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 4.2 Get one catalogue reward

```http
GET /api/v1/partner/rewards/{rewardId}
Authorization: Bearer <token>
```

- **Path param:** `rewardId` — string (uuid).
- **Response:** a single `CatalogReward` object (§4.1).
- `404` if not found or disabled.

---

### 4.3 List the rewards a business owns

Returns the rewards a specific business owns (its own added rewards), so you can
pick one to grant. Identify the business by `mcomUserId` (preferred) or `email`.

```http
GET /api/v1/partner/business-rewards?mcomUserId=6f2c...&status=active&page=1&limit=20
Authorization: Bearer <token>
```

**Query parameters** (`ListBusinessRewardsDto`):

| Name | Type | Required | Notes |
|:--|:--|:--|:--|
| `mcomUserId` | string | one of these | MCOM user id of the business, max `200` |
| `email` | string | one of these | Business email |
| `page` | integer | no | default `1` |
| `limit` | integer | no | default `20`, max `100` |
| `search` | string | no | free text on title/description, max `200` |
| `status` | enum | no | `"active"` \| `"draft"` |
| `rewardType` | enum | no | see `RewardType` (§5) |

> At least one of `mcomUserId` / `email` is required, otherwise `400`.

**Response:**

```jsonc
{
  "business": {
    "id": "biz-1",              // string (uuid)
    "name": "Acme Ltd",
    "email": "shop@example.com",
    "mcomUserId": "6f2c..."     // string | null
  },
  "data": [ /* BusinessReward objects — see §5.2 */ ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

- `404 Business not found` when no business matches the identity.

#### 4.3.1 Issue a business's own reward

Grants a reward the business owns (`BusinessReward`) to a recipient — the reward
the business is **giving them**. The owning business is derived from the reward,
so it is not part of the body.

```http
POST /api/v1/partner/business-rewards/{businessRewardId}/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": { "email": "donor@example.com", "mcomUserId": "6f2c...", "name": "Jane Doe" },
  "quantity": 1,
  "idempotencyKey": "fod-br-2026-0001",
  "externalRef": "campaign-9",
  "expiresAt": "2026-12-31T00:00:00.000Z",
  "metadata": { "note": "Thanks for donating" }
}
```

- **Path param:** `businessRewardId` — string (uuid), from §4.3.
- **Body** (`IssueBusinessRewardDto`): see §5.3.

**Rules:**

- The **owning business's entitlement** is checked automatically (you don't send a
  `business`): active subscription, valid trial, or MCOM Rewards in its MCOM
  membership. Otherwise `403`.
- **Stock:** the business reward's `remainingQuantity` is consumed atomically.
  Out of stock → `400 Reward is out of stock`. Revoking or **expiring** an unused
  gift **returns its unit** to the business reward's `remainingQuantity`.
- **Idempotency:** same `idempotencyKey` returns the original issuance.
- `POINT_OFFER` business rewards require the recipient to resolve to a participant.
- The resulting issuance is linked to the business reward (`businessRewardId`) and
  its `rewardTitle` is the business reward's title; `rewardId` is the parent
  catalogue reward when the business reward derives from one (`sourceRewardId`).

**Response:** `201 Created` with the `Issuance` (§5.1) — note `businessRewardId`.

---

### 4.4 Fetch the rewards earned by a specific user

List issuances scoped to a recipient. Use the **app-level** token (not
delegated) and pass one or more recipient identifiers.

```http
GET /api/v1/partner/issuances?recipientMcomUserId=6f2c...&status=ISSUED
Authorization: Bearer <token>
```

**Query parameters** (`ListIssuancesDto`):

| Name | Type | Required | Notes |
|:--|:--|:--|:--|
| `page` | integer | no | default `1` |
| `limit` | integer | no | default `20`, max `100` |
| `externalRef` | string | no | your own reference, max `200` |
| `status` | enum | no | `RewardIssuanceStatus` (§5) |
| `recipientEmail` | string | no | filter to one recipient email, max `200` |
| `recipientMcomUserId` | string | no | filter to one MCOM user id, max `200` |
| `recipientUserId` | string | no | filter to a resolved local user id, max `200` |

> Recipient filters are available on the **app-level** token only. Delegated
> (`/me`) calls are always locked to the token's own user.

**Response** (`Paginated<Issuance>`):

```jsonc
{
  "data": [ /* Issuance objects — see §5 */ ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

**Delegated variant** — `GET /api/v1/partner/issuances/me` takes the **same
query params** (recipient filters are ignored) and returns only the token
user's issuances. Revoked rewards are hidden here.

---

### 4.5 Issue a reward (user earns it)

```http
POST /api/v1/partner/rewards/{rewardId}/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "business":  { "mcomUserId": "6f2c..." },
  "recipient": { "email": "donor@example.com", "mcomUserId": "6f2c...", "name": "Jane Doe" },
  "quantity": 1,
  "idempotencyKey": "fod-issuance-2026-0001",
  "externalRef": "campaign-9",
  "expiresAt": "2026-12-31T00:00:00.000Z",
  "metadata": { "note": "First donation" }
}
```

- **Path param:** `rewardId` — string (uuid).
- **Body** (`IssueRewardDto`): see §5 for exact types.

**Rules:**

- `business` must be **entitled** (active subscription, valid trial, or MCOM
  Rewards included in its MCOM membership package). Otherwise `403`.
- `recipient`: `email` is required; `mcomUserId` is the preferred identity for
  matching. `POINT_OFFER` rewards require the recipient to resolve to a
  participant account.
- **Idempotency:** repeated calls with the same `idempotencyKey` return the
  **original** issuance (no duplicate grant). Strongly recommended — use a
  stable key per logical grant.
- **Maximum units:** if the reward has a maximum quantity (`quantity > 0`;
  `0` = *Unlimited*), you cannot exceed it **ever**. Every issuance counts
  regardless of status, and revoking/expiring does **not** return capacity.
  Overshooting returns `400 Reward is out of stock`.

**Response:** `201 Created` with the created (or replayed) `Issuance` object (§5).

---

### 4.5.1 Gift a reward to a user (platform-sponsored / admin)

Use this when your **back office / admin** grants an MCOM catalogue reward to a
qualifying MCOM user *on the platform's behalf* — no sponsoring business is
involved and no business entitlement is checked. This is the flow for admins
that are **not** MCOM Central users (e.g. a FundOrDonate admin acting as an
app-level caller). It requires the dedicated **`rewards:gift`** scope.

```http
POST /api/v1/partner/rewards/{rewardId}/gift
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient": { "email": "member@example.com", "mcomUserId": "6f2c...", "name": "Jane Doe" },
  "quantity": 1,
  "idempotencyKey": "fod-gift-2026-0001",
  "externalRef": "qualification-9",
  "expiresAt": "2026-12-31T00:00:00.000Z",
  "metadata": { "note": "Qualified donor reward" }
}
```

- **Path param:** `rewardId` — string (uuid) of an **MCOM-admin-created**
  catalogue reward (only rewards with `source: "mcom vault"` may be gifted).
- **Body** (`GiftRewardDto`): see §5.3 — like `IssueRewardDto` but **without**
  `business`.

**Rules:**

- Only `source = "mcom vault"` rewards (created by the MCOM admin) can be gifted.
  Business-owned rewards keep their own `/partner/business-rewards/{id}/issue`
  flow.
- The **recipient must resolve to an MCOM account** (`Participant`); otherwise
  `400`. This ensures gifted rewards — including `POINT_OFFER` points — land in a
  real MCOM account and appear on the user's MCOM Rewards dashboard.
- **No business entitlement check** and no sponsoring business. The issuance
  metadata records `sponsor: { type: "platform", app: "<caller>" }`.
- **Idempotency, stock and fulfilment** behave exactly like §4.5: replayed keys
  return the original issuance; `quantity > 0` is a hard cumulative cap
  (`0` = unlimited); vouchers/coupons/gift cards get a code + Mall delivery;
  point offers are credited to the participant.
- Emits `reward.issued` (and later `reward.redeemed`/`reward.revoked`/`reward.expired`)
  to the caller exactly like the standard issue flow.

**Response:** `201 Created` with the created (or replayed) `Issuance` object (§5).

---

### 4.6 Revoke a reward the user has not used

```http
POST /api/v1/partner/issuances/{issuanceId}/revoke
Authorization: Bearer <token>
Content-Type: application/json

{ "reason": "requested by donor" }
```

- **Path param:** `issuanceId` — string (uuid).
- **Body** (`RevokeIssuanceDto`): `reason?` string, max `500`.

**Rules:**

- Only allowed while the issuance is **`ISSUED`** (the user has **not used it**).
  - Already used → `400 Cannot revoke a reward the recipient has already used`.
- **Point rewards (`POINT_OFFER`) cannot be revoked** — points were credited at
  issue time → `400 Cannot revoke a point reward: points have already been
  credited`.
- Idempotent: revoking an already-revoked issuance is a no-op.
- On success MCOM Rewards pushes `reward.revoked` to FundOrDonate (§6) and the
  reward is **removed from the user's MCOM Rewards dashboard**.
- Revoking a **business-reward** gift returns its unit to the business reward
  (`remainingQuantity` increments); the same happens when an unused gift **expires**
  (§6 `reward.expired`). Revoking a **catalogue** reward does **not** restore
  capacity (the catalogue cap is "total ever issued").

**Response:** `201 Created` with the updated `Issuance` object with `status: "REVOKED"`.

---

### 4.7 Redeem (claim) a reward — FundOrDonate-initiated

```http
POST /api/v1/partner/issuances/{issuanceId}/redeem
Authorization: Bearer <token>
Content-Type: application/json

{ "code": "MCOM-ABC123", "note": "collected at event" }
```

- **Path param:** `issuanceId` — string (uuid).
- **Body** (`RedeemIssuanceDto`):
  - `code?` string, max `200` — validate against the issuance's code when present.
  - `note?` string, max `500`.

**Rules:**

- The issuance must be `ISSUED`. Redeeming twice → `400`.
- If the issuance has a `code` and you send a different one → `400 Invalid redemption code`.
- Expired issuance → `400 Issuance has expired` (and it is marked `EXPIRED`).
- Emits `reward.redeemed` to FundOrDonate.

**Response:** `201 Created` with the updated `Issuance` with `status: "REDEEMED"` and `redeemedAt`.

---

### 4.8 First-party claim inside MCOM Rewards

The user can also claim directly in the MCOM Rewards UI. These endpoints use the
**user's normal JWT** (not a service token) and require the `Participant` role;
FundOrDonate does not call them.

| Method | Path | Body | Response |
|:--|:--|:--|:--|
| `GET` | `/api/v1/me/partner-rewards` | — (same query params as §4.4) | `Paginated<Issuance>` (revoked hidden) |
| `POST` | `/api/v1/me/partner-rewards/{issuanceId}/claim` | `{ "code": "...", "note": "..." }` | `Issuance` |

Claiming here still emits `reward.redeemed` to FundOrDonate.

---

## 5. Data types

### 5.1 `Issuance`

```ts
type RewardIssuanceStatus =
  | "ISSUED"    // granted, awaiting use
  | "REDEEMED"  // used by the recipient
  | "EXPIRED"   // passed expiry without use
  | "REVOKED"   // cancelled by the issuer (unused)
  | "FAILED";   // fulfilment failed

interface IssuanceRecipient {
  email: string;
  mcomUserId: string | null;
  userId: string | null;        // resolved local MCOM Rewards user id
  userType: string | null;      // "Business" | "Participant"
  name: string | null;
  resolved: boolean;            // matched a local account?
}

interface Issuance {
  id: string;                       // uuid
  rewardId: string | null;          // uuid of the catalogue reward, if any
  businessRewardId: string | null;  // uuid of the business's own reward, if sourced from one
  rewardTitle: string | null;
  issuerClientId: string;       // "fundordonate"
  externalRef: string | null;   // your reference
  idempotencyKey: string;
  recipient: IssuanceRecipient;
  code: string | null;          // redemption code (code-based rewards)
  status: RewardIssuanceStatus;
  rewardType: RewardType | null;
  value: number;
  pointsAwarded: number | null; // for POINT_OFFER
  mallReference: string | null; // external (Mall) reference, if any
  quantity: number;             // units granted by this issuance
  expiresAt: string | null;     // ISO-8601
  redeemedAt: string | null;    // ISO-8601
  revokedAt: string | null;     // ISO-8601
  metadata: Record<string, unknown> | null;
  createdAt: string;            // ISO-8601
  updatedAt: string;            // ISO-8601
}
```

### 5.2 `BusinessReward` (owned reward)

```ts
interface BusinessReward {
  id: string;                    // uuid
  businessId: string;            // uuid of the owning business
  title: string;
  description: string;
  image: string;
  gallery: string[] | null;
  rewardType: RewardType;
  source: RewardSource;
  audience: RewardAudience;
  status: RewardStatus;
  quantity: number | null;         // configured amount
  remainingQuantity: number | null; // still available
  pointsRequired: number | null;   // cost in points
  stampsRequired: number | null;   // cost in stamps
  isPointsEnabled: boolean;
  isStampsEnabled: boolean;
  isMallIntegrated: boolean;
  mallRewardValue: number;
  mallRewardType: "VOUCHER" | "GIFT_CARD" | "COUPON" | null;
  sourceRewardId: string | null;   // parent catalogue reward, if derived
  expiresAt: string | null;        // ISO-8601
  createdAt: string;               // ISO-8601
  updatedAt: string;               // ISO-8601
}
```

### 5.3 Request DTOs

```ts
interface IssuingBusinessDto {
  mcomUserId?: string;   // max 200 — preferred; one of mcomUserId/email required
  email?: string;        // valid email
}

interface IssueRewardRecipientDto {
  email: string;         // required, valid email
  mcomUserId?: string;   // max 200
  name?: string;         // max 200
}

interface IssueRewardDto {
  business: IssuingBusinessDto;      // required
  recipient: IssueRewardRecipientDto;// required
  quantity?: number;                 // int, min 1, default 1
  idempotencyKey?: string;           // max 200
  externalRef?: string;              // max 200
  expiresAt?: string;                // ISO-8601
  metadata?: Record<string, unknown>;
}

interface GiftRewardDto {
  recipient: IssueRewardRecipientDto;// required — must resolve to an MCOM account
  quantity?: number;                 // int, min 1, default 1
  idempotencyKey?: string;           // max 200
  externalRef?: string;              // max 200
  expiresAt?: string;                // ISO-8601
  metadata?: Record<string, unknown>;
}

interface IssueBusinessRewardDto {
  recipient: IssueRewardRecipientDto; // required — the business is derived from the reward
  quantity?: number;                  // int, min 1, default 1
  idempotencyKey?: string;            // max 200
  externalRef?: string;               // max 200
  expiresAt?: string;                 // ISO-8601
  metadata?: Record<string, unknown>;
}

interface RedeemIssuanceDto {
  code?: string;         // max 200
  note?: string;         // max 500
}

interface RevokeIssuanceDto {
  reason?: string;       // max 500
}

interface ListIssuancesDto {
  page?: number;                 // default 1
  limit?: number;                // default 20, max 100
  externalRef?: string;          // max 200
  status?: RewardIssuanceStatus;
  recipientEmail?: string;       // max 200 (app-level token only)
  recipientMcomUserId?: string;  // max 200 (app-level token only)
  recipientUserId?: string;      // max 200 (app-level token only)
}

interface ListPartnerRewardsDto {
  page?: number;                 // default 1
  limit?: number;                // default 20, max 100
  search?: string;               // max 200
  rewardType?: RewardType;
  audience?: RewardAudience;
}

interface ListBusinessRewardsDto {
  mcomUserId?: string;           // max 200 — one of mcomUserId/email required
  email?: string;                // valid email
  page?: number;                 // default 1
  limit?: number;                // default 20, max 100
  search?: string;               // max 200
  status?: RewardStatus;
  rewardType?: RewardType;
}
```

### 5.4 Enums

```ts
enum RewardType {
  VOUCHER = "Voucher",
  GIFT_CARD = "gift card",
  COUPON = "coupon",
  POINT_OFFER = "point offer",
  PHYSICAL_PRODUCT = "physical product",
}

enum RewardAudience {
  ALL_BUSINESS = "all business",
  SPECIFIC_SECTORS = "specific sectors",
  SPECIFIC_TIERS = "specific tiers",
}

enum RewardStatus { ACTIVE = "active", DRAFT = "draft" }

enum RewardSource { MCOM_VAULT = "mcom vault", PARTNER = "partner", BUSINESS = "business" }

enum RewardIssuanceStatus { ISSUED, REDEEMED, EXPIRED, REVOKED, FAILED }
```

### 5.5 Generic pagination

```ts
interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## 6. Outbound events (MCOM Rewards → FundOrDonate)

When something happens to an issuance, MCOM Rewards pushes an event **directly**
to FundOrDonate. FundOrDonate must expose a receiver endpoint.

```http
POST {fundordonate baseUrl}{MCOM_PARTNER_EVENT_PATH}
Authorization: Bearer <RS256 service token, aud = "fundordonate">
Content-Type: application/json

{
  "event": "reward.redeemed",
  "timestamp": "2026-10-15T10:00:00.000Z",
  "source": "mcom-rewards",
  "data": { /* the full Issuance object — see §5.1 */ }
}
```

**Events:**

| `event` | Fired when |
|:--|:--|
| `reward.issued` | A reward was issued (or replayed) |
| `reward.redeemed` | The reward was used (partner- or user-initiated) |
| `reward.expired` | The issuance passed its expiry (business-gift units are returned) |
| `reward.revoked` | An unused reward was revoked |

**Receiver requirements:**

1. Verify the Bearer token offline via Central's JWKS with
   `audience: "fundordonate"` (§3.4). Reject unauthenticated calls with `401`.
2. Respond `2xx` quickly; return `4xx/5xx` to be treated as a failure (delivery
   is best-effort and logged, not retried indefinitely).
3. Treat events as **idempotent** — key off `data.id` + `data.status`.
4. No HMAC / shared secret is used. Do not require a signature header.

---

## 7. Recommended integration flows

**A. Donor earns a reward**
1. `POST /partner/rewards/{rewardId}/issue` with a stable `idempotencyKey` and the
   donor as `recipient`.
2. Store `id` (issuance id) against your donation record.
3. MCOM Rewards also sends `reward.issued`.

**A2. Choose which reward a business offers**
- `GET /partner/business-rewards?mcomUserId=...` returns the rewards the business
  owns (with `remainingQuantity`, costs, etc.).
- To give someone a reward the **business itself** offers, issue it directly:
  `POST /partner/business-rewards/{businessRewardId}/issue` (no `business` field —
  the owner is derived, and its stock + entitlement are enforced).
- To issue a catalogue reward instead, use `POST /partner/rewards/{rewardId}/issue`.

**B. Show a user's rewards in FundOrDonate**
- Backend reconciliation: `GET /partner/issuances?recipientMcomUserId=...`.
- User-facing view (user is logged in): mint a **delegated** token (§3.2) and call
  `GET /partner/issuances/me`.

**C. User claims on FundOrDonate**
- `POST /partner/issuances/{issuanceId}/redeem` (with `code` if the reward has one).

**D. User claims inside MCOM Rewards**
- Nothing to call — the user claims in the MCOM Rewards UI, and you receive
  `reward.redeemed`.

**E. Cancel a reward (unused)**
- `POST /partner/issuances/{issuanceId}/revoke`; expect `reward.revoked`. If it was
  a business-reward gift, the unit is returned to the business reward's stock.

---

## 8. Errors

Error responses use this envelope (success `2xx` responses do **not**):

```jsonc
{
  "success": false,
  "message": "Reward is out of stock: maximum 3 unit(s), 3 already issued",
  // string OR string[] (validation returns an array)
  "code": "BUSINESS_NOT_ENTITLED", // string | null
  "timestamp": "2026-10-15T10:00:00.000Z"
}
```

| Status | `code` / message | Meaning |
|:--|:--|:--|
| `400` | validation array in `message` | Bad body/query (unknown field, wrong type, missing required) |
| `400` | `Provide either mcomUserId or email to identify the business` | Missing business identity (§4.3) |
| `400` | `Reward is not active` | Reward not `active`/not issuable |
| `400` | `Only platform (MCOM) catalogue rewards can be gifted via this endpoint` | `/gift` used with a non-`mcom vault` reward |
| `400` | `Gifted rewards require the recipient to resolve to an MCOM participant account` | `/gift` recipient is not an MCOM account |
| `400` | `Reward is out of stock: maximum N unit(s), M already issued` | Max unit cap reached |
| `400` | `Cannot redeem an issuance in status ...` / `Issuance has expired` | Illegal redemption |
| `400` | `Invalid redemption code` | `code` mismatch |
| `400` | `Cannot revoke a reward the recipient has already used` | Revoke blocked (redeemed) |
| `400` | `Cannot revoke a point reward: points have already been credited` | Revoke blocked (point offer) |
| `401` | `Invalid or expired service token` | Bad/expired token or audience mismatch |
| `403` | `Caller "<id>" is not permitted to call this service` | Ingress policy (`allowedCallers`) |
| `403` | `Forbidden: Missing required scope(s): ...` | Token lacks the scope |
| `403` | `BUSINESS_NOT_ENTITLED` | Sponsoring business not entitled |
| `403` | `ENTITLEMENT_UNAVAILABLE` | Central entitlement check temporarily unavailable |
| `404` | `Reward ... not found` / `Business reward ... not found` / `Issuance ... not found` / `Business not found` | Missing, or not owned by this caller |

---

## 9. Environment (MCOM Rewards side)

```bash
MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com
MCOM_CLIENT_ID=mcom-rewards
MCOM_CLIENT_SECRET=cs_live_...
MCOM_ALLOWED_CALLERS=fundordonate
MCOM_SERVICE_SCOPES=rewards:read rewards:issue

# Where lifecycle events are pushed on FundOrDonate
MCOM_PARTNER_EVENT_PATH=/api/v1/partner/events
MCOM_PARTNER_EVENT_SCOPE=rewards:issue
```

## 10. Console / policy checklist

For the mesh to allow traffic (configured in the MCOM Admin Console):

- `mcom-rewards` → egress allowed to `fundordonate`; ingress allowed from
  `fundordonate`.
- `fundordonate` → egress allowed to `mcom-rewards`; ingress allowed from
  `mcom-rewards` (for the event receiver).
- Both apps: `serviceEnabled = true` and
  `serviceScopes = rewards:read rewards:issue` (grant `rewards:gift` to the peer
  whose admin back office gifts MCOM rewards, e.g. `fundordonate`).
