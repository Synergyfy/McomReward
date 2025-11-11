# Professional Plan: Co-Branded & White-Label Partner Management (Task 10)

This document outlines a professional, step-by-step approach to implement the "Co-Branded & White-Label Partner Management" feature, as described in Task 10 of the Admin Full Feature Checklist.

## Phase 1: Initial Setup and Navigation

This phase establishes the foundational elements for the new feature.

1.  **Create New Page**:
    *   Create the file `src/app/admin/partner-management/page.tsx`. This will serve as the main entry point for the Partner Management panel.

2.  **Update Sidebar Navigation**:
    *   Add a new navigation link in `src/components/admin/sidebar/index.tsx` for "Partner Management" pointing to `/admin/partner-management`.
    *   Use an appropriate icon from `lucide-react` (e.g., `Handshake`, `Share2`, or `Users`).

3.  **Define Data Models**:
    *   Create a new mock data file: `src/lib/mock-data/partners.ts`.
    *   Define a TypeScript interface for `Partner`:
        ```typescript
        export interface Partner {
          id: string;
          name: string;
          type: 'Co-Brand' | 'White-Label';
          status: 'active' | 'inactive';
          brandingPermissions: {
            logo: boolean;
            colors: boolean;
            textLock: boolean; // Ability to lock certain text elements
          };
          subdomain: string; // e.g., "partnername.mcomrewards.com"
          domainRouting?: string; // Optional: custom domain
          revenueSharing: string; // e.g., "10% commission", "Fixed Fee"
          performanceMetrics?: { // Placeholder for future integration
            totalUsers: number;
            totalRewardsClaimed: number;
            revenueGenerated: number;
          };
          createdAt: Date;
          updatedAt: Date;
        }
        ```

4.  **Mock Data**:
    *   Within `src/lib/mock-data/partners.ts`, create a mock data array `mockPartners` populated with example data based on the defined interface, including both Co-Brand and White-Label examples.

## Phase 2: Implementing the Partner Management UI

This phase focuses on building the user interface for managing partners.

1.  **Page Layout (`src/app/admin/partner-management/page.tsx`)**:
    *   Use `shadcn/ui` components for a clean and responsive design.
    *   Include a page title and description.
    *   Implement a section for filters and search.
    *   Display the list/table of partners.
    *   Add a "Create New Partner" button.

2.  **Filters and Search**:
    *   **Search Bar**: An `Input` component for searching by `partner name` or `subdomain`.
    *   **Partner Type Filter**: A `Select` component to filter partners by `type` (All, Co-Brand, White-Label).
    *   **Status Filter**: A `Select` component to filter partners by `status` (All, Active, Inactive).

3.  **Partners List/Table**:
    *   Use `Table` component from `shadcn/ui` to display partners.
    *   Columns should include: `Name`, `Type`, `Status` (with a `Badge`), `Subdomain`, `Revenue Share`, `Actions`.
    *   **Actions Column**: Buttons/Dropdown for:
        *   `View Details` (opens a read-only modal).
        *   `Edit` (opens the "Add/Edit Partner" modal with pre-filled data).
        *   `Toggle Status` (e.g., activate/deactivate).
        *   `Delete` (triggers a confirmation dialog).

4.  **Add/Edit Partner Modal/Form**:
    *   Create a new component, e.g., `src/components/admin/partner-management/AddEditPartnerModal.tsx`.
    *   This `Dialog` or `Sheet` component will handle both adding new partners and editing existing ones.
    *   Fields:
        *   `Name` (`Input`)
        *   `Type` (`Select` - Co-Brand, White-Label)
        *   `Status` (`Select` - Active, Inactive)
        *   `Branding Permissions`:
            *   `Logo` (`Switch`)
            *   `Colors` (`Switch`)
            *   `Text Lock` (`Switch`)
        *   `Subdomain` (`Input`)
        *   `Domain Routing` (`Input` - optional)
        *   `Revenue Sharing` (`Input` type text/number)
    *   "Save" and "Cancel" buttons.

5.  **Partner Details View**:
    *   Create a new component, e.g., `src/components/admin/partner-management/ViewPartnerDetailsModal.tsx`.
    *   A read-only view of all partner properties, including branding permissions and placeholder for performance metrics.

## Phase 3: Functionality and State Management

This phase integrates the UI with interactive logic and data handling.

1.  **Form State Management**:
    *   Use `useState` hooks to manage the form inputs within the "Add/Edit Partner" modal.
    *   Manage the state of the `mockPartners` array within `partner-management/page.tsx`.
    *   Manage filter and search input states.

2.  **CRUD Operations (Mock)**:
    *   Implement functions (`addPartner`, `editPartner`, `deletePartner`) that update the `mockPartners` array in memory.
    *   Implement `togglePartnerStatus` functions.
    *   Utilize the `FeedbackDialog` for success, error, and confirmation messages after each operation.

3.  **Filtering and Searching Logic**:
    *   Implement `useMemo` to efficiently filter and search the `mockPartners` array based on the current filter and search states.

4.  **Data Persistence (Mock)**:
    *   All changes made in the UI will update the in-memory mock data. In a real application, these would be API calls to a backend.

## Phase 4: Refinements and Polish

1.  **Input Validation**:
    *   Add client-side validation for all input fields in the "Add/Edit Partner" form (e.g., name not empty, valid subdomain format, revenue sharing format).
2.  **User Feedback**:
    *   Consistently use the `FeedbackDialog` for all user interactions.
3.  **Accessibility**:
    *   Ensure all form elements are properly labeled and accessible.
4.  **Performance Metrics Tracking (Placeholder)**:
    *   Add a dedicated section or a button on the `ViewPartnerDetailsModal` with a message indicating that "Performance Metrics Tracking" is a future enhancement. This is a complex feature that typically involves backend data aggregation and specialized UI, and is out of scope for the initial UI implementation.

By following this structured plan, we will implement a robust and user-friendly "Co-Branded & White-Label Partner Management" panel that meets the requirements of Task 10.
