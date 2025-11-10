# Professional Plan: Escrow, Payments & Subscriptions (Task 14)

This document outlines a professional, step-by-step approach to implement the "Escrow, Payments & Subscriptions" feature, as described in Task 14 of the Admin Full Feature Checklist.

## Phase 1: Initial Setup and Navigation

This phase establishes the foundational elements for the new feature.

1.  **Create New Page**:
    *   Create the file `src/app/admin/financials/page.tsx`. This will serve as the main entry point for the Financials panel.

2.  **Update Sidebar Navigation**:
    *   Add a new navigation link in `src/components/admin/sidebar/index.tsx` for "Financials" pointing to `/admin/financials`.
    *   Use an appropriate icon from `lucide-react` (e.g., `Landmark`, `CreditCard`, or `DollarSign`).

3.  **Define Data Models**:
    *   Create a new mock data file: `src/lib/mock-data/financials.ts`.
    *   Define TypeScript interfaces within this file:
        ```typescript
        export interface Transaction {
          id: string;
          businessId: string;
          businessName: string;
          type: 'subscription' | 'payout' | 'refund' | 'campaign_escrow';
          amount: number;
          status: 'completed' | 'pending' | 'failed';
          date: Date;
        }

        export interface Escrow {
          id: string;
          campaignId: string;
          campaignName: string;
          businessId: string;
          businessName: string;
          amount: number;
          status: 'held' | 'released' | 'refunded';
          createdAt: Date;
        }

        export interface SubscriptionPlan {
          id: string;
          name: string;
          price: number; // Monthly price
          features: string[];
          isRecommended: boolean;
        }

        export interface PayoutRequest {
          id: string;
          businessId: string;
          businessName: string;
          amount: number;
          status: 'pending' | 'approved' | 'rejected';
          requestedAt: Date;
        }
        ```

4.  **Mock Data**:
    *   Within `src/lib/mock-data/financials.ts`, create mock data arrays `mockTransactions`, `mockEscrows`, `mockSubscriptionPlans`, and `mockPayoutRequests` populated with example data.

## Phase 2: Implementing the Financials UI

This phase focuses on building the user interface for managing financials.

1.  **Page Layout (`src/app/admin/financials/page.tsx`)**:
    *   Use `shadcn/ui` components for a clean and responsive design.
    *   Include a page title and description.
    *   Implement a `Tabs` component to separate different aspects of control: "Payment History", "Escrow Management", "Subscription Plans", and "Payout Requests".
    *   Include a "Financial Analytics" section with summary cards.

2.  **Financial Analytics Section**:
    *   Display summary cards for `Total Revenue`, `Pending Payouts`, and `Total in Escrow`.
    *   Include a placeholder for a chart (e.g., revenue over time).

3.  **Payment History Tab**:
    *   Display `mockTransactions` in a `Table`.
    *   Include filters for `type`, `status`, and a date range picker.

4.  **Escrow Management Tab**:
    *   Display `mockEscrows` in a `Table`.
    *   Include filters for `status`.
    *   Provide actions to `Release` or `Refund` escrow funds (simulated).

5.  **Subscription Plans Tab**:
    *   Display `mockSubscriptionPlans` in a grid of `Card` components.
    *   Provide actions to `Add`, `Edit`, and `Delete` subscription plans via a modal.
    *   Create `src/components/admin/financials/AddEditPlanModal.tsx` for this purpose.

6.  **Payout Requests Tab**:
    *   Display `mockPayoutRequests` in a `Table`.
    *   Include filters for `status`.
    *   Provide actions to `Approve` or `Reject` payout requests.

## Phase 3: Functionality and State Management

This phase integrates the UI with interactive logic and data handling.

1.  **Form State Management**:
    *   Use `useState` hooks to manage the form inputs within the "Add/Edit Plan" modal.
    *   Manage the state of all mock data arrays within `financials/page.tsx`.
    *   Manage filter and search input states.

2.  **CRUD Operations (Mock)**:
    *   Implement functions to add, edit, and delete subscription plans.
    *   Implement functions to approve/reject payouts and release/refund escrows, which will update the status in the mock data.
    *   Utilize the `FeedbackDialog` for all user interactions.

3.  **Filtering and Searching Logic**:
    *   Implement `useMemo` to efficiently filter the data in each tab's table.

4.  **Data Persistence (Mock)**:
    *   All changes made in the UI will update the in-memory mock data.

## Phase 4: Refinements and Polish

1.  **Input Validation**:
    *   Add client-side validation for the "Add/Edit Plan" form.
2.  **User Feedback**:
    *   Consistently use the `FeedbackDialog` for all user interactions.
3.  **Accessibility**:
    *   Ensure all form elements are properly labeled and accessible.
4.  **Commission Structures (Placeholder)**:
    *   Add a placeholder section or button for "Adjust commission structures for agents and affiliates," marked as a future enhancement.

By following this structured plan, we will implement a robust and user-friendly "Escrow, Payments & Subscriptions" panel that meets the requirements of Task 14.
