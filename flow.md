# Business Onboarding Subscription Flow Implementation Plan

This document outlines the step-by-step plan to integrate a subscription selection page into the business onboarding flow. The goal is to create a professional, visually appealing, and seamless experience for new business users.

## 1. Create the New Subscription Page

-   **Action**: Create a new page at `src/app/business/subscription/page.tsx`.
-   **Directory**: This will require creating a new `subscription` directory within `src/app/business`.
-   **Details**:
    -   This page will be the central hub for the new subscription selection step.
    -   It will display four subscription plans: **Bronze**, **Silver**, **Gold**, and **Platinum**.
    -   The design will be modern and professional, with a clear hierarchy to guide the user. I will use a clean layout, good typography, and potentially a featured plan to draw attention.
    -   Each plan will be presented in a dedicated card, showing its features, price, and a clear call-to-action (CTA) button like "Choose Plan" or "Start Free Trial".

## 2. Design and Build Reusable Components

To ensure a high-quality and maintainable implementation, I will create the following reusable components:

-   **Plan Card Component**:
    -   **File**: `src/components/business/subscription/PlanCard.tsx`
    -   **Details**: This component will be responsible for displaying a single subscription plan. It will accept plan data as props (name, price, features, etc.). It will also have a visual state to indicate if it's a "recommended" or "most popular" plan.

-   **Payment Modal Component**:
    -   **File**: `src/components/business/subscription/PaymentModal.tsx`
    -   **Details**: This modal will be triggered when a user clicks the CTA on a `PlanCard`.
        -   It will contain a mock form for credit card details (Card Number, Expiry Date, CVC, Cardholder Name).
        -   The form will have basic validation for a better UX.
        -   The "Confirm Payment" button will simulate an API call (e.g., with a short delay) and, upon "success," trigger the final redirection to the business dashboard.

## 3. Update the Onboarding Form Logic

The core of this change is redirecting the user to the new subscription page after they complete their initial onboarding.

-   **Action**: Modify the `BusinessOnboard` form component, which is located at `src/components/Forms/BusinessOnboarding.tsx`.
-   **Details**:
    -   I will locate the form submission handler (e.g., `onSubmit` or a similar function).
    -   Inside this handler, upon successful submission, I will change the existing `router.push('/dashboard')` to `router.push('/business/subscription')`.

## 4. Create Mock Data for Subscription Plans

To populate the subscription page, I will create a structured mock data file.

-   **Action**: Create a new file at `src/lib/mock-data/business-plans.ts`.
-   **Details**: This file will export an array of plan objects. Each object will contain:
    -   `id`: A unique identifier.
    -   `name`: e.g., "Bronze".
    -   `price`: e.g., "$29/mo".
    -   `features`: An array of strings listing the benefits of the plan.
    -   `isRecommended`: A boolean to flag the "most popular" plan.

## 5. Implement the Full Page Logic for `subscription/page.tsx`

With the components and data ready, I will assemble the subscription page.

-   **Action**: Develop the logic within `src/app/business/subscription/page.tsx`.
-   **Details**:
    -   Import the plans from the mock data file.
    -   Use React state (`useState`) to manage the visibility of the `PaymentModal` and to store the currently selected plan.
    -   Map over the plans data to render a `PlanCard` for each.
    -   Pass a handler function to each `PlanCard` that, when triggered, will set the selected plan in state and open the `PaymentModal`.
    -   The `PaymentModal`'s confirmation handler will contain the `router.push('/dashboard')` logic.

## 6. Styling and User Experience (UX) Enhancements

To meet the "stunning" and "professional grade" requirement, I will focus on the following:

-   **Styling**: Use `tailwindcss` for a consistent and modern look, adhering to the project's existing design system.
-   **Animations**: Employ `framer-motion` for subtle page transitions and modal animations to create a fluid and engaging experience.
-   **Responsiveness**: Ensure the layout is fully responsive and looks great on devices of all sizes, from mobile to desktop.
-   **Guidance**: Add a clear title (e.g., "Choose Your Plan") and a brief, encouraging subtitle at the top of the subscription page to provide context and guide the user.

## Execution Flow

1.  **Create `flow.md`**: This file.
2.  **Create `src/lib/mock-data/business-plans.ts`**.
3.  **Create `src/components/business/subscription` directory**.
4.  **Build `PlanCard.tsx` and `PaymentModal.tsx` components**.
5.  **Create `src/app/business/subscription` directory and the `page.tsx` file**.
6.  **Modify `src/components/Forms/BusinessOnboarding.tsx` to update the redirect**.
7.  **Final review and polish** of the entire flow for a seamless user journey.
