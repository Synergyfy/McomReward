# Plan for Implementing Business Point Packages Feature

This document outlines the steps to implement the feature allowing businesses to purchase point packages.

## 1. Create `plan.md`

- **Task**: Create this `plan.md` file.
- **Status**: Completed.

## 2. Update Types (`src/services/payment/types.ts`)

- **Task**: Define the necessary TypeScript interfaces based on the API documentation in `point_package.md`.
  - `PointPackage`
  - `BuyPackageDto`
  - `ConfirmPurchaseDto`
  - `BusinessPointPackage`
- **Status**: Pending.

## 3. Update Hooks (`src/services/payment/hook.ts`)

- **Task**: Implement React Query hooks for interacting with the point package endpoints.
  - `useGetAvailablePointPackages`: To fetch available packages for a business (`GET /point-packages/business/available`).
  - `useBuyPointPackage`: To initiate a purchase with Stripe or PayPal (`POST /point-packages/business/buy`).
  - `useConfirmPointPackagePurchase`: To confirm a successful payment (`POST /point-packages/business/confirm-purchase`).
- **Status**: Pending.

## 4. Create New UI Component (`src/components/pricing/PointPackages.tsx`)

- **Task**: Develop a new React component to display the point packages.
  - Fetch and display packages using the `useGetAvailablePointPackages` hook.
  - Include a "Buy Now" button for each package.
  - On "Buy Now" click, open a modal for payment selection (Stripe/PayPal).
  - The payment modal will integrate with the payment hooks and existing payment components (`stripe-payment-form.tsx`, `paypal-button.tsx`).
- **Status**: Pending.

## 5. Integrate Component into Pricing Page (`src/app/(others)/pricing/page.tsx`)

- **Task**: Import and render the new `PointPackages.tsx` component within the main pricing page, immediately after the existing `<PricingCards />` component.
- **Status**: Pending.