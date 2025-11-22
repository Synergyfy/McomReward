# Plan to Enhance Campaign List Page with Campaign Details View

1.  **Backend Integration:**
    *   Update `src/services/campaigns/types.ts` to ensure the `CampaignResponse` interface matches the provided API response for a single campaign.
    *   Create a new function `getCampaignById` and a corresponding hook `useGetCampaignById` in `src/services/campaigns/hook.ts` to fetch a single campaign by its ID from the `/campaigns/{id}` endpoint.

2.  **Create Campaign Details Page Structure:**
    *   Create a new route structure under `src/app/admin/campaigns/` for the dynamic campaign details page: `src/app/admin/campaigns/[campaignId]/page.tsx`.
    *   To replicate the preview experience, create the following pages inside the `[campaignId]` folder:
        *   `layout.tsx`: A layout for the campaign details view, similar to `src/app/(others)/campaigns/layout.tsx` but adapted for the admin dashboard.
        *   `overview/page.tsx` (as the main page)
        *   `earn-points/page.tsx`
        *   `redeem-points/page.tsx`
        *   `contact-us/page.tsx`

3.  **Implement the Details View:**
    *   The main details page (`[campaignId]/overview/page.tsx`) will use the new `useGetCampaignById` hook to fetch and display the campaign data.
    *   The component will be structured to look like `src/app/(others)/campaigns/[campaignId]/page.tsx` and will display all the relevant details from the API response.
    *   The sub-pages (`earn-points`, `redeem-points`, `contact-us`) will also fetch the campaign data and display their respective sections. Re-use of components from `src/components/dashboard/campaigns/previews` will be considered.

4.  **Update Campaign List Page:**
    *   Modify `src/app/admin/campaigns/list/page.tsx` to wrap the "View Campaign" button with a `<Link>` component that navigates to the newly created dynamic page, e.g., `/admin/campaigns/${campaign.id}/overview`.
