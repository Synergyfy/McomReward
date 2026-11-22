# Membership synchronisation (Central Hub → MCOM Rewards)

When a business buys a membership on MCOM Central that bundles **MCOM Rewards**,
Central provisions the matching platform package and sends a signed
`membership.updated` event. This app applies that event to its own plan
catalogue and grants or revokes access.

## Endpoint to add in MCOM Console

Open **MCOM Console → MCOM Rewards → Configuration → Membership
Synchronization** and set the endpoint to:

```
{API_PUBLIC_URL}/api/v1/webhooks/membership-updated
```

Use the API host, not the web frontend. For this repo:

| Environment | URL |
| --- | --- |
| Local API (`PORT=4000`) | `http://localhost:4000/api/v1/webhooks/membership-updated` |
| Production | `https://<API_PUBLIC_URL>/api/v1/webhooks/membership-updated` |

An alias also exists at `{API_PUBLIC_URL}/api/v1/mcom/webhook/membership-updated`
for deployments that only route the existing `/mcom/webhook` path.

The endpoint is signed with `MCOM_WEBHOOK_SECRET` (falling back to
`MCOM_HMAC_SECRET`), using `X-Mcom-Webhook-Signature: sha256=<hex>`.

## What the handler does

1. **Verifies the HMAC-SHA256 signature** against the raw request body.
2. **Deduplicates on `data.eventId`** in the `processed_webhook_events` table.
3. **Finds the local business** by `data.userId` (`businesses.mcomUserId`) or
   `data.businessId` (local UUID).
4. Branches on `data.membership.status`:

| Status | Result |
| --- | --- |
| `active` | Match `package.externalPlanId` / `package.packageName` to the local plan or access-pass catalogue, then grant it until `membership.expiresAt` (falling back to `package.expiresAt`). |
| `expired`, `cancelled`, `canceled`, `inactive` | Revoke only the access Central provisioned. Locally purchased plans/passes are never touched. |

If the event says `active` but the expiry is already in the past, it is treated
as expired.

## How plans are matched

`package.externalPlanId` is the identifier this app published to Central. It can
be any of:

- a **plan variant UUID**
- a **plan family UUID**
- a **plan slug** (for example `growth-plan`)
- a **plan name** (for example `Growth Plan` or `Growth Plan Pro`)
- an **access-pass slug** (for example `gold-pass`)

If `externalPlanId` is absent, `package.packageName` is matched by name. If
nothing in the local catalogue matches, the handler asks Central for the
canonical entitlement (`GET /api/v1/auth/sso/entitlement`) instead of granting
an arbitrary local plan.

## Example payload

```json
{
  "event": "membership.updated",
  "platform": "mcom-rewards",
  "timestamp": "2026-11-22T10:15:00.000Z",
  "data": {
    "eventId": "8f2c1e9a-3b4d-4c5e-9f6a-1d2b3c4e5f60",
    "occurredAt": "2026-11-22T10:15:00.000Z",
    "userId": "usr_123",
    "businessId": "biz_123",
    "membership": {
      "planId": "plan_gold",
      "planName": "Gold",
      "tier": "Pro+",
      "level": "Gold",
      "status": "active",
      "billingCycle": "Annually",
      "amount": 249,
      "currency": "GBP",
      "startsAt": null,
      "expiresAt": "2027-11-22T00:00:00.000Z"
    },
    "package": {
      "platform": "MCOM Rewards",
      "packageName": "Growth Plan Pro",
      "externalPlanId": "growth-plan",
      "status": "active",
      "limits": { "maxActiveCampaigns": 20 },
      "expiresAt": "2027-11-22T00:00:00.000Z"
    }
  }
}
```

## Manual test

```bash
BODY='{"event":"membership.updated","platform":"mcom-rewards","data":{"eventId":"test-'$(date +%s)'","userId":"usr_123","businessId":"biz_123","membership":{"planName":"Gold","status":"active","expiresAt":"2027-11-22T00:00:00.000Z"},"package":{"packageName":"Growth Plan","externalPlanId":"growth-plan","status":"active"}}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$MCOM_WEBHOOK_SECRET" -hex | sed 's/^.* //')
curl -i -X POST http://localhost:4000/api/v1/webhooks/membership-updated \
  -H 'Content-Type: application/json' \
  -H "X-Mcom-Webhook-Signature: sha256=$SIG" \
  --data "$BODY"
```

Expected response for a new, matched event:

```json
{ "received": true, "processed": true, "duplicate": false }
```
