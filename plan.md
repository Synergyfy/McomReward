# FULL STAMP SYSTEM DEVELOPER DOCUMENTATION

This document explains the complete structure, logic, and user flow for how *Stamps* must work inside the MCOM Reward System. It includes:

* Admin Stamp Reward Builder
* Business Stamp Reward UI Flow
* Consumer Stamp Card UI Flow
* Developer Logic (Backend + Frontend behaviour)
* Stamp + Points Hybrid Logic

The language is simple, clear, and non‑technical so all product, design, and developer teams can easily understand it.

---

## 1. OVERVIEW OF HOW STAMPS WORK

A Stamp Reward is a type of loyalty program where a customer earns *stamps* each time they perform a required action. When they complete all the stamps, they unlock a reward.

Example: “Collect 5 stamps, get a free item.”

Stamps are controlled by *Admin*, not by the business owner. Businesses only select and activate Stamp Reward Templates created by Admin.

---

# 2. ADMIN STAMP REWARD BUILDER

This is where Admin creates all Stamp Reward Templates. Businesses cannot change the design or rules.

### ADMIN BUILDER FIELDS

Admin sees a new section under *Rewards → Create Reward Template → Stamp Reward*.

Admin must enter:

### 2.1 Reward Title

A simple name for the reward.
Example: “Buy 5, Get 1 Free”.

### 2.2 Reward Description

A short explanation about how customers earn stamps and what they will get.

### 2.3 Number of Stamps Required

Admin chooses how many stamps a customer must earn before unlocking the reward.
Examples: 4, 5, 8, 10.

### 2.4 Reward Benefit (What the customer gets)

Admin chooses the reward the customer will receive after completing the stamps.
Examples:

* Free item
* Discount
* Free service
* Bonus points

### 2.5 Stamp Trigger Method

Admin chooses how customers receive a stamp:

* *QR Scan* – Business scans customer QR to give stamp.
* *Automatic After Purchase* – Given when customer completes a verified purchase.
* *Automatic After Check‑In* – Given when customer checks in at the business.

### 2.6 Expiration Rules

Admin can set:

* Stamp validity period (optional)
* Reward claim deadline (optional)

### 2.7 Visibility Settings

Admin decides:

* Which businesses can access the reward
* Whether consumers can redeem it immediately

### 2.8 Publish Template

Once Admin clicks *Publish*, the Stamp Reward Template appears in the Business Reward Library and is available for businesses to activate.

---

# 3. BUSINESS STAMP REWARD UI FLOW

Businesses cannot change the stamp structure, only activate it.

Business must follow this flow:

## 3.1 View Available Stamp Rewards

Business Dashboard → Rewards → Template Library → "Stamp Rewards"

They see a list of all Admin-created Stamp Templates with:

* Title
* Description
* Number of stamps required
* Reward benefit

## 3.2 Preview Template

When the business taps a template, they see:

* Full stamp card preview
* How stamps are earned
* Reward customers receive
* Terms & Conditions

## 3.3 Activate Template

When business taps *Activate*, they must confirm:

* Use default reward structure
* Use default stamp count
* Use default triggering method

Business can ONLY customize:

* Display image
* Operating hours (optional)
* Reward availability (optional)

After activation, the reward appears:

* On their business page
* Inside the Consumer Reward lists

## 3.4 Viewing Active Stamp Rewards

Business Dashboard → Rewards → Active

For each active Stamp Reward, the business sees:

* Total customers enrolled
* Number of customers who completed stamps
* Number of redemptions

## 3.5 Redeeming Completed Rewards

When a customer finishes all stamps, they show a QR to the business.

Business scans: *“Mark as Redeemed”*.

This closes that reward cycle for that customer.

---

# 4. CONSUMER STAMP CARD UI FLOW

This is how customers interact with stamps.

## 4.1 Discovering Stamp Rewards

Consumers can find stamp rewards in:

* Business profile page → Rewards Tab
* Home Feed (if featured)
* "My Rewards" dashboard

## 4.2 Viewing the Stamp Card

When the consumer opens the reward, they see:

* Stamp progress (example: 2/5 stamps filled)
* What they will get after completion
* How to earn stamps

The stamp card must visually show:

* Empty stamp slots
* Filled stamp slots

## 4.3 Earning a Stamp

Depending on the trigger method:

* Business scans consumer QR to add stamp
* Stamp is added automatically after verified purchase
* Stamp is added automatically after check-in

The app updates the card immediately.

## 4.4 Completing All Stamps

When consumer reaches required stamp count:

* Card displays “Reward Unlocked”
* Consumer sees a “Redeem Now” button

## 4.5 Redeeming Reward

Consumer goes to the business and shows their reward QR.
Business scans it to mark it as used.

After redemption:

* A new empty card starts automatically (if the reward is repeatable)

---

# 5. DEVELOPER LOGIC (BACKEND + FRONTEND)

## 5.1 Creating a Stamp Card for Customer

When a customer interacts with a Stamp Reward for the first time:

* System checks if they already have a card.
* If not, system creates a new stamp card with:

  * 0 stamps
  * Required stamp count
  * Status: "In Progress"

## 5.2 Adding a Stamp

When a trigger happens:

* Verify business identity
* Verify that the stamp method matches the template
* Add +1 stamp
* Update progress
* Log event in reward history

## 5.3 Completing a Stamp Card

When customer hits the required stamp count:

* System changes card status to "Completed"
* Customer can now redeem reward

## 5.4 Redeeming Reward

After business scans customer QR:

* System checks if reward is completed
* System marks reward as "Redeemed"
* If template is repeatable, create new empty card

## 5.5 Anti‑Fraud Rules

* Businesses cannot manually add stamps
* Admin-only templates prevent misuse
* Consumer QR must be validated with server
* Each trigger must store the source of stamp

---

# 6. STAMP + POINTS HYBRID LOGIC

Hybrid mode means the customer earns both:

* 1 stamp per required action
* A set number of points (optional)

Admin can turn on hybrid mode during template creation.

### Example

Each stamp = 5 bonus points.

### Developer Rules for Hybrid

* When a stamp is added, the system also adds points to consumer wallet.
* If customer completes the stamp card, they only receive the stamp reward, not extra points (unless Admin enables a completion bonus).

### Hybrid Options Admin Can Enable

1. *Points per stamp* (default: off)
2. *Bonus points for completing the card* (default: off)
3. *Points-only fallback* if stamp cannot be earned due to system error

---

# 7. HOW ALL PARTS CONNECT

1. Admin creates stamp templates.
2. Businesses activate templates.
3. Consumers collect stamps.
4. Businesses verify and redeem.
5. Admin sees all analytics from backend.

---

# 8. WHAT DEVELOPERS MUST BUILD

### BACKEND

* Stamp Template System (Admin-only)
* Stamp Card System for each consumer
* Stamp Trigger Engine (QR, check-in, purchase)
* Reward Unlock and Redemption Engine
* Hybrid Stamp + Points Engine

### FRONTEND – ADMIN

* Template Builder UI
* Template Preview UI

### FRONTEND – BUSINESS

* Template Library List
* Preview + Activate Screens
* Reward Analytics
* Reward Redemption Scanner

### FRONTEND – CONSUMER

* Stamp Card Display Component
* Stamp Progress Bar
* Redeem QR Code Screen
* Reward History

---

# 9. END OF DOCUMENT

This is the full Stamp System documentation covering Admin setup, Business flows, Consumer experience, and developer logic. All required sections have been included.