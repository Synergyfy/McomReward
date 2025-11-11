# Professional Plan: Financials Management (Escrow, Payments & Subscriptions) (Task 14)

This document outlines a professional, step-by-step approach to implement the "Financials Management" feature, as described in Task 14 of the Admin Full Feature Checklist, with a focus on a "glamourous," "professional," and "premium" UI.

## Phase 1: Initial Setup and Navigation

This phase establishes the foundational elements for the new feature.

1.  **Create New Page**:
    *   Create the file `src/app/admin/financials/page.tsx`. This will serve as the main entry point for the Financials Management panel.

2.  **Update Sidebar Navigation**:
    *   Add a new navigation link in `src/components/admin/sidebar/index.tsx` for "Financials" pointing to `/admin/financials`.
    *   Use an appropriate icon from `lucide-react` (e.g., `Landmark`, `Banknote`, or `TrendingUp`).

3.  **Define Data Models**:
    *   Create a new mock data file: `src/lib/mock-data/financials.ts`.
    *   Define TypeScript interfaces within this file:
        ```typescript
        export interface Transaction {
          id: string;
          businessId: string;
          businessName: string;
          type: 'subscription' | 'payout' | 'refund' | 'commission';
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
          releasedAt?: Date;
        }

        export interface SubscriptionPlan {
          id: string;
          name: string;
          price: number; // Monthly price
          features: string[];
          isPopular: boolean;
        }

        export interface PayoutRequest {
          id:string;
          businessId: string;
          businessName: string;
          amount: number;
          status: 'pending' | 'approved' | 'rejected';
          requestedAt: Date;
          processedAt?: Date;
        }
        ```

4.  **Mock Data**:
    *   Within `src/lib/mock-data/financials.ts`, create mock data arrays `mockTransactions`, `mockEscrows`, `mockSubscriptionPlans`, and `mockPayoutRequests` populated with example data.

## Phase 2: Implementing the Financials UI

This phase focuses on building a premium user interface for managing financials.

1.  **Page Layout (`src/app/admin/financials/page.tsx`)**:
    *   Use `shadcn/ui` components for a clean and responsive design.
    *   Include a page title and description.
    *   Implement a `Tabs` component to separate different aspects of control: "Payment History", "Escrow Management", "Subscription Plans", and "Payout Requests".
    *   Add a "Financial Analytics" section with charts.

2.  **Payment History Tab**:
    *   **List Transactions**: Display `mockTransactions` in a table with filters for `type` and `status`.
    *   **Actions**: `View Details` button for each transaction.

3.  **Escrow Management Tab**:
    *   **List Escrows**: Display `mockEscrows` in a table with filters for `status`.
    *   **Actions**: `Release Funds` and `Refund` buttons for escrows with 'held' status, triggering a `ConfirmationDialog`.

4.  **Subscription Plans Tab**:
    *   **Display Plans**: Present `mockSubscriptionPlans` in a visually appealing grid of `Card` components, highlighting the "popular" plan.
    *   **Add/Edit Plan Modal/Form**:
        *   Create a new component, e.g., `src/components/admin/financials/AddEditPlanModal.tsx`.
        *   Fields for `name`, `price`, `features` (dynamic list), and `isPopular` (`Switch`).
    *   **Delete Plan Functionality**: A button to trigger a `ConfirmationDialog` for deleting a plan.

5.  **Payout Requests Tab**:
    *   **List Requests**: Display `mockPayoutRequests` in a table with filters for `status`.
    *   **Actions**: `Approve` and `Reject` buttons for pending requests, triggering a `ConfirmationDialog`.

6.  **Financial Analytics Section**:
    *   A dedicated section on the page (or a separate tab) to display financial charts.
    *   **Revenue Over Time**: A `LineChart` showing revenue trends.
    *   **Payouts vs. Subscriptions**: A `BarChart` comparing total payouts and subscription revenue.

## Phase 3: Functionality and State Management

This phase integrates the UI with interactive logic and data handling.

1.  **Form State Management**:
    *   Use `useState` hooks to manage the form inputs within the "Add/Edit Plan" modal.
    *   Manage the state of all mock data arrays within `financials/page.tsx`.

2.  **CRUD Operations (Mock)**:
    *   Implement functions for adding, editing, and deleting subscription plans.
    *   Implement functions for updating the status of escrows and payout requests.
    *   Utilize the `FeedbackDialog` for success, error, and confirmation messages after each operation.

3.  **Data Persistence (Mock)**:
    *   All changes made in the UI will update the in-memory mock data. In a real application, these would be API calls to a backend.

## Phase 4: Refinements and Polish

1.  **Input Validation**:
    *   Add client-side validation for all input fields in the "Add/Edit Plan" form.
2.  **User Feedback**:
    *   Consistently use the `FeedbackDialog` for all user interactions.
3.  **Accessibility**:`
    *   Ensure all form elements are properly labeled and accessible.
4.  **Commission Structures (Placeholder)**:
    *   Add a dedicated section or a button on the page with a message indicating that "Commission Structures Management" is a future enhancement.

By following this structured plan, we will implement a robust, user-friendly, and visually appealing "Financials Management" panel that meets the requirements of Task 14.
