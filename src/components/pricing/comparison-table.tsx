import { Check, Minus } from "lucide-react"
import { listFeatureRows, getComparisonMatrix } from "@/lib/content"

export default function ComparisonTable() {
  // Data-driven feature comparison ensured to match card bullets via shared content source.
  const features = listFeatureRows()
  const includedByTier = getComparisonMatrix()
  const tiers = Object.keys(includedByTier).filter(tierName => tierName !== "Trial")

  return (
    <div className="w-full fade-in">
      <h2 className="text-3xl font-bold mb-12 text-center text-balance">Compare All Features</h2>

      <div className="overflow-x-auto rounded-3xl border-2 border-border shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-6 py-4 text-left font-semibold">Feature</th>
              {tiers.map((tier) => (
                <th key={tier} className="px-6 py-4 text-center font-semibold">
                  {tier}
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
                {tiers.map((tierName, tierIdx) => (
                  <td key={tierIdx} className="px-6 py-4 text-center">
                    <td key={tierIdx} className="px-6 py-4 text-center">
                      {(() => {
                        const value = includedByTier[tierName][features.indexOf(feature)];
                        if (typeof value === 'string' || typeof value === 'number') {
                          return <span className="text-sm font-medium text-gray-900">{value}</span>;
                        }
                        return value ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                            <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                            <Minus className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                          </span>
                        );
                      })()}
                    </td>
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
