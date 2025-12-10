import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
    TierConfiguration,
    SeasonalVariant,
    TierProgressionLevel,
    TierQuotas,
    TierFeatureFlags,
    TrialConfiguration,
    TierConditions,
    TierBenefits
} from '@/services/payment/types';
import { QuotasEditor } from './QuotasEditor';
import { FeatureFlagsEditor } from './FeatureFlagsEditor';
import { Settings, Calendar, Award, Zap } from 'lucide-react';

interface TierConfigurationEditorProps {
    initialConfiguration?: TierConfiguration;
    onSave: (configuration: TierConfiguration) => void;
    isSaving?: boolean;
}

const DEFAULT_QUOTAS: TierQuotas = {
    maxActiveCampaigns: 5,
    maxActiveRewards: 10,
    maxRewardsPerCampaign: 1,
    monthlyPointsAllowance: 500,
    maxTeamMembers: 1
};

const DEFAULT_FEATURE_FLAGS: TierFeatureFlags = {
    canCreateCampaignFromScratch: false,
    canEditAdminTemplates: false,
    hasAccessToAdvancedAnalytics: false,
    hasAccessToCRM: false,
    canUpdateReward: false,
    canCreateRewardFromScratch: false
};

const DEFAULT_CONFIGURATION: TierConfiguration = {
    quotas: DEFAULT_QUOTAS,
    featureFlags: DEFAULT_FEATURE_FLAGS,
};

