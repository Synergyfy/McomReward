# M-COM REWARD & LOYALTY

## Frontend Product Flow Specification

## Business Side Only

# 1. IMPORTANT PRINCIPLE

M-Com Reward & Loyalty is not a standalone platform.

The business does not start here.

The business starts inside:

* M-Com Central
* M-Com Solutions
* Audit recommendations
* MCOMMall
* Consultant onboarding
* Account Manager onboarding
* Agent onboarding

By the time the business enters M-Com Reward & Loyalty, we already know:

* Business name
* Business category
* Industry
* Goals
* Challenges
* Audit recommendations
* Membership package
* Business branding
* Contact details

Because of this:

DO NOT ask these questions again.

The frontend should automatically pull all information from M-Com Central.

The business should feel like they are moving to another section of the same platform, not creating another account.

---

# 2. ENTRY INTO REWARD & LOYALTY

Business sees recommendation:

"Activate Customer Rewards & Loyalty"

Possible locations:

* M-Com Central dashboard
* Audit recommendation page
* MCOMMall dashboard
* Consultant dashboard recommendation
* Account Manager recommendation

Business clicks:

"Activate Loyalty"

System creates Loyalty workspace automatically.

No registration form.

No signup page.

No login page.

Business lands immediately inside:

## Loyalty Welcome Screen

Page content:

Header:

"Welcome to M-Com Reward & Loyalty"

Short explanation:

* Increase repeat customers
* Reward loyal customers
* Increase customer lifetime value
* Bring customers back more often
* Turn customers into promoters

Buttons:

* Start Setup
* View Demo
* Skip For Now

---

# 3. LOYALTY SETUP WIZARD

This is a step-by-step setup process.

Progress bar example:

Step 1 of 7
Step 2 of 7
Step 3 of 7

Business should always know where they are.

---

# STEP 1 — BUSINESS PROFILE CONFIRMATION

Display information pulled from M-Com Central.

Show:

* Business name
* Logo
* Industry
* Address
* Phone number
* Website
* Membership package

Business can:

* Edit information
* Continue

Do not ask for information already known.

---

# STEP 2 — CHOOSE LOYALTY TEMPLATE

Admin creates templates.

Frontend displays available templates.

Examples:

* Restaurant Template
* Coffee Shop Template
* Retail Template
* Beauty Salon Template
* Gym Template
* Service Business Template
* Custom Template

Each card should show:

* Template name
* Short explanation
* Benefits
* Included reward types

Example:

Coffee Shop Template includes:

* Points
* Stamps
* Visit rewards
* Birthday rewards

Business selects one.

Clicks:

"Use This Template"

---

# STEP 3 — SELECT REWARD TYPES

Business chooses which reward systems they want active.

Multiple selections allowed.

Options:

## Points

Customers earn points when spending money.

Example display:

Spend £1 = 1 Point

Editable fields:

* Currency amount
* Points earned

---

## Stamps

Digital stamp cards.

Examples:

Buy 9 coffees get 1 free.

Frontend fields:

* Purchases required
* Reward earned

Example:

10 purchases required
Reward = Free Coffee

---

## Visit Rewards

Rewards based on visits.

Example:

Visit 5 times and receive reward.

Fields:

* Number of visits required
* Reward amount

---

## Spend Rewards

Reward customers after reaching spending targets.

Example:

Spend £100 this month and receive £10 reward.

Fields:

* Spend target
* Reward value

---

## Referral Rewards

Reward customers for referrals.

Example:

Refer a friend and receive:

* Points
* Voucher
* Gift card

Fields:

* Referral reward amount
* Friend reward amount

---

## Birthday Rewards

Reward customers automatically during birthday month.

Fields:

* Reward type
* Expiry period

---

## Anniversary Rewards

Reward customers on membership anniversaries.

---

Business can enable or disable any reward type.

---

# STEP 4 — CONFIGURE POINTS ENGINE

Only appears if Points is enabled.

Settings:

## Base Points

Example:

Spend £1 = 1 point

Fields:

* Spend amount
* Points awarded

---

## Bonus Points

Examples:

Double points Tuesday.

Triple points weekends.

Fields:

* Event name
* Multiplier
* Start date
* End date

---

## Matching Points

Example:

Business gives:

100 points

Platform gives:

100 extra points

Customer receives:

200 points.

Fields:

* Matching enabled
* Match percentage

Examples:

* 50%
* 100%
* 200%

---

## Point Expiry

Examples:

* Never expire
* 3 months
* 6 months
* 12 months

Dropdown selection.

---

# STEP 5 — CONFIGURE CUSTOMER TIERS

Optional feature.

Business enables tier system.

Example tiers:

* Bronze
* Silver
* Gold
* Platinum

Admin may create custom tiers.

Each tier contains:

## Entry Requirement

