'use client';

import PricingCard from "./pricing-card"
import SeasonalPricingCard from "./seasonal-pricing-card"
import { Target, Award, Medal, Crown, Trophy, type LucideIcon, Loader2, ShoppingBag } from "lucide-react"
import type { BillingCycle } from "@/lib/content"
import { Reveal } from "@/components/ui/reveal"
import { useGetTiers } from "@/services/payment/hook"
import { useGetMallPlans, type MallPlan } from "@/services/mall-integration"

interface PricingCardsProps {
  billingCycle: BillingCycle
  activeTab?: string
}

const iconByTier: Record<string, LucideIcon> = {
  Trial: Target,
  Bronze: Award,
  Silver: Medal,
  Gold: Trophy,
  Platinum: Crown,
}

const getIconForPlan = (name: string): LucideIcon => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("trial")) return Target;
  if (normalized.includes("bronze")) return Award;
  if (normalized.includes("silver")) return Medal;
  if (normalized.includes("gold")) return Trophy;
  if (normalized.includes("platinum")) return Crown;
  return ShoppingBag;
}

export default function PricingCards({ billingCycle, activeTab }: PricingCardsProps) {
  const { data: tiers, isLoading: tiersLoading, error: tiersError } = useGetTiers();
  const { data: mallPlans, isLoading: mallLoading, error: mallError } = useGetMallPlans();

  const isLoading = tiersLoading || mallLoading;
  const error = tiersError || mallError;

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
    const isStandard = type === 'standard' || type === '';
    const isPublished = status === 'published' || status === 'draft' || status === '';
    return isStandard && isPublished && t.name !== "Trial";
  }).map((t) => ({
    name: t.name,
    description: t.description || "Unlock your potential",
    quarterlyPrice: parseFloat(t.quarterlyPrice),
    annualPrice: parseFloat(t.annualPrice),
    includesNfc: t.includesNfc ?? false,
    icon: iconByTier[t.name] ?? Target,
    features: t.features,
    id: t.id,
    source: 'loyalty' as const,
  })) || [];

  standardTiers.sort((a, b) => a.quarterlyPrice - b.quarterlyPrice);

  const mallStandardPlans = mallPlans?.filter(p => {
    const type = normalize(p.type);
    return p.isActive && (type === 'standard' || type === '');
  }).map(p => ({
    name: p.name,
    description: p.description || "Plan from MCOM Mall",
    quarterlyPrice: p.quarterlyPrice,
    annualPrice: p.annualPrice,
    includesNfc: false,
    icon: getIconForPlan(p.name),
    features: p.features,
    id: p.id,
    source: 'mall' as const,
  })) || [];

  mallStandardPlans.sort((a, b) => a.quarterlyPrice - b.quarterlyPrice);

  const allStandardPlans = [...standardTiers, ...mallStandardPlans];

  const seasonalTiers = tiers?.filter(t => {
    const type = normalize(t.type);
    const status = normalize(t.status);
    const isVisible = status === 'published' || status === 'draft' || status === '';
    return type === 'seasonal' && isVisible;
  }).map(t => ({
    ...t,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startDate: t.startDate || (t as any).start_date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endDate: t.endDate || (t as any).end_date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixedPrice: t.fixedPrice || (t as any).fixed_price,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colorCode: t.colorCode || (t as any).color_code,
  })) || [];

  seasonalTiers.sort((a, b) => (a.fixedPrice || 0) - (b.fixedPrice || 0));

  return (
    <div>
      {activeTab === 'seasonal' ? (
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
        <div>
          {mallStandardPlans.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 justify-center mb-6">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">MCOM Mall Plans</h3>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Plans from the MCOM Mall platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {mallStandardPlans.map((tier, index) => (
                  <Reveal key={`mall-${tier.id}`} animationClass="card-reveal" delayMs={index * 100}>
                    <PricingCard tier={tier} billingCycle={billingCycle} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {standardTiers.length > 0 && (
            <div>
              {mallStandardPlans.length > 0 && (
                <div className="flex items-center gap-2 justify-center mb-6">
                  <div className="h-px bg-border flex-1 max-w-[100px]" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="h-px bg-border flex-1 max-w-[100px]" />
                </div>
              )}
              <div className="flex items-center gap-2 justify-center mb-6">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Loyalty Plans</h3>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Built-in loyalty platform plans
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {standardTiers.map((tier, index) => (
                  <Reveal key={`loyalty-${tier.name}`} animationClass="card-reveal" delayMs={index * 100}>
                    <PricingCard tier={tier} billingCycle={billingCycle} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {allStandardPlans.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No standard plans available.</p>
          )}
        </div>
      )}
    </div>
  )
}
