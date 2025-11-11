# Plan for New Business Rewards Flow

This document outlines the steps to implement the new rewards creation flow for business owners.

## 1. Create New Components

### 1.1. `ClaimRewardModal.tsx`
- **Location:** `src/components/dashboard/rewards/ClaimRewardModal.tsx`
- **Purpose:** This will be the main modal that opens when a user clicks "Add Reward".
- **Features:**
    - Fetches and displays a list of pre-made "template" rewards from a mock data source (`src/lib/mock-data/template-rewards.ts`).
    - Each reward template will have a "Preview" and a "Select" button.
    - Includes a prominent "Create a reward from scratch" button.
    - The modal will be built using `shadcn/ui` components (`Dialog`, `Card`, `Button`).

### 1.2. `EditClaimedRewardModal.tsx`
- **Location:** `src/components/dashboard/rewards/EditClaimedRewardModal.tsx`
- **Purpose:** This modal opens after a user selects a reward template from `ClaimRewardModal`.
- **Features:**
    - It will be pre-filled with the data from the selected template reward.
    - Certain fields will be editable based on the user's subscription tier (e.g., 'co-branded' can edit name and description, 'white-label' can edit everything).
    - It will reuse the form structure from the existing `CreateRewardWizardModal.tsx` but with fields disabled/enabled based on tier.
    - On save, it will add the new reward to the user's list of rewards on the main page.

### 1.3. `UpgradePlanModal.tsx`
- **Location:** `src/components/dashboard/rewards/UpgradePlanModal.tsx`
- **Purpose:** This modal appears when a user on a lower-tier plan clicks "Create a reward from scratch".
- **Features:**
    - Explains the benefits of upgrading to the "White-Label" plan.
    - Contains a button that links to the subscription/upgrade page.
    - Simple informational dialog.

## 2. Create Mock Data

### 2.1. `template-rewards.ts`
- **Location:** `src/lib/mock-data/template-rewards.ts`
- **Purpose:** To provide a list of admin-created rewards that business owners can claim.
- **Structure:** An array of `Reward` objects, similar to the `initialRewards` in `src/app/dashboard/rewards/page.tsx`. These will represent templates.

## 3. Update Existing Files

### 3.1. `src/app/dashboard/rewards/page.tsx`
- **Change:** Modify the `handleOpenModal` function and the state management for modals.
- **Current:** It opens `CreateRewardWizardModal`.
- **New Logic:**
    1.  Create a new state, e.g., `isClaimModalOpen`, and set it to `true` in the "Add Reward" button's `onClick` handler.
    2.  Render `<ClaimRewardModal />` and pass the necessary props (`isOpen`, `onClose`, etc.).
    3.  The page will need to manage the state for the other new modals as well (`isEditClaimedRewardModalOpen`, `isUpgradeModalOpen`). It will orchestrate the flow between these modals.

### 3.2. `src/components/dashboard/rewards/ClaimRewardModal.tsx`
- **Logic:**
    - When "Create a reward from scratch" is clicked:
        - Check the `currentUser.plan`.
        - If `plan === 'white-label'`, close this modal and open the existing `CreateRewardWizardModal`.
        - Otherwise, close this modal and open the `UpgradePlanModal`.
    - When a user selects a reward template:
        - Close this modal and open the `EditClaimedRewardModal`, passing the selected template data.

## 4. Implementation Steps

1.  **Create `rewards-flow-plan.md`** with the plan outlined above.
2.  **Create mock data file:** `src/lib/mock-data/template-rewards.ts`.
3.  **Create `UpgradePlanModal.tsx`:** A simple dialog component.
4.  **Create `ClaimRewardModal.tsx`:** The main new modal for selecting templates.
5.  **Create `EditClaimedRewardModal.tsx`:** The modal for customizing a selected template.
6.  **Update `src/app/dashboard/rewards/page.tsx`:**
    - Add state to manage the new modals.
    - Change the "Add Reward" button's `onClick` to open `ClaimRewardModal`.
    - Add the logic to handle the closing and opening of the different modals in the flow.
7.  **Testing:** Manually test the entire flow for different user tiers.
