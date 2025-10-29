# Affiliate / Invite System — Frontend Build Guide

### 1. One-line purpose
To provide businesses with a personal invite link and QR code to refer other businesses, and to track the resulting sign-ups and rewards earned in a clear, actionable dashboard interface.

### 2. High-level flow (what happens)
1.  **Business Access**: A business user navigates to the "Affiliate" section in their dashboard.
2.  **Get Link/QR**: The page displays a unique referral link and a corresponding QR code.
3.  **Share**: The business user copies the link or shares the QR code with other potential businesses.
4.  **New User Signup**: An invited business clicks the link (e.g., `mcom.loyal/signup?ref=BIZ-XYZ`) and signs up.
5.  **Track Progress**: The referring business sees the new sign-up in their affiliate dashboard, initially marked as "Pending."
6.  **Earn Rewards**: Once the invited business completes required actions (e.g., completes profile, launches first campaign), their status changes to "Completed," and the referring business earns points.
7.  **View Stats**: The dashboard shows total invites, successful conversions, and total points earned.

### 3. Requirements & Principles
*   **Clarity First**: The invite link, QR code, and rewards must be immediately obvious and easy to use.
*   **Frontend First**: The entire flow will be built and demonstrated using mock data. No backend integration is required for this task.
*   **Action-Oriented**: The dashboard should make it easy to copy the link and see performance at a glance.
*   **Seamless Integration**: The new section should feel like a natural part of the existing business dashboard.
*   **Responsive Design**: All new components must work flawlessly on both desktop and mobile devices.

### 4. Frontend Implementation Plan (File by File)

*   **New Page:**
    *   `src/app/dashboard/affiliate/page.tsx`: The main page for the affiliate system. It will compose the different UI components together.

*   **New Components:**
    *   `src/components/dashboard/affiliate/InviteCard.tsx`: A component to display the unique referral link with a "Copy" button and the QR code.
    *   `src/components/dashboard/affiliate/StatsSummary.tsx`: A set of cards to display key metrics like "Total Invites," "Successful Referrals," and "Points Earned."
    *   `src/components/dashboard/affiliate/ReferralsHistoryTable.tsx`: A table to list all referred businesses, their join date, their status (`Pending`, `Completed`), and the reward earned.
    *   `src/components/dashboard/affiliate/RewardsLadder.tsx`: A visual component to show the ladder-based rewards system (e.g., "5 referrals = 500 bonus points," "10 referrals = 1000 bonus points + Gold Badge").

*   **New Mock Data:**
    *   `src/lib/mock-data/affiliate.ts`: This file will export mock data for the affiliate dashboard, including a sample referral link, stats, a list of referred users, and the rewards ladder structure.

*   **File Modifications:**
    *   `src/components/dashboard/Sidebar.tsx`: Add a new navigation link to the "Affiliate" page in the business dashboard sidebar.
    *   `src/app/signup/page.tsx`: (Optional, for demonstration) Modify the signup page to show a banner if a `ref` query parameter is present in the URL, e.g., "You've been invited by Business XYZ."

### 5. Mock Data Structure (`src/lib/mock-data/affiliate.ts`)

```typescript
export interface Referral {
  id: string;
  businessName: string;
  joinDate: string;
  status: 'Completed' | 'Pending';
  reward: number; // Points earned
}

export interface AffiliateStats {
  totalInvites: number;
  successfulReferrals: number;
  pointsEarned: number;
}

export interface RewardTier {
  level: number;
  referralsNeeded: number;
  description: string;
  reward: string;
}

export const affiliateData = {
  referralLink: 'https://mcom.loyal/signup?ref=BIZ-XYZ123',
  qrCodeUrl: '/placeholder-qr.svg', // We will need a placeholder QR code image
  stats: {
    totalInvites: 28,
    successfulReferrals: 12,
    pointsEarned: 1200,
  },
  referrals: [
    { id: '1', businessName: 'The Coffee Spot', joinDate: '2025-10-15', status: 'Completed', reward: 100 },
    { id: '2', businessName: 'Local Threads', joinDate: '2025-10-12', status: 'Completed', reward: 100 },
    { id: '3', businessName: 'Quick Bites', joinDate: '2025-10-10', status: 'Pending', reward: 0 },
    { id: '4', businessName: 'Gourmet Grocer', joinDate: '2025-09-28', status: 'Completed', reward: 100 },
  ],
  rewardsLadder: [
    { level: 1, referralsNeeded: 5, description: 'Reach 5 successful referrals', reward: '500 Bonus Points' },
    { level: 2, referralsNeeded: 10, description: 'Reach 10 successful referrals', reward: '1000 Bonus Points' },
    { level: 3, referralsNeeded: 25, description: 'Reach 25 successful referrals', reward: '2500 Bonus Points + Gold Partner Badge' },
  ]
};
```

### 6. Step-by-step Implementation Guide

1.  **Create Plan**: Create and save this plan as `AFFILIATE_INVITE_SYSTEM_PLAN.md`.
2.  **Create Mock Data**: Create the `src/lib/mock-data/affiliate.ts` file with the structure defined above. Also, add a placeholder QR code image to the `/public` directory.
3.  **Update Sidebar**: Modify `src/components/dashboard/Sidebar.tsx` to add a new link to `/dashboard/affiliate`. I'll use an existing icon that represents sharing or users.
4.  **Create Page and Components**:
    *   Create the directory `src/app/dashboard/affiliate`.
    *   Create the page file `src/app/dashboard/affiliate/page.tsx`.
    *   Create the directory `src/components/dashboard/affiliate`.
    *   Create the components: `InviteCard.tsx`, `StatsSummary.tsx`, `ReferralsHistoryTable.tsx`, and `RewardsLadder.tsx` inside the new directory.
5.  **Build the UI**: Implement the JSX and styling for each component, importing and using the mock data.
    *   `InviteCard.tsx` will display the link and QR code.
    *   `StatsSummary.tsx` will display the high-level numbers.
    *   `ReferralsHistoryTable.tsx` will use the `Table` component from `src/components/ui/table.tsx` to display the referral history.
    *   `RewardsLadder.tsx` will visually represent the reward tiers.
6.  **Assemble the Page**: In `src/app/dashboard/affiliate/page.tsx`, import and arrange the newly created components to build the complete page layout.
7.  **Verify**: Run the development server and navigate to the new page to ensure everything renders correctly and is responsive.
