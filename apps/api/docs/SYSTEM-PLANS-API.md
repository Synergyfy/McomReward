# MCOM Solutions — Plans CRUD Integration (Rewards Backend)

## Overview

MCOM Solutions admin can manage subscription plans (tiers) in the MCOM Rewards backend by calling the `/system/plans` API. Plans map to the **Tier** entity with monthly/quarterly/annual pricing and feature quotas.

**Base URL:** `<REWARDS_API_BASE>/api/v1` (e.g. `https://mcom-rewards-api.com/api/v1`)

**Auth Header:** `x-mcom-solution-api-key` — shared secret stored in the rewards backend's `MCOM_SOLUTION_API_KEY` env var.

---

## Authentication

Every request must include:

```
x-mcom-solution-api-key: <your-api-key>
```

If missing or invalid, the API returns `401 Unauthorized`.

> Keep this key secret — it grants admin-level access to create, update, and delete plans. Never expose it client-side.

### How the key works

1. MCOM Solutions sends the `x-mcom-solution-api-key` header on every `/system/plans` request
2. The rewards backend validates it against the `MCOM_SOLUTION_API_KEY` environment variable
3. If valid, the request proceeds; if not, `401` is returned

### Shared key exchange

Both teams must agree on the API key value. Set it in:

- **Rewards backend:** `MCOM_SOLUTION_API_KEY` in `.env`
- **MCOM Solutions backend:** Store it as a secret and include it in all outbound requests to the rewards API

---

## Endpoints

### Create a Plan

```
POST /api/v1/system/plans
```

**Request body:**

```json
{
  "name": "Gold Plan",
  "description": "Premium tier for established businesses",
  "monthlyPrice": 29.99,
  "quarterlyPrice": 79.99,
  "annualPrice": 299.99,
  "features": ["Priority support", "Increased listing limit", "Custom domain"],
  "configuration": {
    "quotas": {
      "maxActiveCampaigns": 5,
      "maxActiveRewards": 10,
      "maxRewardsPerCampaign": 3,
      "monthlyPointsAllowance": 1000,
      "monthlyStampsAllowance": 100,
      "monthlyRewardBudget": 500,
      "maxTeamMembers": 2,
      "maxRewardPoints": 5000
    },
    "featureFlags": {
      "canCreateCampaignFromScratch": true,
      "canEditAdminTemplates": false,
      "hasAccessToAdvancedAnalytics": true,
      "hasAccessToCRM": false,
      "canUpdateReward": true,
      "canCreateRewardFromScratch": true
    }
  },
  "isActive": true,
  "isDefault": false,
  "type": "STANDARD",
  "stripeMonthlyPriceId": "price_abc123",
  "stripeQuarterlyPriceId": "price_def456",
  "stripeAnnualPriceId": "price_ghi789",
  "paypalMonthlyPlanId": "P-123456",
  "paypalQuarterlyPlanId": "P-789012",
  "paypalAnnualPlanId": "P-345678"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "name": "Gold Plan",
  "description": "Premium tier for established businesses",
  "monthlyPrice": 29.99,
  "quarterlyPrice": 79.99,
  "annualPrice": 299.99,
  "features": ["Priority support", "Increased listing limit", "Custom domain"],
  "configuration": { "...": "..." },
  "isActive": true,
  "isDefault": false,
  "type": "STANDARD",
  "trialDuration": null,
  "seasonId": null,
  "stripeMonthlyPriceId": "price_abc123",
  "stripeQuarterlyPriceId": "price_def456",
  "stripeAnnualPriceId": "price_ghi789",
  "paypalMonthlyPlanId": "P-123456",
  "paypalQuarterlyPlanId": "P-789012",
  "paypalAnnualPlanId": "P-345678",
  "created_at": "2026-07-16T10:00:00.000Z",
  "updated_at": "2026-07-16T10:00:00.000Z"
}
```

---

### Get All Plans

```
GET /api/v1/system/plans
```

Returns all plans (no pagination needed — plans are typically < 50).

**Response:** `200 OK`

