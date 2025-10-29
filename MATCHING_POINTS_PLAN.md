
# Frontend Implementation Plan: Matching Points

This document outlines the step-by-step plan to implement the "Matching Points" feature on the MCOM Rewards platform from a frontend-only perspective, using mock data.

**One-line purpose:** To create a clear, intuitive user interface for customers to see and understand two types of loyalty points: **Regular Points** (earned from business activities) and **Matching Points** (bonus points from MCOM).

---

### 1. Core Concepts & Frontend Data Model

- **Regular Points:** Earned directly from business-specific actions (purchases, campaign participation).
- **Matching Points:** Bonus points awarded by the MCOM platform.
- **Total Points:** The sum of Regular and Matching Points, used for redeeming rewards.

We will simulate this with the following mock data structure:

```typescript
// src/lib/mock-data/wallet.ts

export interface Transaction {
  id: string;
  type: 'regular' | 'matching';
  points: number; // positive for earning, negative for spending
  description: string;
  date: string;
}

export interface Wallet {
  regularPoints: number;
  matchingPoints: number;
  totalPoints: number;
  transactions: Transaction[];
}

export const mockWallet: Wallet = {
  regularPoints: 1250,
  matchingPoints: 400,
  totalPoints: 1650,
  transactions: [
    { id: '1', type: 'regular', points: 100, description: "Purchase at 'Coffee House'", date: "2025-10-28" },
    { id: '2', type: 'matching', points: 50, description: "MCOM Welcome Bonus", date: "2025-10-27" },
    { id: '3', type: 'regular', points: -200, description: "Redeemed '10% Off' Reward", date: "2025-10-26" },
    { id: '4
', type: 'regular', points: 50, description: "Joined 'Grand Opening' Campaign", date: "2025-10-25" },
  ],
};
```

---

### 2. Step-by-Step Implementation Guide

#### **Step 1: Create the Mock Data File**

1.  **Action:** Create a new file at `src/lib/mock-data/wallet.ts`.
2.  **Content:** Add the TypeScript interfaces and `mockWallet` object defined above into this file.

#### **Step 2: Update the Customer Wallet UI**

1.  **File to Modify:** `src/app/(customer)/wallet/page.tsx`
2.  **Actions:**
    *   Import `mockWallet` from `src/lib/mock-data/wallet.ts`.
    *   Create a new component, `PointsBalanceCard`, to display the points breakdown.
    *   This component should visually distinguish between `Regular Points` and `Matching Points` while prominently displaying the `Total Points`.
    *   Use `Card`, `Badge`, and `Tooltip` components from `src/components/ui/` for a clean and informative layout.

    **Example Structure:**

    ```jsx
    // Inside /wallet/page.tsx
    import { mockWallet } from '@/lib/mock-data/wallet';
    import { PointsBalanceCard } from '@/components/customer/PointsBalanceCard'; // To be created
    import { TransactionHistory } from '@/components/customer/TransactionHistory'; // To be created

    export default function WalletPage() {
      return (
        <div>
          <PointsBalanceCard wallet={mockWallet} />
          <TransactionHistory transactions={mockWallet.transactions} />
        </div>
      );
    }
    ```

#### **Step 3: Create a `PointsBalanceCard` Component**

1.  **File to Create:** `src/components/customer/PointsBalanceCard.tsx`
2.  **Actions:**
    *   This component will receive the `wallet` object as a prop.
    *   Display the `totalPoints` as the main metric.
    *   Below the total, show a breakdown of `regularPoints` and `matchingPoints`.
    *   Use a `Tooltip` to provide a brief explanation of what "Matching Points" are.

#### **Step 4: Create a `TransactionHistory` Component**

1.  **File to Create:** `src/components/customer/TransactionHistory.tsx`
2.  **Actions:**
    *   This component will receive the `transactions` array as a prop.
    *   Render a table (`Table` component from `src/components/ui/table.tsx`).
    *   The table should have columns: `Description`, `Points`, `Type`, and `Date`.
    *   Use a `Badge` component in the `Type` column to clearly label each transaction as "Regular" or "Matching".

#### **Step 5: Update Admin Dashboard Views**

1.  **File to Modify:** `src/app/admin/points-log/page.tsx`
2.  **Actions:**
    *   Modify the existing table to include a `Type` column.
    *   Use the mock data to populate the table, showing how an admin would differentiate between point types for different users.
    *   Add controls (e.g., `Select` or `RadioGroup`) to filter the transaction list by point type (All, Regular, Matching).

#### **Step 6: Simulate Point Redemption Flow**

1.  **File to Modify:** `src/components/customer/ClaimConfirmationDialog.tsx`
2.  **Actions:**
    *   When a user confirms a claim, the dialog should show the point cost.
    *   For the frontend flow, you don't need to implement the deduction logic. Simply show a success message.
    *   The updated `totalPoints` will be reflected in the `PointsBalanceCard` based on the mock data. The transaction history will show a new entry for the redemption.

---

### 3. Professional-Grade Standards

-   **Component-Driven:** Keep components small, reusable, and focused on a single responsibility (e.g., `PointsBalanceCard`, `TransactionHistory`).
-   **Consistent Styling:** Strictly adhere to the existing design system (Tailwind CSS and `shadcn/ui` components).
-   **Clarity and UX:** Ensure the distinction between the two point types is immediately obvious to a non-technical user. Use tooltips and clear labels.
-   **State Management:** For this frontend-only task, `useState` within the pages will be sufficient to manage the mock data. No complex state management library is needed.
-   **Accessibility:** Use semantic HTML and ensure all interactive elements are accessible.
