*MCOM Rewards (LoyaltyCardX) — Admin Full Feature Checklist* (src/app/admin)

1. ADMIN DASHBOARD OVERVIEW
Purpose: Central control hub for managing sectors, categories, rewards, campaigns, users, permissions, and analytics.
Main Dashboard Sections:
 Top Summary Cards:
Total Businesses, Active Campaigns, Total Consumers, Total Rewards Claimed.
Total Matching Points Issued.
Business Tier Breakdown (Starter, Active, Trusted, Partner).
 Quick Actions:
Create New Reward, Create Campaign, Add Sector, Add Business.
 Notifications: Admin announcements, flagged activities, and pending approvals.
 Search & Filter: Search by business, user, or campaign.

2. SECTORS, CATEGORIES & SUB-CATEGORIES MANAGEMENT
Purpose: Define and organize business sectors that shape all campaigns, rewards, and listings.
Admin Can:
 Create New Sector
Fields: Sector Name, Description, Default Icon, Default Color, Auto-branding Theme.
Example: “Food & Dining,” “Fashion & Beauty,” “Health & Wellness.”
 Create Category Inside Sector
Fields: Category Name, Description, Image/Icon.
Example (Under Food & Dining): “Restaurants,” “Cafes,” “Bakeries.”
 Create Sub-Category Inside Category
Fields: Sub-Category Name, Description, Image/Icon.
Example (Under Restaurants): “Fine Dining,” “Fast Food,” “Buffet.”
 Edit / Delete / Reorder Sectors, Categories, Sub-Categories.
 Auto-linking:
When a business selects a Sector → Category → Sub-Category, it inherits the default branding from Admin setup.
 Display Controls:
Toggle visibility (Show/Hide) of sectors or categories on front-end campaign lists.

3. ADMIN REWARD MANAGEMENT
Purpose: Allow Admin to create, assign, and control all reward assets visible across the platform.
Admin Can:
 Create New Reward
Fields: Title, Description, Reward Type (Gift Card, Coupon, Voucher, Product, Service).
Points Required, Expiry Date, Sector, Category, Sub-Category.
Upload Image or Select Template.
Attach Reward Source: MCOM Reward Vault or Partner Businesses.
Select Audience: All Businesses / Specific Sectors / Specific Tiers.
 Edit or Duplicate Rewards.
 Auto-group rewards into categories for easier display.
 Filter rewards by sector, category, status, expiry, or partner.
 Reward Status: Draft, Live, Expired.
 Assign Reward Ownership:
System Rewards (created by Admin).
Partner Rewards (submitted by white-label partners).
 Reward Preview Page (how it looks to consumers and businesses).

4. ADMIN CAMPAIGN MANAGEMENT
Purpose: Enable Admin to create and oversee global campaigns, manage business-specific campaigns, and automate distribution.
Admin Can:
 Create New Campaign
Link to Reward (choose from Reward list).
Add Campaign Name, Caption, CTA, Banner Image.
Select Campaign Type: QR, Referral, Social, Event.
Set Start/End Date, Claim Limit, Matching Points Option.
Attach Sector, Category, Sub-Category (for targeted visibility).
Select Audience Type: All / Businesses / Consumers / Specific Badge Level.
Enable Smart Auto Rules:
Auto-stop when rewards run out.
Auto-switch to matching points.
Auto-refresh campaign after period ends.
 Edit or Pause Active Campaigns.
 Approve / Reject Business-Created Campaigns (moderation layer).
 Assign Campaign Ownership:
Admin-Owned (MCOM HQ).
Co-Brand Partner.
White-Label Business.
 View Campaign Performance:
Total Claims, Referrals, Engagements.
Points Distributed, Matching Points Given.

5. AUTO-GROUPING & DISPLAY RULES
Purpose: Maintain order and clarity for all rewards and campaigns.
Admin Can Configure:
 Auto-group rewards under their parent sectors/categories.
 Group Campaigns by Sector for homepage display.
 Define display order or highlight top-performing campaigns.
 Set rules for homepage: “Show top 5 active campaigns per sector.”
 Tag featured rewards for banner display.

6. USER MANAGEMENT (BUSINESS & CONSUMER)
Purpose: Allow Admin to control and monitor all users on the platform.
Business Owners:
 View all businesses with filters: Tier, Sector, Activity Status.
 Edit business profile and tier level.
 Suspend, Activate, or Downgrade account.
 See campaigns created and rewards attached.
 Access audit logs for business actions.
 Manually add or adjust business points balance.
 Reset login or send verification email.
