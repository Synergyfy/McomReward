# Plan: Implement Admin Impersonation of Business Dashboard

This document outlines the plan to implement a feature allowing administrators to view a dynamic, read-only version of a business owner's dashboard. This will enable admins to diagnose issues and provide support by seeing what the business user sees.

## Phase 1: Create the Dynamic Dashboard Route

1.  **Create New Directory Structure**: A new route will be created at `src/app/admin/view-business/[businessId]`. This will house the duplicated dashboard pages. The `[businessId]` segment will make the route dynamic.

2.  **Duplicate Dashboard Files**: Recursively copy all files and subdirectories from the existing business dashboard at `src/app/dashboard` into the new dynamic route structure. This ensures all pages (Profile, Campaigns, Rewards, etc.) are available in the impersonation view.

## Phase 2: Update Admin UI to Link to the New Dashboard

1.  **Locate the "View Details" Action**: Identify the code responsible for the actions menu in the Business Owners Management table (`src/app/admin/users/business/page.tsx`). This is likely located in `src/components/admin/users/columns.tsx`.

2.  **Modify the Action**: Change the "View Details" menu item's behavior. Instead of opening a modal, it will trigger a navigation event using Next.js's `useRouter`.

3.  **Implement Navigation**: The router will push to the new dynamic URL, e.g., `/admin/view-business/{business_id}`, where `{business_id}` is the ID of the selected business owner.

## Phase 3: Adapt Data Fetching for Impersonation

This is the most critical phase. The duplicated dashboard pages must be modified to fetch data for the specific business owner being viewed, not the logged-in admin.

1.  **Identify Data Hooks**: Systematically go through each page in `src/app/admin/view-business/[businessId]/` and identify all data-fetching hooks (e.g., `useGetGeneralAnalytics`, `useGetMyCreatedCampaigns`).

2.  **Create Business-Specific Hooks**: For each identified hook, create a new version that accepts a `businessId` as a parameter. For example:
    *   `useGetGeneralAnalytics` -> `useGetBusinessGeneralAnalytics(businessId: string)`
    *   `useGetMyCreatedCampaigns` -> `useGetBusinessCreatedCampaigns(businessId:string)`
    *   This may involve creating new API service functions and backend endpoints if they don't already exist. (Initially, we will focus on the frontend changes and assume endpoints can be adapted).

3.  **Update Pages to Use New Hooks**: Modify each duplicated page to:
    *   Extract the `businessId` from the URL using the `useParams` hook.
    *   Call the new, business-specific data hooks with the extracted `businessId`.
    *   Render the fetched data.

## Phase 4: Create an "Impersonation Mode" Layout

1.  **Adapt the Layout**: The duplicated layout file (`src/app/admin/view-business/[businessId]/layout.tsx`) will be modified.

2.  **Add an Impersonation Banner**: A prominent banner will be added at the top of the page. This banner will:
    *   Clearly state that the admin is "Viewing as [Business Name]".
    *   Provide a "Return to Admin Dashboard" button to easily exit the impersonation view.
    *   This ensures the admin is always aware of the context and has a clear exit path.

3.  **Preserve Business Navigation**: The layout will continue to use the `BusinessSidebar` and `BusinessHeader` to accurately mimic the business user's experience, as requested.

## Phase 5: Testing and Refinement

1.  **Navigation Testing**: Ensure all links within the impersonated dashboard (e.g., from the main dashboard page to the campaigns list) navigate correctly within the `/admin/view-business/[businessId]/` context.
2.  **Data Validation**: Verify that the data displayed on each page corresponds to the correct business owner, not the logged-in admin.
3.  **Edge Cases**: Test scenarios like invalid business IDs or permissions issues.