Examples:

* Spend amount
* Number of purchases
* Points earned

---

## Benefits

Examples:

* Double points
* Early access
* Special discounts
* VIP offers

Frontend should display tiers visually.

Customers should see progress bars.

Example:

750 points out of 1,000 required for Gold.

---

# STEP 6 — CONFIGURE GIFT CARDS

Business chooses whether gift cards are enabled.

Options:

## Sell Gift Cards

Examples:

* £10
* £25
* £50
* £100

Multiple values allowed.

---

## Promotional Gift Cards

Examples:

Spend £100 and receive £10 gift card.

---

## Referral Gift Cards

Example:

Refer a customer and receive £5 gift card.

---

## Seasonal Gift Cards

Examples:

* Christmas
* Easter
* Summer Sale
* Black Friday

---

Gift cards should display:

* Card design
* Value
* Expiry date
* Status

Statuses:

* Active
* Redeemed
* Expired

---

# STEP 7 — REVIEW AND ACTIVATE

Display summary.

Sections:

* Selected template
* Enabled rewards
* Point settings
* Gift cards
* Tier settings

Buttons:

* Edit
* Activate Programme

Business clicks:

"Activate Programme"

System creates loyalty programme immediately.

Redirect to dashboard.

---

# 4. BUSINESS LOYALTY DASHBOARD

Main dashboard sections:

## KPI Cards

Show:

* Total Members
* Total Points Issued
* Total Points Redeemed
* Active Campaigns
* Gift Cards Issued
* Gift Cards Redeemed
* Repeat Customer Rate
* Revenue Generated

---

## Recent Activity Feed

Examples:

John earned 50 points.

Sarah redeemed £10 voucher.

Michael referred a friend.

---

## Quick Actions

Buttons:

* Create Campaign
* Issue Gift Card
* Add Reward
* Create Stamp Card
* View Customers

---

# 5. CUSTOMER MANAGEMENT PAGE

Table columns:

* Customer Name
* Tier
* Points
* Stamps
* Visits
* Lifetime Spend
* Last Visit

Actions:

* View Profile
* Issue Bonus Points
* Send Reward
* Upgrade Tier

---

# 6. REWARDS MANAGEMENT PAGE

Business manages all rewards here.

Sections:

* Active Rewards
* Scheduled Rewards
* Expired Rewards

Actions:

* Edit
* Pause
* Duplicate
* Delete

---

# 7. STAMP MANAGEMENT PAGE

Display all active stamp programmes.

Examples:

Coffee Card

10 Meals Card

Car Wash Card

Show:

* Progress
* Active customers
* Redemption count

---

# 8. GIFT CARD MANAGEMENT PAGE

Sections:

* Sold cards
* Promotional cards
* Redeemed cards
* Expired cards

Filters:

* Date
* Amount
* Status

---

# 9. CAMPAIGNS PAGE

Campaigns make rewards visible to customers.

Campaign types:

* QR Campaign
* Referral Campaign
* Email Campaign
* Social Campaign
* Seasonal Campaign

Each campaign contains:

* Name
* Start date
* End date
* Reward type
* Target audience

---

# 10. ANALYTICS PAGE

Charts and reports:

* Repeat customer percentage
* Redemption rate
* Average customer spend
* Customer lifetime value
* Most redeemed reward
* Best performing campaign
* Customer growth trend

---

# 11. CUSTOMER WALLET

Every customer receives one wallet.

Wallet contains:

* Points
* Stamps
* Vouchers
* Coupons
* Gift Cards
* Membership Tier

Everything exists in one place.

---

# 12. REDEMPTION FLOW

Customer chooses reward.

Customer presses:

Redeem Reward.

System generates:

* QR Code
* Redemption Code
* Barcode

Staff verifies reward.

Reward status changes to:

Redeemed.

Transaction recorded automatically.

---

# 13. CONNECTION TO OTHER M-COM PLATFORMS

## MCOMMall

Purchases automatically generate:

* Points
* Stamps
* Rewards

---

## MCOMSpin

Winning games can issue:

* Points
* Gift cards
* Coupons

---

## Expo

Visitors can collect rewards during events.

---

## Affiliates

Consultants, Account Managers and Agents can view:

* Adoption status
* Programme activity
* Business performance

Only businesses assigned to them should be visible.

---

# 14. MOBILE REQUIREMENT

Everything must be mobile first.

Business owners will mainly use:

* Mobile phones
* Tablets

Desktop comes second.

Every page must work perfectly on mobile.

---

# 15. FINAL USER EXPERIENCE GOAL

The business should feel that:

"I turned loyalty on in a few minutes."

The system should feel:

* Simple
* Guided
* Automated
* Intelligent

The business should never feel overwhelmed by setup complexity.

The platform should do most of the work automatically using information already collected from M-Com Central.