import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Tier, TierConfiguration, TierProgressionLevel, UpdateTierProgressionDto } from '@/services/payment/types';

import { Loader2 } from 'lucide-react';

interface TierProgressionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: Tier;
    onSave: (data: UpdateTierProgressionDto) => void;
    isLoading?: boolean;
}

export function TierProgressionModal({
    isOpen,
    onClose,
    tier,
    onSave,
    isLoading = false,
}: TierProgressionModalProps) {
    const [proConfig, setProConfig] = useState<TierProgressionLevel>({ conditions: {}, benefits: {} });
    const [proPlusConfig, setProPlusConfig] = useState<TierProgressionLevel>({ conditions: {}, benefits: {} });

    useEffect(() => {
        if (tier.configuration) {
            setProConfig(tier.configuration.pro || { conditions: {}, benefits: {} });
            setProPlusConfig(tier.configuration.pro_plus || { conditions: {}, benefits: {} });
        } else {
            setProConfig({ conditions: {}, benefits: {} });
            setProPlusConfig({ conditions: {}, benefits: {} });
        }
    }, [tier, isOpen]);

    const handleSave = () => {
        onSave({
            pro: proConfig,
            pro_plus: proPlusConfig,
        });
        // Do not close here, let the parent handle closing on success
    };

    const updateCondition = (level: 'pro' | 'pro_plus', key: string, value: any) => {
        const setter = level === 'pro' ? setProConfig : setProPlusConfig;
        setter(prev => ({
            ...prev,
            conditions: {
                ...prev.conditions,
                [key]: value
            }
        }));
    };

    const updateBenefitQuota = (level: 'pro' | 'pro_plus', key: string, value: number) => {
        const setter = level === 'pro' ? setProConfig : setProPlusConfig;
        setter(prev => ({
            ...prev,
            benefits: {
                ...prev.benefits,
                quotas: {
                    ...prev.benefits.quotas,
                    [key]: value
                }
            }
        }));
    };

    const updateBenefitFlag = (level: 'pro' | 'pro_plus', key: string, value: boolean) => {
        const setter = level === 'pro' ? setProConfig : setProPlusConfig;
        setter(prev => ({
            ...prev,
            benefits: {
                ...prev.benefits,
                featureFlags: {
                    ...prev.benefits.featureFlags,
                    [key]: value
                }
            }
        }));
    };

    const updateBenefitBonus = (level: 'pro' | 'pro_plus', value: number) => {
        const setter = level === 'pro' ? setProConfig : setProPlusConfig;
        setter(prev => ({
            ...prev,
            benefits: {
                ...prev.benefits,
                bonusPoints: value
            }
        }));
    };

    const renderLevelConfig = (level: 'pro' | 'pro_plus') => {
        const config = level === 'pro' ? proConfig : proPlusConfig;

        return (
            <div className="space-y-6 py-4 h-[60vh] overflow-y-auto pr-2">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Conditions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Min Campaigns Created</Label>
                            <Input type="number" value={config.conditions.minCampaignsCreated || ''} onChange={e => updateCondition(level, 'minCampaignsCreated', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Rewards Created</Label>
                            <Input type="number" value={config.conditions.minRewardsCreated || ''} onChange={e => updateCondition(level, 'minRewardsCreated', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Points Used</Label>
                            <Input type="number" value={config.conditions.minPointsUsed || ''} onChange={e => updateCondition(level, 'minPointsUsed', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Customer Scans</Label>
                            <Input type="number" value={config.conditions.minCustomerScans || ''} onChange={e => updateCondition(level, 'minCustomerScans', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Participants</Label>
                            <Input type="number" value={config.conditions.minParticipants || ''} onChange={e => updateCondition(level, 'minParticipants', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Tasks Completed</Label>
                            <Input type="number" value={config.conditions.minTasksCompleted || ''} onChange={e => updateCondition(level, 'minTasksCompleted', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Purchases</Label>
                            <Input type="number" value={config.conditions.minPurchases || ''} onChange={e => updateCondition(level, 'minPurchases', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Days Active</Label>
                            <Input type="number" value={config.conditions.minDaysActive || ''} onChange={e => updateCondition(level, 'minDaysActive', Number(e.target.value))} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.conditions.profileCompleted || false} onCheckedChange={c => updateCondition(level, 'profileCompleted', c)} />
                            <Label>Profile Completed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.conditions.kycVerified || false} onCheckedChange={c => updateCondition(level, 'kycVerified', c)} />
                            <Label>KYC Verified</Label>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Benefits</h3>

                    <h4 className="font-medium mt-2 mb-1">Quotas</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Max Active Campaigns</Label>
                            <Input type="number" value={config.benefits.quotas?.maxActiveCampaigns || ''} onChange={e => updateBenefitQuota(level, 'maxActiveCampaigns', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Active Rewards</Label>
                            <Input type="number" value={config.benefits.quotas?.maxActiveRewards || ''} onChange={e => updateBenefitQuota(level, 'maxActiveRewards', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Rewards Per Campaign</Label>
                            <Input type="number" value={config.benefits.quotas?.maxRewardsPerCampaign || ''} onChange={e => updateBenefitQuota(level, 'maxRewardsPerCampaign', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Monthly Points Allowance</Label>
                            <Input type="number" value={config.benefits.quotas?.monthlyPointsAllowance || ''} onChange={e => updateBenefitQuota(level, 'monthlyPointsAllowance', Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Team Members</Label>
                            <Input type="number" value={config.benefits.quotas?.maxTeamMembers || ''} onChange={e => updateBenefitQuota(level, 'maxTeamMembers', Number(e.target.value))} />
                        </div>
                    </div>

                    <h4 className="font-medium mt-4 mb-1">Feature Flags</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.benefits.featureFlags?.canCreateCampaignFromScratch || false} onCheckedChange={c => updateBenefitFlag(level, 'canCreateCampaignFromScratch', c)} />
                            <Label>Create Campaign From Scratch</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.benefits.featureFlags?.canEditAdminTemplates || false} onCheckedChange={c => updateBenefitFlag(level, 'canEditAdminTemplates', c)} />
                            <Label>Edit Admin Templates</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.benefits.featureFlags?.hasAccessToAdvancedAnalytics || false} onCheckedChange={c => updateBenefitFlag(level, 'hasAccessToAdvancedAnalytics', c)} />
                            <Label>Advanced Analytics</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.benefits.featureFlags?.hasAccessToCRM || false} onCheckedChange={c => updateBenefitFlag(level, 'hasAccessToCRM', c)} />
                            <Label>CRM Access</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch checked={config.benefits.featureFlags?.canUpdateReward || false} onCheckedChange={c => updateBenefitFlag(level, 'canUpdateReward', c)} />
                            <Label>Update Reward</Label>
                        </div>
                    </div>

                    <h4 className="font-medium mt-4 mb-1">Bonus</h4>
                    <div className="space-y-2">
                        <Label>Bonus Points</Label>
                        <Input type="number" value={config.benefits.bonusPoints || ''} onChange={e => updateBenefitBonus(level, Number(e.target.value))} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Update Progression: {tier.name}</DialogTitle>
                    <DialogDescription>
                        Configure conditions and benefits for Pro and Pro Plus levels.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="pro">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pro">Pro</TabsTrigger>
                        <TabsTrigger value="pro_plus">Pro Plus</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pro">
                        {renderLevelConfig('pro')}
                    </TabsContent>
                    <TabsContent value="pro_plus">
                        {renderLevelConfig('pro_plus')}
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
