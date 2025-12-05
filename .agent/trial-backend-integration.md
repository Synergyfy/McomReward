# Trial Subscription Backend Integration

## Overview
Successfully integrated the backend `/membership/join-trial` endpoint into the existing trial flow.

## Changes Made

### 1. **Types** (`src/services/payment/types.ts`)
Added trial subscription types:
```typescript
export interface JoinTrialDto {
    tier_id: string;
}

export interface TrialSubscriptionResponse {
    id: string;
    status: string;
    planType: string;
    startsAt: string;
    expiresAt: string;
    isTrial: boolean;
    variant: string;
    progressionLevel: string;
    business: { id: string };
    tier: Tier;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
```

### 2. **Hook** (`src/services/payment/hook.ts`)
Created `useJoinTrial` hook:
```typescript
export const useJoinTrial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinTrial,
    onSuccess: () => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
    },
  });
};
```

### 3. **Checkout Page** (`src/app/(others)/checkout/page.tsx`)
Updated to use trial endpoint when `isTrial=true`:

**Key Changes:**
- Imported `useJoinTrial` hook
- Added `isJoiningTrial` to processing state
- Modified `handleConfirmPurchase` to detect trial mode and call trial endpoint directly

**Trial Flow:**
```typescript
if (isTrialMode) {
  joinTrial(
    { tier_id: tier.id },
    {
      onSuccess: (data) => {
        toast.success(`Trial started! Expires: ${new Date(data.expiresAt).toLocaleDateString()}`);
        router.push('/dashboard/subscription');
      },
      onError: (error) => {
        toast.error("Failed to start trial. Please try again.");
      }
    }
  );
  return; // Skip payment flow
}
```

## User Flow

### Trial Subscription Flow
```
1. User clicks "Start Trial" on pricing page
   ↓
2. Redirected to /checkout?plan=Bronze&billing=quarterly&isTrial=true
   ↓
3. Checkout page detects isTrial=true
   ↓
4. Shows "Trial Mode - No Charge Now" badge
   ↓
5. User clicks "Start Free Trial" button
   ↓
6. Calls POST /membership/join-trial with { tier_id }
   ↓
7. Backend creates trial subscription (14 days)
   ↓
8. Success toast shows expiration date
   ↓
9. Redirects to /dashboard/subscription
```

### Regular Subscription Flow
```
1. User clicks "Choose [Tier]" on pricing page
   ↓
2. Redirected to /checkout?plan=Bronze&billing=quarterly
   ↓
3. Checkout page (isTrial=false)
   ↓
4. User selects payment method (Stripe/PayPal)
   ↓
5. Optional: Select point package add-ons
   ↓
6. Clicks "Proceed to Payment"
   ↓
7. Calls payment initiation endpoint
   ↓
8. Completes payment
   ↓
9. Subscription activated
```

## Key Features

### ✅ **No Payment Required for Trial**
- Trial endpoint doesn't require payment provider
- No card details needed
- Instant activation

### ✅ **Clear User Communication**
- Green badge shows "Trial Mode - No Charge Now"
- Success message includes expiration date
- Total shows £0.00 for trial

### ✅ **Automatic Redirect**
- After successful trial join, redirects to dashboard
- User can immediately see their subscription status

### ✅ **Error Handling**
- Clear error messages if trial join fails
- Fallback to contact support

## Backend Response Example
```json
{
  "id": "471e8868-a072-4ad1-b455-49f36a22fa0f",
  "status": "active",
  "planType": "monthly",
  "startsAt": "2025-12-05T05:37:37.865Z",
  "expiresAt": "2026-01-04T05:37:37.865Z",
  "isTrial": true,
  "business": { "id": "0bccad82-6777-4000-adce-be40d7d40923" },
  "tier": { /* tier details */ }
}
```

## Testing

### Test Trial Flow:
1. Navigate to `/pricing`
2. Click "Start Trial" on any tier
3. Verify URL has `&isTrial=true`
4. Verify green trial badge appears
5. Click "Start Free Trial"
6. Verify success toast with expiration date
7. Verify redirect to `/dashboard/subscription`

### Test Regular Flow:
1. Navigate to `/pricing`
2. Click "Choose [Tier]"
3. Verify URL does NOT have `&isTrial=true`
4. Verify no trial badge
5. Proceed with normal payment flow

## Summary

The trial subscription feature is now fully integrated with the backend. Users can start a 14-day free trial without providing payment information, and the subscription is automatically created and activated by the backend.
