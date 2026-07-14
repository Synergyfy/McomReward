# WHAT THE NUMBER FIELD IS REALLY FOR

**The system needs business owners to commit to a realistic number of contacts they can bring into the ecosystem\.**

This number is important because:

- It tells the system how strong their network is\.
- It determines which group they can realistically build\.
- It helps account managers prioritize who to work with\.
- It prevents users from typing unrealistic or nonsense numbers\.
- It becomes part of campaign execution\.
- It signals their collaboration capacity\.

That’s why we use a **dropdown** like:

- 12\+ \(minimum\)
- 25\+
- 50\+
- 100\+

This prevents bad data and aligns with the “group of 12” logic\.

# MCOM Rewards — Onboarding &amp; Contacts Form \(Developer Spec\)

**Purpose:** This document defines the *beginning steps* of onboarding in MCOM Rewards and the exact developer implementation for the &quot;number of contacts&quot; \+ follow\-up form that feeds group\-building\. It is written in simple English and covers UI, backend, data model, validations, flows, edge cases and acceptance criteria\.

## Overview \(high level\)

The onboarding flow is a seven\-step process\. The key step introduced here is Step 3 \(&quot;How Many Contacts Can You Bring?&quot;\) and the follow\-up Step 5 \(contact submission form\)\. These steps feed the &quot;My Network List&quot; and enable group building and campaign execution later\.

**Onboarding steps \(sequence\):**

1. Verify Email &#x2F; OTP
2. Business Profile Setup
3. **How Many Contacts Can You Bring?** \(dropdown selection\)
4. Subscription Selection
5. **Submit Actual Contact Names** \(form\) — optional to complete immediately; user can save progress and return
6. Create First Reward &#x2F; Campaign
7. Build Groups

> NOTE: The flow allows the user to continue past step 5 if they do not yet have contact details\. However the system should prominently surface the pending contact task until it is completed\.

## Goals

- Collect realistic, verifiable contact data from business owners\.
- Prevent nonsense inputs by using guided dropdowns\.
- Feed a canonical `NetworkList` used by Group Builder and Campaigns\.
- Allow users to save progress and return to the contact form later\.
- Surface platform\-sourced leads when users cannot supply contacts\.

## UX &#x2F; UI Requirements

All UI text must be plain and instructive\. Keep fields minimal\.

### Step 3: How Many Contacts Can You Bring? \(Screen\)

**Components:**

- Short explanation text \(1–2 lines\) telling why we ask this\.
- Dropdown with values: `12`, `25`, `50`, `100\+` \(developer configurable\)\.
- Tooltip &#x2F; info icon explaining what each bucket means\.
- Primary button: **Continue** — takes user to Step 4 \(Subscription Selection\)\.

**Validation:**

- Value required\.
- Default selection: `12` \(to encourage realistic baseline\)\.

**Notes for designers:**

- Keep the dropdown prominent\.
- Show a small progress indicator \(Step 3 of 7\)\.

### Step 5: Submit Actual Contact Names \(Form\)

**Accessibility:** The user must be able to save progress and return\. The form is also available from the Dashboard as &quot;Complete My Contact List&quot;\.

**Components \(per contact row\):**