Consumers:
 View all registered consumers with filters: Badge Level, Location, Activity.
 Edit or reset consumer account.
 See campaigns joined and rewards redeemed.
 Manually add or adjust points/matching points.
 Suspend or delete accounts for violations.

7. MATCHING POINTS CONTROL PANEL
Purpose: Manage global matching point settings and apply logic across all campaigns.
Admin Can:
 Define base matching point ratio (e.g., 1:1 or 1:0.5).
 Set default matching point range per sector (100–1000 points).
 Enable or disable matching points for specific campaigns.
 Monitor total matching points distributed.
 Adjust or deduct matching points manually for any account.

8. TIER & BADGE CONTROL (BUSINESS + CONSUMER)
Purpose: Manage the logic and progression of badges and tiers.
Admin Can:
 Define criteria for each level (points, redemptions, or activities).
 Override and manually promote or demote any user.
 Add or modify badge design and name.
 Assign custom privileges per level.
 Generate reports of user movement across levels.

9. DEALS, B2B EXCHANGE & MARKETPLACE MANAGEMENT
Purpose: Control visibility and performance of business deals and exchanges.
Admin Can:
 Create or approve deals submitted by businesses.
 Attach deals to sectors or groups.
 Moderate pricing and visibility rules.
 Monitor B2B exchange activities.
 Highlight featured deals on homepage or campaign pages.

10. CO-BRANDED & WHITE-LABEL PARTNER MANAGEMENT
Purpose: Oversee branded and partner-specific platforms connected to MCOM Rewards.
Admin Can:
 Create and manage Co-Brand partner accounts.
 Assign permissions for branding edits (logo, colors, text lock).
 Create White-Label partners with full independent dashboards.
 Manage subdomains and domain routing.
 Track performance metrics for each partner system.
 Define revenue-sharing or commission settings.

11. REPORTING & ANALYTICS
Purpose: Monitor the platform’s performance and ensure business owners achieve goals.
Reports Include:
Total Campaigns Created, Joined, Claimed.
Top Performing Businesses.
Most Popular Rewards.
Points Distributed (Standard vs Matching).
Consumer Growth and Activity.
Business Tier Distribution.
Conversion and Retention Reports.
Downloadable (CSV, PDF, XLS).

12. NOTIFICATIONS & COMMUNICATION CONTROL
Purpose: Manage how alerts, announcements, and emails are delivered to users.
Admin Can:
 Create platform-wide announcements.
 Send targeted messages (by sector, tier, or location).
 Configure automated notifications (campaign start, expiry, etc.).
 Email Templates Manager (customize headers, body, and signatures).
 Push Notifications and In-App Alerts control.

13. FRONT-END CONTENT MANAGEMENT
Purpose: Let Admin control visible content and static pages of the MCOM Rewards site.
Pages Admin Can Edit:
Homepage, About Us, Deals Page, Campaign List Page.
Pricing Page, Terms & Conditions, Privacy Policy.
Banners, Carousel images, Featured Rewards.
CMS Features:
 WYSIWYG editor for content pages.
 Upload images and videos.
 Schedule when new content goes live.
 Assign visibility by user type (public, business, consumer).

14. ESCROW, PAYMENTS & SUBSCRIPTIONS
Purpose: Manage financial logic of reward redemption and subscriptions.
Admin Can:
 View payment history for all businesses.
 Manage escrow system (hold funds until campaign completion).
 Control subscription plans and pricing.
 Adjust commission structures for agents and affiliates.
 Approve payout requests.
 View financial analytics (revenue, pending payouts, refunds).

15. SECURITY, PERMISSIONS & AUDIT TRAILS
Purpose: Protect platform integrity and ensure accountability.
Admin Can:
 Assign roles: Super Admin, Moderator, Finance, Support.
 Define role-based access controls (RBAC).
 View complete audit trails (who did what and when).
 Data export/download logs.
 GDPR and compliance controls (data consent and anonymization).

16. TRAINING, SUPPORT & RESOURCE MANAGEMENT
Purpose: Manage help materials for users and business owners.
Admin Can:
 Upload training videos and tutorials.
 Manage help center articles.
 Assign learning modules by tier level.
 Monitor completion progress for businesses.

17. ADMIN CONTROL SUMMARY
Create and manage sectors, categories, and sub-categories.
Build and attach rewards/campaigns by sector.
Manage users (business + consumers) and their tiers.
Control co-branded and white-label partners.
Monitor matching points, campaigns, and deals.
Manage notifications, content, payments, and training.
Ensure platform compliance, security, and audit readiness.
End of Admin Full Feature Checklist — MCOM Rewards (LoyaltyCardX)