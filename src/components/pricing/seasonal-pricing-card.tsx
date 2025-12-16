'use client';

import { type LucideIcon, Check, Calendar, Snowflake, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SeasonalPricingCardProps {
    tier: {
        id: string
        name: string
        description?: string
        fixedPrice?: number
        startDate?: string
        endDate?: string
        colorCode?: string
        features: string[]
    }
}

export default function SeasonalPricingCard({ tier }: SeasonalPricingCardProps) {
    const price = tier.fixedPrice ?? 0;

    // Format dates
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Determine styles based on colorCode or default
    const customStyle = tier.colorCode ? {
        borderColor: tier.colorCode,
        '--theme-color': tier.colorCode
    } as React.CSSProperties : {};

    return (
        <div
            className={cn(
                "relative rounded-3xl p-8 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 bg-card text-card-foreground border-2 shadow-md group overflow-hidden",
                !tier.colorCode && "border-border hover:border-primary"
            )}
            style={customStyle}
        >
            {/* Background Gradient Effect for Seasonal */}
            {tier.colorCode && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: tier.colorCode }}
                />
            )}

            <div className="flex justify-between items-start mb-6">
                <div
                    className={cn(
                        "inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300",
                        !tier.colorCode ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary" : "text-white"
                    )}
                    style={tier.colorCode ? { backgroundColor: tier.colorCode } : {}}
                >
                    <Snowflake
                        className="w-8 h-8"
                        strokeWidth={2}
                    />
                </div>
                {(tier.startDate || tier.endDate) && (
                    <div className="flex flex-col items-end text-xs font-medium opacity-70 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(tier.startDate)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(tier.endDate)}</span>
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-bold mb-2" style={tier.colorCode ? { color: tier.colorCode } : {}}>{tier.name}</h3>

            <p className="text-sm mb-6 text-foreground/70 min-h-[40px]">
                {tier.description || "Limited time seasonal offer."}
            </p>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">£{price}</span>
                    <span className="text-sm font-medium text-muted-foreground uppercase">/ season</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    One-time payment for the entire duration
                </p>
            </div>

            <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                        <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300"
                            style={tier.colorCode ? { backgroundColor: `${tier.colorCode}20` } : {}} // 20% opacity hex
                        >
                            <Check
                                className={cn("w-3 h-3", !tier.colorCode && "text-primary")}
                                style={tier.colorCode ? { color: tier.colorCode } : {}}
                                strokeWidth={3}
                            />
                        </span>
                        <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>

            <Link
                href={`/checkout?plan=${encodeURIComponent(tier.id)}&billing=fixed`}
                className={cn(
                    "w-full inline-block text-center py-3.5 rounded-full font-semibold transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 mb-3 shadow-lg",
                    !tier.colorCode && "bg-primary text-primary-foreground hover:bg-primary/90",
                    tier.colorCode && "text-white opacity-90 hover:opacity-100"
                )}
                style={tier.colorCode ? { backgroundColor: tier.colorCode } : {}}
            >
                Get {tier.name} Access
            </Link>

            <p className="text-center text-xs text-muted-foreground" style={tier.colorCode ? { color: tier.colorCode } : {}}>
                Limited Time Offer
            </p>
        </div>
    )
}