- Contact full name \(required\)
- Business name \(required\)
- Email \(optional but recommended\)
- Phone\*
- Location tag \(radio&#x2F;select\): `Nearby` | `Hyperlocal` | `National` \(required\)

 **Tooltip:**

    1. **Nearby:** Businesses located very close to you \(your immediate neighbourhood or trading radius\)\.
    1. **Hyperlocal:** Businesses in your wider local area \(same town, district, or nearby zones\)\.
    2. **National:** Businesses anywhere within the country that you can collaborate with digitally or via shipping\.
- Relationship tag \(select\): `Partner` | `Supplier` | `Affiliate` | `Customer` \(optional\)

  **Tooltip:**

    1. **Partner:** Someone you will collaborate with through campaigns, rewards, or cross\-promotion\.
    1. **Supplier:** A business providing goods or services you may use or resell\.
    2. **Affiliate:** Someone who promotes your business using your affiliate link\.
    3. **Customer:** Someone who purchases from you and may later become a partner\.
- Source \(auto\): `User\-submitted` or `Platform\-provided`
- Add&#x2F;Remove row controls

**Form behavior:**

- Allow batch paste \(CSV\-friendly\): one contact per line with comma separated values\. Provide an &quot;Import&quot; helper for power users\.
- Allow user to save draft \(auto\-save every 15s or on change\) and to submit partial lists\.
- Show counter: `0 &#x2F; 25` \(if user selected 25\)\. If user selected `100\+` show `0 &#x2F; 100\+` or `0 &#x2F; 100` with note\.
- Enforce minimum before allowing use of certain features: require at least **1** contact to create a test campaign, require **12** for full group creation \(configurable by admin\)\.

**Validation rules:**

- Prevent duplicate entries by comparing `email` OR `phone` OR exact name\+business\.
- If email present, verify format client\-side\.
- Provide inline error messages and highlight invalid rows\.

**UX for incomplete submission:**

- If user exits the form without meeting their chosen number, save progress and create a task in Dashboard: &quot;Contacts \(Incomplete\) — Submit X more to reach your target&quot;\.
- Provide button: `Get Platform Leads` which will auto\-populate a supplemental list of platform\-sourced contacts to help them reach the chosen bucket\.

## Data Model \(minimum\)

Design a small set of tables &#x2F; collections\. Use names that are consistent with existing models\.

### Tables &#x2F; collections

- `users` \(existing\) — contains owner profile and onboardingState
- `business\_profiles` \(existing\) — business metadata
- `network\_contacts` \(new\)
    - `id` \(uuid\)
    - `owner\_id` \(FK \-&gt; business\_profiles\)
    - `full\_name` \(string\)
    - `business\_name` \(string\)
    - `email` \(string\)
    - `phone` \(string\)
    - `location\_tag` \(enum: nearby|hyperlocal|national\)
    - `relationship\_tag` \(enum\)
    - `source` \(enum: user\_submitted|plaque\_scan|affiliate|platform\)
    - `status` \(enum: pending|active|inactive\)
    - `created\_at`, `updated\_at`
- `onboarding\_contact\_goal` \(new\)
    - `owner\_id` \(FK\)
    - `selected\_bucket` \(int or string: 12,25,50,100\)
    - `created\_at`, `updated\_at`
- `group\_membership` \(reuse existing\) — membership references `network\_contacts`

## Backend API Endpoints \(suggested\)

- `POST &#x2F;api&#x2F;onboarding&#x2F;contact\-goal` \{ bucket \} — save chosen number
- `GET &#x2F;api&#x2F;onboarding&#x2F;contact\-goal` — read chosen number
- `POST &#x2F;api&#x2F;network\_contacts` — add single contact \(body with contact fields\)
- `POST &#x2F;api&#x2F;network\_contacts&#x2F;batch` — batch add \(CSV or array\)
- `GET &#x2F;api&#x2F;network\_contacts?owner\_id=` — list owner contacts
- `PUT &#x2F;api&#x2F;network\_contacts&#x2F;:id` — update
- `DELETE &#x2F;api&#x2F;network\_contacts&#x2F;:id` — delete
- `GET &#x2F;api&#x2F;platform\_leads?sector=&amp;location=` — returns platform\-sourced supplemental leads

All endpoints must return consistent errors and support pagination for list endpoints\.

## Admin &#x2F; Account Manager UX

- Admin dashboard shows: owner contact goal, actual contacts submitted, percent complete\.
- Flag business owners with incomplete contact lists for outreach\.
- Provide admin action: `Inject platform leads` that will add contacts with `source=platform` to the owner&#39;s `network\_contacts` \(do not mark as user\_submitted\)\.

## Plaque and Affiliate Integration \(where they connect\)

- When a plaque is scanned, create a `network\_contacts` record with `source=plaque\_scan` and status `pending` until confirmed by owner\.
- When an affiliate link sign\-up occurs, create a `network\_contacts` record for the referrer owner with `source=affiliate` or add the new user to the referrer’s `affiliate\_list` \(separate list\)\. Platform designers decide if affiliates are contacts or separate entities; recommended: keep affiliates as `affiliate\_list` but expose them as selectable members during group\-building\.

## Dashboard &amp; Reminders

- Dashboard tile &quot;Contacts to submit&quot; with CTA: `Complete my contact list`\.
- Email&#x2F;SMS reminders \(configurable cadence\) for owners with incomplete lists\.
- Task list item shows how many contacts needed to reach the bucket\.

## Platform\-provided leads \(fallback\)

- If after X days the owner still hasn’t provided required contacts, platform auto\-injects leads from `platform\_leads` to the owner’s `network\_contacts` with `source=platform`\.
- These leads are presented to the owner with the tag: &quot;Suggested partner — Platform&quot;\.

## Acceptance Criteria &#x2F; Tests

1. Choosing a bucket saves `onboarding\_contact\_goal` and displays the correct bucket in the dashboard\.
2. User can add contacts one\-by\-one and in batch\. Each contact is saved to `network\_contacts`\.
3. Form auto\-saves and preserves partial data if user leaves and returns\.
4. Duplicate contacts are prevented\.
5. If user selects `25` but submits fewer, dashboard shows `X &#x2F; 25` and reminder task appears\.
6. Account manager can inject platform leads and owner will see them marked as platform\-provided\.
7. Plaque scans create `network\_contacts` automatically \(pending confirmation\)\.
8. Affiliates added via link are reflected in the owner’s affiliate list and optionally selectable when building groups\.

## Edge Cases &amp; Notes

- For `100\+`, store the selected value as `100\_plus` and treat target as advisory rather than strict numeric enforcement\.
- If user deletes contacts after submission, the dashboard updates progress immediately and triggers reminder if below bucket\.
- Allow cross\-referencing: if two owners submit the same company, system should allow but mark as &quot;potential duplicate&quot;\.
- Privacy: store only what is necessary; do not automatically invite or spam contacts\. All outreach must be consent\-driven\.

## Rollout Plan \(minimum\)

1. Implement backend models and endpoints\.
2. Build Step 3 UI \(dropdown\) \+ save API\.
3. Build contact submission form with save\-draft and batch import features\.
4. Hook the Dashboard reminder tile and Admin view\.
5. Add platform leads injection flow and basic plaque scan handler\.
6. QA and acceptance tests\.

## Final Notes \(developer quick checklist\)

-  Dropdown values configurable in admin settings
-  Auto\-save \+ draft support
-  Batch import &amp; dedupe
-  Dashboard task \+ reminder system
-  Platform leads injection API
-  Plaque scan endpoint mapping to `network\_contacts`
-  Admin&#x2F;AM view to monitor progress

If you want, I will now create a matching **UI flow visual** and an **API contract \(OpenAPI\)** for the endpoints listed above\.

