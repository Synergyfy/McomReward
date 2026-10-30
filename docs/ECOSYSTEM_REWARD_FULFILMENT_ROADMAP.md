# Ecosystem Reward Fulfilment Roadmap

**Connecting MCOM Rewards → MCOM Central Hub (memberships, access passes, coupons) and MCOM Rewards → MCOM Mall (gift cards, vouchers, coupons, catalog targeting)**

| Field | Value |
|:--|:--|
| Status | Draft for team review |
| Version | 1.0 |
| Date | 2026-10-29 |
| Transport | MCOM zero-hop service mesh (`protocol_version: 2026-10-01`, RS256 + JWKS) |
| Apps in scope | `mcom-rewards`, `central-hub-solution` (`mcom-central`), `mcom-mall` |
| Code changes in this document | None — planning only |

---

## 1. Executive summary

**Verdict: all three requested capabilities are technically possible on the existing mesh architecture, but only part of the machinery exists today.** The remaining work is concentrated in three places:

1. **Central Hub is currently only a control plane.** It issues service tokens and publishes JWKS, but it has **no inbound service-token verification** and **no partner API surface**. To let Rewards read Central memberships/access plans and issue Central coupons, Central must also become a *callee* in the mesh.
2. **Mall's partner surface is real and already shipped behind a flag** (`MCOM_REWARDS_MESH_ENABLED`), but it only supports generic instruments (amount + email) and per-business catalog reads. It does **not** yet support templates, business binding, product/service scoping, or a global catalog browse for Rewards admins.
3. **Rewards has the right reward types and issuance ledger, but two parallel redemption paths.** The modern `RewardIssuanceService` already speaks to Mall. The legacy points/stamps redemption in `RedemptionService` calls Mall directly and does **not** write an issuance. These must converge before Central fulfilment can be reliable.

### What the user asked for, translated into build items

