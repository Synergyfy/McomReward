'use client';

import React from 'react';
import { useGetAvailablePointPackages } from '@/services/payment/hook';
import { Sparkles, Zap, Info } from 'lucide-react';
import LoadingSpinner from '@/components/ui/Loading';

const PointPackages: React.FC = () => {
  const { data: pointPackages, isLoading, isError } = useGetAvailablePointPackages();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading point packages.</div>;
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
          <Zap className="h-4 w-4" />
          Add-Ons Available
        </div>
        <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4">
          Point Packages
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Boost your campaigns with additional loyalty points. Purchase point packages anytime from your dashboard to reward your customers.
        </p>
      </div>

      {pointPackages && pointPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pointPackages.map((pkg, index) => {
            // Determine styling based on package size/price
            const isPopular = index === 1; // Middle package is usually most popular
            const isPremium = index === pointPackages.length - 1;

            return (
              <div
                key={pkg.id}
                className={`relative group rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isPopular
                  ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10'
                  : isPremium
                    ? 'border-purple-500/30 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20'
                    : 'border-border bg-card'
                  }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Premium Badge */}
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      BEST VALUE
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${isPopular
                    ? 'bg-primary/20'
                    : isPremium
                      ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
                      : 'bg-primary/10'
                    }`}>
                    <Sparkles className={`h-7 w-7 ${isPopular
                      ? 'text-primary'
                      : isPremium
                        ? 'text-purple-600'
                        : 'text-primary/70'
                      }`} />
                  </div>

                  {/* Package Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {pkg.name}
                  </h3>

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-sm text-foreground/60 mb-6 min-h-[40px]">
                      {pkg.description}
                    </p>
                  )}

                  {/* Points Display */}
                  <div className="mb-6 pb-6 border-b border-border/50">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-extrabold ${isPopular
                        ? 'text-primary'
                        : isPremium
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                          : 'text-foreground'
                        }`}>
                        {pkg.points.toLocaleString()}
                      </span>
                      <span className="text-lg font-medium text-foreground/60">
                        points
                      </span>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground/70">
                        Package Price
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">
                          {pkg.currency === 'GBP' ? '£' : '$'}
                          {parseFloat(pkg.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Value Indicator */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${isPopular
                      ? 'bg-primary/10'
                      : isPremium
                        ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10'
                        : 'bg-muted/50'
                      }`}>
                      <Info className={`h-4 w-4 flex-shrink-0 ${isPopular
                        ? 'text-primary'
                        : isPremium
                          ? 'text-purple-600'
                          : 'text-foreground/60'
                        }`} />
                      <span className="text-xs text-foreground/70">
                        {(parseFloat(pkg.price) / pkg.points * 1000).toFixed(2)} {pkg.currency} per 1,000 points
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-border max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Sparkles className="h-8 w-8 text-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Point Packages Available
          </h3>
          <p className="text-foreground/60">
            Point packages will be available soon. Check back later or contact support for more information.
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-foreground/60">
          💡 Point packages can be purchased from your dashboard after subscribing to a plan
        </p>
      </div>
    </div>
  );
};

export default PointPackages;