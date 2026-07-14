'use client'

import { Suspense, useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Award, Medal, Trophy, Crown, Target, BadgePercent, type LucideIcon } from "lucide-react"
import { applyCoupon, findCoupon, getPrice, getTierByName, type BillingCycle } from "@/lib/content"

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

  const [plan, setPlan] = useState(initialPlan)
  const [billing, setBilling] = useState<BillingCycle>(initialBilling)
  const [couponCode, setCouponCode] = useState(initialCoupon)
  const [appliedCoupon, setAppliedCoupon] = useState(() => findCoupon(initialCoupon))
  const [couponError, setCouponError] = useState<string | null>(null)

  const tier = useMemo(() => getTierByName(plan), [plan])
  const Icon = iconByTier[plan] ?? Target

  const basePrice = useMemo(() => (tier ? getPrice(tier, billing) : 0), [tier, billing])
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

  if (!tier) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Selected plan not found.</p>
          <Link href="/" className="underline text-primary">Go back to pricing</Link>
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
        <Link href="/" className="underline text-foreground/70">Back to pricing</Link>
        <Link
          href={`/checkout/confirmation?plan=${encodeURIComponent(plan)}&billing=${billing}${appliedCoupon ? `&coupon=${appliedCoupon.code}` : ""}`}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold"
        >
          Confirm Purchase
        </Link>
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
