# Plaque User — Mini Dashboard

## Quick notes for developers \(plain\)

- This is a **mini dashboard** with only tools related to the user&#39;s assigned plaque\(s\)\.
- Plaque Users may have one or several plaques assigned\.
- Keep UI simple and mobile\-first\.
- All copy should be clear and friendly\. Use short sentences\.

# Navigation \(top\-level for plaque users\)

- Home \(Overview\)
- My Plaques
- Plaque Details \(dynamic\)
- Share &amp; Campaigns
- Downloads &amp; Print
- Scans &amp; Activity
- Offers &amp; Redemptions
- Earnings \(if commissions enabled\)
- Settings &amp; Profile
- Help &amp; Support

Each page should have a clear header with the plaque user&#39;s name and the business name they belong to\.

# 1\) Onboarding &#x2F; First Login page

**Goal:** Greet the plaque user and help them confirm their assigned plaque\.

**What to show:**

- Friendly welcome: &quot;Welcome, \[Name\]\! Here’s your plaque dashboard\.&quot;
- Big card that shows assigned plaque\(s\) with QR preview, PLAQUE ID, business name\.
- Short checklist: &quot;1\. Confirm your plaque location  2\. Share your plaque link  3\. Check scans&quot;
- Button: **Confirm my plaque** \(opens Edit Location\)
- Button: **Show me how to use my plaque** \(opens Help modal\)

**Behind the scenes:** Confirm button sets `location\_confirmed` flag and triggers onboarding email\.

**Microcopy examples:**

- Headline: &quot;Your Plaque is Ready&quot;
- Subtext: &quot;This plaque belongs to \[Business\]\. You can share it, download it, or check scans\.&quot;

# 2\) Home \(Overview\)

**Goal:** Give a simple snapshot of plaque performance and quick actions\.

**Top area:**

- Small business card \(logo, business name, group owner name\)
- Quick KPIs in a row:
    - Total scans \(lifetime\)
    - Scans \(last 30 days\)
    - Redemptions &#x2F; leads \(last 30 days\)
    - Commission earned \(if enabled\)

**Middle area — Plaque list \(if user has many plaques\):**<br> For each plaque show a small card with:

