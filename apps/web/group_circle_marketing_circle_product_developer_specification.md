## Purpose and Scope
This document explains, in product-manager detail, how **Group Circles (Marketing Circles)** must be developed for M‑COM / 247 GBS, based strictly on the *Marketing Circle update* document. It is written for frontend and backend developers to implement without ambiguity.

Group Circles are the **core execution layer** that sits **after My Network(`src\app\dashboard\my-assets\page.tsx` it will be a subpage of my assets)**. Businesses first build structured lists in *My Network*, then convert selected lists into **interactive, dynamic Group Circles** for marketing, advertising, seasonal campaigns, and Smart Money Partner Finance Networks.

---

## Foundational Rules (Non‑Negotiable)

1. **Every Business Owner / Member must create two mandatory Group Circles**:
   - **Marketing Group Circle**
   - **Advertising Group Circle**

   These are system‑required and must be created during onboarding or first access to Group Circles.

2. Businesses may create **unlimited additional Group Circles** depending on:
   - Membership tier (Bronze, Silver, Gold, Platinum)
   - Campaign type (Nearby, Hyperlocal, National, Global)
   - Use case (Marketing, Advertising, Seasonal Campaigns, Smart Money Groups)

3. **Group Circles are always built from lists**, never from scratch.
   - Lists originate in **My Network**.
   - Group Circles are a *layer on top of lists*.

---

## Relationship Between My Network and Group Circles

### My Network (Already Developed)
My Network is the **data intake and organisation layer**.

Businesses can create lists from:
- Manual Contacts (B2B / B2C)
- QR Plaque Scans
- Affiliate Signups
- Traffic & Leads Directory (247 GBS)
- Other approved sources

Each list has:
- Type (B2B or B2C)
- Geography (Nearby, Hyperlocal, National, Global)
- Status (Active / Inactive)

### Group Circles (This Feature)
Group Circles **consume** My Network lists.

A Group Circle:
- References one or more lists
- Applies rules, roles, and interaction logic
- Enables communication, collaboration, and campaigns

---

## Step‑by‑Step Group Circle Creation Logic

### Step 1: Select Lists
When creating a Group Circle, the business must:
- Choose one or more existing lists from My Network
- See list metadata (size, source, geography)

System guidance:
- Recommend starting with **25 members**
- Allow shortlisting down to **12 core members** for active campaigns

---

### Step 2: Define Group Circle Type

Required selection:
- Marketing Circle
- Advertising Circle
- Nearby Campaign Circle
- Hyperlocal Campaign Circle
- National Campaign Circle
- Global Campaign Circle
- Smart Money Partner Finance Network Circle

Each type determines:
- UI behaviour
- Permissions
- Financial features (if any)

---

### Step 3: Group Circle Configuration

Configuration fields:
- Group name
- Description / purpose
- Campaign duration (90, 180, 270, 360 days)
- Visibility (private / invite only)
- Interaction level (read, message, collaborate)

---

## Mandatory Group Circle Behaviour (Dynamic & Interactive)

Group Circles **must not be static**.

Each Group Circle must support:

### 1. Member Interaction
- Member‑to‑member messaging
- Group messaging
- Activity feed (joins, messages, updates)

### 2. Hover / Tap Profile Preview
On hover or tap:
- Profile photo
- Business name
- Category
- Quick actions:
  - View Profile
  - Send Message
  - Add Category

---

## Adding New Contacts to a Group Circle

Group Circles must allow **continuous growth**.

### Supported Methods
1. **Add from My Network**
   - Select additional contacts from existing lists

2. **Add from Traffic & Leads Directory**
   - Subject to membership level
   - Pay‑as‑you‑go or free access

3. **Manual Invite**
   - Invite external partners (agents, consultants, managers)

All added contacts:
- Must inherit the Group Circle rules
- Must appear instantly in the circle UI

---

## Group Circle Design Logic (Visual + Functional)

### Circle Layout Rules
- Members displayed in a **circular or radial layout**
- Core members closer to the center
- Peripheral or new members toward the outer ring

### Dynamic Behaviour
- Circle expands as members are added
- Active members visually prioritised
- Inactive members visually de‑emphasised

---

## Filters and Controls

Each Group Circle must support filters:
- Category
- Location
- Activity status
- Role (core, peripheral, banker, partner)

Filter UI must update the circle in real time.

---

## Smart Money Partner Finance Network Circles

This is a **special Group Circle type** with financial logic.

### Rules
- Minimum: 6 members
- Maximum: 12 members
- One designated **Banker**

### Financial Logic
- Weekly contributions based on membership tier
- Rotational payout (round‑robin)
- Draw dates assigned on acceptance
- Swap / barter draw dates supported

### Banker Responsibilities
- Collect funds
- Cover one missed payment per cycle
- Receive weekly management incentive

---

## Membership Tier Impact

| Tier | Duration | Weekly Amount |
|---|---|---|
| Bronze | 90 Days | £25 |
| Silver | 180 Days | £50 |
| Gold | 270 Days | £75 |
| Platinum | 360 Days | £100 |

System must enforce limits automatically.

---

## Messaging and Activity Examples

Each Group Circle includes:
- Messages tab
- Member list tab
- Activity log

Profile summary panel:
- Name
- Category
- Contact actions

---

## Key Problems This Design Solves

- Makes circles **interactive and alive**
- Enables ongoing member growth
- Adds clear structural logic to circle design
- Aligns with seasonal marketing and finance workflows

---

## Final Developer Notes

- Group Circles are **stateful objects**, not static views
- They depend entirely on My Network data integrity
- All actions must be auditable and reversible

This specification must be followed exactly to ensure alignment with 247 GBS, M‑COM Rewards, and M‑COM to E‑COM Expo systems.

