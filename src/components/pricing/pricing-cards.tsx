'use client';

import PricingCard from "./pricing-card"
import SeasonalPricingCard from "./seasonal-pricing-card"
import { Target, Award, Medal, Crown, Trophy, type LucideIcon, Loader2 } from "lucide-react"
import type { BillingCycle } from "@/lib/content"
import { Reveal } from "@/components/ui/reveal"
import { useGetTiers } from "@/services/payment/hook"

interface PricingCardsProps {
  billingCycle: BillingCycle
  activeTab?: string
}

// Map product tier names to their icon components to keep rendering data-driven.
const iconByTier: Record<string, LucideIcon> = {
  Trial: Target,
  Bronze: Award,
  Silver: Medal,
  Gold: Trophy,
  Platinum: Crown,
}

export default function PricingCards({ billingCycle, activeTab }: PricingCardsProps) {
  const { data: tiers, isLoading, error } = useGetTiers();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load pricing plans. Please try again later.</div>;
  }

  const normalize = (str?: string) => str?.toLowerCase().trim() || '';

  const standardTiers = tiers?.filter(t => {
    const type = normalize(t.type);
    const status = normalize(t.status);
    // Allow 'standard' or empty type (legacy). Allow 'published' or empty status. Exclude 'trial' by name.
    const isStandard = type === 'standard' || type === '';
    // Relax status check to allow 'draft' for development visibility
    const isPublished = status === 'published' || status === 'draft' || status === '';
    return isStandard && isPublished && t.name !== "Trial";
  }).map((t) => ({
    name: t.name,
    description: t.description || "Unlock your potential",
    quarterlyPrice: parseFloat(t.quaterlyPrice),
    annualPrice: parseFloat(t.annualPrice),
    includesNfc: t.includesNfc ?? false,
    icon: iconByTier[t.name] ?? Target,
    features: t.features,
    id: t.id,
  })) || [];

  // Sort tiers by price
  standardTiers.sort((a, b) => a.quarterlyPrice - b.quarterlyPrice);

  const seasonalTiers = tiers?.filter(t => {
    const type = normalize(t.type);
    const status = normalize(t.status);
    const isVisible = status === 'published' || status === 'draft' || status === '';
    return type === 'seasonal' && isVisible;
  }).map(t => ({
    ...t,
    // Robustly handle potential snake_case from backend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startDate: t.startDate || (t as any).start_date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endDate: t.endDate || (t as any).end_date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixedPrice: t.fixedPrice || (t as any).fixed_price,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colorCode: t.colorCode || (t as any).color_code,
  })) || [];

  // Sort seasonal by price if needed
  seasonalTiers.sort((a, b) => (a.fixedPrice || 0) - (b.fixedPrice || 0));

  return (
    <div>
      {activeTab === 'seasonal' ? (
        // Seasonal Plans
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {seasonalTiers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10">No seasonal offers available at the moment.</p>
          ) : (
            seasonalTiers.map((tier, index) => (
              <Reveal key={tier.id} animationClass="card-reveal" delayMs={index * 100}>
                <SeasonalPricingCard tier={tier} />
              </Reveal>
            ))
          )}
        </div>
      ) : (
        // Standard Plans
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {standardTiers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No standard plans available.</p>
          ) : (
            standardTiers.map((tier, index) => (
              <Reveal key={tier.name} animationClass="card-reveal" delayMs={index * 100}>
                <PricingCard tier={tier} billingCycle={billingCycle} />
              </Reveal>
            ))
          )}
        </div>
      )}
    </div>
  )
}
