'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCampaignForm } from "@/context/CampaignFormContext";
import { useGetTiers } from '@/services/tiers/hook';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TierResponse } from '@/services/tiers/types';

interface StepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function StepSelectTier({ onNext, onBack }: StepProps) {
    const { formData, updateFormData } = useCampaignForm();
    const { data: tiers, isLoading } = useGetTiers();

    const handleTierChange = (tierId: string) => {
        const selectedTier = tiers?.find((tier: TierResponse) => tier.id === tierId);
        if (selectedTier) {
            updateFormData({
                target_tier_id: selectedTier.id,
                maxRewardsPerCampaign: selectedTier.configuration?.quotas?.maxRewardsPerCampaign
            });
        }
    };

    const isFormValid = () => {
        return !!formData.target_tier_id;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Tier</CardTitle>
                <CardDescription>Select the tier that this campaign targets.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="tier">Target Tier</Label>
                        <Select
                            value={formData.target_tier_id || ''}
                            onValueChange={handleTierChange}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="tier">
                                <SelectValue placeholder={isLoading ? "Loading tiers..." : "Select a tier"} />
                            </SelectTrigger>
                            <SelectContent>
                                {tiers?.map((tier: TierResponse) => (
                                    <SelectItem key={tier.id} value={tier.id}>
                                        {tier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formData.maxRewardsPerCampaign !== undefined && (
                            <p className="text-sm text-gray-500 mt-1">
                                Max rewards for this tier: {formData.maxRewardsPerCampaign === -1 ? 'Unlimited' : formData.maxRewardsPerCampaign}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={onNext} disabled={!isFormValid()}>Next</Button>
                </div>
            </CardContent>
        </Card>
    );
}