```json
[
  {
    "id": "uuid-1",
    "name": "Gold Plan",
    "description": "Premium tier for established businesses",
    "monthlyPrice": 29.99,
    "quarterlyPrice": 79.99,
    "annualPrice": 299.99,
    "type": "STANDARD",
    "isActive": true,
    "isDefault": true,
    "configuration": { "...": "..." },
    "features": ["..."],
    "trialDuration": null,
    "seasonId": null,
    "stripeMonthlyPriceId": "price_abc123",
    "stripeQuarterlyPriceId": "price_def456",
    "stripeAnnualPriceId": "price_ghi789",
    "paypalMonthlyPlanId": "P-123456",
    "paypalQuarterlyPlanId": "P-789012",
    "paypalAnnualPlanId": "P-345678",
    "created_at": "...",
    "updated_at": "..."
  },
  {
    "id": "uuid-2",
    "name": "Trial",
    "description": null,
    "type": "TRIAL",
    "trialDuration": 14,
    "monthlyPrice": 0,
    "quarterlyPrice": 0,
    "annualPrice": 0,
    "isActive": true,
    "isDefault": false,
    "configuration": { "...": "..." },
    "features": ["..."],
    "seasonId": null,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

---

### Get a Plan by ID

```
GET /api/v1/system/plans/:id
```

**Response:** `200 OK` — single plan object, or `404 Not Found`

---

### Update a Plan

```
PATCH /api/v1/system/plans/:id
```

Send only the fields you want to change:

```json
{
  "monthlyPrice": 34.99,
  "features": ["Priority support", "Unlimited listings"],
  "configuration": {
    "quotas": {
      "maxActiveCampaigns": -1
    }
  }
}
```

**Response:** `200 OK` — the updated plan object

---

### Delete a Plan

```
DELETE /api/v1/system/plans/:id
```

**Response:** `200 OK`

```json
{
  "message": "Plan deleted successfully"
}
```

---

## Plan Types

| Type | Description | Required Extra Fields |
|------|-------------|----------------------|
| `STANDARD` | Regular paid plan | — |
| `TRIAL` | Free trial plan (only one allowed globally) | `trialDuration` (days, > 0) |
| `SEASONAL` | Time-limited plan | `seasonId` (valid UUID from seasons table) |

---

## Configuration Object (`configuration`)

### `quotas`

| Field | Type | Description |
|-------|------|-------------|
| `maxActiveCampaigns` | number | `-1` for unlimited |
| `maxActiveRewards` | number | `-1` for unlimited |
| `maxRewardsPerCampaign` | number | |
| `monthlyPointsAllowance` | number | Points allocated per month |
| `monthlyStampsAllowance` | number | Stamps allocated per month |
| `monthlyRewardBudget` | number | GBP amount allocated per month |
| `maxTeamMembers` | number | `-1` for unlimited |
| `maxRewardPoints` | number | Max reward points |

### `featureFlags`

| Field | Type | Description |
|-------|------|-------------|
| `canCreateCampaignFromScratch` | boolean | |
| `canEditAdminTemplates` | boolean | |
| `hasAccessToAdvancedAnalytics` | boolean | |
| `hasAccessToCRM` | boolean | |
| `canUpdateReward` | boolean | |
| `canCreateRewardFromScratch` | boolean | |

---

## Field Mapping (MCOM Mall ↔ Rewards)

| MCOM Mall field | Rewards Tier field | Notes |
|----------------|-------------------|-------|
| `name` | `name` | Direct |
| `description` | `description` | New column added |
| `monthlyPrice` | `monthly_price` | camelCase ↔ snake_case |
| `quarterlyPrice` | `quarterly_price` | Same |
| `annualPrice` | `annual_price` | Same |
| `features` | `features` | Direct |
| `configuration` | `configuration` | Direct (jsonb) |
| `isActive` | `status` | `true` → `published`, `false` → `draft` |
| `isDefault` | `is_default` | New column added |
| `type` | `type` | `STANDARD` ↔ `standard`, `TRIAL` ↔ `trial`, `SEASONAL` ↔ `seasonal` |
| `trialDuration` | `configuration.trial.trialDuration` | Stored in config jsonb |
| `stripeMonthlyPriceId` | `stripe_monthly_price_id` | snake_case in DB |
| `stripeQuarterlyPriceId` | `stripe_quarterly_price_id` | snake_case in DB |
| `stripeAnnualPriceId` | `stripe_annual_price_id` | snake_case in DB |
| `paypalMonthlyPlanId` | `paypal_monthly_plan_id` | snake_case in DB |
| `paypalQuarterlyPlanId` | `paypal_quarterly_plan_id` | snake_case in DB |
| `paypalAnnualPlanId` | `paypal_annual_plan_id` | snake_case in DB |

---

## Error Responses

| Status | Description |
|--------|-------------|
| `401` | Missing or invalid API key |
| `404` | Plan not found |
| `409` | Conflict (e.g. duplicate plan name, trial tier already exists) |
| `400` | Validation error (e.g. trial tier without `trialDuration`, seasonal tier without `seasonId`) |

Error body:

```json
{
  "statusCode": 409,
  "message": "Tier with this name already exists",
  "error": "Conflict"
}
```

---

## Setup Instructions

### 1. Rewards Backend (this repo)

Add the API key to `.env`:

```bash
MCOM_SOLUTION_API_KEY=your-agreed-secret-key-here
```

Run the migration to add new columns:

```bash
cd apps/api
pnpm run migration:run
```

Start the server:

```bash
pnpm dev
```

### 2. MCOM Solutions Backend

Store the rewards API base URL and API key as secrets:

```env
REWARDS_API_BASE=https://mcom-rewards-api.com/api/v1
MCOM_SOLUTION_API_KEY=your-agreed-secret-key-here
```

Make HTTP requests with the header:

```typescript
const response = await fetch(`${REWARDS_API_BASE}/system/plans`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-mcom-solution-api-key': MCOM_SOLUTION_API_KEY,
  },
  body: JSON.stringify({
    name: 'Gold Plan',
    monthlyPrice: 29.99,
    quarterlyPrice: 79.99,
    annualPrice: 299.99,
    features: ['Priority support', 'Custom domain'],
    isActive: true,
    type: 'STANDARD',
  }),
});
```

---

## Implementation Checklist

1. [x] Store `MCOM_SOLUTION_API_KEY` in rewards backend `.env`
2. [x] Run `pnpm run migration:run` to apply schema changes
3. [x] MCOM Solutions backend stores the API key as a secret
4. [x] MCOM Solutions backend calls `POST /system/plans` to create plans
5. [x] After Stripe/PayPal price creation, MCOM Solutions sends back price/plan IDs via `PATCH /system/plans/:id`
6. [x] Handle errors gracefully (409 conflicts, 400 validation, etc.)

---

## Example: Full Flow

### Step 1: MCOM Solutions creates a plan in Stripe/PayPal

```typescript
// MCOM Solutions creates Stripe prices
const stripeMonthly = await stripe.prices.create({
  unit_amount: 2999,
  currency: 'gbp',
  recurring: { interval: 'month' },
  product: productId,
});

