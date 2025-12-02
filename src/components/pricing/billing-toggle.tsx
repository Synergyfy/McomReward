"use client"

interface BillingToggleProps {
  billingCycle: "quarterly" | "annual"
  setBillingCycle: (cycle: "quarterly" | "annual") => void
}

export default function BillingToggle({ billingCycle, setBillingCycle }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => setBillingCycle("quarterly")}
        className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out ${
          billingCycle === "quarterly"
            ? "bg-primary text-primary-foreground shadow-lg"
            : "bg-muted text-foreground hover:bg-muted/80"
        }`}
      >
        Quarterly
      </button>
      <button
        onClick={() => setBillingCycle("annual")}
        className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out ${
          billingCycle === "annual"
            ? "bg-primary text-primary-foreground shadow-lg"
            : "bg-muted text-foreground hover:bg-muted/80"
        }`}
      >
        Annual
      </button>
    </div>
  )
}
