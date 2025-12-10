'use client';

import { type LucideIcon, Check, Nfc } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PricingCardProps {
  tier: {
    id: string
    name: string
    description: string
    quarterlyPrice: number
    annualPrice: number
    icon: LucideIcon
    includesNfc?: boolean
    features: string[]
  }
  billingCycle: "quarterly" | "annual"
}

export default function PricingCard({ tier, billingCycle }: PricingCardProps) {
  const price = billingCycle === "annual" ? tier.annualPrice : tier.quarterlyPrice
  const Icon = tier.icon
  const router = useRouter()
  /* Removed unused imports and state for trial */

  return (
    <div className="rounded-3xl p-8 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 bg-card text-card-foreground border-2 border-border shadow-md hover:bg-primary hover:text-primary-foreground hover:border-primary group">
      <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary-foreground/20 group-hover:to-primary-foreground/5 transition-all duration-300">
        <Icon
          className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-300"
          strokeWidth={2}
        />
      </div>

      <h3 className="text-2xl font-bold mb-3">{tier.name}</h3>

      <p className="text-sm mb-6 text-foreground/70 group-hover:text-primary-foreground/90 transition-colors duration-300">
        {tier.description}
      </p>

      <div className="mb-8">
        <span className="text-4xl font-bold">£{price}</span>
        <span className="text-sm ml-2 text-foreground/60 group-hover:text-primary-foreground/80 transition-colors duration-300">
        </span>
        {tier.includesNfc && (
          <span className="inline-flex items-center gap-1 ml-3 text-xs font-medium px-2 py-1 rounded-full bg-primary/10 group-hover:bg-primary-foreground/20">
            <Nfc className="w-3.5 h-3.5" /> NFC included
          </span>
        )}
      </div>
      <ul className="space-y-4 mb-8">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 group-hover:bg-primary-foreground/20 flex items-center justify-center mt-0.5 transition-colors duration-300">
              <Check
                className="w-3 h-3 text-primary group-hover:text-primary-foreground transition-colors duration-300"
                strokeWidth={3}
              />
            </span>
            <span className="text-sm leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/checkout?plan=${encodeURIComponent(tier.id)}&billing=${billingCycle}`}
        className="w-full inline-block text-center py-3.5 rounded-full font-semibold transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 mb-3 bg-primary text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground shadow-md"
      >
        {tier.name === "Trial" ? "Start Trial" : `Choose ${tier.name}`}
      </Link>

      {tier.name !== "Trial" && (
        <button
          onClick={() => router.push(`/checkout?plan=${encodeURIComponent(tier.id)}&billing=${billingCycle}&isTrial=true`)}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border-2 border-primary text-primary group-hover:border-primary-foreground group-hover:text-primary-foreground group-hover:bg-primary-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Start Trial
        </button>
      )}
    </div>
  )
}