const stripeQuarterly = await stripe.prices.create({
  unit_amount: 7999,
  currency: 'gbp',
  recurring: { interval: 'month', interval_count: 3 },
  product: productId,
});

const stripeAnnual = await stripe.prices.create({
  unit_amount: 29999,
  currency: 'gbp',
  recurring: { interval: 'year' },
  product: productId,
});
```

### Step 2: MCOM Solutions creates the plan in Rewards

```typescript
const response = await fetch(`${REWARDS_API_BASE}/system/plans`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-mcom-solution-api-key': API_KEY,
  },
  body: JSON.stringify({
    name: 'Gold Plan',
    description: 'Premium tier for established businesses',
    monthlyPrice: 29.99,
    quarterlyPrice: 79.99,
    annualPrice: 299.99,
    features: ['Priority support', 'Custom domain'],
    configuration: {
      quotas: {
        maxActiveCampaigns: 5,
        maxActiveRewards: 10,
        maxRewardsPerCampaign: 3,
        monthlyPointsAllowance: 1000,
        monthlyStampsAllowance: 100,
        monthlyRewardBudget: 500,
        maxTeamMembers: 2,
        maxRewardPoints: 5000,
      },
      featureFlags: {
        canCreateCampaignFromScratch: true,
        canEditAdminTemplates: false,
        hasAccessToAdvancedAnalytics: true,
        hasAccessToCRM: false,
        canUpdateReward: true,
        canCreateRewardFromScratch: true,
      },
    },
    isActive: true,
    isDefault: false,
    type: 'STANDARD',
    stripeMonthlyPriceId: stripeMonthly.id,
    stripeQuarterlyPriceId: stripeQuarterly.id,
    stripeAnnualPriceId: stripeAnnual.id,
  }),
});

const plan = await response.json();
// plan.id is the UUID used for memberships
```

### Step 3: Update Stripe/PayPal IDs later (if created after plan)

```typescript
await fetch(`${REWARDS_API_BASE}/system/plans/${plan.id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-mcom-solution-api-key': API_KEY,
  },
  body: JSON.stringify({
    paypalMonthlyPlanId: 'P-123456',
    paypalQuarterlyPlanId: 'P-789012',
    paypalAnnualPlanId: 'P-345678',
  }),
});
```

### Step 4: Deactivate a plan

```typescript
await fetch(`${REWARDS_API_BASE}/system/plans/${plan.id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-mcom-solution-api-key': API_KEY,
  },
  body: JSON.stringify({
    isActive: false,
  }),
});
```

### Step 5: Delete a plan

```typescript
await fetch(`${REWARDS_API_BASE}/system/plans/${plan.id}`, {
  method: 'DELETE',
  headers: {
    'x-mcom-solution-api-key': API_KEY,
  },
});
```
