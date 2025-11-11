# Professional Plan: Deals, B2B Exchange & Marketplace Management (Task 9)

This document outlines a professional, step-by-step approach to implement the "Deals, B2B Exchange & Marketplace Management" feature, as described in Task 9 of the Admin Full Feature Checklist.

## Phase 1: Initial Setup and Navigation

This phase establishes the foundational elements for the new feature.

1.  **Create New Page**:
    *   Create the file `src/app/admin/deals-management/page.tsx`. This will serve as the main entry point for the Deals Management panel.

2.  **Update Sidebar Navigation**:
    *   Add a new navigation link in `src/components/admin/sidebar/index.tsx` for "Deals Management" pointing to `/admin/deals-management`.
    *   Use an appropriate icon from `lucide-react` (e.g., `Tag`, `DollarSign`, or `Handshake`).

3.  **Define Data Models**:
    *   Review the existing `src/lib/mock-data/deals.ts`. If it's not suitable or doesn't exist, create/update it.
    *   Define a TypeScript interface for `Deal`:
        ```typescript
        export interface Deal {
          id: string;
          title: string;
          description: string;
          status: 'draft' | 'pending_approval' | 'active' | 'rejected';
          price: number;
          sectorId: string; // Link to Sector
          groupIds?: string[]; // Optional: Link to specific groups/categories
          visibilityRules?: string; // e.g., "Only for Gold members"
          isFeatured: boolean;
          submittedByBusinessId?: string; // Optional: If submitted by a business
          createdAt: Date;
          updatedAt: Date;
        }
        ```

4.  **Mock Data**:
    *   Within `src/lib/mock-data/deals.ts`, create a mock data array `mockDeals` populated with example data based on the defined interface. Include deals with different statuses (e.g., `pending_approval`, `active`).

## Phase 2: Implementing the Deals Management UI

This phase focuses on building the user interface for managing deals.

1.  **Page Layout (`src/app/admin/deals-management/page.tsx`)**:
    *   Use `shadcn/ui` components for a clean and responsive design.
    *   Include a page title and description.
    *   Implement a section for filters and search.
    *   Display the list/table of deals.
    *   Add a "Create New Deal" button.

2.  **Filters and Search**:
    *   **Search Bar**: An `Input` component for searching by `deal title` or `description`.
    *   **Status Filter**: A `Select` component to filter deals by `status` (All, Draft, Pending Approval, Active, Rejected).
    *   **Sector Filter**: A `Select` component to filter deals by `sector` (requires fetching mock sector data).
    *   **Submitted By Filter (Optional)**: An `Input` or `Select` to filter by `submittedByBusinessId`.

3.  **Deals List/Table**:
    *   Use `Table` component from `shadcn/ui` to display deals.
    *   Columns should include: `Title`, `Status` (with a `Badge` for visual distinction), `Price`, `Sector`, `Submitted By` (if applicable), `Featured` (with a `Switch` or `Badge`), `Actions`.
    *   **Actions Column**: Buttons/Dropdown for:
        *   `View Details` (opens a read-only modal).
        *   `Edit` (opens the "Add/Edit Deal" modal with pre-filled data).
        *   `Approve` / `Reject` (conditional, if `status` is `pending_approval`).
        *   `Toggle Featured` (a `Switch` or button to change `isFeatured`).
        *   `Delete` (triggers a confirmation dialog).

4.  **Add/Edit Deal Modal/Form**:
    *   Create a new component, e.g., `src/components/admin/deals-management/AddEditDealModal.tsx`.
    *   This `Dialog` or `Sheet` component will handle both adding new deals and editing existing ones.
    *   Fields:
        *   `Title` (`Input`)
        *   `Description` (`Textarea`)
        *   `Price` (`Input` type number)
        *   `Status` (`Select` - Admin can set initial status, or it defaults to 'draft'/'pending_approval')
        *   `Sector` (`Select` - populated from mock sectors)
        *   `Groups` (`Multi-select` or `Input` for comma-separated IDs)
        *   `Visibility Rules` (`Textarea`)
        *   `Is Featured` (`Switch`)
        *   `Submitted By Business ID` (`Input` - read-only if editing, optional if creating)
    *   "Save" and "Cancel" buttons.

5.  **Deal Details View (Optional)**:
    *   If a separate "View Details" is desired, it can be a simple `Dialog` displaying all properties of a selected deal in a read-only format. Alternatively, the "Edit" modal can be used in a read-only mode.

## Phase 3: Functionality and State Management

This phase integrates the UI with interactive logic and data handling.

1.  **Form State Management**:
    *   Use `useState` hooks to manage the form inputs within the "Add/Edit Deal" modal.
    *   Manage the state of the `mockDeals` array within `deals-management/page.tsx`.
    *   Manage filter and search input states.

2.  **CRUD Operations (Mock)**:
    *   Implement functions (`addDeal`, `editDeal`, `deleteDeal`) that update the `mockDeals` array in memory.
    *   Implement `approveDeal`, `rejectDeal`, `toggleFeaturedDeal` functions, updating the `status` and `isFeatured` properties of deals in the mock data.
    *   Utilize the `FeedbackDialog` for success, error, and confirmation messages after each operation.

3.  **Filtering and Searching Logic**:
    *   Implement `useMemo` to efficiently filter and search the `mockDeals` array based on the current filter and search states.

4.  **Data Persistence (Mock)**:
    *   All changes made in the UI will update the in-memory mock data. In a real application, these would be API calls to a backend.

## Phase 4: Refinements and Polish

1.  **Input Validation**:
    *   Add client-side validation for all input fields in the "Add/Edit Deal" form (e.g., title not empty, price is a positive number, valid sector selected).
2.  **User Feedback**:
    *   Consistently use the `FeedbackDialog` for all user interactions, including successful saves, validation errors, and confirmations (e.g., for delete, approve/reject).
3.  **Accessibility**:
    *   Ensure all form elements are properly labeled, and the page is keyboard navigable and screen-reader friendly.
4.  **B2B Exchange Monitoring (Placeholder)**:
    *   Add a dedicated section or a button on the page with a message indicating that "B2B Exchange Activities Monitoring" is a future enhancement. This is a complex feature that typically involves backend data aggregation and specialized UI, and is out of scope for the initial UI implementation.

By following this structured plan, we will implement a robust and user-friendly "Deals, B2B Exchange & Marketplace Management" panel that meets the requirements of Task 9.