export const TierConfigurationEditor: React.FC<TierConfigurationEditorProps> = ({
    initialConfiguration = DEFAULT_CONFIGURATION,
    onSave,
    isSaving
}) => {
    const [config, setConfig] = useState<TierConfiguration>(initialConfiguration);

    // Helper to update specific sections (quotas, featureFlags)
    const updateSection = (section: keyof TierConfiguration, data: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: data
        }));
    };

    // Helper for nested updates (e.g. seasonal variants)
    const updateNestedSection = (path: string[], data: any) => {
        // Simple deep update implementation
        setConfig(prev => {
            const newConfig = { ...prev };
            let current: any = newConfig;
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            current[path[path.length - 1]] = data;
            return newConfig;
        });
    };

    /**
     * Editor for a Progression Level (Pro / Pro Plus)
     */
    const ProgressionLevelEditor = ({
        levelKey,
        label,
        data
    }: {
        levelKey: 'pro' | 'pro_plus';
        label: string;
        data?: TierProgressionLevel
    }) => {
        const conditions = data?.conditions || {};
        const benefits = data?.benefits || {};

        const updateConditions = (newConditions: TierConditions) => {
            updateNestedSection([levelKey, 'conditions'], newConditions);
        };

        const updateBenefits = (newBenefits: TierBenefits) => {
            updateNestedSection([levelKey, 'benefits'], newBenefits);
        };

        const handleConditionChange = (field: keyof TierConditions, value: string | boolean) => {
            const currentConditions = conditions || {};
            // Determine if it should be a number
            const numVal = typeof value === 'string' ? parseInt(value) : value;
            // If field is boolean type (profileCompleted, kycVerified), keep as boolean, else parse int
            const finalVal = (field === 'profileCompleted' || field === 'kycVerified') ? value : (isNaN(Number(value)) ? 0 : Number(value));

            updateConditions({
                ...currentConditions,
                [field]: finalVal
            });
        };

        return (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                <h4 className="text-lg font-medium">{label} Settings</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Conditions Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-muted-foreground">Conditions (Unlock Triggers)</Label>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor={`${levelKey}-minCampaigns`}>Min Campaigns Created</Label>
                                <Input
                                    id={`${levelKey}-minCampaigns`}
                                    type="number"
                                    value={conditions.minCampaignsCreated || 0}
                                    onChange={e => handleConditionChange('minCampaignsCreated', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor={`${levelKey}-minPointsUsed`}>Min Points Used</Label>
                                <Input
                                    id={`${levelKey}-minPointsUsed`}
                                    type="number"
                                    value={conditions.minPointsUsed || 0}
                                    onChange={e => handleConditionChange('minPointsUsed', e.target.value)}
                                />
                            </div>
                            {/* Add other condition fields as needed */}
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-muted-foreground">Benefits (Unlocked)</Label>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor={`${levelKey}-bonusPoints`}>Bonus Points</Label>
                                <Input
                                    id={`${levelKey}-bonusPoints`}
                                    type="number"
                                    value={benefits.bonusPoints || 0}
                                    onChange={e => updateBenefits({ ...benefits, bonusPoints: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            {/* Quota overrides for benefits */}
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="benefit-quotas">
                                    <AccordionTrigger className="py-2 text-sm">Quota Overrides</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pt-2">
                                            <QuotasEditor
                                                quotas={benefits.quotas || {}}
                                                onChange={(q) => updateBenefits({ ...benefits, quotas: q })}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="benefit-flags">
                                    <AccordionTrigger className="py-2 text-sm">Feature Flag Overrides</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pt-2">
                                            <FeatureFlagsEditor
                                                featureFlags={benefits.featureFlags || {}}
                                                onChange={(f) => updateBenefits({ ...benefits, featureFlags: f })}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Editor for Seasonal Variants
     */
    const SeasonalVariantEditor = ({
        season,
        data
    }: {
        season: 'winter' | 'summer' | 'autumn' | 'spring';
        data?: SeasonalVariant
    }) => {
        const updateSeason = (newData: SeasonalVariant) => {
            updateSection(season, newData);
        };

        return (
            <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Seasonal Price</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data?.price || ''}
                            placeholder="Base Price Override"
                            onChange={e => updateSeason({ ...data, price: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Stripe Price ID</Label>
                        <Input
                            value={data?.stripe_price_id || ''}
                            placeholder="price_..."
                            onChange={e => updateSeason({ ...data, stripe_price_id: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>PayPal Plan ID</Label>
                        <Input
                            value={data?.paypal_plan_id || ''}
                            placeholder="P-..."
                            onChange={e => updateSeason({ ...data, paypal_plan_id: e.target.value })}
                        />
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full border rounded-md">
                    <AccordionItem value="quotas">
                        <AccordionTrigger className="px-4">Seasonal Quota Overrides</AccordionTrigger>
                        <AccordionContent className="p-4">
                            <QuotasEditor
                                quotas={data?.quotas || {}}
                                onChange={q => updateSeason({ ...data, quotas: q })}
                            />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="flags">
                        <AccordionTrigger className="px-4">Seasonal Feature Flag Overrides</AccordionTrigger>
                        <AccordionContent className="p-4">
                            <FeatureFlagsEditor
                                featureFlags={data?.featureFlags || {}}
                                onChange={f => updateSeason({ ...data, featureFlags: f })}
                            />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="progression">
                        <AccordionTrigger className="px-4">Seasonal Progression Overrides</AccordionTrigger>
                        <AccordionContent className="p-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Define specific progression rules that only apply during this season.
                            </p>
                            {/* Simplified nested progression editors for season */}
                            <div className="space-y-4">
                                <div>
                                    <h5 className="font-semibold text-sm mb-2">Seasonal Pro</h5>
                                    {/* Ideally we reuse ProgressionLevelEditor but adapting it for deep nesting might get complex for this UI demo */}
                                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                        Note: Seasonal progression configuration follows the same structure as main progression.
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tier Configuration Editor</h2>
                    <p className="text-muted-foreground">Configure global settings, quotas, and progression logic for this tier.</p>
                </div>
                <Button onClick={() => onSave(config)} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
            </div>

            <Tabs defaultValue="base" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="base" className="flex items-center gap-2"><Settings className="w-4 h-4" /> Base</TabsTrigger>
                    <TabsTrigger value="progression" className="flex items-center gap-2"><Award className="w-4 h-4" /> Progression</TabsTrigger>
                    <TabsTrigger value="seasonal" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Seasonal</TabsTrigger>
                    <TabsTrigger value="trial" className="flex items-center gap-2"><Zap className="w-4 h-4" /> Trial</TabsTrigger>
                </TabsList>

                <TabsContent value="base" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Base Configuration</CardTitle>
                            <CardDescription>Default limits and features for this tier.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-4">Quotas</h3>
                                <QuotasEditor
                                    quotas={config.quotas || {}}
                                    onChange={(q) => updateSection('quotas', q)}
                                />
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-4">Feature Flags</h3>
                                <FeatureFlagsEditor
                                    featureFlags={config.featureFlags || {}}
                                    onChange={(f) => updateSection('featureFlags', f)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="progression" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Progression Levels</CardTitle>
                            <CardDescription>Define how users can unlock Pro and Pro+ status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ProgressionLevelEditor
                                levelKey="pro"
                                label="Pro Status"
                                data={config.pro}
                            />
                            <Separator />
                            <ProgressionLevelEditor
                                levelKey="pro_plus"
                                label="Pro+ Status"
                                data={config.pro_plus}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="seasonal" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seasonal Variants</CardTitle>
                            <CardDescription>Override settings for specific times of the year.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="winter" className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="winter">Winter</TabsTrigger>
                                    <TabsTrigger value="spring">Spring</TabsTrigger>
                                    <TabsTrigger value="summer">Summer</TabsTrigger>
                                    <TabsTrigger value="autumn">Autumn</TabsTrigger>
                                </TabsList>
                                <TabsContent value="winter">
                                    <SeasonalVariantEditor season="winter" data={config.winter} />
                                </TabsContent>
                                <TabsContent value="spring">
                                    <SeasonalVariantEditor season="spring" data={config.spring} />
                                </TabsContent>
                                <TabsContent value="summer">
                                    <SeasonalVariantEditor season="summer" data={config.summer} />
                                </TabsContent>
                                <TabsContent value="autumn">
                                    <SeasonalVariantEditor season="autumn" data={config.autumn} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trial" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trial Configuration</CardTitle>
                            <CardDescription>Specific limits for users on a trial period.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-orange-50 p-4 rounded-md text-orange-800 text-sm mb-4">
                                Limits defined here override the base configuration when a user is in trial mode.
                            </div>
                            <div>
                                <h3 className="text-lg font-medium mb-4">Trial Quotas</h3>
                                <QuotasEditor
                                    quotas={config.trial?.quotas || {}}
                                    onChange={(q) => updateNestedSection(['trial', 'quotas'], q)}
                                />
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-4">Trial Feature Flags</h3>
                                <FeatureFlagsEditor
                                    featureFlags={config.trial?.featureFlags || {}}
                                    onChange={(f) => updateNestedSection(['trial', 'featureFlags'], f)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
