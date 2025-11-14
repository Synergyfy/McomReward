# Plan for Tier-Based Business Campaigns Flow

This document outlines the steps to implement a new, tier-based campaign creation flow for business owners, restricting access based on their subscription plan.

## 1. Create the Main Campaign Management Page

### 1.1. `src/app/dashboard/campaigns/page.tsx`
- **Purpose:** This will be a new page for business owners to view and manage their campaigns.
- **Features:**
    - A header with the title "My Campaigns".
    - A prominent "Create New Campaign" button.
    - A list or grid displaying the business's active, scheduled, and completed campaigns (using mock data for now).
    - Search and filter functionality.
    - A mock `currentUser` object to simulate different subscription tiers (`starter`, `co-branded`, `white-label`).

## 2. Create New Components & Mock Data

### 2.1. `src/lib/mock-data/template-campaigns.ts`
- **Purpose:** To provide a list of admin-created campaign templates that lower-tier users can select.
- **Structure:** An array of `Campaign` objects, defining properties like `title`, `description`, `type`, `image`, etc.

### 2.2. `src/components/dashboard/campaigns/ClaimCampaignModal.tsx`
- **Purpose:** This modal opens when any user clicks "Create New Campaign".
- **Features:**
    - Displays a grid of campaign templates from `template-campaigns.ts`.
    - Each template will have a "Select & Customize" button.
    - A "Create a Campaign from Scratch" button will be present.
    - Built with `shadcn/ui` components.

## 3. Implement the Tier-Based Logic

The core of this task is controlling the user flow from the `ClaimCampaignModal`.

### 3.1. On `src/app/dashboard/campaigns/page.tsx`:
- The "Create New Campaign" button will always open the `ClaimCampaignModal`.
- State will be managed for `isClaimModalOpen` and `isUpgradeModalOpen`.

### 3.2. In `ClaimCampaignModal.tsx`:
- **"Select & Customize" Button Click:**
    - This action is available to all tiers.
    - It will close the `ClaimCampaignModal`.
    - It will take the selected template data and add it to the list of campaigns on the main page. (In a future implementation, this would lead to an editing/customization step).
- **"Create a Campaign from Scratch" Button Click:**
    - The `onClick` handler will check `currentUser.plan`.
    - If `plan === 'white-label'`:
        - It will proceed to the full campaign builder (for now, we can simulate this by adding a new, blank campaign to the list).
    - If `plan === 'starter'` or `plan === 'co-branded'`:
        - It will close the `ClaimCampaignModal` and open the `UpgradePlanModal` (reusing the component from the rewards flow).

## 4. Implementation Steps

1.  **Create `campaigns-flow-plan.md`**.
2.  **Create the mock data file:** `src/lib/mock-data/template-campaigns.ts`.
3.  **Create the main page:** `src/app/dashboard/campaigns/page.tsx`. This will be the primary view.
4.  **Create the modal component:** `src/components/dashboard/campaigns/ClaimCampaignModal.tsx`.
5.  **Integrate and add logic:** Update `page.tsx` to manage the modals and user flow based on the mock `currentUser` plan.
6.  **Reuse existing components:** The `UpgradePlanModal` from the rewards section will be imported and reused.
7.  **Testing:** Manually test the flow for each user tier (`starter`, `co-branded`, `white-label`) to ensure the correct paths are taken.
