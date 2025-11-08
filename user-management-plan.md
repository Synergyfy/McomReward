# Professional Plan: Admin User Management (Task 6)

This document outlines the step-by-step plan to implement the User Management feature for the MCOM Rewards admin dashboard. The approach focuses on creating a robust, reusable, and maintainable codebase, following professional frontend development standards.

## Part 1: Foundational Setup (The Groundwork)

The first priority is to establish a solid foundation. This involves setting up the necessary routing, defining our data structures, and creating mock data to build against.

1.  **Routing & Page Structure**:
    *   The main page will be located at `src/app/admin/users/page.tsx`.
    *   This page will feature a tabbed interface to cleanly separate "Business Owners" and "Consumers". We will use `shadcn/ui`'s `Tabs` component for this.

2.  **Data Models (TypeScript)**:
    *   Create a new file `src/lib/mock-data/users.ts`.
    *   Inside this file, define the TypeScript interfaces `BusinessUser` and `ConsumerUser` based on the requirements in `task.md`. This ensures type safety throughout the feature.

3.  **Mock Data**:
    *   In the same `users.ts` file, create realistic mock data arrays for both `BusinessUser` and `ConsumerUser`. This allows us to build and test the entire UI without depending on a live backend.

## Part 2: The Core Component - A Reusable Data Table

Instead of building two separate tables, we will create a single, powerful, and reusable `UserDataTable` component. This is a cornerstone of professional frontend architecture.

1.  **Build the `UserDataTable` Component**:
    *   Create a new component at `src/components/admin/users/UserDataTable.tsx`.
    *   This component will be built using `shadcn/ui`'s `DataTable` component, which includes sorting, filtering, and pagination out of the box.
    *   It will be designed to accept `data` and `columns` as props, making it adaptable for both business and consumer users.

2.  **Define Table Columns**:
    *   Create a corresponding `columns.tsx` file (`src/components/admin/users/columns.tsx`).
    *   This file will define the column structure for both user types, including an "Actions" column that will house a `DropdownMenu` for user-specific operations (Edit, Suspend, etc.).

## Part 3: Implementing the User Lists

With the foundation in place, we can now assemble the two main user list views.

1.  **Business Owners Tab**:
    *   Create the UI and logic for the "Business Owners" tab.
    *   Implement the filter controls: dropdowns for **Tier**, **Sector**, and **Activity Status**, plus a text search input.
    *   Pass the business user mock data, columns, and filters to our `UserDataTable` component.

2.  **Consumers Tab**:
    *   Create the UI and logic for the "Consumers" tab.
    *   Implement its specific filters: dropdowns for **Badge Level**, **Location**, and **Activity**, plus text search.
    *   Configure and render the `UserDataTable` component with the consumer data and columns.

## Part 4: Building the Core Actions (Modals & Dialogs)

Now we'll bring the user management actions to life by creating a suite of reusable modal dialogs.

1.  **Confirmation Dialog**:
    *   Create a generic `ConfirmationDialog` component. This will be used for all destructive or critical actions like "Suspend," "Activate," and "Delete" to prevent accidental clicks.

2.  **Adjust Points Modal**:
    *   Create a dedicated `AdjustPointsModal` component. This modal will contain a form to add or subtract points from a user and include a field for noting the reason for the adjustment.

3.  **Wire Up Actions**:
    *   Integrate these modals into the "Actions" dropdown menu in the `UserDataTable` for both user types.

## Part 5: Finalizing with Edit and View Modals

The final step is to build the modals for viewing detailed information and editing user profiles.

1.  **Edit Modals**:
    *   Create `EditBusinessUserModal` and `EditConsumerUserModal`. These will contain forms to modify user profile data as specified in the task requirements.

2.  **Detailed View Modals**:
    *   Create modals for viewing user-specific data that doesn't fit in the table, such as "Campaigns & Rewards" for businesses or "Audit Logs."

By following these steps, we will deliver a comprehensive, well-architected, and professional User Management feature that is easy to use and maintain.
