# Trial Subscription Implementation Guide

## Overview
This document explains how the trial subscription flow works in the application, following industry best practices used by companies like Stripe, Netflix, and Spotify.

## How It Works

### 1. **User Flow**
```
Pricing Page → Click "Start Trial" → Checkout Page (Trial Mode) → Enter Payment Details → Trial Starts
```

### 2. **Key Features**

#### ✅ **Same Checkout Page for Both Regular and Trial**
- Regular purchase: `/checkout?plan=Bronze&billing=quarterly`
- Trial purchase: `/checkout?plan=Bronze&billing=quarterly&isTrial=true`

#### ✅ **Visual Indicators**
- **Trial Badge**: Green badge at top showing "🎉 Trial Mode - No Charge Now"
- **Summary Section**: Shows £0.00 total due today
- **Trial Discount Line**: Shows the full price being discounted during trial
- **Clear Messaging**: "14-day free trial - Your card will be authorized but not charged"

#### ✅ **Button Text Changes**
- Regular: "Proceed to Payment"
- Trial: "Start Free Trial"

### 3. **Technical Implementation**

#### **Frontend Changes**

**File: `src/components/pricing/pricing-card.tsx`**
```tsx
// Trial button now passes the selected plan with isTrial flag
<Link href={`/checkout?plan=${tier.name}&billing=${billingCycle}&isTrial=true`}>
  Start Trial
</Link>
```

**File: `src/app/(others)/checkout/page.tsx`**
```tsx
// Detects trial mode from URL
const isTrialMode = params.get("isTrial") === "true"

// Passes trial flag to backend
const paymentPayload = {
  tier_id: tier.id,
  plan_type: planType,
  coupon_code: appliedCoupon?.code || "",
  is_trial: isTrialMode, // Backend will handle trial setup
};
```

**File: `src/services/payment/types.ts`**
```tsx
export interface StripeInitiateRequest {
    tier_id: string;
    plan_type: string;
    coupon_code?: string;
    is_trial?: boolean; // New field
}

export interface PayPalInitiateRequest {
    tier_id: string;
    plan_type: string;
    coupon_code?: string;
    is_trial?: boolean; // New field
}
```

### 4. **Backend Requirements (To Be Implemented)**

When the backend receives `is_trial: true`, it should:

#### **For Stripe:**
```javascript
// Create subscription with trial period
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14, // 14-day trial
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});

// Return client secret for card authorization (not charge)
return {
  clientSecret: subscription.latest_invoice.payment_intent.client_secret
};
```

#### **For PayPal:**
```javascript
// Create subscription with trial period
const subscription = await paypal.subscriptions.create({
  plan_id: planId,
  start_time: futureDate, // Start billing after trial
  billing_cycles: [
    {
      tenure_type: 'TRIAL',
      sequence: 1,
      total_cycles: 1,
      pricing_scheme: {
        fixed_price: { value: '0', currency_code: 'GBP' }
      }
    },
    {
      tenure_type: 'REGULAR',
      sequence: 2,
      total_cycles: 0, // Infinite
      pricing_scheme: {
        fixed_price: { value: tierPrice, currency_code: 'GBP' }
      }
    }
  ]
});
```

### 5. **User Experience**

#### **During Trial (Days 1-14)**
- ✅ Card is authorized (verified as valid)
- ❌ No charge is made
- ✅ User has full access to all features
- ✅ User can cancel anytime with no charge

#### **After Trial (Day 15+)**
- ✅ Automatic charge begins
- ✅ Subscription continues normally
- ✅ User is notified before first charge

### 6. **Why This Approach?**

#### **Industry Standard**
- **Netflix**: Requires card, no charge during trial
- **Spotify**: Requires card, no charge during trial
- **Stripe**: Recommends this approach in their documentation

#### **Benefits**
1. **Reduces Friction**: One checkout flow for all users
2. **Higher Conversion**: Users who add cards are more likely to convert
3. **Prevents Abuse**: Requires valid payment method
4. **Seamless Experience**: No action needed after trial ends
5. **Professional**: Matches user expectations from major platforms

#### **Alternative Approaches (Not Recommended)**
❌ **Separate Trial Checkout**: Creates confusion, doubles maintenance
❌ **No Card Required**: High abuse rate, low conversion
❌ **Manual Upgrade**: Friction point, users forget, high churn

### 7. **Testing the Flow**

#### **Test Trial Mode:**
1. Go to pricing page
2. Click "Start Trial" on any tier
3. Verify URL has `&isTrial=true`
4. Verify green trial badge appears
5. Verify total shows £0.00
6. Verify button says "Start Free Trial"

#### **Test Regular Mode:**
1. Go to pricing page
2. Click "Choose [Tier]" on any tier
3. Verify URL does NOT have `&isTrial=true`
4. Verify no trial badge
5. Verify total shows actual price
6. Verify button says "Proceed to Payment"

### 8. **Next Steps for Backend Team**

1. Update Stripe/PayPal endpoints to accept `is_trial` parameter
2. Implement trial period logic (14 days recommended)
3. Set up webhook handlers for trial end events
4. Implement email notifications:
   - Trial started confirmation
   - Trial ending reminder (2 days before)
   - First charge confirmation
5. Add subscription status tracking in database

### 9. **Database Schema Considerations**

```sql
-- Subscription table should include:
subscriptions {
  id: uuid
  user_id: uuid
  tier_id: uuid
  status: enum ('trial', 'active', 'cancelled', 'expired')
  trial_start_date: timestamp
  trial_end_date: timestamp
  billing_start_date: timestamp
  next_billing_date: timestamp
  is_trial: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

## Summary

The implementation follows industry best practices by:
- ✅ Using the same checkout flow for trials and regular purchases
- ✅ Clearly communicating trial terms to users
- ✅ Requiring payment method upfront (prevents abuse)
- ✅ Not charging during trial period
- ✅ Automatically converting to paid subscription after trial

This approach maximizes conversion while providing a professional, trustworthy user experience.
