# Professional Plan: Plaque Management Admin Screens

This document outlines a professional, step-by-step approach to implement the "Admin Screens" section of the `task.md`, focusing on Plaque Management.

## Overall Goal
Implement the Admin Screens for Plaque Management, covering creation, listing, viewing details, transferring, retiring, printing, and analytics.

## Phase 1: Core Data Models and Mock Data

This phase establishes the foundational data structures for plaques, groups, and owners.

1.  **Define Plaque Interface**:
    *   Create a new mock data file: `src/lib/mock-data/plaques.ts`.
    *   Define a TypeScript interface for `Plaque`:
        ```typescript
        export interface Plaque {
          id: string;
          name: string; // e.g., "Front Desk Plaque", "Entrance QR"
          description: string;
          groupId: string; // Link to PlaqueGroup
          ownerId: string; // Link to BusinessUser or PlaqueOwner
          ownerName: string; // Denormalized for display
          qrCodeData: string; // Base64 or URL of the QR code image
          status: 'Active' | 'Sold' | 'Retired' | 'Lost' | 'Inactive';
          scanCounts: number;
          lastScanTime: Date | null;
          transferHistory: {
            fromOwnerId: string;
            fromOwnerName: string;
            toOwnerId: string;
            toOwnerName: string;
            transferDate: Date;
          }[];
          locationDetails: string; // e.g., "Front Desk", "Window Display"
          createdAt: Date;
          updatedAt: Date;
        }
        ```

2.  **Define PlaqueGroup Interface**:
    *   Create a new mock data file: `src/lib/mock-data/plaque-groups.ts`.
    *   Define a TypeScript interface for `PlaqueGroup`:
        ```typescript
        export interface PlaqueGroup {
          id: string;
          name: string; // e.g., "Standard Retail", "Premium Dining"
          description: string;
        }
        ```

3.  **Define PlaqueOwner Interface (or reuse BusinessUser)**:
    *   For simplicity, we will reuse `BusinessUser` from `src/lib/mock-data/users.ts` as plaque owners. If a dedicated `PlaqueOwner` interface is needed later, it can be created.

4.  **Generate Mock Data**:
    *   Populate `src/lib/mock-data/plaques.ts` with `mockPlaques`.
    *   Populate `src/lib/mock-data/plaque-groups.ts` with `mockPlaqueGroups`.
    *   Ensure mock data covers various statuses and scenarios.

## Phase 2: Navigation and Routing

This phase sets up the navigation structure for the new admin screens.

1.  **Update Sidebar**:
    *   Modify `src/components/admin/sidebar/index.tsx`.
    *   Add a new top-level navigation item "Plaque Management" (e.g., with a `QrCode` or `Scan` icon).
    *   This will be a dropdown with the following sub-links:
        *   "Create Plaque" (`/admin/plaques/create`)
        *   "Plaque List" (`/admin/plaques`) - This will be the default view for `/admin/plaques`
        *   "Plaque Analytics" (`/admin/plaques/analytics`)

2.  **Create Base Page**:
    *   Create `src/app/admin/plaques/page.tsx`. This page will serve as a layout for sub-routes or simply redirect to `/admin/plaques/list`. For this plan, it will redirect to `/admin/plaques/list`.

3.  **Create Sub-Pages**:
    *   `src/app/admin/plaques/create/page.tsx`
    *   `src/app/admin/plaques/list/page.tsx`
    *   `src/app/admin/plaques/[plaqueId]/page.tsx` (for View Plaque Details)
    *   `src/app/admin/plaques/analytics/page.tsx`

## Phase 3: Create Plaque Screen (`src/app/admin/plaques/create/page.tsx`)

This phase implements the form for creating new plaques.

1.  **UI Components**:
    *   Use `shadcn/ui` components for a form.
    *   `Input` fields for `name`, `description`, `locationDetails`.
    *   `Select` component for choosing a `PlaqueGroup` (populated from `mockPlaqueGroups`).
    *   `Select` component for choosing an `Owner` (populated from `mockBusinessUsers`).
    *   A button to "Generate QR Code".
    *   An area to display the generated QR code (e.g., an `img` tag with base64 data or a URL).
    *   A "Save Plaque" button.

2.  **Functionality**:
    *   State management for all form fields.
    *   Mock QR code generation: For the prototype, this can be a simple placeholder image or a static base64 string.
    *   `onSave` function to add the new plaque to the `mockPlaques` array.
    *   Use `FeedbackDialog` for success/error messages.
    *   Client-side validation for required fields.

## Phase 4: Plaque List Screen (`src/app/admin/plaques/list/page.tsx`)

This phase implements the listing and filtering of plaques.

