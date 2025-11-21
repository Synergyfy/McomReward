'use client'

import { Suspense, useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Award, Medal, Trophy, Crown, Target, BadgePercent, Loader2, CreditCard } from "lucide-react"
import { applyCoupon, findCoupon, type BillingCycle } from "@/lib/content"
import { useGetTiers, useSubscribe } from "@/services/payment/hook"
import { PlanType, PaymentProvider, Tier } from "@/services/payment/types"
import { toast } from "sonner"

const iconByTier: Record<string, any> = {
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

  const [plan, setPlan] = useState(initialPlan)
  const [billing, setBilling] = useState<BillingCycle>(initialBilling)
  const [couponCode, setCouponCode] = useState(initialCoupon)
  const [appliedCoupon, setAppliedCoupon] = useState(() => findCoupon(initialCoupon))
  const [couponError, setCouponError] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(PaymentProvider.STRIPE)

  // Fetch tiers from backend
  const { data: tiers, isLoading: isLoadingTiers } = useGetTiers();
  const { mutate: subscribe, isPending: isSubscribing } = useSubscribe();

  // Find the selected tier object from backend data
  // We check both name and ID to be robust, as params might pass either
  const tier = useMemo(() => {
    if (!tiers) return null;
    return tiers.find(t => t.name === plan || t.id === plan);
  }, [tiers, plan]);

  const Icon = tier ? (iconByTier[tier.name] ?? Target) : Target

  const basePrice = useMemo(() => {
    if (!tier) return 0;
    return billing === "annual" ? tier.annual_price : tier.quaterly_price;
  }, [tier, billing]);

  const { final, discount } = useMemo(() => applyCoupon(basePrice, appliedCoupon), [basePrice, appliedCoupon])

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

    const planType = billing === "annual" ? PlanType.ANNUALLY : PlanType.QUARTERLY;

    // Mock payment token for Stripe for now as we don't have Stripe Elements integrated yet
    const mockToken = "tok_visa";

    subscribe({
      tier_id: tier.id,
      plan_type: planType,
      provider: paymentProvider,
      payment_token: paymentProvider === PaymentProvider.STRIPE ? mockToken : undefined,
      return_url: `${window.location.origin}/checkout/confirmation?plan=${encodeURIComponent(tier.name)}&billing=${billing}`,
      cancel_url: `${window.location.origin}/checkout?plan=${encodeURIComponent(tier.name)}&billing=${billing}`,
    }, {
      onSuccess: (data) => {
        if (paymentProvider === PaymentProvider.PAYPAL && 'approveLink' in data) {
          window.location.href = data.approveLink;
        } else {
          // Stripe success or other direct success
          router.push(`/checkout/confirmation?plan=${encodeURIComponent(tier.name)}&billing=${billing}`);
        }
      },
      onError: (error) => {
        console.error("Subscription failed:", error);
        toast.error("Subscription failed. Please try again.");
      }
    });
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Checkout</h1>

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
        <div className="flex items-center justify-between py-2 text-xl font-bold border-t mt-2 pt-3">
          <span>Total due {billing === "annual" ? "(per year)" : "(per quarter)"}</span>
          <span>£{final}</span>
        </div>
        <p className="text-sm text-foreground/70 mt-3">All plans include Done-For-You Services, Marketing Assets and Automation Support.</p>
      </section>

      <div className="flex items-center justify-between">
        <Link href="/pricing" className="underline text-foreground/70">Back to pricing</Link>
        <button
          onClick={handleConfirmPurchase}
          disabled={isSubscribing}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubscribing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubscribing ? 'Processing...' : 'Confirm Purchase'}
        </button>
      </div>
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
