# Stamp System - Developer Documentation

This document outlines the implementation of the Stamp Reward System in the backend.

## 1. Overview

The Stamp System allows:
- **Admins** to create and manage `StampRewardTemplates`.
- **Businesses** to activate templates, creating `BusinessStampRewards`.
- **Participants** (Customers) to collect stamps via `StampCards` and earn rewards.
- **Hybrid Logic**: Optionally award points alongside stamps.

## 2. API Endpoints

### 2.1 Admin Endpoints


#### `POST /admin/stamps/templates`
Creates a new Stamp Reward Template.

**Request Body (`CreateStampTemplateDto`):**
```typescript
interface CreateStampTemplateDto{
title*	string
example: Buy 5 Get 1 Free
description*	string
example: Collect 5 stamps to get a free coffee.
required_stamps*	number
example: 5
reward_benefit*	string
example: FREE_ITEM
Enum:
[ FREE_ITEM, DISCOUNT, FREE_SERVICE, BONUS_POINTS ]
reward_benefit_value	string
example: Coffee
trigger_method*	string
example: QR_SCAN
Enum:
[ QR_SCAN, PURCHASE, CHECK_IN ]
stamp_validity_days	number
example: 30
Days valid after start

reward_claim_deadline_days	number
example: 7
Days to redeem after completion

is_hybrid*	boolean
example: false
hybrid_points_per_stamp	number
example: 10
hybrid_completion_bonus_points	number
example: 50
default_image	string
example: https://example.com/image.png
}


```

**Response (`StampRewardTemplate`):**
```typescript
interface StampRewardTemplate{
id*	string
The unique identifier of the entity

created_at*	string($date-time)
The date when the entity was created

updated_at*	string($date-time)
The date when the entity was last updated

deleted_at*	string($date-time)
The date when the entity was soft deleted

}
```

#### `GET /admin/stamps/templates`
List all Stamp Reward Templates (draft and published).

**Request:** No payload.

**Response:** `StampRewardTemplate[]`

#### `GET /admin/stamps/templates/:id`
Get a specific template by ID.

**Response:** `StampRewardTemplate`

#### `PATCH /admin/stamps/templates/:id`
Update a template.

**Request Body (`UpdateStampTemplateDto`):**
Same as `CreateStampTemplateDto` but all fields are optional.

**Response:** `StampRewardTemplate`

#### `POST /admin/stamps/templates/:id/publish`
Publish a template so businesses can see and activate it.

**Response:** `StampRewardTemplate` (with `is_published: true`)

---

### 2.2 Business Endpoints
Base URL: `/business/stamps`
**Auth**: Business or Staff Role Required.

#### `GET /business/stamps/templates`
List published templates available for activation.

**Response:** `StampRewardTemplate[]`

#### `POST /business/stamps/activate`
Activate a template for the business.

**Request Body (`ActivateStampRewardDto`):**
```typescript
interface ActivateStampRewardDto {
  templateId: string;        // Required. UUID of the template.
  custom_image?: string;     // Optional. Overrides default image.
  operating_hours?: string;  // Optional. e.g., "Mon-Fri 9-5"
}
```

**Response (`BusinessStampReward`):**
```typescript
interface BusinessStampReward {
  id: string;
  template: StampRewardTemplate;
  business: Business;
  custom_image: string;
  operating_hours: string;
  is_active: boolean;
  total_enrolled: number;
  total_completions: number;
  total_redemptions: number;
}
```

#### `GET /business/stamps/active`
List active stamp rewards for the logged-in business.

**Response:** `BusinessStampReward[]`

#### `GET /business/stamps/stats`
Get simplified stats for active stamp rewards.

**Response:**
```typescript
Array<{
  id: string;
  title: string;
  total_enrolled: number;
  total_completions: number;
  total_redemptions: number;
}>
```

#### `POST /business/stamps/scan`
Scan a participant's QR code to add a stamp.

**Request Body (`ScanParticipantQrDto`):**
```typescript
interface ScanParticipantQrDto {
  participantUniqueCode: string;   // Required. User's 9-char code.
  businessStampRewardId: string;   // Required. UUID of the reward program.
}
```

**Response (`StampCard`):**
```typescript
interface StampCard {
  id: string;
  participant: Participant;
  businessStampReward: BusinessStampReward;
  current_stamps: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'REDEEMED';
  completed_at?: Date;
  redeemed_at?: Date;
}
```

#### `POST /business/stamps/redeem`
Redeem a completed stamp card for a participant.

**Request Body (`RedeemStampCardDto`):**
```typescript
interface RedeemStampCardDto {
  participantUniqueCode: string; // Required.
}
```

**Response (`StampCard`):**
The updated card with `status: 'REDEEMED'`.

---

### 2.3 Participant Endpoints
Base URL: `/participant/stamps`
**Auth**: Participant Role Required.

#### `GET /participant/stamps/my-cards`
List all stamp cards (active and past) for the logged-in user.

**Response:** `StampCard[]`

#### `GET /participant/stamps/card/:id`
Get detailed view of a specific stamp card.

**Response:** `StampCard` (with full relations loaded)

#### `GET /participant/stamps/business/:businessId`
Get available stamp rewards for a specific business.

**Response:** `BusinessStampReward[]`

## 3. Enums

### `StampTriggerMethod`
- `QR_SCAN`: Business scans participant QR.
- `PURCHASE`: Automatic after purchase (integration dependent).
- `CHECK_IN`: Automatic after check-in (integration dependent).

### `StampRewardType`
- `FREE_ITEM`
- `DISCOUNT`
- `FREE_SERVICE`
- `BONUS_POINTS`

### `StampCardStatus`
- `IN_PROGRESS`
- `COMPLETED`
- `REDEEMED`
