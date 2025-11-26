'use client';

import { ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Only attempt to load Stripe if the publishable key is available
export const stripePromise: Promise<Stripe | null> | null = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

const StripeProvider = ({ children }: { children: ReactNode }) => {
  if (!stripePromise) {
    // Render a fallback or error message if the key is missing
    console.error("Stripe publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is not set. Stripe will not function.");
    return (
      <div className="text-red-500">
        Stripe is not configured. Please check environment variables.
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeProvider;
