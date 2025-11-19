import PricingCard from "./pricing-card"
import { Target, Award, Medal, Crown, Trophy, type LucideIcon } from "lucide-react"
import type { BillingCycle } from "@/lib/content"
import { getTiers } from "@/lib/content"
import { Reveal } from "@/components/ui/reveal"

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
  const tiers = getTiers().filter(t => t.name !== "Trial").map((t) => ({
    name: t.name,
    description: t.description,
    quarterlyPrice: t.quarterlyPrice,
    includesNfc: t.includesNfc,
    icon: iconByTier[t.name] ?? Target,
    features: t.features,
  }))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {tiers.map((tier, index) => (
        <Reveal key={tier.name} animationClass="card-reveal" delayMs={index * 100}>
          <PricingCard tier={tier} billingCycle={billingCycle} />
        </Reveal>
      ))}
    </div>
  )
}
