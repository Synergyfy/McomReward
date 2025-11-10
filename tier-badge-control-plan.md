# Professional Plan: Tier & Badge Control (Task 8)

This document outlines a professional, step-by-step approach to implement the "Tier & Badge Control (Business + Consumer)" feature, as described in Task 8 of the Admin Full Feature Checklist.

## Phase 1: Initial Setup and Navigation

This phase focuses on establishing the foundational elements for the new feature.

1.  **Create New Page**:
    *   Create the file `src/app/admin/tier-badge-control/page.tsx`. This will serve as the main entry point for the Tier & Badge Control panel.

2.  **Update Sidebar Navigation**:
    *   Add a new navigation link in `src/components/admin/sidebar/index.tsx` for "Tier & Badge Control" (or a more concise name like "Tiers & Badges") pointing to `/admin/tier-badge-control`.
    *   Use an appropriate icon from `lucide-react` (e.g., `Award`, `Crown`, or `GraduationCap`).

3.  **Define Data Models**:
    *   Create a new mock data file: `src/lib/mock-data/tiers-badges.ts`.
    *   Define TypeScript interfaces within this file:
        *   `BusinessTier`:
            *   `id: string`
            *   `name: string` (e.g., "Starter", "Active", "Trusted", "Partner")
            *   `description: string`
            *   `criteria: string[]` (e.g., ["Requires 1000 points", "5 campaigns created"])
            *   `privileges: string[]` (e.g., ["Early Access to Features", "Dedicated Account Manager"])
            *   `icon: string` (e.g., Lucide icon name or URL)
            *   `color: string` (e.g., hex code for visual representation)
        *   `ConsumerBadge`:
            *   `id: string`
            *   `name: string` (e.g., "Bronze", "Silver", "Gold", "Platinum")
            *   `description: string`
            *   `criteria: string[]` (e.g., ["Earned 500 points", "Joined 3 campaigns"])
            *   `privileges: string[]` (e.g., ["Exclusive Discounts", "Birthday Bonus"])
            *   `icon: string` (e.g., Lucide icon name or URL)
            *   `color: string` (e.g., hex code for visual representation)

4.  **Mock Data**:
    *   Within `src/lib/mock-data/tiers-badges.ts`, create mock data arrays: `mockBusinessTiers` and `mockConsumerBadges`, populated with example data based on the defined interfaces.

## Phase 2: Implementing the Control Panel UI

This phase focuses on building the user interface for managing tiers and badges.

1.  **Page Layout (`src/app/admin/tier-badge-control/page.tsx`)**:
    *   Use `shadcn/ui` components for a clean and responsive design.
    *   Implement a `Tabs` component to separate the management of "Business Tiers" and "Consumer Badges".
    *   Each tab will have its own dedicated content area.

2.  **Business Tiers Management Tab**:
    *   **Display Tiers**: Present `mockBusinessTiers` in a visually appealing manner, such as a `Table` or a grid of `Card` components. Each entry should show name, criteria, privileges, and design elements.
    *   **Add/Edit Tier Modal/Form**:
        *   A `Dialog` or `Sheet` component for adding new tiers or editing existing ones.
        *   Input fields for `name`, `description`, `icon`, `color`.
        *   A dynamic input area (e.g., `Textarea` or multiple `Input` fields) for `criteria` and `privileges` (allowing multiple entries).
        *   "Save" and "Cancel" buttons.
    *   **Delete Tier Functionality**: A button (e.g., within each tier's display or an action column in a table) to trigger a `ConfirmationDialog` for deleting a tier.

3.  **Consumer Badges Management Tab**:
    *   **Display Badges**: Similar to business tiers, display `mockConsumerBadges` using a `Table` or `Card` grid.
    *   **Add/Edit Badge Modal/Form**:
        *   A `Dialog` or `Sheet` component for adding new badges or editing existing ones, with similar input fields and dynamic areas for `criteria` and `privileges` as the business tiers.
    *   **Delete Badge Functionality**: Similar to business tiers.

4.  **Manual Override Section (Optional, but good to include)**:
    *   A dedicated section or button on the page (or within each tab) to open a `Dialog` for manually promoting/demoting a user.
    *   This modal would require:
        *   An `Input` field for `User ID` or `Email`.
        *   A `Select` component to choose the new `BusinessTier` or `ConsumerBadge`.
        *   A "Apply Change" button.
    *   *Note*: This functionality could also be integrated into the existing User Management's "Edit User" modals, but for this plan, we'll treat it as a separate action on this page.

## Phase 3: Functionality and State Management

This phase integrates the UI with interactive logic and data handling.

1.  **Form State Management**:
    *   Use `useState` hooks to manage the form inputs within the "Add/Edit" modals for both tiers and badges.
    *   Manage the state of the `mockBusinessTiers` and `mockConsumerBadges` arrays within `tier-badge-control/page.tsx`.

2.  **CRUD Operations (Mock)**:
    *   Implement functions (`addTier`, `editTier`, `deleteTier`, `addBadge`, `editBadge`, `deleteBadge`) that update the respective mock data arrays in memory.
    *   Utilize the `FeedbackDialog` for success, error, and confirmation messages after each operation.

3.  **Manual Override Logic (Mock)**:
    *   Implement a function (`overrideUserTierBadge`) that takes a `userId` and a new `tierId`/`badgeId`.
    *   This function will update the `tier` or `badgeLevel` property of the corresponding user in `src/lib/mock-data/users.ts` (in memory).
    *   Provide feedback using `FeedbackDialog`.

4.  **Data Persistence (Mock)**:
    *   All changes made in the UI will update the in-memory mock data. In a real application, these would be API calls to a backend.

## Phase 4: Refinements and Polish

1.  **Input Validation**:
    *   Add client-side validation for all input fields in the "Add/Edit" forms (e.g., name cannot be empty, criteria/privileges are in a valid format).
2.  **User Feedback**:
    *   Consistently use the `FeedbackDialog` for all user interactions, including successful saves, validation errors, and confirmations.
3.  **Accessibility**:
    *   Ensure all form elements are properly labeled, and the page is keyboard navigable and screen-reader friendly.
4.  **Reporting (Placeholder)**:
    *   For the requirement "Generate reports of user movement across levels," add a placeholder button or a dedicated section with a message indicating that this is a future enhancement. This is a complex reporting feature that typically involves backend aggregation and is out of scope for the initial UI implementation.

By following this structured plan, we will implement a robust and user-friendly "Tier & Badge Control" panel that meets the requirements of Task 8.
