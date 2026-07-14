import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TierQuotas } from '@/services/payment/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface QuotasEditorProps {
    quotas: TierQuotas;
    onChange: (quotas: TierQuotas) => void;
}

export const QuotasEditor: React.FC<QuotasEditorProps> = ({ quotas, onChange }) => {
    const handleChange = (field: keyof TierQuotas, value: string) => {
        const numValue = parseInt(value);
        onChange({
            ...quotas,
            [field]: isNaN(numValue) ? 0 : numValue
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="maxActiveCampaigns">Max Active Campaigns (-1 for unlimited)</Label>
                <Input
                    id="maxActiveCampaigns"
                    type="number"
                    value={quotas.maxActiveCampaigns ?? 0}
                    onChange={(e) => handleChange('maxActiveCampaigns', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maxActiveRewards">Max Active Rewards (-1 for unlimited)</Label>
                <Input
                    id="maxActiveRewards"
                    type="number"
                    value={quotas.maxActiveRewards ?? 0}
                    onChange={(e) => handleChange('maxActiveRewards', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maxRewardsPerCampaign">Max Rewards Per Campaign</Label>
                <Input
                    id="maxRewardsPerCampaign"
                    type="number"
                    value={quotas.maxRewardsPerCampaign ?? 0}
                    onChange={(e) => handleChange('maxRewardsPerCampaign', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="monthlyPointsAllowance">Monthly Points Allowance</Label>
                <Input
                    id="monthlyPointsAllowance"
                    type="number"
                    value={quotas.monthlyPointsAllowance ?? 0}
                    onChange={(e) => handleChange('monthlyPointsAllowance', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="monthlyRewardBudget">Monthly Reward Budget</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">The monetary budget allocated for Gift Cards, Vouchers, and Coupons rewards each month. Once exhausted, businesses can top up their balance to continue rewarding customers.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Input
                    id="monthlyRewardBudget"
                    type="number"
                    value={quotas.monthlyRewardBudget ?? 0}
                    onChange={(e) => handleChange('monthlyRewardBudget', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maxTeamMembers">Max Team Members</Label>
                <Input
                    id="maxTeamMembers"
                    type="number"
                    value={quotas.maxTeamMembers ?? 0}
                    onChange={(e) => handleChange('maxTeamMembers', e.target.value)}
                />
            </div>
        </div>
    );
};