1.  **UI Components**:
    *   `Table` component from `shadcn/ui` to display all plaques.
    *   `Input` for search by plaque ID, owner name, or group name.
    *   `Select` filters for `Group`, `Owner`, and `Status` (Active, Sold, Retired, Lost, Inactive).
    *   Pagination controls (if the list grows large, for now, simple display is fine).
    *   Action buttons/dropdown for each plaque in the table:
        *   `View Details` (navigates to `/[plaqueId]`)
        *   `Edit` (opens `AddEditPlaqueModal`)
        *   `Transfer` (opens `TransferPlaqueModal`)
        *   `Retire` (opens `RetirePlaqueModal` or `ConfirmationDialog`)
        *   `Print` (navigates to `/[plaqueId]/print`)
        *   `Delete` (triggers `ConfirmationDialog`)

2.  **Functionality**:
    *   State management for search term and filter selections.
    *   Filtering and sorting logic for the `mockPlaques` array using `useMemo`.
    *   Integration with modals/pages for actions.
    *   `onDelete` function to remove a plaque from `mockPlaques`.
    *   Use `FeedbackDialog` for success/error messages.

## Phase 5: View Plaque Details Screen (`src/app/admin/plaques/[plaqueId]/page.tsx`)

This phase implements the detailed view for a single plaque.

1.  **UI Components**:
    *   Display all plaque information in a read-only format, using `Card` components for organization.
    *   Plaque details (ID, Name, Description, Group, Owner, Status, Location).
    *   Display the QR code image.
    *   Scan counts (total, last scan time).
    *   Transfer history (a list/table of `fromOwner`, `toOwner`, `transferDate`).
2.  **Functionality**:
    *   Fetch plaque details from `mockPlaques` based on the `plaqueId` from the URL parameters.
    *   Handle cases where the plaque is not found.

## Phase 6: Transfer Plaque Functionality (Modal)

This phase implements the transfer of plaque ownership.

1.  **UI Components**:
    *   Create `src/components/admin/plaques/TransferPlaqueModal.tsx`.
    *   `Input` (read-only) for current owner.
    *   `Select` for choosing a `New Owner` (populated from `mockBusinessUsers`).
    *   `Input` (read-only) for transfer date (defaults to current date).
    *   "Transfer" button.
2.  **Functionality**:
    *   `onTransfer` function to update `ownerId`, `ownerName`, and add an entry to `transferHistory` in `mockPlaques`.
    *   Use `FeedbackDialog` for success/error messages.
    *   Client-side validation for new owner selection.

## Phase 7: Retire Plaque Functionality (Modal/Confirmation)

This phase implements the ability to mark a plaque as retired, lost, or inactive.

1.  **UI Components**:
    *   Create `src/components/admin/plaques/RetirePlaqueModal.tsx` (or reuse `ConfirmationDialog` with custom content).
    *   Confirmation message.
    *   `Select` for choosing the new `status` (e.g., 'Retired', 'Lost', 'Inactive').
    *   "Confirm" button.
2.  **Functionality**:
    *   `onRetire` function to update the `status` of the plaque in `mockPlaques`.
    *   Use `FeedbackDialog` for success/error messages.

## Phase 8: Plaque Print View (`src/app/admin/plaques/[plaqueId]/print/page.tsx`)

This phase implements a print-friendly view of a plaque's QR code.

1.  **UI Components**:
    *   A dedicated page to display the QR code and essential plaque details in a print-friendly layout.
    *   Large QR code image.
    *   Plaque ID, Name, Owner, Group.
    *   "Print" button (triggers browser print dialog).
    *   "Download QR Code" button (downloads the QR image).
2.  **Functionality**:
    *   Fetch plaque details based on `plaqueId`.
    *   Client-side print functionality (e.g., `window.print()`).
    *   Client-side image download (e.g., converting base64 QR data to a downloadable PNG).

## Phase 9: Plaque Analytics Dashboard (`src/app/admin/plaques/analytics/page.tsx`)

This phase implements an analytics overview for plaques.

1.  **UI Components**:
    *   Summary cards: "Total Plaques Issued", "Average Scans Per Day", "Total Active Plaques".
    *   Chart: "Scans Over Time" (e.g., a line chart using `recharts` showing daily/weekly scan trends).
    *   Table: "Top Performing Plaques" (by scan count).
2.  **Functionality**:
    *   Aggregate data from `mockPlaques` to generate analytics metrics.
    *   Use `recharts` for data visualization.
    *   Provide mock data for scan trends.

## Phase 10: General Refinements

1.  **Input Validation**: Implement client-side validation for all forms (e.g., required fields, valid formats).
2.  **User Feedback**: Consistently use `FeedbackDialog` for all user interactions (success, error, confirmation).
3.  **Accessibility**: Ensure all pages and interactive elements are keyboard navigable and screen-reader friendly.
4.  **Responsive Design**: Ensure all pages work well on different screen sizes (mobile, tablet, desktop).

By following this structured plan, we will implement a comprehensive and user-friendly "Plaque Management Admin Screens" feature.
