'use client';

import PricingCard from "./pricing-card"
import { Target, Award, Medal, Crown, Trophy, type LucideIcon, Loader2 } from "lucide-react"
import type { BillingCycle } from "@/lib/content"
import { Reveal } from "@/components/ui/reveal"
import { useGetTiers } from "@/services/payment/hook"

interface PricingCardsProps {
  billingCycle: BillingCycle
}

// Map product tier names to their icon components to keep rendering data-driven.
const iconByTier: Record<string, LucideIcon> = {
  Trial: Target,
  Bronze: Award,
  Silver: Medal,
  Gold: Trophy,
  Platinum: Crown,
}

export default function PricingCards({ billingCycle }: PricingCardsProps) {
  const { data: tiers, isLoading, error } = useGetTiers();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load pricing plans. Please try again later.</div>;
  }

  const displayTiers = tiers?.filter(t => t.name !== "Trial").map((t) => ({
    name: t.name,
    description: t.description || "Unlock your potential", // Fallback description
    quarterlyPrice: parseFloat(t.quaterlyPrice), // Parse string to number
    annualPrice: parseFloat(t.annualPrice), // Parse string to number
    includesNfc: t.includesNfc ?? false,
    icon: iconByTier[t.name] ?? Target,
    features: t.features,
    id: t.id, // Pass ID for checkout link
  })) || [];

  // Sort tiers by price to ensure logical order if backend doesn't guarantee it
  displayTiers.sort((a, b) => a.quarterlyPrice - b.quarterlyPrice);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {displayTiers.map((tier, index) => (
        <Reveal key={tier.name} animationClass="card-reveal" delayMs={index * 100}>
          <PricingCard tier={tier} billingCycle={billingCycle} />
        </Reveal>
      ))}
    </div>
  )
}
