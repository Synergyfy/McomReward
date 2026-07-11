# What should exist today

## Admin Side

Admin creates:

### Sector Templates

Examples:

### Restaurant Template

Contains:

* Points
* Stamp Card
* Birthday Campaign
* Referral Campaign

---

### Retail Template

Contains:

* Points
* Vouchers
* Gift Cards
* Referral Rewards

---

### Salon Template

Contains:

* Points
* Visit Stamps
* Birthday Campaign

---

### Hotel Template

Contains:

* Points
* Stay Rewards
* Voucher Campaigns

---

Admin configures:

* [ ] Which modules are included.
* [ ] Default point earning rules.
* [ ] Default redemption rules.
* [ ] Default expiry rules.
* [ ] Default campaign rules.
* [ ] Which modules are editable by businesses.
* [ ] Which modules are locked.

---

## Business Side

Business enters Reward & Loyalty.

System already knows:

* Sector.
* Category.
* Audit recommendations.
* Membership level.

System loads:

> Recommended Loyalty Package

Example:

```text
Recommended for Restaurants

✓ Points Programme
✓ Stamp Card
✓ Birthday Campaign
✓ Referral Campaign
```

Business clicks:

**Activate Programme**

Done.

No wizard.

No setup questions.

No loyalty design work.

---

## Backend Creates

Automatically:

* Points Engine
* Stamp Engine
* Voucher Engine
* Campaign Engine

depending on the template.

---

## Business Dashboard

Business sees:

### Points

* Active
* Rules
* Issued
* Redeemed

---

### Stamps

* Active campaigns
* Completions
* Rewards issued

---

### Vouchers

* Active vouchers
* Usage rates

---

### Gift Cards

* Active gift cards
* Balances

---

### Campaigns

* Birthday
* Referral
* Seasonal

---

# Future Integrations

Later:

```text
Reward Source
```

can become:

* MCOM Rewards
* ADMIN
* PREZZEE
* RETAIL PARTNER API
* BRAND API

without redesigning the frontend.

The frontend only needs:

```text
Reward
Provider
Value
Expiry
Status
```

The source becomes irrelevant.

---

# Product Management Recommendation

Build in this order:

## Version 1

* Admin templates.
* Business activation.
* Points.
* Stamps.
* Vouchers.
* Gift Cards.
* Campaigns.

## Version 2

* External reward providers.
* Affiliate providers.
* Brand catalogues.
* Coalition rewards.

## Version 3

* Dynamic recommendation engine.
* Multi-provider reward marketplace.