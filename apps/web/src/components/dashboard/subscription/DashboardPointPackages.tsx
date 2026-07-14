'use client';

import React, { useState } from 'react';
import { useGetAvailablePointPackages } from '@/services/payment/hook';
import { PointPackage } from '@/services/payment/types';
import { Sparkles, ShoppingCart, Zap, Check, Info } from 'lucide-react';
import LoadingSpinner from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import BuyPointPackageModal from '@/components/pricing/BuyPointPackageModal';

const DashboardPointPackages: React.FC = () => {
    const { data: pointPackages, isLoading, isError } = useGetAvailablePointPackages();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PointPackage | null>(null);

    const handleBuyClick = (pkg: PointPackage) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handlePurchaseSuccess = () => {
        // Refresh packages or update state
        setIsModalOpen(false);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return (
            <div className="text-center py-8 text-red-500">
                Error loading point packages. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Point Packages</h2>
                    </div>
                    <p className="text-sm text-foreground/70">
                        Purchase additional points to reward your customers and boost engagement
                    </p>
                </div>
            </div>

            {pointPackages && pointPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pointPackages.map((pkg, index) => {
                        const isPopular = index === 1;
                        const isPremium = index === pointPackages.length - 1;

                        return (
                            <div
                                key={pkg.id}
                                className={`relative rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${isPopular
                                        ? 'border-primary bg-primary/5'
                                        : isPremium
                                            ? 'border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/10 dark:to-indigo-950/10'
                                            : 'border-border bg-card'
                                    }`}
                            >
                                {/* Badge */}
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                            <Sparkles className="h-3 w-3" />
                                            POPULAR
                                        </span>
                                    </div>
                                )}

                                {isPremium && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold">
                                            <Sparkles className="h-3 w-3" />
                                            BEST VALUE
                                        </span>
                                    </div>
                                )}

                                {/* Package Info */}
                                <div className="space-y-4">
                                    {/* Icon & Name */}
                                    <div>
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${isPopular
                                                ? 'bg-primary/20'
                                                : isPremium
                                                    ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
                                                    : 'bg-primary/10'
                                            }`}>
                                            <Sparkles className={`h-6 w-6 ${isPopular
                                                    ? 'text-primary'
                                                    : isPremium
                                                        ? 'text-purple-600'
                                                        : 'text-primary/70'
                                                }`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                                        {pkg.description && (
                                            <p className="text-sm text-foreground/60 mt-1">{pkg.description}</p>
                                        )}
                                    </div>

                                    {/* Points */}
                                    <div className="py-4 border-y border-border/50">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-4xl font-extrabold ${isPopular
                                                    ? 'text-primary'
                                                    : isPremium
                                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                                                        : 'text-foreground'
                                                }`}>
                                                {pkg.points.toLocaleString()}
                                            </span>
                                            <span className="text-sm font-medium text-foreground/60">points</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-foreground">
                                                {pkg.currency === 'GBP' ? '£' : '$'}
                                                {parseFloat(pkg.price).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Value */}
                                        <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isPopular
                                                ? 'bg-primary/10 text-primary'
                                                : isPremium
                                                    ? 'bg-purple-500/10 text-purple-600'
                                                    : 'bg-muted text-foreground/60'
                                            }`}>
                                            <Info className="h-3 w-3 flex-shrink-0" />
                                            <span>
                                                {(parseFloat(pkg.price) / pkg.points * 1000).toFixed(2)} {pkg.currency} per 1k points
                                            </span>
                                        </div>
                                    </div>

                                    {/* Buy Button */}
                                    <Button
                                        onClick={() => handleBuyClick(pkg)}
                                        className={`w-full ${isPopular
                                                ? 'bg-primary hover:bg-primary/90'
                                                : isPremium
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                                                    : 'bg-primary/90 hover:bg-primary'
                                            }`}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Purchase Package
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                    <Sparkles className="h-12 w-12 text-foreground/40 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                        No Point Packages Available
                    </h3>
                    <p className="text-sm text-foreground/60">
                        Point packages will be available soon. Check back later.
                    </p>
                </div>
            )}

            {/* Purchase Modal */}
            <BuyPointPackageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pointPackage={selectedPackage}
                onPurchaseSuccess={handlePurchaseSuccess}
            />
        </div>
    );
};

export default DashboardPointPackages;