| Ask | Feasible? | Existing foundation | Main new work |
|:--|:--:|:--|:--|
| Admin fetches Central access passes + memberships and attaches them to a reward; redemption grants the entitlement | **Yes** | Central `AccessPlan`, `AccessPassCode`, `MembershipPlan/Tier`; Rewards issuance ledger | Central partner read/grant API; Rewards attachment + fulfilment |
| Admin configures a **Central coupon** (like Central's admin coupon builder); recipient gets a usable Central code | **Yes** | Central `Coupon` + `CouponRedemption`, `lockedToUserId` | Central partner coupon API; Rewards coupon builder + code delivery |
| Business attaches a **Mall gift card / voucher / coupon template** to a reward with a value | **Yes** | Mall templates exist (`GiftCardTemplate`, `VoucherProduct`, business `Coupon`); partner instrument endpoints exist | Template listing endpoints; template-aware instrument creation |
| Business restricts usage to own listing / specific products / specific services | **Yes, but this is the hardest part** | `metadata.mallTargets` only scopes *discount rewards*, not instruments | New instrument scope model + line-level checkout enforcement |
| Rewards admin creates the same across **all** Mall, or picks listings/products/services | **Yes** | Mall admin catalog exists but is JWT-admin only | Global partner catalog browse + admin scope modes |
| Reward shows a button that deep-links to the issuing business's Mall listing and works at checkout like a native instrument | **Yes** | Mall `/listings/[id]` storefront; checkout already accepts `giftCardCode`, `voucherCode`, `couponCode` | Stable deep-link contract; instrument↔issuance linkage |

**Bottom line:** no architectural blocker — the mesh model explicitly supports this. The schedule is dominated by (a) turning Central into a mesh peer and (b) Mall line-level scoping math. Everything else is contract + UI work.

---

## 2. Scope and definitions

### 2.1 Actors

| Actor | Lives in | Identity |
|:--|:--|:--|
| **Rewards Admin** | `mcom-rewards` (`Role.Admin`) | Reward local user; may hold a Central `mcomUserId` |
| **Business** | `mcom-rewards` (`Role.Business`) | `business.mcomUserId` = Central user id; maps to Mall `User.centralUserId` → Mall `Business` |
| **Consumer / Participant** | `mcom-rewards` (`Role.Participant` / customer) | `participant.mcomUserId` = Central user id |
| **Central Admin** | `central-hub-solution` | Central `User` with `Role.ADMIN` |
| **Mall Business Owner** | `mcom-mall` | Mall `User.centralUserId` (same person as the Rewards business owner) |

### 2.2 The three "coupon" systems — keep them distinct

This is the single biggest source of confusion in the request. There are **three unrelated coupon engines**:

| Name in this roadmap | Codebase | What it discounts | Where redeemed |
|:--|:--|:--|:--|
| **Rewards Coupon** | `mcom-rewards` `resources/coupon` | Nothing real today — it is a minimal stub entity (`code`, `discount_type`, `discount_value`, `expires_at`, `is_active`) | N/A |
| **Mall Coupon** | `mcom-mall` `/api/v1/coupons` | Mall cart total; platform or business sourced; stacking rules | Mall checkout (`couponCode`) |
| **Central Coupon** | `central-hub-solution` `admin/coupons` | **MCOM membership and access-pass purchases only** | Central checkout only |

> **Critical clarification:** a **Central coupon cannot discount Mall products.** Central's `Coupon` model links to `MembershipPlan` and `AccessPlan` only (`CouponMembershipPlan`, `CouponAccessPlan`, `CouponRedemption`). If the goal is "a coupon earned in Rewards that reduces a Mall basket", that is a **Mall coupon** (or a Mall gift card/voucher), not a Central coupon. The roadmap supports both, but they must be labelled separately in the UI.

### 2.3 Reward taxonomy to introduce

Rewards today stores `reward_type` as a label (`Voucher`, `gift card`, `coupon`, `point offer`, `physical product`, `MallDiscount`). It does **not** encode *who fulfils it* or *what gets delivered*. Introduce a **Fulfilment Attachment** that is separate from the cosmetic reward type:

| Field | Values |
|:--|:--|
| `provider` | `NONE` \| `MALL` \| `CENTRAL` |
| `kind` | `MALL_DISCOUNT`, `MALL_GIFT_CARD`, `MALL_VOUCHER`, `MALL_COUPON`, `CENTRAL_MEMBERSHIP`, `CENTRAL_ACCESS_PASS`, `CENTRAL_COUPON` |
| `delivery` | `CODE` (recipient receives a code), `DIRECT_GRANT` (entitlement provisioned), `CHECKOUT_APPLY` (issuance id applied at checkout) |
| `templateRef` | `{ system: 'MALL' \| 'CENTRAL', id, ownerBusinessId? }` |
| `value` | amount/currency, or discountType/discountValue/maxDiscount/minSpend |
| `scope` | see §2.4 |
| `validity` | `expiresInDays`, absolute `expiresAt` |

This keeps existing `reward_type` intact (no breaking change) and gives the fulfilment engine a deterministic contract.

### 2.4 Scope model

| Scope mode | Meaning | Allowed for |
|:--|:--|:--|
| `ALL` | Every Mall product/service (or every Central plan) | **Rewards Admin only** |
| `SELECTED_LISTINGS` | All products/services inside chosen Mall listings | Admin; Business limited to own listing |
| `SELECTED_ITEMS` | Specific Mall `productId`s and/or `serviceId`s | Admin; Business limited to own catalogue |
| `BUSINESS_CATALOG` | The issuing business's entire catalogue | Business (default) |
| `SELECTED_PLANS` | Chosen Central membership plans / access plans | Admin (Central) |
| `NO_SCOPE` | No restriction (legacy behaviour) | Migration default |

---

## 3. What exists today (grounded inventory)

### 3.1 MCOM Rewards (`/mcom-rewards`)

**Already built**

- Reward catalogue and business rewards: `apps/api/src/resources/rewards/` — `Reward`, `BusinessReward`, enums `reward-type.enum.ts`, `reward-source.enum.ts`.
- Business reward fields for Mall: `is_mall_integrated`, `mall_reward_type`, `mall_reward_value`, plus discount targeting `mall_target_scope`, `mall_target_product_ids`, `mall_target_service_ids`, `mall_discount_type`, `mall_discount_value`, `mall_max_discount`, `mall_min_spend` (`business-reward.entity.ts`).
- Mall partner client over the mesh: `apps/api/src/resources/mall-integration/mall-integration.service.ts` — catalog reads (`mall:read`) and instrument creation (`mall:write`).
- Service mesh outbound + inbound: `apps/api/src/resources/service-mesh/` with scopes `rewards:read`, `rewards:issue`, `rewards:gift`, `mall:read`, `mall:write`.
- Issuance ledger: `apps/api/src/resources/partner-rewards/` — `RewardIssuance` with `ISSUED/RESERVED/REDEEMED/EXPIRED/REVOKED/FAILED`, reserve/commit/release/redeem/revoke, idempotency, `metadata.mallTargets`, `mall_reference`.
- Mall-facing partner endpoints for Mall to call: `partner/issuances` (`rewards:read`, `rewards:issue`).
- UI: `apps/web/src/app/dashboard/rewards/page.tsx`, `apps/web/src/app/dashboard/mall-rewards/page.tsx`, admin rewards under `apps/web/src/app/admin/rewards`.
- Local access-pass module (`resources/access-passes/`) — **not** Central's access passes; this is Rewards' own feature and must not be confused with Central `AccessPlan`.

**Gaps**

- No Central Hub peer client and no Central scopes.
- No fulfilment provider abstraction; Mall instrument creation is hard-coded inside `RewardIssuanceService` and `RedemptionService`.
- Two redemption paths:
  - `RewardIssuanceService` (issuer/partner driven) — writes `reward_issuance`, speaks Mall.
  - `RedemptionService.redeemReward` in `resources/participant-campaign-balance/services/redemption.service.ts` — spends points/stamps, writes `PointHistory`, calls Mall directly, **does not create an issuance**.
- `resources/coupon` is a stub entity, not a real coupon engine.
- Business reward Mall instrument creation does not pass a template, business binding, or scope.
- No UI for attaching Central plans or Central coupons.

### 3.2 Central Hub (`/central-hub-solution`)

**Already built**

- Prisma models: `AccessPlan`, `AccessPlanAppBundle`, `AccessPurchase`, `AccessPassCode`, `MembershipPlan`, `MembershipPlanTier`, `MembershipPaymentOption`, `Coupon`, `CouponMembershipPlan`, `CouponAccessPlan`, `CouponRedemption`, `SsoClient`, `ServiceTokenAudit`.
- Access entitlements: `apps/backend/src/access/access.service.ts` — `activateAccess()` (idempotent on `providerPaymentId`, supports `chargedAmount: 0` + `allowZeroAmount`), `createPendingAccessCode()`, `completeAccessCode()`, `redeemAccessCode()`, deferred activation when a membership overlaps.
- Membership entitlements: `apps/backend/src/pricing/pricing.service.ts` — `subscribeMembership()` (idempotent on `providerPaymentId`), writes `BillingTransaction` + `EcosystemSubscription` + packages.
- Coupons: `apps/backend/src/coupon/` — admin CRUD, `lockedToUserId`, plan/access scoping, redemption ledger.
- Token minting + JWKS: `apps/backend/src/service-identity/` — `POST /api/v1/auth/service-token`, `/exchange`, `/.well-known/jwks.json`, `/api/v1/ecosystem/services`, `/api/v1/ecosystem/discovery`; registry fields `serviceEnabled`, `serviceBaseUrl`, `serviceScopes`, `allowedAudiences`, `allowedCallers`.
- Admin UI: `/admin/memberships`, `/admin/access`, `/admin/coupons`, `/admin/console` (mesh policy).

**Gaps**

- **No inbound mesh verifier.** No `jose` usage and no service-token guard anywhere in `apps/backend/src` (verified by search). It is the issuer only.
- **No `/partner/*` API surface** for plans, grants, or coupons.
- `mcom-central` exists as an internal pseudo-client (`access.service.ts`, `payment.service.ts`, `recurring.service.ts`) but is not necessarily a registered, callable `SsoClient` with `serviceEnabled` + `serviceBaseUrl`.
- Membership duration is derived from tier (`calculateTierExpiry`), not configurable per grant — a reward may want "30 days" or "1 year".
- Access passes are **business-only** (`AccessPurchase.businessId` is required). A consumer/participant cannot hold one unless they have a Central business profile.
- No event/callback outbound to Rewards when a Central coupon or entitlement is consumed.

### 3.3 MCOM Mall (`/mcom-mall`)

**Already built**

- Partner catalog: `apps/mcom_mallAPI/src/resources/rewards-integration/partner-catalog.controller.ts` + `partner-catalog.service.ts` — resolve business by `mcomUserId`/email, list products/services.
- Partner instruments: `partner-instruments.controller.ts` — `POST /partner/instruments/{vouchers,gift-cards,coupons}` under `mall:write`, caller derived from token.
- Partner events: `partner-events.controller.ts` — `POST /partner/events`, idempotent on `data.id` + `data.status`.
- Reward eligibility + checkout integration: `rewards-client.service.ts`, `rewards-eligibility.service.ts`, `rewards-integration.service.ts`; order checkout accepts `rewardApplications`, `couponCode`, `giftCardCode`, `voucherCode`; booking payment accepts `rewardIssuanceId`.
- Native instruments: `GiftCardTemplate`, `GiftCard`, `VoucherProduct`, `Voucher`, `Coupon`, `RedemptionLog`.
- Business template UIs/endpoints: `POST /merchant/gift-cards/templates`, `GET /merchant/gift-cards/templates`, `POST /business/vouchers/products`, `POST /coupons` (business), `GET /business/coupons/*`.
- Admin catalog: `GET /admin/listings`, `/admin/products`, `/admin/services` — but JWT-admin guarded, not mesh-callable.
- Feature flag: `MCOM_REWARDS_MESH_ENABLED`.

**Gaps**

- Partner instrument DTOs accept only `amount`, `recipientEmail`, `recipientName`, `message`, `businessName`, `code`, `expiresAt`. No `templateId`, `businessId`, `scope`, `issuanceId`.
- `businessName` is cosmetic; partner instruments are not bound to a Mall business, so a "business reward" is currently platform-wide.
- No partner endpoint to list templates (`gift card templates`, `voucher products`, business `coupons`).
- No global partner catalog browse (`all listings`, search, pagination) for Rewards admins.
- **No instrument-level product/service scope.** `Coupon` has business/campaign only; `GiftCard`/`Voucher` have no line restrictions. Checkout applies coupons to the whole discounted subtotal and gift cards/vouchers to the whole payable total.
- No `issuanceId` persisted on instruments, so Mall cannot reliably map a used code back to a Rewards issuance (the integration handbook already calls this out in §13.6).
- Checkout math is cart-level; line-level scope requires rework of `order.service.ts` and booking payment.

---

## 4. Feasibility assessment

Legend: ✅ usable as-is · 🟡 extension needed · 🔴 must be built · ⚠️ decision required

| # | Capability | Rewards | Central | Mall | Verdict |
|:--|:--|:--:|:--:|:--:|:--|
| 1 | Mint/verify RS256 service tokens | ✅ | ✅ mint / 🔴 verify | ✅ | 🟡 Central must add inbound verifier |
| 2 | Registry + policy edges | ✅ consume | ✅ publish | ✅ consume | ✅ existing Console |
| 3 | Central plan catalogue read | 🔴 client | 🔴 API | n/a | 🔴 build both sides |
| 4 | Attach Central membership/access to reward | 🔴 model+UI | n/a | n/a | 🔴 build |
| 5 | Grant membership on redemption | 🔴 call | 🟡 internal exists, no API | n/a | 🟡 wrap + idempotency |
| 6 | Grant access pass on redemption | 🔴 call | 🟡 `AccessPassCode` flow exists | n/a | 🟡 wrap; business-only |
| 7 | Central coupon create on redemption | 🔴 call+UI | 🟡 internal exists, no API | n/a | 🟡 wrap |
| 8 | Mall template discovery | 🔴 UI | n/a | 🔴 partner API | 🔴 build |
| 9 | Template-aware instrument creation | 🟡 pass fields | n/a | 🟡 extend DTO + services | 🟡 extend |
| 10 | Business binding for instruments | 🟡 send ids | n/a | 🔴 persist + enforce | 🔴 build |
| 11 | Product/service scope on instruments | 🟡 send scope | n/a | 🔴 model + checkout math | 🔴 hardest |
| 12 | Admin-wide Mall catalogue | 🔴 UI | n/a | 🔴 partner API | 🔴 build |
| 13 | Deep link from reward to Mall listing | 🔴 UI | n/a | 🟡 stable route contract | 🟡 agree |
| 14 | Instrument ↔ issuance linkage | 🟡 store ref | n/a | 🔴 persist + callback | 🔴 build |
| 15 | Unified redemption → issuance | 🔴 refactor | n/a | n/a | 🔴 prerequisite |
| 16 | Funding/liability for admin rewards | ⚠️ | ⚠️ | ⚠️ | ⚠️ decision |

**No item is blocked by the mesh design.** Every red item is ordinary product engineering.

---

## 5. Critical decisions (must be settled in Phase 0)

| # | Decision | Recommended option | Why |
|:--|:--|:--|:--|
| D1 | Scope names for Central | `central:read`, `central:issue` (or `hub:read`, `hub:issue`) | Keeps the caller-declares-scope rule consistent |
| D2 | Does Central register itself as a peer? | Yes — seed/register `mcom-central` with `serviceEnabled: true`, `serviceBaseUrl`, scopes, `allowedCallers: ['mcom-rewards']` | Otherwise Rewards cannot mint `aud=mcom-central` tokens |
| D3 | Access pass delivery | **Issue an `AccessPassCode`** and return the code | Reuses existing email + redemption + idempotency; avoids direct entitlement writes |
| D4 | Membership delivery | **Direct grant** to the recipient business's Central profile | Memberships have no code primitive; grant is the natural model |
| D5 | Membership duration | Add explicit `durationDays` to the grant contract | Current tier-based expiry cannot express "30-day reward" |
| D6 | Existing active membership | Default: **extend from current expiry** (stack), never silently downgrade; return conflict to Rewards | Matches existing access-pass stacking behaviour |
| D7 | Instrument scope semantics | Scope **caps the applicable spend**, does not change the face value | Predictable for users and finance |
| D8 | Gift card/voucher + reward stacking | Keep current rule: gift card/voucher are payment instruments and may combine with a reward discount | Matches handbook §7.4 |
| D9 | Business-created reward scope ceiling | Business can only target **its own** Mall catalogue | Enforces tenancy; admin has wider rights |
| D10 | Who funds admin-created rewards | Platform liability account, not a business wallet | Current `walletService.spend` assumes a business sponsor |
| D11 | Rewards' local coupon module | Deprecate/freeze; do not extend it | Three coupon systems is already too many |
| D12 | Redemption path | Make `RewardIssuance` the single ledger; `RedemptionService` must create/commit an issuance | Needed for reserve/commit, retries, and Central fulfilment |
| D13 | Consumer recipients | Consumers can receive Mall instruments and Central coupons, **not** Central memberships/access passes | Central entitlements are business-scoped |
| D14 | Expiry ownership | Rewards stores the canonical expiry; providers mirror it; a provider-side expiry must be reported back | Prevents "valid in Rewards, expired in Mall" |

---

## 6. Target architecture

### 6.1 Topology after this work

```
                         ┌──────────────────────────────────────────┐
                         │        MCOM CENTRAL (mcom-central)       │
                         │  control plane + NEW callee surface      │
                         │                                          │
                         │  • JWKS / service-token (existing)       │
                         │  • /partner/catalog/memberships          │  ← NEW
                         │  • /partner/catalog/access-plans         │  ← NEW
                         │  • /partner/grants/membership            │  ← NEW
                         │  • /partner/access-pass-codes            │  ← NEW
                         │  • /partner/coupons                      │  ← NEW
                         │  • NEW inbound mesh guard (jose)         │  ← NEW
                         └───────────────▲──────────────────────────┘
                                         │  direct HTTPS (aud=mcom-central,
                                         │  scope central:read/central:issue)
                                         │
┌────────────────────────────────────────┴─────────────────────────────────────┐
│                            MCOM REWARDS (mcom-rewards)                       │
│                                                                              │
│  Reward / BusinessReward                                                     │
│    └─ Fulfilment Attachment (provider, kind, template, value, scope)  ← NEW  │
│  RewardIssuance (single ledger, status machine)                              │
│    └─ Fulfilment Orchestrator (strategy per provider)                ← NEW   │
│         ├─ MallStrategy    → mall peer (existing client, extended)           │
│         └─ CentralStrategy → central peer (new client)               ← NEW   │
└───────────────┬──────────────────────────────────────────┬───────────────────┘
                │ direct HTTPS (aud=mcom-mall,               │
                │ scope mall:read / mall:write)              │
                ▼                                           ▼
┌──────────────────────────────────────────┐   ┌──────────────────────────────┐
│              MCOM MALL (mcom-mall)       │   │  Rewards Web (Next.js)       │
│                                          │   │  • Admin reward builder      │
│  • /partner/catalog/business (existing)  │   │  • Business reward builder   │
│  • /partner/catalog/listings        NEW  │   │  • Fulfilment picker         │
│  • /partner/templates/*             NEW  │   │  • Catalog scoping UI        │
│  • /partner/instruments/* (extend)       │   │  • "Use reward" deep link    │
│  • instrument scope + checkout math NEW  │   └──────────────────────────────┘
│  • instrument ↔ issuance link       NEW  │
└──────────────────────────────────────────┘
```

### 6.2 Fulfilment lifecycle

```
Reward configured
      │
      ▼
Earned / redeemed in Rewards
      │
      ▼
RewardIssuance created (ISSUED)
      │
      ├── CHECKOUT_APPLY (Mall discount) ──► Mall evaluates metadata.mallTargets at checkout
      │                                        reserve → commit → REDEEMED
      │
      └── CODE / DIRECT_GRANT
              │
              ▼
        Fulfilment Orchestrator
              │
              ├── MallStrategy    → POST /partner/instruments/*
              │                     persist mall id + code + scope
              │
              └── CentralStrategy → POST /partner/grants/* or /partner/coupons
                                    persist central ref + code
              │
              ▼
        issuance.status = ISSUED (code ready)  ──► recipient uses code
              │
              ▼
        provider confirms consumption ──► callback/event ──► REDEEMED
```

### 6.3 Idempotency keys (uniform)

| Operation | Key |
|:--|:--|
| Rewards → Mall instrument | `rewards:<issuanceId>` (send as `issuanceId` + `code`) |
| Rewards → Central membership grant | `providerPaymentId = rewards:<issuanceId>` |
| Rewards → Central access code | `providerPaymentId = rewards:<issuanceId>` on completion |
| Rewards → Central coupon | `code = <rewards code>` (Central is idempotent per code) |
| Mall → Rewards reserve/commit/release | `<orderRef>:<issuanceId>` |
| Events both ways | `(recordId, status)` |

---

## 7. Data model changes

### 7.1 MCOM Rewards

| Entity | Change | Purpose |
|:--|:--|:--|
| `reward` | add `fulfilment_provider`, `fulfilment_kind`, `fulfilment_config jsonb` | Admin catalogue rewards can carry fulfilment |
| `business_reward` | add `fulfilment_provider`, `fulfilment_kind`, `fulfilment_config jsonb`, `fulfilment_template_id`, `fulfilment_business_ref` | Business rewards attach provider templates |
| `reward_issuance` | add `fulfilment_provider`, `fulfilment_kind`, `fulfilment_status`, `fulfilment_ref`, `fulfilment_code`, `fulfilment_payload jsonb`, `fulfilment_error` | Track delivery independently of redemption |
| `reward_issuance` | keep existing `mall_reference`, `metadata`, reserve columns | Backwards compatible |
| new | `central_plan_cache` (optional) | Cache Central plan catalogue for pickers (TTL) |
| new | `fulfilment_outbox` | Reliable retries for provider calls (or reuse existing queue) |

> `fulfilment_config` shape: `{ scope, value, templateRef, validity, delivery, grant }` per §2.3.

### 7.2 Central Hub

| Model | Change | Purpose |
|:--|:--|:--|
| `SsoClient` | seed/register `mcom-central` peer row | Make Central callable |
| `ServiceTokenAudit` | no change | Already records inbound/outbound tokens |
| new | `PartnerGrant` | Idempotency + audit for reward-driven grants (`issuanceId`, `businessId`, `kind`, `planId`, `status`, `providerPaymentId`) |
| `AccessPassCode` | optional `source` + `externalRef` | Mark codes issued by Rewards |
| `Coupon` | optional `externalRef` / `sourceApp` | Mark coupons issued by Rewards |
| new | `PartnerOutbox` | Emit `coupon.redeemed`, `membership.granted`, `access_pass.redeemed` to Rewards |

### 7.3 MCOM Mall

| Model | Change | Purpose |
|:--|:--|:--|
| `GiftCard`, `Voucher`, `Coupon` | add `issuanceId`, `sourceApp`, `businessId` (where missing), `scopeMode` | Link to Rewards, bind to business, enforce scope |
| new | `InstrumentScope` (or JSON column `scope`) | `scopeMode`, `listingIds`, `productIds`, `serviceIds` |
| new | `PartnerTemplateGrant` (optional) | Track which templates were exposed to which partner |
| `RedemptionLog` | add `issuanceId` mirror | Reconciliation |

---

## 8. API contracts (draft)

All endpoints are `/api/v1` on the respective app, authenticated with an RS256 service token. Caller identity comes from the token, never from `X-Caller-Id`.

### 8.1 Central Hub — new partner API

**Scopes:** `central:read` (catalogue), `central:issue` (grants/coupons).

| Method | Path | Scope | Purpose |
|:--|:--|:--|:--|
| `GET` | `/partner/catalog/memberships` | `central:read` | List membership plans with tiers, prices, durations, features |
| `GET` | `/partner/catalog/memberships/:id` | `central:read` | One plan with tiers |
| `GET` | `/partner/catalog/access-plans` | `central:read` | List access plans with bundles + duration |
| `GET` | `/partner/catalog/access-plans/:id` | `central:read` | One access plan |
| `GET` | `/partner/users/resolve?email=` | `central:read` | Resolve `mcomUserId` + `businessId` for a recipient |
| `POST` | `/partner/grants/membership` | `central:issue` | Direct membership grant |
| `POST` | `/partner/access-pass-codes` | `central:issue` | Create a ready-to-redeem access code |
| `POST` | `/partner/coupons` | `central:issue` | Create a locked coupon code |
| `GET` | `/partner/coupons/:code` | `central:read` | Status/usage |
| `POST` | `/partner/coupons/:code/revoke` | `central:issue` | Revoke unused |
| `POST` | `/partner/grants/:id/revoke` | `central:issue` | Revoke entitlement (policy-dependent) |

**Grant membership request (shape only)**

| Field | Type | Notes |
|:--|:--|:--|
| `issuanceId` | string | Idempotency key source |
| `recipientMcomUserId` | string | Required |
| `planId` | string | Central `MembershipPlan.id` |
| `tier` | `Standard \| Pro \| Pro+` | |
| `durationDays` | int | New; overrides tier default |
| `extendExisting` | boolean | Default `true` |
| `source` | `"mcom-rewards"` | Audit |

**Create access code request**

| Field | Type | Notes |
|:--|:--|:--|
| `issuanceId` | string | Idempotency |
| `accessPlanId` | string | |
| `recipientEmail` | string | Code is email-locked (existing behaviour) |
| `recipientMcomUserId` | string? | For resolution |
| `mode` | `GIFT \| CODE` | |

**Create coupon request**

| Field | Type | Notes |
|:--|:--|:--|
| `issuanceId` | string | Traceability |
| `code` | string | Shared Rewards code; Central idempotent on code |
| `discountType` | `PERCENTAGE \| FIXED` | |
| `discountValue` | number | |
| `appliesToAllMemberships` | boolean | |
| `membershipPlanIds` | string[] | |
| `appliesToAllAccess` | boolean | |
| `accessPlanIds` | string[] | |
| `maxUses` | number? | Default 1 |
| `maxUsesPerUser` | number? | Default 1 |
| `validFrom` / `expiresAt` | ISO-8601 | |
| `lockedToUserId` | string? | Recipient's Central user id |
| `description` | string? | |

### 8.2 MCOM Mall — extended partner API

| Method | Path | Scope | Purpose |
|:--|:--|:--|:--|
| `GET` | `/partner/catalog/business?...` | `mall:read` | Existing |
| `GET` | `/partner/catalog/listings?query=&page=&limit=` | `mall:read` | **NEW** global browse (admin) |
| `GET` | `/partner/catalog/listings/:id` | `mall:read` | **NEW** listing + products/services |
| `GET` | `/partner/catalog/business/:id/products` | `mall:read` | Existing |
| `GET` | `/partner/catalog/business/:id/services` | `mall:read` | Existing |
| `GET` | `/partner/templates/gift-cards?businessId=` | `mall:read` | **NEW** |
| `GET` | `/partner/templates/vouchers?businessId=` | `mall:read` | **NEW** |
| `GET` | `/partner/templates/coupons?businessId=` | `mall:read` | **NEW** |
| `GET` | `/partner/templates/:kind/:id` | `mall:read` | **NEW** |
| `POST` | `/partner/instruments/gift-cards` | `mall:write` | Extend payload |
| `POST` | `/partner/instruments/vouchers` | `mall:write` | Extend payload |
| `POST` | `/partner/instruments/coupons` | `mall:write` | Extend payload |
| `GET` | `/partner/instruments/:kind/:code` | `mall:read` | **NEW** status/balance |
| `POST` | `/partner/instruments/:kind/:code/revoke` | `mall:write` | **NEW** |
| `POST` | `/partner/events` | `mall:write` | Existing |

**Instrument create payload extension**

| Field | Type | Notes |
|:--|:--|:--|
| `templateId` | string? | Gift card template / voucher product / coupon template |
| `issuanceId` | string | Rewards issuance; persisted for linkage |
| `businessId` | string? | Bind to listing; required for business rewards |
| `scope` | object? | `{ mode, listingIds?, productIds?, serviceIds? }` |
| `metadata` | object? | Free-form |
| `code` | string? | Existing |
| `amount` | number | Existing |
| `recipientEmail` | string? | Existing |
| `expiresAt` | ISO-8601? | Existing (coupons) |

### 8.3 MCOM Rewards — new/changed endpoints

| Method | Path | Purpose |
|:--|:--|:--|
| `GET` | `/rewards/admin/central/memberships` | Proxy/read Central membership catalogue |
| `GET` | `/rewards/admin/central/access-plans` | Proxy/read Central access plans |
| `GET` | `/rewards/admin/mall/listings` | Global Mall browse |
| `GET` | `/rewards/business/mall/templates` | Business's Mall templates |
| `POST` | `/rewards/admin/rewards` | Extend body with fulfilment attachment |
| `POST` | `/rewards/business/rewards/create` | Extend body with fulfilment attachment |
| `GET` | `/rewards/me/issuances` | Recipient wallet (code + deep link) |
| `POST` | `/rewards/me/issuances/:id/claim` | Trigger/retry fulfilment |
| `POST` | `/rewards/partner/issuances/:id/redeem` | Existing; add Central callback semantics |

> Keep existing route shapes; add fields rather than new parallel resources.

---

## 9. End-to-end flows

### Flow A — Business gift-card reward, scoped to own products

1. Business opens Rewards reward builder → chooses **Mall gift card**.
2. Rewards calls `GET /partner/templates/gift-cards?businessId=<resolved>` (mesh, `mall:read`).
3. Business picks a template, value (£30), scope `SELECTED_ITEMS` with 3 product ids from its own catalogue.
4. Saved on `business_reward.fulfilment_config`.
5. Participant redeems → issuance created → fulfilment calls `POST /partner/instruments/gift-cards` with `templateId`, `businessId`, `scope`, `issuanceId`, shared `code`.
6. Mall creates a gift card bound to the business + scope; returns `{ id, code }`.
7. Rewards wallet shows the code and a **Shop at <business>** button → Mall `/listings/<businessId>?reward=<code>`.
8. Shopper adds eligible products, applies code at checkout. Mall computes eligible line total and caps the gift card amount.
9. On payment success, Mall calls Rewards `POST /partner/issuances/:id/redeem` (or emits `reward.redeemed`), and Rewards marks `REDEEMED`.

### Flow B — Admin gift card usable across all Mall

Same as A, but `scope.mode = ALL`, no `businessId`, and the template is platform-owned. Only `Role.Admin` may select `ALL`.

### Flow C — Admin Central membership reward

1. Admin opens reward builder → **Central membership**.
2. Rewards reads `GET /partner/catalog/memberships`.
3. Admin picks plan + tier + duration + scope (all or selected plans).
4. Participant redeems → Rewards calls `POST /partner/grants/membership` with `issuanceId`.
5. Central resolves the recipient's `businessId`, activates membership, writes `BillingTransaction` with `providerPaymentId = rewards:<issuanceId>`, returns entitlement.
6. Rewards shows "Active until <date>" + **Manage in MCOM Central**.
7. If the recipient is a consumer → Central returns `422 RECIPIENT_NOT_A_BUSINESS`; Rewards surfaces a clear message and leaves the issuance `ISSUED` for admin resolution.

### Flow D — Admin Central access pass reward

1. Admin picks an access plan; delivery is `CODE`.
2. On redemption, Rewards calls `POST /partner/access-pass-codes` (creates + completes in one call, or two idempotent calls).
3. Central returns `{ code, accessPlanId, expiresAt? }`; Rewards emails it and shows it.
4. Recipient redeems the code in Central → Central `redeemAccessCode` activates the pass and records `providerPaymentId = code:<id>`.
5. Central emits `access_pass.redeemed` → Rewards marks the issuance `REDEEMED`.

### Flow E — Admin Central coupon reward

1. Admin opens **Central coupon** builder mirrored from Central's admin UI:
   discount type/value, applies-to-all vs selected membership/access plans, max uses, per-user limit, validity, optional lock to recipient.
2. On redemption, Rewards generates a shared code and calls `POST /partner/coupons`.
3. Central creates the coupon with `lockedToUserId` = recipient's Central user id, `maxUses = 1`, `perUserLimit = 1`, returns the code.
4. Rewards shows the code and **Use on MCOM Central** deep link.
5. Recipient applies it at Central membership/access checkout. Central `CouponRedemption` completes.
6. Central emits `coupon.redeemed` → Rewards marks the issuance `REDEEMED`.

> Reminder: Flow E discounts Central subscriptions, **not Mall goods**.

---

## 10. Roadmap

Estimates are engineering weeks for one squad per codebase, assuming parallel work. Milestones are cumulative.

### Phase 0 — Decisions & contracts (Week 1)

| Task | Owner | Deliverable |
|:--|:--|:--|
| Ratify D1–D14 (§5) | All leads | Signed decision log |
| Finalise scope names + registry entries | Central + Rewards | Console entries + policy matrix |
| Freeze the API contracts in §8 | All | Versioned OpenAPI fragments |
| Define reward taxonomy + fulfilment config schema | Rewards | Schema doc + migration plan |
| Define money/liability model | Product + Finance | One-page policy |
| Agree Mall deep-link format | Mall + Rewards | `https://<mall-web>/listings/<businessId>?reward=<code>` |

**Exit:** contracts signed; no open ⚠️ decisions.

### Phase 1 — Mesh plumbing + Central as callee (Weeks 2–3)

| Task | Owner |
|:--|:--|
| Add inbound RS256 guard + scope decorator to Central (`jose`, JWKS self-verify) | Central |
| Register `mcom-central` peer (`serviceEnabled`, `serviceBaseUrl`, `serviceScopes`, `allowedCallers: ['mcom-rewards']`) | Central |
| Add `central:read`, `central:issue` to Rewards' declared scopes + egress | Rewards + Central Console |
| Add Central client + scopes to Rewards `ServiceMeshService` | Rewards |
| Add a shared conformance test script (token → 200; wrong scope → 403; wrong caller → 403) | All |
| Update `.env.example` in all three repos | All |

**Exit:** Rewards can call a `GET /partner/ping` on Central with `central:read`; all deny paths return 403.

### Phase 2 — Central catalogue read + reward attachment (Weeks 3–4)

| Task | Owner |
|:--|:--|
| `GET /partner/catalog/memberships`, `/access-plans` (+ `:id`) | Central |
| `GET /partner/users/resolve` | Central |
| Central catalogue cache + client methods | Rewards |
| `fulfilment_config` columns/entities + migrations | Rewards |
| Admin reward builder: fulfilment picker (Central membership/access) | Rewards |
| Business reward builder: read-only for Central (businesses cannot grant Central entitlements) | Rewards |
| Contract tests + fixture data | All |

**Exit:** an admin can attach a Central plan to a reward and see it persisted/rendered.

### Phase 3 — Central fulfilment: memberships & access passes (Weeks 5–6)

| Task | Owner |
|:--|:--|
| `POST /partner/grants/membership` with `durationDays`, `extendExisting`, idempotency | Central |
| `POST /partner/access-pass-codes` (create + complete, email optional) | Central |
| `PartnerGrant` model + audit + revocation policy | Central |
| Fulfilment orchestrator (strategy pattern) + outbox/retry | Rewards |
| Central client methods + error mapping (`422` recipient not business) | Rewards |
| Recipient wallet: code/entitlement display + claim/retry | Rewards |
| Events `membership.granted`, `access_pass.redeemed` → Rewards | Central + Rewards |

**Exit:** redeeming a membership reward activates the recipient's Central membership idempotently; redeeming an access-pass reward yields a working code.

### Phase 4 — Central coupons (Weeks 6–7)

| Task | Owner |
|:--|:--|
| `POST /partner/coupons`, `GET /:code`, `POST /:code/revoke` | Central |
| `sourceApp` / `externalRef` on `Coupon`; outbox events | Central |
| Admin Central-coupon builder UI (mirror Central fields) | Rewards |
| Coupon generation + delivery + status sync | Rewards |
| Validation of edge cases: locked user, max uses, expiry, plan scope | All |

**Exit:** admin creates a Central-coupon reward; recipient receives a code that validates and redeems at Central checkout.

### Phase 5 — Mall templates + template-aware instruments (Weeks 6–8)

| Task | Owner |
|:--|:--|
| `GET /partner/templates/{gift-cards,vouchers,coupons}` + `:id` | Mall |
| Extend instrument DTOs: `templateId`, `businessId`, `issuanceId`, `scope`, `metadata` | Mall |
| Persist linkage + business binding; idempotent on `(sourceApp, issuanceId)` / `code` | Mall |
| `GET /partner/instruments/:kind/:code` + revoke | Mall |
| Rewards: template picker for business reward builder | Rewards |
| Rewards: send template/business/scope/issuance on fulfilment | Rewards |
| Deep-link "Shop at business" button | Rewards |

**Exit:** a business reward materialises a template-based instrument bound to that business, and the code is visible and usable natively.

### Phase 6 — Mall scoping + admin-wide catalogue (Weeks 8–11)

| Task | Owner |
|:--|:--|
| `GET /partner/catalog/listings` + `:id` (global, paginated, search) | Mall |
| `InstrumentScope` model + migrations | Mall |
| Line-level eligibility + discount math in `order.service.ts` | Mall |
| Booking payment equivalent for services | Mall |
| Enforce scope on redemption; reject ineligible carts clearly | Mall |
| Rewards admin UI: browse all listings/products/services, multi-select | Rewards |
| Rewards business UI: own catalog only (server-enforced) | Rewards |
| Cross-tenant authorization tests | All |

**Exit:** an admin can create an ALL-scope or item-scoped instrument; Mall applies it only to eligible lines with correct totals.

### Phase 7 — Convergence & hardening (Weeks 11–13)

| Task | Owner |
|:--|:--|
| Make `RedemptionService` create/commit a `RewardIssuance` (single ledger) | Rewards |
| Remove direct Mall calls from `RedemptionService`; route through orchestrator | Rewards |
| Instrument → issuance callback on Mall consumption | Mall + Rewards |
| Refund/chargeback/revocation propagation | All |
| Retry, dead-letter, reconciliation job, alerting | All |
| PII, rate limits, audit logs, token scopes review | All |
| Load/performance test on checkout + fulfilment | All |

**Exit:** one ledger, no duplicate instruments, retries safe, reconciliation report clean.

### Phase 8 — Analytics, finance, GA (Weeks 13–14)

| Task | Owner |
|:--|:--|
| Outstanding liability per provider/scope | Rewards + Finance |
| Redemption, breakage, attach-rate dashboards | Rewards |
| Feature flags per provider/tenant | All |
| Runbooks + support scripts | All |
| GA sign-off | All |

**Exit:** production launch with dashboards and runbooks.

### Timeline summary

| Milestone | Weeks | Theme |
|:--|:--|:--|
| M0 | 1 | Decisions + contracts |
| M1 | 2–4 | Mesh + Central read |
| M2 | 5–7 | Central fulfilment + coupons |
| M3 | 6–8 | Mall templates + instruments |
| M4 | 8–11 | Mall scoping + admin catalogue |
| M5 | 11–14 | Convergence, hardening, GA |

With three parallel squads, this is roughly a **14-week programme**, with M2 and M3 overlapping.

---

## 11. Work packages per codebase

> The following three sections are written to be copied verbatim into the respective team channels.

---

### 11.1 MCOM REWARDS — work package

**Mission:** make Rewards the single place where a reward's fulfilment is configured, issued, tracked, and displayed — for Mall instruments and Central entitlements.

**A. Data model (owner: Rewards backend)**

1. Add to `reward` and `business_reward`:
   - `fulfilment_provider` (`NONE|MALL|CENTRAL`)
   - `fulfilment_kind` (`MALL_DISCOUNT|MALL_GIFT_CARD|MALL_VOUCHER|MALL_COUPON|CENTRAL_MEMBERSHIP|CENTRAL_ACCESS_PASS|CENTRAL_COUPON`)
   - `fulfilment_config jsonb` (`scope`, `value`, `templateRef`, `validity`, `delivery`, `grant`)
   - `fulfilment_template_id`, `fulfilment_business_ref`
2. Add to `reward_issuance`:
   - `fulfilment_provider`, `fulfilment_kind`, `fulfilment_status`
   - `fulfilment_ref`, `fulfilment_code`, `fulfilment_payload jsonb`, `fulfilment_error`
3. Keep `is_mall_integrated`, `mall_reward_type`, `mall_reward_value`, `mall_target_*`, `mall_reference` for backwards compatibility; migrate business rewards to `fulfilment_*` behind a flag.
4. Add a `fulfilment_outbox` table (or reuse the existing queue) with `issuanceId`, `provider`, `attempt`, `nextAttemptAt`, `lastError`.

**B. Service mesh (owner: Rewards backend)**

1. Add to `apps/api/src/resources/service-mesh/constants.ts`:
   - `DEFAULT_CENTRAL_CLIENT_ID = "mcom-central"`
   - `SERVICE_SCOPE_CENTRAL_READ = "central:read"`
   - `SERVICE_SCOPE_CENTRAL_ISSUE = "central:issue"`
2. Declare those scopes on `mcom-rewards` in the Central Console and add `mcom-central` to egress `allowedAudiences`.
3. Add `getCentralClientId()` / `callCentral()` helpers mirroring `callPeerByClientId`.
4. Add `MCOM_CENTRAL_CLIENT_ID`, `MCOM_ALLOWED_CALLERS` (include `mcom-central` if Central will call back) to `.env.example`.

**C. Central integration module (owner: Rewards backend)**

Create `apps/api/src/resources/central-integration/`:

1. `central-integration.service.ts`
   - `listMembershipPlans()`, `listAccessPlans()`, `resolveRecipient(email|mcomUserId)`
   - `grantMembership(input)`, `issueAccessPassCode(input)`, `createCoupon(input)`, `getCoupon(code)`, `revokeCoupon(code)`
   - All calls idempotent; map Central errors to Rewards exceptions.
2. `fulfilment.orchestrator.ts`
   - Resolve strategy from `fulfilment_provider`.
   - `fulfil(issuance)` → provider call → persist `fulfilment_*` → emit event.
   - `retry(issuanceId)` and `revoke(issuanceId)`.
3. `strategies/mall.strategy.ts`
   - Extend existing `MallIntegrationService` calls with `templateId`, `businessId`, `scope`, `issuanceId`.
4. `strategies/central.strategy.ts`
   - Membership: `grantMembership`.
   - Access pass: `issueAccessPassCode`.
   - Coupon: `createCoupon` with shared code + `lockedToUserId`.
5. `strategies/none.strategy.ts`
   - Manual/offline fulfilment with an admin note.

**D. Issuance & redemption convergence (owner: Rewards backend)**

1. Refactor `RedemptionService.redeemReward` so it:
   - Creates/uses a `RewardIssuance` (idempotency key = existing `idempotencyKey`).
   - Calls the fulfilment orchestrator instead of `MallIntegrationService` directly.
   - Stores `fulfilment_code` and `fulfilment_ref`.
   - Keeps `PointHistory` as the points/stamps ledger, not the fulfilment ledger.
2. Keep `RewardIssuanceService` as the single state machine; add `fulfilment_status` transitions.
3. Remove `walletService.spend` coupling for admin-created rewards; introduce a platform liability account (per D10).
4. Add reconciliation: issuances `ISSUED` with `fulfilment_status=FAILED` older than N minutes retried by a cron.

**E. API (owner: Rewards backend)**

1. Admin catalogue proxies:
   - `GET /rewards/admin/central/memberships`
   - `GET /rewards/admin/central/access-plans`
   - `GET /rewards/admin/mall/listings` (paginated, searchable)
   - `GET /rewards/admin/mall/templates?kind=&businessId=`
2. Business catalogue:
   - `GET /rewards/business/mall/templates?kind=` (own only)
   - existing `GET /rewards/business/mall-catalog` remains
3. Extend `CreateRewardDto`, `CreateBusinessRewardDto`, `UpdateBusinessRewardDto` with `fulfilment` block.
4. Recipient:
   - `GET /rewards/me/issuances` (code, deep link, expiry, status)
   - `POST /rewards/me/issuances/:id/claim` (retry fulfilment)
5. Partner callback:
   - `POST /partner/issuances/:id/redeem` already exists — accept Mall/Central callbacks and mark `fulfilment_status`.

**F. Web UI (owner: Rewards frontend)**

1. **Admin reward builder** (`apps/web/src/app/admin/rewards`):
   - Step "Fulfilment": None / Mall / Central.
   - Mall: template picker (gift card / voucher / coupon), value, scope (ALL / listings / items).
   - Central: membership / access pass picker; coupon builder mirroring Central's fields.
   - Preview: "Recipient will receive: code / entitlement".
2. **Business reward builder** (`apps/web/src/app/dashboard/rewards/page.tsx`):
   - Mall only; templates limited to own; scope limited to own catalogue.
   - Keep existing Mall discount targeting (`mallTargets`) as a separate option.
3. **Recipient wallet** (`my-rewards` / `play-win/my-rewards`):
   - Show code, copy button, expiry, status.
   - "Shop at <business>" deep link for Mall; "Use on MCOM Central" for Central.
4. **Admin reconciliation view**:
   - Issuances with failed fulfilment; retry button; error reason.

**G. Tests (owner: Rewards)**

- Unit: strategy selection, idempotent fulfil, error mapping, scope payload.
- Integration: mesh contract tests against Central and Mall stubs.
- E2E: admin creates each of the 7 kinds; participant redeems; code works in the provider.
- Regression: existing Mall discount rewards still work.

**H. Definition of done (Rewards)**

- One issuance ledger; `RedemptionService` no longer calls Mall directly.
- All 7 kinds creatable and redeemable.
- Codes/entitlements visible to recipients with deep links.
- Retries safe; no duplicate instruments across 3 consecutive retries.
- Existing rewards unaffected behind a feature flag.

---

### 11.2 CENTRAL HUB — work package

**Mission:** become a first-class mesh peer that lets Rewards read the plan catalogue and issue memberships, access passes, and coupons — idempotently and auditably.

**A. Mesh inbound (owner: Central backend)**

1. Add a `ServiceAuthGuard` equivalent to the Mall/Rewards implementation:
   - `createRemoteJWKSet(<MCOM_SOLUTIONS_URL>/.well-known/jwks.json)` (self-hosted; can verify from its own public key set).
   - `jwtVerify` with `issuer: "mcom-solutions"`, `audience: "mcom-central"`, `algorithms: ["RS256"]`.
   - Derive caller from `payload.act?.sub ?? payload.sub`.
   - Deny-by-default against `allowedCallers` (registry or `MCOM_ALLOWED_CALLERS`).
2. Add `ServiceScopesGuard` + `@RequireServiceScopes` (copy the proven pattern from Mall).
3. Add constants: `SERVICE_SCOPE_CENTRAL_READ = "central:read"`, `SERVICE_SCOPE_CENTRAL_ISSUE = "central:issue"`.

**B. Registry configuration (owner: Central + Console)**

1. Seed/register `mcom-central` as an `SsoClient` with:
   - `clientId: "mcom-central"`, `serviceEnabled: true`
   - `serviceBaseUrl: <public central API URL>`
   - `serviceScopes: ["central:read", "central:issue"]`
   - `allowedCallers: ["mcom-rewards"]`
   - `allowedAudiences: ["mcom-rewards"]` (for callbacks/events)
2. Add `central:read` and `central:issue` to `mcom-rewards.serviceScopes` and add `mcom-central` to its `allowedAudiences`.
3. Make sure `ecosystem.service` includes Central itself (or add a built-in pseudo-entry) so peers can resolve `mcom-central`.
4. Document the policy matrix in `/admin/console`.

**C. Partner catalogue API (owner: Central backend)**

Create `apps/backend/src/partner/` (or `partner-access/`):

1. `GET /api/v1/partner/catalog/memberships`
   - Returns plans with tiers, durations, prices, features, entitlements, bundles.
   - Exclude archived/deleted.
2. `GET /api/v1/partner/catalog/memberships/:id`
3. `GET /api/v1/partner/catalog/access-plans`
   - Returns plans with `durationDays`, `platformAccess`, `features`, bundles.
4. `GET /api/v1/partner/catalog/access-plans/:id`
5. `GET /api/v1/partner/users/resolve?email=|mcomUserId=`
   - Returns `{ mcomUserId, email, businessId?, businessName?, role }`.
   - Reuse existing user lookup logic; never expose sensitive fields.

**D. Grant API (owner: Central backend)**

1. `POST /api/v1/partner/grants/membership`
   - Resolve recipient `businessId` from `recipientMcomUserId`.
   - Validate plan/tier.
   - Call `pricingService.subscribeMembership(businessId, planName, tier, billing, { provider: 'mcom-rewards', providerPaymentId: 'rewards:<issuanceId>', chargedAmount: 0, durationDays })`.
   - **Requires extending `subscribeMembership`** with `durationDays` (default `calculateTierExpiry`).
   - Policy: `extendExisting` → compute start from current `membershipExpiresAt`.
   - Return entitlement snapshot.
2. `POST /api/v1/partner/access-pass-codes`
   - Create `AccessPassCode` directly in `UNUSED` state (or `createPendingAccessCode` + `completeAccessCode` with `providerPaymentId: rewards:<issuanceId>` and `amount: 0`).
   - Return `{ code, accessPlanId, planName, expiresAt? }`.
   - Respect recipient email lock.
3. `POST /api/v1/partner/grants/:id/revoke`
   - Policy-gated; audit; do not break active paid subscriptions silently.
4. Persist a `PartnerGrant` record per call for idempotency + audit.

**E. Coupon partner API (owner: Central backend)**

1. `POST /api/v1/partner/coupons`
   - Reuse `CouponService.createCoupon` with `source: ADMIN` + new `sourceApp: 'mcom-rewards'` + `externalRef: issuanceId`.
   - Accept the full admin DTO: `code`, `description`, `discountType`, `discountValue`, `appliesToAllMemberships`, `membershipPlanIds`, `appliesToAllAccess`, `accessPlanIds`, `maxUses`, `maxUsesPerUser`, `validFrom`, `expiresAt`, `lockedToUserId`.
   - Idempotent on `code` — return existing coupon.
2. `GET /api/v1/partner/coupons/:code`
   - Status, uses, remaining, locked user.
3. `POST /api/v1/partner/coupons/:code/revoke`
   - Only if no completed redemptions (or policy-defined).
4. Add `sourceApp` / `externalRef` to `Coupon`.
5. Emit outbox events: `coupon.created`, `coupon.redeemed`, `coupon.expired`.

**F. Events / callbacks (owner: Central backend)**

1. Add a `PartnerOutbox` + dispatcher to `mcom-rewards` (audience token, `central:read`/`central:issue` as agreed).
2. Events:
   - `membership.granted`, `membership.expired`
   - `access_pass.code_created`, `access_pass.redeemed`
   - `coupon.created`, `coupon.redeemed`, `coupon.expired`
3. Sign/deliver per the existing webhook model; retry with backoff.

**G. Admin UI (owner: Central frontend)**

- `/admin/console`: show the `mcom-central` peer row, `central:*` scopes, and the Rewards edge.
- `/admin/coupons`: add `sourceApp` column/filter so Rewards-issued coupons are distinguishable.
- `/admin/access`: show codes issued via partner (source = Rewards).
- Optional: a read-only "Issued to Rewards" badge.

**H. Tests (owner: Central)**

- Guard tests: missing token → 401; wrong `aud` → 401; wrong caller → 403; missing scope → 403.
- Grant idempotency: same `issuanceId` twice → one membership/code.
- Coupon idempotency: same code twice → one coupon.
- Recipient resolution: business vs consumer; unknown email.
- Regression: existing admin/payment/access flows unchanged.

**I. Definition of done (Central)**

- Rewards can mint `aud=mcom-central` tokens and call all partner endpoints.
- Grants are idempotent and auditable; no duplicate billing rows.
- Access codes and coupons are redeemable through the existing UIs without changes.
- Events reach Rewards with retry safety.

---

### 11.3 MCOM MALL — work package

**Mission:** expose templates and a global catalogue to Rewards, and make partner instruments behave like native, business-bound, scope-aware instruments at checkout.

**A. Partner template discovery (owner: Mall backend)**

1. `GET /api/v1/partner/templates/gift-cards?businessId=`
   - Resolve business by `businessId` or owner `mcomUserId`.
   - Return active templates: `id`, `name`, `fixedAmounts`, `allowCustomAmount`, `min/max`, `expiryPeriodDays`, `allowReloading`, image fields.
2. `GET /api/v1/partner/templates/vouchers?businessId=`
   - Return `VoucherProduct` fields: `id`, `name`, `usage`, `fixedAmounts`, `valueType`, `value`, `expiryDays`, `allowPartialRedemption`.
3. `GET /api/v1/partner/templates/coupons?businessId=`
   - Return business coupon templates (sourceType `BUSINESS`): `id`, `title`, `discountType`, `discountValue`, `usageLimit`, `perUserLimit`, validity.
4. `GET /api/v1/partner/templates/:kind/:id`
5. Enforce tenancy: a business-scoped token may only read its own templates; platform/admin reads require a platform scope.

> New scope suggestion: `mall:read` for all partner reads; optionally `mall:admin` for global reads. Decide in Phase 0.

**B. Instrument creation extensions (owner: Mall backend)**

1. Extend `CreateInstrumentDto` / `CreateCouponInstrumentDto`:
   - `templateId?`, `businessId?`, `issuanceId`, `scope?`, `metadata?`
2. `GiftCardService.createPartnerGiftCard`
   - Bind `purchaseBusiness` to `businessId`.
   - Copy template defaults (expiry, reload, bonus) when `templateId` supplied.
   - Persist `issuanceId`, `sourceApp='mcom-rewards'`, `scope`.
3. `VoucherService.createPartnerVoucher`
   - Bind `voucherProduct` when `templateId` supplied; enforce its `usage`/`expiryDays`/`allowPartialRedemption`.
   - Persist linkage + scope.
4. `CouponService.createPartnerCoupon`
   - Bind `business` when `businessId` supplied; apply template defaults.
   - Persist linkage + scope.
5. Idempotency: unique on `(sourceApp, issuanceId)` and on `code`; return the existing instrument on replay.
6. Validate: amount > 0; scope ids exist and belong to the business; no cross-tenant ids.

**C. Instrument scope model + checkout enforcement (owner: Mall backend — largest item)**

1. Add `InstrumentScope`:
   - `scopeMode`: `ALL | LISTINGS | ITEMS`
   - `listingIds`, `productIds`, `serviceIds`
   - polymorphic owner: `instrumentType` + `instrumentId`
2. **Coupon path** (`validateCoupon` + `order.service.ts`):
   - Compute eligible subtotal: sum of line totals matching the scope.
   - Fixed: `min(discountValue, eligibleSubtotal)`.
   - Percentage: `eligibleSubtotal * value / 100` (cap by `maxDiscount` if present).
   - Keep existing no-stacking rule relative to rewards.
3. **Gift card path**:
   - Eligible payable = eligible line total + proportional shipping (decide policy: exclude shipping for item-scoped cards).
   - `giftCardAmountToApply = min(requested, balance, eligiblePayable)`.
4. **Voucher path**: same as gift card.
5. **Booking path** (`booking.service.ts` / `initiate-payment`):
   - Scope service bookings by `serviceId`; apply the same capping.
6. Reject clearly when a scoped instrument is applied to a cart with **zero** eligible lines.
7. Persist the applied eligible amount in `RedemptionLog` / transaction metadata for audit.

**D. Instrument ↔ issuance linkage (owner: Mall backend)**

1. Add `issuanceId`, `sourceApp` to `GiftCard`, `Voucher`, `Coupon`.
2. On successful consumption, call Rewards `POST /partner/issuances/:id/redeem` with the code (existing endpoint).
3. If the call fails, queue a retry; never block checkout on the callback.
4. Also emit `reward.redeemed` to `/partner/events` (existing) as a secondary channel.

**E. Global catalogue for Rewards admin (owner: Mall backend)**

1. `GET /api/v1/partner/catalog/listings?query=&page=&limit=&status=`
   - Paginated businesses with name, id, owner `mcomUserId`, status, logo.
2. `GET /api/v1/partner/catalog/listings/:id`
   - Business + products + services (reuse `PartnerCatalogService`).
3. `GET /api/v1/partner/catalog/products?query=&businessId=&page=`
4. `GET /api/v1/partner/catalog/services?query=&businessId=&page=`
5. Only return `published`/active entities to partners; include status for transparency.
6. Gate global reads behind `mall:read` + an `isPlatformCaller` check (or a new `mall:admin` scope).

**F. Deep link contract (owner: Mall frontend + backend)**

1. Canonical: `https://<mall-web>/listings/<businessId>?reward=<code>` (confirm actual route: `apps/McomMall/app/(public)/listings/[id]`).
2. If the reward is item-scoped, optionally deep-link to a filtered listing view with `?products=<ids>`.
3. Ensure the code can be pre-applied at checkout via query/local storage; otherwise show it prominently.
4. Add UTM/source parameter for attribution.

**G. Security & tenancy (owner: Mall)**

1. Derive caller from token; never trust `X-Caller-Id`.
2. A business-scoped request must never read/write another business's templates or instruments.
3. Validate every `businessId`, `productId`, `serviceId` belongs to the resolved tenant before persisting scope.
4. Rate-limit partner endpoints; log caller + issuanceId.

**H. Tests (owner: Mall)**

- Contract tests for every new partner endpoint (200/401/403/404/422).
- Idempotency replay for each instrument kind.
- Scope math unit tests: fixed, percentage, caps, min spend, shipping, zero eligible lines.
- Cross-tenant authorization tests.
- Checkout regression: native gift cards/vouchers/coupons unaffected when no scope.
- Booking path parity.

**I. Definition of done (Mall)**

- Templates listable per business and globally.
- Instruments created from templates, bound to a business, with a persisted scope.
- Scoped instruments apply only to eligible lines with correct totals.
- Instrument consumption notifies Rewards exactly once (retry-safe).
- Native Mall behaviour unchanged for non-partner instruments.

---

## 12. Cross-team contract & RACI

| Area | Rewards | Central | Mall |
|:--|:--:|:--:|:--:|
| Scope names + registry | C | **R/A** | C |
| Central catalogue API | C | **R/A** | – |
| Grant API | C | **R/A** | – |
| Central coupon API | C | **R/A** | – |
| Fulfilment orchestrator | **R/A** | C | C |
| Reward builder UI | **R/A** | C | C |
| Mall template API | C | – | **R/A** |
| Instrument extension | C | – | **R/A** |
| Scope + checkout math | C | – | **R/A** |
| Instrument↔issuance link | C | – | **R/A** |
| Global Mall catalogue | C | – | **R/A** |
| Deep link | **R** | – | **A** |
| Redemption convergence | **R/A** | – | C |
| Events/outbox | C | **R/A** | **R/A** |
| E2E conformance | **R** | **R** | **R** |

R = responsible, A = accountable, C = consulted.

**Contract artefacts to keep in one place:**
1. OpenAPI fragments per app (versioned).
2. Scope/policy matrix (Console screenshot + JSON export).
3. Fulfilment config JSON schema (Rewards owns).
4. Instrument scope schema (Mall owns).
5. Event catalogue (all).
6. Error-code catalogue (all) — e.g. `RECIPIENT_NOT_A_BUSINESS`, `SCOPE_EMPTY`, `TEMPLATE_NOT_OWNED`, `ISSUANCE_ALREADY_FULFILLED`.

---

## 13. Security & compliance checklist

- [ ] Every inbound partner route uses the shared RS256 guard + scope guard.
- [ ] `aud` is checked against the receiving app's own `clientId`.
- [ ] Caller identity derived from the token, never from headers.
- [ ] Deny-by-default ingress; explicit `allowedCallers`.
- [ ] Scopes requested are a subset of the caller's declared scopes.
- [ ] No shared secrets or webhook keys between apps.
- [ ] JWKS cached with rotation tolerance; clock skew tolerance configured.
- [ ] Token TTL respected; no long-lived tokens.
- [ ] Partner endpoints rate-limited and audited (`caller`, `issuanceId`, `scope`).
- [ ] PII minimisation: recipient email only where required; no full profile payloads.
- [ ] Cross-tenant checks on every `businessId`/`productId`/`serviceId`.
- [ ] Idempotency enforced at the database level (unique constraints).
- [ ] Financial audit trail: `providerPaymentId`, `BillingTransaction`, `CouponRedemption`, `RedemptionLog`.
- [ ] Revocation/refund paths documented and tested.
- [ ] Secrets in a managed store; `.env.example` contains placeholders only.

---

## 14. Acceptance scenarios (must all pass before GA)

| # | Scenario | Expected |
|:--|:--|:--|
| 1 | Business attaches own gift-card template, £30, 2 products | Instrument created, bound to business, applies only to those products |
| 2 | Business tries to attach another business's product | `403` / validation error; nothing persisted |
| 3 | Admin creates ALL-scope voucher | Works on any Mall product/service |
| 4 | Admin creates item-scoped coupon | Applies only to selected items; zero-eligible cart is rejected clearly |
| 5 | Participant redeems gift-card reward | Code appears in wallet; deep link opens business listing |
| 6 | Same redemption replayed 3× | Exactly one instrument, one code |
| 7 | Mall checkout consumes scoped gift card | Correct capped amount; issuance marked `REDEEMED` |
| 8 | Rewards retries Mall call after timeout | Mall returns the same instrument (idempotent) |
| 9 | Admin attaches Central membership plan | Reward saves; redemption grants membership |
| 10 | Consumer receives membership reward | `422 RECIPIENT_NOT_A_BUSINESS`, issuance stays `ISSUED`, admin can reassign |
| 11 | Access-pass reward redeemed | Code generated; redeemable in Central; expiry correct |
| 12 | Central coupon reward redeemed | Code locked to recipient; redeemable at Central checkout; one use |
| 13 | Central coupon applied to a Mall cart | Not possible by design; UI must not offer it |
| 14 | Active membership exists; new membership reward granted | Extends from current expiry (per D6) |
| 15 | Central/Mall unreachable during fulfilment | Issuance stays `ISSUED`, outbox retries, admin sees error |
| 16 | Revoke an unused instrument | Provider revokes; issuance `REVOKED`; code no longer valid |

---

## 15. Risks & mitigations

| Risk | Impact | Mitigation |
|:--|:--|:--|
| Central has no inbound guard → rushed security work | High | Build it first (Phase 1) and reuse Mall/Rewards patterns verbatim |
| Mall scope math changes checkout | High | Feature-flag scoped instruments; exhaustive math tests; shadow-mode comparison |
| Two redemption paths cause duplicates | High | Converge on `RewardIssuance` before enabling provider fulfilment |
| Consumer recipients can't hold Central entitlements | Medium | Clear UX; `422` path; allow reassignment/gift |
| Membership grant overwrites existing plan | Medium | `extendExisting` policy + conflict response |
| Template cross-tenant leakage | High | Server-side ownership validation + tests |
| Coupon semantics confusion (3 systems) | Medium | Rename in UI: "Mall coupon", "Central coupon", "Rewards coupon (legacy)" |
| Admin reward funding unclear | Medium | Platform liability account (D10) before launch |
| Provider outage blocks redemption | Medium | Outbox + retry + "pending fulfilment" state |
| Instrument expiry drift across apps | Medium | Rewards canonical expiry; providers mirror; reconcile job |
| Token scope drift in Console | Medium | Conformance script in CI against the live registry |

---

## 16. Open questions for product/finance

1. For a business-issued reward, does the business pay face value upfront, on redemption, or only on breakage-adjusted usage? (Today Rewards debits the business wallet at redemption.)
2. For admin-issued rewards, which ledger bears the liability, and how is it reconciled with Mall/Central?
3. Should a reward be combinable with a native Mall coupon or Central coupon? (Recommend: no stacking on the same line.)
4. Should expired reward instruments auto-refund the sponsor, or is breakage retained?
5. Do we need partial redemption across multiple orders for gift cards/vouchers? (Native behaviour supports it; scoped behaviour needs a rule.)
6. Should consumers ever receive Central memberships/access passes (e.g. gifted to a business they own later)?
7. What is the maximum scope size (e.g. 10,000 product ids)? Pagination/chunking strategy?
8. Is the deep link allowed to pre-apply the code, or must the user type it?
9. Do we expose Rewards-issued coupons in Central's public coupon list, or keep them hidden/locked?
10. What is the SLA for fulfilment (synchronous vs async with notification)?

---

## 17. Appendix

### 17.1 Scope & policy matrix (target)

| App | `serviceScopes` (declares) | Egress `allowedAudiences` | Ingress `allowedCallers` |
|:--|:--|:--|:--|
| `mcom-rewards` | `rewards:read rewards:issue rewards:gift mall:read mall:write central:read central:issue` | `fundordonate, mcom-mall, mcom-central` | `fundordonate, mcom-mall, mcom-central` |
| `mcom-mall` | `mall:read mall:write rewards:read rewards:issue` | `mcom-rewards` | `mcom-rewards` |
| `mcom-central` | `central:read central:issue rewards:read rewards:issue` | `mcom-rewards` | `mcom-rewards` |

> Adjust Central's `rewards:*` declarations only if Central needs to call Rewards (events/callbacks). Otherwise use a webhook/outbox instead of inbound calls.

### 17.2 Environment variables

**Rewards**
```bash
MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com
MCOM_CLIENT_ID=mcom-rewards
MCOM_CLIENT_SECRET=cs_live_...
MCOM_CENTRAL_CLIENT_ID=mcom-central
MCOM_MALL_CLIENT_ID=mcom-mall
MCOM_ALLOWED_CALLERS=fundordonate,mcom-mall,mcom-central
MCOM_SERVICE_SCOPES=rewards:read rewards:issue rewards:gift mall:read mall:write central:read central:issue
```

**Central**
```bash
MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com          # self
MCOM_CLIENT_ID=mcom-central
MCOM_CLIENT_SECRET=cs_live_...
MCOM_ALLOWED_CALLERS=mcom-rewards
SERVICE_JWT_ISSUER=mcom-solutions
```

**Mall**
```bash
MCOM_SOLUTIONS_URL=https://auth.mcomsolutions.com
MCOM_CLIENT_ID=mcom-mall
MCOM_CLIENT_SECRET=cs_live_...
MCOM_ALLOWED_CALLERS=mcom-rewards
MCOM_REWARDS_MESH_ENABLED=true
```

### 17.3 Glossary

| Term | Meaning |
|:--|:--|
| **Issuance** | One reward granted to one recipient; the ledger row |
| **Fulfilment** | Turning an issuance into a usable code/entitlement at a provider |
| **Instrument** | Mall gift card, voucher, or coupon |
| **Entitlement** | Central membership or access pass |
| **Template** | Mall gift-card template, voucher product, or business coupon blueprint |
| **Scope** | Which products/services/plans an instrument or entitlement applies to |
| **Zero-hop** | App-to-app direct HTTPS; Central is never in the data path |
| **Provider** | `MALL` or `CENTRAL` (or `NONE` for manual) |

### 17.4 Reference files

**Rewards**
- `apps/api/src/resources/rewards/entities/business-reward.entity.ts`
- `apps/api/src/resources/partner-rewards/services/reward-issuance.service.ts`
- `apps/api/src/resources/participant-campaign-balance/services/redemption.service.ts`
- `apps/api/src/resources/mall-integration/mall-integration.service.ts`
- `apps/api/src/resources/service-mesh/services/service-mesh.service.ts`
- `apps/web/src/app/dashboard/rewards/page.tsx`

**Central**
- `apps/backend/src/access/access.service.ts`
- `apps/backend/src/pricing/pricing.service.ts`
- `apps/backend/src/coupon/coupon.service.ts`
- `apps/backend/src/service-identity/service-token.service.ts`
- `apps/backend/src/service-identity/ecosystem.controller.ts`
- `apps/backend/prisma/schema.prisma`

**Mall**
- `apps/mcom_mallAPI/src/resources/rewards-integration/partner-catalog.service.ts`
- `apps/mcom_mallAPI/src/resources/rewards-integration/partner-instruments.controller.ts`
- `apps/mcom_mallAPI/src/resources/rewards-integration/partner-events.controller.ts`
- `apps/mcom_mallAPI/src/resources/gift-card/gift-card.service.ts`
- `apps/mcom_mallAPI/src/resources/voucher/voucher.service.ts`
- `apps/mcom_mallAPI/src/resources/coupon/coupon.service.ts`
- `apps/mcom_mallAPI/src/resources/order/order.service.ts`
- `apps/McomMall/app/(public)/listings/[id]`

**Existing integration handbook**
- `mcom-mall/MCOM_REWARDS_MALL_INTEGRATION.md` (v3, 67KB) — authoritative for the current Rewards↔Mall contract.

---

*End of roadmap.*
