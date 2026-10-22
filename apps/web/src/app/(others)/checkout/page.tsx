import { redirect } from "next/navigation";

/**
 * The legacy direct-Stripe/PayPal checkout has been retired.
 * Plans are now purchased in-app through MCOM Pay.
 */
export default function LegacyCheckoutPage() {
  redirect("/dashboard/subscription");
}
