'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCampaignForm } from "@/context/CampaignFormContext";
import { useGetTiers } from '@/services/tiers/hook';
import { TierResponse } from '@/services/tiers/types';
import ReactSelect, { MultiValue } from 'react-select'; // Using react-select for multi-select support

interface StepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function StepSelectTier({ onNext, onBack }: StepProps) {
    const { formData, updateFormData } = useCampaignForm();
    const { data: allTiers, isLoading } = useGetTiers();

    // Filter tiers based on plan type
    const tiers = React.useMemo(() => {
        if (!allTiers) return [];
        if (formData.planType === 'seasonal') {
            return allTiers.filter(t => t.type === 'seasonal');
        } else {
            // Default to standard if not seasonal, or exclude seasonal
            return allTiers.filter(t => t.type !== 'seasonal');
        }
    }, [allTiers, formData.planType]);

    // Handle multi-select for BOTH Standard and Seasonal
    const handleMultiTierChange = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
        const selectedIds = selectedOptions.map(opt => opt.value);

        // For maxRewards, we might pick the most restrictive, or just the first.
        const firstTier = tiers.find(t => t.id === selectedIds[0]);

        updateFormData({
            target_tier_ids: selectedIds,
            target_tier_id: selectedIds[0], // Primary for backward compat
            maxRewardsPerCampaign: firstTier?.configuration?.quotas?.maxRewardsPerCampaign
        });
    };

    const isFormValid = () => {
        // Check array length for validity for both types
        return (formData.target_tier_ids?.length || 0) > 0;
    };

    const tierOptions = tiers.map(t => ({ value: t.id, label: t.name }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 3: Select Tier</CardTitle>
                <CardDescription>Select the tier(s) that this campaign targets.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="tier">Target Tier ({formData.planType === 'seasonal' ? 'Seasonal' : 'Standard'})</Label>

                        <ReactSelect
                            isMulti
                            options={tierOptions}
                            value={tierOptions.filter(opt => formData.target_tier_ids?.includes(opt.value))}
                            onChange={handleMultiTierChange}
                            isLoading={isLoading}
                            placeholder={formData.planType === 'seasonal' ? "Select seasonal tiers..." : "Select standard tiers..."}
                            className="mt-2"
                        />

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
