
# Deals Platform Integration — Frontend Build Guide

### 1. One-line purpose
To enable businesses to easily create, publish, and manage deals (e.g., discounts, special offers), and for customers to discover and claim these deals through the platform.

### 2. High-level flow (what happens)

*   **Business Flow**:
    1.  **Navigate**: A business owner goes to the "Deals" section in their dashboard.
    2.  **Create**: They click "Create New Deal" and fill out a form with details like title, description, type (discount, package), value, dates, and targeting (local/national).
    3.  **Publish**: They publish the deal, making it visible to customers.
    4.  **Manage**: They can view a list of their active, scheduled, and expired deals, and edit or deactivate them.

*   **Customer Flow**:
    1.  **Discover**: A customer navigates to the public "Deals" page on the website.
    2.  **Browse**: They browse or filter deals by category, location, or type.
    3.  **View Details**: They click on a deal to see more information, including terms and conditions.
    4.  **Claim/Use**: They click a button to claim the deal, which might reveal a promo code or add the offer to their wallet.

### 3. Requirements & Principles
*   **Simplicity**: The deal creation process for businesses must be intuitive and fast.
*   **Clarity**: Deals presented to customers must be easy to understand, with clear terms.
*   **Frontend First**: The entire flow will be built and demonstrated using mock data.
*   **Integration**: Deals should be linkable to the loyalty system, allowing them to be used as rewards.
*   **Scalability**: The design should accommodate both local (geo-targeted) and national deals, even if the initial implementation is simplified.

### 4. Frontend Implementation Plan (File by File)

*   **New Business-Facing Pages & Components:**
    *   Page: `src/app/dashboard/deals/page.tsx` (To list and manage existing deals).
    *   Page: `src/app/dashboard/deals/create/page.tsx` (The form for creating a new deal).
    *   Component: `src/components/dashboard/deals/DealsTable.tsx` (A table to display deals with actions like Edit/Deactivate).
    *   Component: `src/components/dashboard/deals/DealForm.tsx` (The reusable form for creating/editing deals).

*   **New Customer-Facing Pages & Components:**
    *   Page: `src/app/deals/page.tsx` (The main page for customers to browse all deals).
    *   Page: `src/app/deals/[dealId]/page.tsx` (The detail page for a single deal).
    *   Component: `src/components/deals/DealCard.tsx` (A card to display a single deal in the browser grid).
    *   Component: `src/components/deals/FilterSidebar.tsx` (For filtering deals by category, location, etc.).

*   **New Mock Data:**
    *   `src/lib/mock-data/deals.ts`: Will export mock data for various deals.

*   **File Modifications:**
    *   `src/components/dashboard/sidebar/index.tsx`: Add a "Deals" link to the business dashboard navigation.
    *   `src/components/Navbar/index.tsx`: Add a "Deals" link to the main public-facing website navigation.

### 5. Mock Data Structure (`src/lib/mock-data/deals.ts`)

```typescript
export type DealType = 'Discount' | 'Package' | 'Gig Reward' | 'Special Offer';
export type DealAudience = 'Local' | 'National';

export interface Deal {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  type: DealType;
  value: string; // e.g., "20%", "$10 Off", "Free Item"
  startDate: string;
  endDate: string;
  audience: DealAudience;
  terms: string;
  status: 'Active' | 'Scheduled' | 'Expired';
}

export const dealsData: Deal[] = [
  // ... mock deal objects
];
```

### 6. Step-by-step Implementation Guide

1.  **Create Plan**: Create and save this plan as `DEALS_PLATFORM_PLAN.md`.
2.  **Create Mock Data**: Create `src/lib/mock-data/deals.ts` with the defined structure and sample data.
3.  **Update Navigation**:
    *   Modify `src/components/dashboard/sidebar/index.tsx` to add a "Deals" link for businesses.
    *   Modify `src/components/Navbar/index.tsx` to add a "Deals" link for customers.
4.  **Build Business Flow**:
    *   Create the directory `src/app/dashboard/deals` and `src/components/dashboard/deals`.
    *   Implement the `DealForm` component.
    *   Implement the `create/page.tsx` using the `DealForm`.
    *   Implement the `DealsTable` component.
    *   Implement the main `/dashboard/deals` page to display the `DealsTable`.
5.  **Build Customer Flow**:
    *   Create the directory `src/app/deals` and `src/components/deals`.
    *   Implement the `DealCard` component.
    *   Implement the main `/deals` page to display a grid of `DealCard` components.
    *   Implement the `[dealId]/page.tsx` to show deal details.
6.  **Verify**: Test all new pages and components to ensure they render correctly with mock data and are responsive.