- Plaque name
- Plaque ID
- QR preview image \(small\)
- Current status \(Active &#x2F; Paused &#x2F; Retired\)
- Total scans \(30d\)
- Quick action buttons: **Open**, **Share**, **Download**, **Edit Location**

**Bottom area — Recent activity feed:**

- Timeline entries: &quot;3 mins ago — Person scanned Plaque \#334&quot;; &quot;2 days ago — Offer redeemed&quot;
- Link: **See all activity** \-&gt; Scans &amp; Activity page

**Buttons and CTAs:**

- Primary: **Share My Plaque**
- Secondary: **Download Plaque**

**Error &#x2F; empty states:**

- If no scans yet: &quot;No scans yet\. Share your plaque and try scanning it yourself to test\.&quot;

# 3\) My Plaques \(List view\)

**Goal:** Let the plaque user see all plaques they own and take quick actions\.

**Layout:** Table or stacked cards with columns&#x2F;rows:

- Checkbox \(for multi\-select\)
- Plaque preview \(small QR\)
- Plaque name \+ ID
- Status badge
- Location \(editable short text\)
- Scans \(30d\) and lifetime
- Last scanned date
- Actions: **View**, **Share**, **Download**, **Edit Location**

**Filters:**

- Search by plaque ID or name
- Filter by status

**Bulk actions:**

- Download selected
- Generate share links for selected

**Microcopy example:**

- Action tooltip: &quot;Share this plaque link with customers or staff\.&quot;

# 4\) Plaque Details \(single plaque page\)

**Goal:** The main page where user inspects the plaque and acts on it\.

**Header:**

- Large QR image \+ Plaque name \+ Plaque ID
- Small business logo and business name
- Status pill \(Active &#x2F; Paused &#x2F; Retired\)

**Primary actions \(buttons near header\):**

- **Share** \(opens Share modal\)
- **Download** \(opens Download modal\)
- **Edit Location** \(opens small form\)
- **Report an Issue** \(opens Support modal\)

**Left column — Snapshot:**

- KPIs: Total scans \(lifetime\), Scans \(30d\), Redemptions, Conversion rate \(if available\)
- Last scanned: date&#x2F;time
- Assigned by: owner name \(business owner\)
- Seller info \(if resale\): original seller and last seller with small labels

**Right column — Timeline &#x2F; Feed:**

- List of recent scans and redemptions with timestamps and source \(QR &#x2F; NFC &#x2F; Shared link\)
- Each scan row: time, approximate location, device type \(friendly text\), whether it led to an offer
- Button under the list: **Export scans \(CSV\)**

**Bottom area — Landing page preview:**

- Show the actual page users see when they scan the plaque\. This is read\-only here\.
- Button: **Open live landing page**

**Edge cases:**

- If plaque is Paused: show yellow banner: &quot;This plaque is paused\. Scans will not show offers until it is active\.&quot;
- If plaque is Retired: show red banner: &quot;This plaque is retired\. It no longer records scans\.&quot; and disable share and downloads\.

# 5\) Share &amp; Campaigns page&#x2F;modal

**Goal:** Simple tools to share the plaque and track which shares brought scans\.

**Share modal content:**

- Short link \(copy button\)
- Social buttons \(WhatsApp, Facebook, Twitter\) with one\-click share
- Create Campaign input: Campaign name, optional expiry date
- Checkbox: Make link one\-time use
- Small sample share message \(editable\) with **Copy message** button

**Campaigns table:**

- Campaign name, created date, total clicks, total scans, last click
- Actions: **View stats**, **Deactivate**, **Duplicate**

**Behavior:**

- When user creates a campaign, the share link created is tagged with that campaign\. Scans that happen via that link are shown in the Plaque Details’ feed and in Campaign stats\.

**Microcopy examples:**

- Copy button text: &quot;Copy link&quot;
- Help text: &quot;Give each share a name so you can see which posts worked best\.&quot;

# 6\) Downloads &amp; Print page&#x2F;modal

**Goal:** Let plaque users download a printable version of their assigned plaque\.

**Options to show:**

- PNG download \(small, medium, large\)
- PDF download \(A4 ready, A5 ready\)
- Print preview \(shows how it will look on paper\)
- Checkbox: Include installation instructions
- Checkbox: Include serial number \+ seller name

**When download triggered:**

- Log the download \(who, when\) for audit\.

**Empty &#x2F; blocked state:**

- If plaque is retired: show note and disable downloads\.

# 7\) Scans &amp; Activity page

**Goal:** Show the full list of scan events and let user filter and export\.

**Top filters:**

- Date range \(today, 7d, 30d, custom\)
- Source \(QR, NFC, Shared link, Campaign\)
- Location \(if available\)
- Redemption \(Yes &#x2F; No\)

**Table columns:**

- Time
- Source \(QR&#x2F;NFC&#x2F;Link\)
- Campaign \(if any\)
- Approximate place \(city or store branch\)
- Result \(viewed landing, redeemed offer, signed up\)

**Row actions:**

- **View details** \(shows a small modal with available info\) — limited info only for privacy
- **Flag** \(report suspicious scan\)

**Export:**

- Button: **Export CSV** \(exports filtered results\)

**Privacy note:**

- Only show non\-personal device info\. Do not show raw IP or personal identifiers\.

# 8\) Offers &amp; Redemptions page

**Goal:** Show offers tied to this plaque and when people redeemed them\.

**Top:** Quick totals: total offers shown, total redemptions, conversion rate\.

**List:**

- Each offer card shows: Offer name, short details, redemption count, last redeemed date
- Click offer to see redemption details \(time, campaign if any\)

**Action:**

- Button: **Suggest an update to offer** — this opens a small form sent to business owner to request offer change \(plaque user cannot change offers directly\)

# 9\) Earnings &amp; Commissions page \(only show if plaque commissions are enabled\)

**Goal:** Let plaque user see money they earned from plaque sales, scans or conversions\.

**Top summary:**

- Total earned \(lifetime\)
- Pending payouts
- Paid \(lifetime\)

**Transactions table:**

- Date, Type \(Sale &#x2F; Scan Commission &#x2F; Redemption\), Amount, Status \(Pending &#x2F; Approved &#x2F; Paid\), Related plaque or invoice

**Payout actions:**

- Button: **Request payout** \(if above minimum threshold\)
- Button: **View payout history**

**Notes:**

- Include tooltips explaining hold periods and how payouts are processed by Admin\.

# 10\) Settings &amp; Profile

**Goal:** Manage basic profile and plaque preferences\.

**Sections:**

- Profile \(name, phone, email\) — editable
- Notification prefs \(daily summary, immediate scan alerts, weekly earnings\) — toggles
- Linked NFC devices \(list\) — show assigned NFC IDs and option to request pairing
- Billing \(only if plaque user pays activation or buys plaque\) — show invoices and payment method

**Security:**

- Button: **Log out**

# 11\) Help &amp; Support

**Goal:** Fast help related to plaque use\.

**What to show:**

- Quick guides: &quot;How to place a plaque&quot;, &quot;How NFC works&quot;, &quot;How to share your link&quot;
- Contact support: open ticket form with fields: Subject, Description, Attach image
- Report transfer issue: special form used when plaque user claims ownership problem
- Link to Live Chat \(if available\)

# 12\) Audit &amp; Transfer Requests \(read\-only for plaque user\)

**Goal:** Let plaque users see the transfer history and request help\.

**What to show:**

- Transfer history list with dates: from \-&gt; to \-&gt; price \(if public\) \-&gt; invoice id
- Button: **Request transfer review** — opens support ticket pre\-filled with transfer details

# 13\) UI copy and microcopy examples \(small helpful texts\)

- Empty scan: &quot;No one has scanned this plaque yet\. Share it with customers or test it yourself by scanning\.&quot;
- Paused plaque: &quot;This plaque is paused\. Contact the business owner to reactivate\.&quot;
- Share help: &quot;Copy the link and send it to staff or customers\. Use Campaign names to track which posts work best\.&quot;
- Download help: &quot;Download a print\-ready file and take it to the printer\.&quot;

# 14\) Responsive &amp; accessibility notes

- Use mobile\-first breakpoints\. Ensure key actions \(Share, Download, Edit Location\) are visible on small screens\.
- Buttons should be large tappable targets\.
- Provide alt text for QR preview images\.
- Ensure high contrast for status badges\.
- Use ARIA labels for modals and forms\.

# 15\) Acceptance Criteria for each page \(QA checklist\)

- Pages load within reasonable time on mobile and desktop\.
- All action buttons perform and show success or error messages\.
- Scans table respects date and source filters\.
- Share links copy to clipboard and open the correct landing page\.
- Downloads produce a valid PNG&#x2F;PDF with the correct plaque ID and logo\.
- Paused&#x2F;Retired plaques disable share and download actions\.
- Exported CSVs contain the expected columns and data\.

# 16\) Example user flows \(short\)

**Flow: New plaque user checks scans**

1. Login → Home → Click Plaque Details → See 12 scans last 7 days → Click a scan to view details\.

**Flow: User shares plaque**

1. Open Plaque Details → Click Share → Create campaign name &quot;Front\-Window\-Dec&quot; → Copy link → Post to WhatsApp\.

**Flow: Request payout**

1. Home → Earnings → Request payout \(if &gt; minimum\) → Show confirmation and pending status\.

