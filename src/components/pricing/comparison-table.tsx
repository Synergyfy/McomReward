import { Check, Minus, Loader2 } from "lucide-react"
import { useGetTiers } from "@/services/tiers/hook"
import { TierResponse } from "@/services/tiers/types"

interface ComparisonTableProps {
  activeTab?: string;
}

export default function ComparisonTable({ activeTab = "standard" }: ComparisonTableProps) {
  const { data: tiersData, isLoading, isError } = useGetTiers()

  // Define features to compare
  const features = [
    "Monthly Points Allocation",
    "Max Campaigns",
    "Max Rewards per Campaign",
    "Edit Admin Rewards",
    "Edit Admin Campaigns",
    "Create Rewards from Scratch",
    "Create Campaigns from Scratch",
    "Number of QR Plaques",
    "NFC Items Supported",
    "Advanced Analytics",
    "Audience Segmentation",
    "Team Members",
    "Support"
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading comparison data...</p>
      </div>
    )
  }

  if (isError || !tiersData) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load pricing table. Please try again later.
      </div>
    )
  }

  const normalize = (str?: string) => str?.toLowerCase().trim() || '';

  // Filter tiers based on activeTab
  const tiers = tiersData.filter(t => {
    const type = normalize(t.type);
    const status = normalize(t.status);
    const isVisible = status === 'published' || status === 'draft' || status === '';

    if (activeTab === 'seasonal') {
      return type === 'seasonal' && isVisible;
    } else {
      // Standard view
      const isStandard = type === 'standard' || type === '';
      return isStandard && isVisible && t.name !== "Trial";
    }
  });

  // Sort tiers
  if (activeTab === 'seasonal') {
    tiers.sort((a, b) => {
      const priceA = a.fixedPrice ? parseFloat(String(a.fixedPrice)) : 0;
      const priceB = b.fixedPrice ? parseFloat(String(b.fixedPrice)) : 0;
      return priceA - priceB;
    });
  } else {
    tiers.sort((a, b) => {
      const priceA = a.quaterlyPrice ? parseFloat(String(a.quaterlyPrice)) : 0;
      const priceB = b.quaterlyPrice ? parseFloat(String(b.quaterlyPrice)) : 0;
      return priceA - priceB;
    });
  }

  const getFeatureValue = (tier: TierResponse, feature: string): string | boolean | number => {
    const config = tier.configuration
    const quotas = config?.quotas
    const flags = config?.featureFlags

    switch (feature) {
      case "Monthly Points Allocation":
        return quotas ? `${quotas.monthlyPointsAllowance.toLocaleString()} pts` : "0 pts"
      case "Max Campaigns":
        return quotas?.maxActiveCampaigns === -1 ? "Unlimited" : (quotas?.maxActiveCampaigns ?? 0)
      case "Max Rewards per Campaign":
        return quotas?.maxRewardsPerCampaign === -1 ? "Unlimited" : (quotas?.maxRewardsPerCampaign ?? 0)
      case "Edit Admin Rewards":
      case "Edit Admin Campaigns":
        return !!flags?.canEditAdminTemplates
      case "Create Rewards from Scratch":
      case "Create Campaigns from Scratch":
        return !!flags?.canCreateCampaignFromScratch
      case "Number of QR Plaques":
        return tier.qrCodeCount === -1 ? "Unlimited" : (tier.qrCodeCount ?? 0)
      case "NFC Items Supported":
        // Based on logic from content.json (Silver+ has NFC items)
        return (tier.qrCodeCount ?? 0) >= 10
      case "Advanced Analytics":
        return !!flags?.hasAccessToAdvancedAnalytics
      case "Audience Segmentation":
        return !!flags?.hasAccessToCrm
      case "Team Members":
        // Fallback or specific logic if needed
        if (tier.name === "Platinum") return "Unlimited"
        if (tier.name === "Gold") return 7
        if (tier.name === "Silver") return 3
        return 1
      case "Support":
        if (tier.name === "Platinum") return "Dedicated Manager"
        if (tier.name === "Gold") return "Chat"
        if (tier.name === "Silver") return "Priority Email"
        return "Email"
      default:
        return false
    }
  }

  return (
    <div className="w-full fade-in">
      <h2 className="text-3xl font-bold mb-12 text-center text-balance">Compare All Features</h2>

      <div className="overflow-x-auto rounded-3xl border-2 border-border shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-6 py-4 text-left font-semibold">Feature</th>
              {tiers.map((tier) => (
                <th key={tier.id} className="px-6 py-4 text-center font-semibold">
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr
                key={feature}
                className={`transition-colors ${idx % 2 === 0 ? "bg-background" : "bg-muted/30"} hover:bg-muted/50`}
              >
                <td className="px-6 py-4 font-medium text-foreground">{feature}</td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {(() => {
                      const value = getFeatureValue(tier, feature)
                      if (typeof value === 'string' || typeof value === 'number') {
                        return <span className="text-sm font-medium text-foreground">{value}</span>
                      }
                      return value ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                          <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                          <Minus className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                        </span>
                      )
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
