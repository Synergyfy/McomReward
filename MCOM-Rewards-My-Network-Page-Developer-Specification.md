# MCOM Rewards — My Network Page \(Developer Specification\)

This document provides **full, simple\-English instructions** for developers to build the **My Network** page inside MCOM Rewards\. It covers all three sections:

1. **Form Contacts**
2. **Plaques**
3. **Affiliates**

Every feature, screen, interaction, validation, and backend requirement is included\.

# 1\. My Network — Overview

The **My Network** page is where a business owner manages the people and businesses they can work with\. The page has a **top dropdown** with three sections:

- **Form Contacts** \(contacts they manually submitted or platform added\)
- **Plaques** \(contacts or leads generated from plaque scans\)
- **Affiliates** \(people who joined through the owner’s affiliate link\)

Everything inside My Network must eventually be usable inside:

- Group Builder
- Campaign Creation
- Reward Distribution
- B2B\-to\-C activities

# 2\. Page Structure

### 2\.1 Navigation Layout

At the top of the page, include a simple dropdown:

- **My Network** \(default view = Form Contacts\)
- **Plaques**
- **Affiliates**

Below the dropdown is the main content area that changes depending on the selected section\.

All three sections must have:

- Search bar
- Filters \(location tags, relationship tags, status\)
- Sort options \(A–Z, newest, most active\)
- Pagination or infinite scroll

# 3\. SECTION 1 — Form Contacts

This section displays the contacts collected through:

- Step 3 \(How many contacts\)
- Step 5 \(Submit contact names\)
- Platform\-provided leads \(auto\-injected\)
- Imported CSV

### 3\.1 Data Display

Each row&#x2F;card must show:

- Full name
- Business name
- Email \(if available\)
- Phone \(if available\)
- Location tag
- Relationship tag
- A checkbox that confirms that this business has the permission to add the Business details to their contact\. 
- Submit Button 
- Source tag \(`User\-submitted`, `Platform`, `Plaque`, `Affiliate`\)
- Status: Active | Pending | Inactive
- &quot;Add to Group&quot; quick action button
- Edit and Delete icons

### 3\.2 Tooltip Explanations

**Location tag:**

- **Nearby:** Very close, neighbourhood radius\.
- **Hyperlocal:** Wider local area but still nearby\.
- **National:** Anywhere within the country\.

**Relationship tag:**

- **Partner:** Someone you collaborate with\.
- **Supplier:** Someone who provides you items or services\.
- **Affiliate:** Promotes your business\.
- **Customer:** Buys from you\.

**Source tag:**

- **User\-submitted:** Manually added by the business owner\.
- **Platform:** Contact automatically provided by MCOM\.
- **Plaque:** Contact generated when someone scans their plaque\.
- **Affiliate:** Contact created by affiliate sign\-ups\.

### 3\.3 Required Actions

Developers must build:

