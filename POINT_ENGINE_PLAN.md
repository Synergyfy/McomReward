# Point Engine Feature: Frontend Prototype Plan

## Introduction

This document outlines the frontend implementation plan for the "Point Engine" feature. The primary goal is to create a prototype that demonstrates how point transactions are tracked and made visible to both customers and business administrators, as described in the project tasks.

This plan leverages the existing application structure and will use mock data to simulate the backend logic of earning and spending points.

---

## Phase 1: Enhancing the Customer Wallet

This phase focuses on improving the existing customer wallet to provide a comprehensive view of their point history, reflecting the various activities tracked by the Point Engine.

### 1. Refine Transaction Types

- **Objective**: Showcase the different ways a customer can earn or spend points.
- **Action**: I will update the mock data in `src/app/(customer)/wallet/page.tsx` to include a more diverse set of transaction types beyond simple campaign joins and redemptions.
- **New Mock Transaction Types**:
    - `purchase`: Points earned from a transaction.
    - `referral_bonus`: Points earned for successfully inviting a new user.
    - `manual_adjustment`: Points added or removed by a business admin for customer service reasons.
    - `deal_redemption`: Points spent on a special deal from the deals platform.

### 2. Improve Transaction Display

- **Objective**: Make the transaction history clearer and more informative.
- **Action**: I will modify the wallet page to visually distinguish between different transaction types.
- **Enhancements**:
    - Assign a unique icon to each new transaction type (e.g., a shopping cart for `purchase`, a user group icon for `referral_bonus`).
    - Improve the description for each transaction to provide more context (e.g., "Points earned from purchase at Burger Queen", "Referral bonus for inviting Jane Doe").

---

## Phase 2: Creating Business/Admin Visibility

This phase focuses on providing administrators with the tools to monitor and understand the flow of points across the platform.

### 1. Create a Central Points Log Page

- **Objective**: Build a centralized location for admins to view all point transactions.
- **Action**: I will create a new page at `src/app/admin/points-log/page.tsx`.
- **Features**:
    - The page will feature a filterable and searchable table displaying all point transactions.
    - Table columns will include: `Timestamp`, `Customer`, `Transaction Type`, `Points`, `Campaign/Reward`, and a `Notes/Description` field.
    - Filters will allow admins to sort by customer, transaction type, or date range.

### 2. Add Point Engine Summary to Dashboard

- **Objective**: Provide a high-level overview of point activity on the main admin dashboard.
- **Action**: I will add a new summary card to `src/app/admin/dashboard/page.tsx`.
- **Dashboard Card Details**:
    - **Title**: "Point Velocity" or "Recent Point Activity".
    - **Content**: The card will display key metrics such as "Total Points Awarded (24h)" and "Total Points Redeemed (24h)".
    - It will also feature a list of the 5 most recent transactions, with a link to the full Points Log page.

### 3. Update Navigation

- **Objective**: Ensure the new pages are easily accessible.
- **Action**: I will add a new link to the "Points Log" page in the admin sidebar menu (`src/components/admin/sidebar/index.tsx`).

---

This plan will deliver a functional frontend prototype of the Point Engine, clearly demonstrating its value to both customers and businesses.
