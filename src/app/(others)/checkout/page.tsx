'use client'

import { Suspense, useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Award, Medal, Trophy, Crown, Target, BadgePercent, Loader2, CreditCard, LucideIcon, Sparkles } from "lucide-react"
import { applyCoupon, findCoupon, type BillingCycle } from "@/lib/content"
import { useGetTiers, useStripeInitiate, usePayPalInitiate, useStripeVerify, useGetPointPackagesByTier, useJoinTrial } from "@/services/payment/hook"
import { PlanType, PaymentProvider, PointPackage, StripeInitiateRequest } from "@/services/payment/types"
import { toast } from "sonner"
import { Elements } from '@stripe/react-stripe-js';
import PayPalButton from "@/components/paypal-button"
import { stripePromise } from "@/components/stripe-provider"
import StripePaymentForm from "@/components/stripe-payment-form"
import { Checkbox } from "@/components/ui/checkbox"

const iconByTier: Record<string, LucideIcon> = {
  Trial: Target,
  Bronze: Award,
  Silver: Medal,
  Gold: Trophy,
  Platinum: Crown,
}

function CheckoutContent() {
  const params = useSearchParams()
  const router = useRouter()
  const initialPlan = params.get("plan") || "Bronze"
  const rawBilling = params.get("billing")
  const initialBilling: BillingCycle = rawBilling === "annual" ? "annual" : "quarterly"
  const initialCoupon = params.get("coupon") || ""
  const isTrialMode = params.get("isTrial") === "true"

  const [plan, setPlan] = useState(initialPlan)
  const [billing, setBilling] = useState<BillingCycle>(initialBilling)
  const [couponCode, setCouponCode] = useState(initialCoupon)
  const [appliedCoupon, setAppliedCoupon] = useState(() => findCoupon(initialCoupon))
  const [couponError, setCouponError] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(PaymentProvider.STRIPE)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  // Fetch tiers and point packages from backend
  const { data: tiers, isLoading: isLoadingTiers } = useGetTiers();

  const { mutate: initiateStripe, isPending: isInitiatingStripe } = useStripeInitiate();
  const { mutate: initiatePayPal, isPending: isInitiatingPayPal } = usePayPalInitiate();
  const { mutate: verifyStripe, isPending: isVerifyingStripe } = useStripeVerify();
  const { mutate: joinTrial, isPending: isJoiningTrial } = useJoinTrial();

  const isProcessing = isInitiatingStripe || isInitiatingPayPal || isJoiningTrial;

  // Find the selected tier object from backend data
  // We check both name and ID to be robust, as params might pass either
  const tier = useMemo(() => {
    if (!tiers) return null;
    return tiers.find(t => t.name === plan || t.id === plan);


  }, [tiers, plan]);

  const { data: pointPackages } = useGetPointPackagesByTier(tier?.id);

  const Icon = tier ? (iconByTier[tier.name] ?? Target) : Target

  const basePrice = useMemo(() => {
    if (!tier) return 0;
    return billing === "annual" ? parseFloat(tier.annualPrice) : parseFloat(tier.quaterlyPrice);
  }, [tier, billing]);

  const { final, discount } = useMemo(() => applyCoupon(basePrice, appliedCoupon), [basePrice, appliedCoupon])

  // Calculate add-ons total
  const addOnsTotal = useMemo(() => {
    if (!pointPackages || selectedAddOns.length === 0) return 0;
    return selectedAddOns.reduce((total, packageId) => {
      const pkg = pointPackages.find(p => p.id === packageId);
      return total + (pkg ? parseFloat(pkg.price) : 0);
    }, 0);
  }, [pointPackages, selectedAddOns]);

  const grandTotal = final + addOnsTotal;

  const toggleAddOn = (packageId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  useEffect(() => {
    const qs = new URLSearchParams()
    qs.set("plan", plan)
    qs.set("billing", billing)
    if (appliedCoupon) qs.set("coupon", appliedCoupon.code)
    const next = `/checkout?${qs.toString()}`
    router.replace(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, billing, appliedCoupon])

  if (isLoadingTiers) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!tier) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Selected plan not found.</p>
          <Link href="/pricing" className="underline text-primary">Go back to pricing</Link>
        </div>
      </main>
    )
  }

  const apply = () => {
    const found = findCoupon(couponCode)
    if (!found) {
      setAppliedCoupon(undefined)
      setCouponError("Coupon expired or not valid.")
    } else {
      setAppliedCoupon(found)
      setCouponError(null)
    }
  }

  const handleConfirmPurchase = () => {
    if (!tier) return;

    // If trial mode, call the trial endpoint directly
    if (isTrialMode) {
      joinTrial(
        { tier_id: tier.id },
        {
          onSuccess: (data) => {
            toast.success(`Trial started successfully! Your trial expires on ${new Date(data.expiresAt).toLocaleDateString()}`);
            // Redirect to dashboard after successful trial join
            router.push('/dashboard/subscription');
          },
          onError: (error) => {
            console.error("Trial join failed:", error);
            toast.error("Failed to start trial. Please try again or contact support.");
          }
        }
      );
      return;
    }

    // Regular payment flow
    const planType = billing === "annual" ? PlanType.ANNUALLY : PlanType.QUARTERLY;

    const paymentPayload: StripeInitiateRequest = {
      tier_id: tier.id,
      plan_type: planType,
      point_package_ids: selectedAddOns,
    };

    if (appliedCoupon?.code) {
      paymentPayload.coupon_code = appliedCoupon.code;
    }

    if (paymentProvider === PaymentProvider.STRIPE) {
      initiateStripe(paymentPayload, {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
          toast.success("Payment initiated!");
        },
        onError: (error) => {
          console.error("Stripe initiation failed:", error);
          toast.error("Failed to initiate Stripe payment. Please try again.");
        }
      });
    } else {
      initiatePayPal(paymentPayload, {
        onSuccess: (data) => {
          toast.success("Redirecting to PayPal...");
          console.log("PayPal Order ID:", data.orderId);

          if (data.approveLink) {
            window.location.href = data.approveLink;
          } else {
            const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${data.orderId}`;
            window.location.href = paypalUrl;
          }
        },
        onError: (error) => {
          console.error("PayPal initiation failed:", error);
          toast.error("Failed to initiate PayPal payment. Please try again.");
        }
      });
    }
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Checkout</h1>
        {isTrialMode && (
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold text-sm">
            🎉 Trial Mode - No Charge Now
          </span>
        )}
      </div>

      <section className="rounded-3xl border-2 border-border p-6 mb-8 bg-card">
        <div className="flex items-center gap-4 mb-4">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </span>
          <div>
            <div className="text-sm text-foreground/60">Selected plan</div>
            <div className="text-xl font-semibold">{tier.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setBilling("quarterly")}
            className={`px-4 py-2 rounded-full ${billing === "quarterly" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-4 py-2 rounded-full ${billing === "annual" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            Annual
          </button>
          <div className="ml-auto text-right">
            <div className="text-sm text-foreground/60">Price</div>
            <div className="text-2xl font-bold">£{basePrice}{billing === "annual" ? "/year" : "/quarter"}</div>
          </div>
        </div>
        {billing === "annual" && (
          <p className="text-xs text-foreground/60 mt-2">Annual price is quarterly × 4.</p>
        )}
      </section>

      <section className="rounded-3xl border-2 border-border p-6 mb-8 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <BadgePercent className="w-5 h-5 text-primary" />
          <div className="font-semibold">Promo code</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-4 py-3 rounded-lg border bg-background"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button onClick={apply} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground">Apply</button>
        </div>
        {couponError && <p className="text-destructive mt-2 text-sm">{couponError}</p>}
        {appliedCoupon && !couponError && (
          <p className="text-foreground/70 mt-2 text-sm">Applied {appliedCoupon.code}: {appliedCoupon.discountPercent}% off</p>
        )}
      </section>

      {/* Add-ons Section */}
      {pointPackages && pointPackages.length > 0 && (
        <section className="rounded-3xl border-2 border-border p-6 mb-8 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="font-semibold">Add-ons (Optional)</div>
          </div>
          <div className="space-y-4">
            {pointPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddOns.includes(pkg.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
                  }`}
                onClick={() => toggleAddOn(pkg.id)}
              >
                <Checkbox
                  checked={selectedAddOns.includes(pkg.id)}
                  onCheckedChange={() => toggleAddOn(pkg.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{pkg.name}</div>
                    <div className="font-bold">
                      {pkg.currency === 'GBP' ? '£' : '$'}
                      {parseFloat(pkg.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-foreground/70 mt-1">
                    {pkg.points.toLocaleString()} points
                  </div>
                  {pkg.description && (
                    <div className="text-xs text-foreground/50 mt-1">{pkg.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border-2 border-border p-6 mb-8 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <div className="font-semibold">Payment Method</div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setPaymentProvider(PaymentProvider.STRIPE)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${paymentProvider === PaymentProvider.STRIPE ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <div className="font-semibold">Credit Card (Stripe)</div>
          </button>
          <button
            onClick={() => setPaymentProvider(PaymentProvider.PAYPAL)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${paymentProvider === PaymentProvider.PAYPAL ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <div className="font-semibold">PayPal</div>
          </button>
        </div>
        {paymentProvider === PaymentProvider.STRIPE && clientSecret && (
          <div className="mt-4">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                onSuccess={(transactionId) => {
                  toast.success(`Payment successful! Transaction ID: ${transactionId}`);
                  // Here you can add logic to update the user's subscription,
                  // redirect to a confirmation page, etc.
                  router.push("/confirmation");
                }}
              />
            </Elements>
          </div>
        )}
        {paymentProvider === PaymentProvider.PAYPAL && (
          <div className="mt-4">
            <PayPalButton
              tier_id={tier.id}
              plan_type={billing === "annual" ? "annual" : "quarterly"}
              coupon_code={appliedCoupon?.code || ""}
              onPaymentSuccess={async (details, orderId) => {
                console.log("Payment successful:", details);
                toast.success("Payment confirmed! Updating your subscription...");

                try {
                  const res = await fetch("/api/update-subscription", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      userId: "123", // Replace with actual user ID
                      tierId: tier.id,
                      planType: billing === "annual" ? "annually" : "quarterly",
                      paymentId: orderId,
                    }),
                  });

                  const data = await res.json();

                  if (data.success) {
                    toast.success("Subscription updated! Redirecting...");
                    router.push("/confirmation");
                  } else {
                    toast.error("Failed to update subscription. Please contact support.");
                  }
                } catch (error) {
                  console.error("Error updating subscription:", error);
                  toast.error("An error occurred while updating your subscription.");
                }
              }}
              onPaymentError={(error) => {
                console.error("Payment error:", error);
                toast.error("Payment failed. Please try again.");
              }}
            />
          </div>
        )}
      </section>

      <section className="rounded-3xl border-2 border-border p-6 mb-8 bg-card">
        <div className="font-semibold mb-2">Summary</div>
        <div className="flex items-center justify-between py-2">
          <span>Base price</span>
          <span>£{basePrice}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between py-2 text-foreground/70">
            <span>Discount</span>
            <span>-£{discount}</span>
          </div>
        )}
        {addOnsTotal > 0 && (
          <div className="flex items-center justify-between py-2 text-foreground/70">
            <span>Add-ons</span>
            <span>+£{addOnsTotal.toFixed(2)}</span>
          </div>
        )}
        {isTrialMode && (
          <div className="flex items-center justify-between py-2 text-green-600 dark:text-green-400">
            <span>Trial Period Discount</span>
            <span>-£{final}</span>
          </div>
        )}
        <div className="flex items-center justify-between py-2 text-xl font-bold border-t mt-2 pt-3">
          <span>Total due {isTrialMode ? "today" : billing === "annual" ? "(per year)" : "(per quarter)"}</span>
          <span>£{isTrialMode ? addOnsTotal.toFixed(2) : grandTotal.toFixed(2)}</span>
        </div>
        {isTrialMode ? (
          <p className="text-sm text-foreground/70 mt-3">
            🎉 <strong>14-day free trial</strong> - Your card will be authorized but not charged. After the trial, you'll be billed £{final} {billing === "annual" ? "annually" : "quarterly"}.
          </p>
        ) : (
          <p className="text-sm text-foreground/70 mt-3">All plans include Done-For-You Services, Marketing Assets and Automation Support.</p>
        )}
      </section>

      {paymentProvider === PaymentProvider.STRIPE && !clientSecret && (
        <div className="flex items-center justify-between">
          <Link href="/pricing" className="underline text-foreground/70">Back to pricing</Link>
          <button
            onClick={handleConfirmPurchase}
            disabled={isProcessing}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : isTrialMode ? 'Start Free Trial' : 'Proceed to Payment'}
          </button>
        </div>
      )}
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
