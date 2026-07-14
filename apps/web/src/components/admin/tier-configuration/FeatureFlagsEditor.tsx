import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TierFeatureFlags } from '@/services/payment/types';

interface FeatureFlagsEditorProps {
    featureFlags: TierFeatureFlags;
    onChange: (flags: TierFeatureFlags) => void;
}

export const FeatureFlagsEditor: React.FC<FeatureFlagsEditorProps> = ({ featureFlags, onChange }) => {
    const handleToggle = (field: keyof TierFeatureFlags) => {
        onChange({
            ...featureFlags,
            [field]: !featureFlags[field]
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="canCreateCampaignFromScratch" className="flex-1">Create Campaigns from Scratch</Label>
                <Switch
                    id="canCreateCampaignFromScratch"
                    checked={featureFlags.canCreateCampaignFromScratch ?? false}
                    onCheckedChange={() => handleToggle('canCreateCampaignFromScratch')}
                />
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="canEditAdminTemplates" className="flex-1">Edit Admin Templates</Label>
                <Switch
                    id="canEditAdminTemplates"
                    checked={featureFlags.canEditAdminTemplates ?? false}
                    onCheckedChange={() => handleToggle('canEditAdminTemplates')}
                />
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="hasAccessToAdvancedAnalytics" className="flex-1">Access Advanced Analytics</Label>
                <Switch
                    id="hasAccessToAdvancedAnalytics"
                    checked={featureFlags.hasAccessToAdvancedAnalytics ?? false}
                    onCheckedChange={() => handleToggle('hasAccessToAdvancedAnalytics')}
                />
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="hasAccessToCRM" className="flex-1">Access CRM</Label>
                <Switch
                    id="hasAccessToCRM"
                    checked={featureFlags.hasAccessToCRM ?? false}
                    onCheckedChange={() => handleToggle('hasAccessToCRM')}
                />
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="canUpdateReward" className="flex-1">Update Rewards</Label>
                <Switch
                    id="canUpdateReward"
                    checked={featureFlags.canUpdateReward ?? false}
                    onCheckedChange={() => handleToggle('canUpdateReward')}
                />
            </div>
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="canCreateRewardFromScratch" className="flex-1">Create Rewards from Scratch</Label>
                <Switch
                    id="canCreateRewardFromScratch"
                    checked={featureFlags.canCreateRewardFromScratch ?? false}
                    onCheckedChange={() => handleToggle('canCreateRewardFromScratch')}
                />
            </div>
        </div>
    );
};
