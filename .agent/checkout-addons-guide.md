# Checkout Add-ons Implementation Guide

## Overview
This document explains how the point package add-ons feature is implemented in the checkout process. This feature allows users to bundle point packages with their subscription purchase.

## How It Works

### 1. **User Flow**
```
Checkout Page → Select Plan → Toggle Add-ons (Point Packages) → Total Updates → Payment
```

### 2. **Key Features**

#### ✅ **Seamless Integration**
- Point packages are fetched dynamically from the backend.
- Users can select multiple packages as add-ons.
- The total price updates instantly when an add-on is selected/deselected.

#### ✅ **Visual Indicators**
- **Add-ons Section**: A dedicated section with checkboxes for each available package.
- **Summary Update**: The order summary shows a breakdown of the base price, discount, add-ons total, and grand total.

### 3. **Technical Implementation**

#### **Frontend Changes**

**File: `src/app/(others)/checkout/page.tsx`**
```tsx
// State for selected add-ons
const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

// Fetch point packages
const { data: pointPackages } = useGetAvailablePointPackages();

// Calculate add-ons total
const addOnsTotal = useMemo(() => {
  // ... calculation logic
}, [pointPackages, selectedAddOns]);

// Pass add-ons to backend
const paymentPayload = {
  // ... other fields
  point_package_ids: selectedAddOns,
};
```

**File: `src/services/payment/types.ts`**
```tsx
export interface StripeInitiateRequest {
    // ... other fields
    point_package_ids?: string[]; // New field
}

export interface PayPalInitiateRequest {
    // ... other fields
    point_package_ids?: string[]; // New field
}
```

### 4. **Backend Requirements (To Be Implemented)**

When the backend receives `point_package_ids`, it should:

1.  **Validate Packages**: Ensure the selected packages exist and are active.
2.  **Calculate Total**: Verify the total amount matches the sum of the subscription price and add-on prices.
3.  **Process Payment**: Charge the total amount.
4.  **Provision Resources**:
    *   Create the subscription.
    *   Add the purchased points to the user's business account.
    *   Record the transaction for both the subscription and the point packages.

### 5. **Testing**

1.  Go to the checkout page.
2.  Verify that the "Add-ons" section appears (if packages are available).
3.  Select a point package.
4.  Verify that the "Add-ons" line appears in the summary and the total price increases.
5.  Deselect the package and verify the total decreases.
6.  Proceed with payment and ensure the `point_package_ids` are sent in the network request.

## Summary

This implementation provides a flexible way for users to purchase point packages during the subscription process, increasing the average order value and providing a better user experience.
