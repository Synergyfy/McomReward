'use client';

import React, { useState } from 'react';
import { useGetTiers, useUpdateTierProgression } from '@/services/payment/hook';
import { Tier } from '@/services/payment/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Settings2, CheckCircle2 } from 'lucide-react';
import { TierConfigurationEditor } from '@/components/admin/tier-configuration/TierConfigurationEditor';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function TierConfigurationPage() {
    const { data: tiers, isLoading: isLoadingTiers, error: isErrorTiers } = useGetTiers();
    const { mutate: updateTier, isPending: isUpdating } = useUpdateTierProgression();

    const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const handleOpenEditor = (tier: Tier) => {
        setSelectedTier(tier);
        setIsEditorOpen(true);
    };

    const handleSaveConfiguration = (newConfig: any) => {
        if (!selectedTier) return;

        updateTier(
            { id: selectedTier.id, payload: { configuration: newConfig } },
            {
                onSuccess: () => {
                    toast.success(`Configuration for ${selectedTier.name} updated successfully.`);
                    setIsEditorOpen(false);
                },
                onError: (error) => {
                    console.error("Failed to update tier configuration:", error);
                    toast.error("Failed to update configuration. Please try again.");
                }
            }
        );
    };

    if (isLoadingTiers) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading tiers...</p>
                </div>
            </div>
        );
    }

    if (isErrorTiers) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <p className="text-destructive">Failed to load tiers.</p>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Tier Configuration</h1>
                <p className="text-muted-foreground mt-2">
                    Manage advanced settings, quotas, feature flags, and progression rules for each subscription tier.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers?.map((tier) => (
                    <Card key={tier.id} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {tier.description || "No description provided."}
                                    </CardDescription>
                                </div>
                                {tier.status === 'active' || tier.status === 'published' ? (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {tier.status}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-muted/30 p-2 rounded">
                                        <span className="text-muted-foreground block text-xs">Monthly</span>
                                        <span className="font-semibold">£{tier.monthlyPrice}</span>
                                    </div>
                                    <div className="bg-muted/30 p-2 rounded">
                                        <span className="text-muted-foreground block text-xs">Annual</span>
                                        <span className="font-semibold">£{tier.annualPrice}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Features</span>
                                    <div className="flex flex-wrap gap-1">
                                        {tier.features.slice(0, 3).map((f, i) => (
                                            <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded">
                                                {f}
                                            </span>
                                        ))}
                                        {tier.features.length > 3 && (
                                            <span className="text-xs text-muted-foreground self-center">
                                                +{tier.features.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => handleOpenEditor(tier)}
                            >
                                <Settings2 className="w-4 h-4 mr-2" />
                                Configure Limits & Rules
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Configuration Editor Dialog */}
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="max-w-[90vw] h-[90vh] overflow-y-auto w-full p-0">
                    <div className="p-6 h-full overflow-auto">
                        {selectedTier && (
                            <TierConfigurationEditor
                                initialConfiguration={selectedTier.configuration || {}}
                                onSave={handleSaveConfiguration}
                                isSaving={isUpdating}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