- Add contact \(single\)
- Add contacts \(batch&#x2F;CSV\)
- Edit contact
- Remove contact
- Duplicate checking
- Filters for Source, Location, Relationship, Status

### 3\.4 Special Behavior

- If user did not submit all required contacts, show a **progress bar** e\.g\. `12 &#x2F; 25 contacts completed`\.
- If incomplete, show CTA: **Complete My Contact List**\.
- Admin&#x2F;Account Manager can inject Platform Leads; they must show with a highlighted &quot;Platform&quot; tag\.

# 4\. SECTION 2 — Plaques

This section displays all contacts and interactions generated from plaque scans\.

### 4\.1 Data Display

Each row&#x2F;card must show:

- Name \(if provided during scan\)
- Contact info \(email&#x2F;phone\)
- Scan type \(NFC tap or QR scan\)
- Date&#x2F;time of scan
- Status: Pending | Confirmed | Connected
- Action button: **Convert to Contact**

If name or business name is missing, show placeholder fields:

- &quot;Unknown — Needs confirmation&quot;

### 4\.2 Required Features

Developers must build:

- Automatic record creation when someone scans plaque
- Assign `source = plaque`
- Owner must confirm each contact before it becomes part of the official network
- Bulk confirm option
- Panel with plaque activity summary:
    - Number of scans
    - Conversion rate
    - Most active plaque \(if multiple\)

### 4\.3 Tooltip Explanations

- **Pending:** Scan recorded but not confirmed by owner\.
- **Confirmed:** Owner validated the contact\.
- **Connected:** Contact added into Form Contacts\.

### 4\.4 Converting to Form Contacts

When owner clicks **Convert to Contact**:

1. A pre\-filled form opens with available scan data\.
2. Owner can edit or complete missing fields\.
3. On save, move to Form Contacts with tag `Source: Plaque`\.
4. Status in plaque list becomes &quot;Connected&quot;\.

# 5\. SECTION 3 — Affiliates

This section manages people who joined using the owner’s affiliate link\.

### 5\.1 Data Display

Each row&#x2F;card must show:

- Affiliate name
- Email
- Phone
- Joined date
- Role type \(Marketing affiliate, Advertising affiliate, Business owner referral\)
- Total referrals they have brought
- Status: Active | Inactive
- Quick actions: Message &#x2F; Invite to Group &#x2F; View Profile

### 5\.2 Required Developer Features

- Automatic record creation when someone signs up using the affiliate link
- Assign `source = affiliate`
- Link affiliates to the business owner profile
- Track referrals from each affiliate \(multi\-level possible later\)
- Filters: role type, status, referral count

### 5\.3 Tooltip Explanations

- **Marketing affiliate:** Promotes the business owner to consumers\.
- **Advertising affiliate:** Brings businesses who want visibility\.
- **Business owner referral:** Someone who joined MCOM as a business owner through your referral link\.

### 5\.4 Integration Notes

All affiliates must be available during:

- Group building
- Reward campaigns
- Deal promotions

# 6\. Shared Components Across All Sections

### 6\.1 Search

- Must search across names, business names, emails\.
- Instant keyword filtering\.

### 6\.2 Filters

Shared filters must include:

- Location tags
- Relationship tags
- Status
- Source

### 6\.3 Sorting

Sorting options:

- Alphabetical \(A–Z\)
- Newest added
- Oldest added
- Most active

### 6\.4 Quick Actions

Every row must support:

- Add to Group
- Add to Campaign
- View Profile
- Message \(external integration\)

# 7\. Backend Requirements

### 7\.1 Tables Needed

- `network\_contacts`
- `plaque\_leads`
- `affiliate\_list`

### 7\.2 API Endpoints

All sections must use consistent API structure:

- Create, Update, Delete records
- Confirm plaque scans
- Convert plaque scan to network contact
- Get affiliate records
- Get platform leads

# 8\. Integration With Group Builder

Everything inside My Network must be selectable inside the Group Builder\. Developers must:

- Provide unified selector API returning all contacts from all sources
- Include filters \(location, relationship, source\)
- Mark each item with icon \(Form, Plaque, Affiliate\)

# 9\. Integration With Rewards &amp; Campaigns

Inside campaign creation:

- Owner must pick contacts from My Network
- Campaign audience builder must pull from the three sections
- Campaign distribution uses contact info from network\_contacts

# 10\. Admin Controls

Admin should have full visibility:

- All contacts submitted by owners
- All plaque leads generated
- All affiliates maps
- Ability to inject platform leads
- Ability to remove invalid contacts
- Ability to merge duplicates

# 11\. Final Acceptance Criteria

The My Network page is complete when:

1. All three sections \(Form Contacts, Plaques, Affiliates\) work fully and independently\.
2. All tooltips and explanations appear correctly\.
3. Contacts from all sources can be edited, deleted, filtered, sorted\.
4. Plaque leads can be converted smoothly\.
5. Affiliate records update automatically on sign\-up\.
6. Everything is available inside Group Builder\.
7. Everything is available during Campaign Creation\.
8. No duplicates exist without warning\.
9. Admin can see everything\.

If you want, the next step can be:

- Complete UI wireframes for each section,
- API contracts,
- Or create the developer checklist for implementation\.

## 7\. How My Network Connects to Group Builder, B2B\-to\-C Activities, and Deals

### 7\.1 Connection to Group Builder

My Network is the foundation of every group a business will build\. Each contact in the **Forms Contacts**, **Plaques**, or **Affiliates** sections becomes potential group members\.

**Step\-by\-step:**

1. Business adds contacts manually through the Contacts Form OR via Plaques or Affiliate signups\.
2. Each contact is tagged with Location \(Nearby, Hyperlocal, National\) and Relationship \(Partner, Supplier, Affiliate, Customer\)\.
3. When creating a group inside the **Group Builder**, the system should allow the business to:
    - Search contacts from My Network\.
    - Filter by Location, Relationship, or Contact Source\.
    - Add selected contacts to create Marketing, Advertising, Rewards, or Deal Groups\.
4. Groups are dynamic, meaning:
    - When a contact detail is updated in My Network, it auto\-updates inside any group they belong to\.
    - If a contact becomes inactive \(e\.g\., unreachable\), Group Builder displays a warning icon\.

### 7\.2 Connection to B2B\-to\-C Activities

My Network directly powers business\-to\-business\-to\-consumer activities\.

**Step\-by\-step flow:**

1. Business identifies partners or suppliers inside My Network\.
2. These contacts can be invited to collaborate through:
    - Reward campaigns
    - Joint advertising activities
    - Shared product promotion
3. Once partners accept \(via plaque activation or affiliate onboarding\), the system marks them as **Active Partners**\.
4. Active Partners automatically become available for:
    - Cross\-promotions
    - Product&#x2F;service exchange
    - Joint referrals
5. When a business launches a consumer\-facing campaign, the system:
    - Pushes the campaign to their partners inside the group\.
    - Partners distribute to their customers \(C\), enabling B2B\-to\-C distribution\.

### 7\.3 Connection to Deals Promotion

Deals rely heavily on My Network contacts and group formation\.

**Step\-by\-step:**

1. Business creates a deal \(discount, flash sale, bundle, etc\.\)\.
2. When selecting distribution settings, the system shows:
    - Groups created from My Network
    - Individual contacts \(e\.g\., influencers or affiliates\)
3. Business selects which partner groups receive the deal\.
4. System automatically:
    - Notifies selected partners
    - Pushes deal to their network \(if they accept\)
5. For each partner who distributes the deal:
    - They earn rewards or commission based on configuration
    - Their customers redeem deals in\-store or online

### 7\.4 Summary of How Everything Links Together

- **My Network** holds every potential relationship\.
- **Group Builder** organises relationships into functional units\.
- **Reward Campaigns, Deals, and Advertising** use groups for distribution\.
- **B2B\-to\-C** happens when a partner distributes the business’s offer to their own customers\.
- **Plaques &amp; Affiliates** keep My Network growing automatically\.

This completes the connection layer between My Network → Groups → Campaign Execution → B2B\-to\-C distribution\.

