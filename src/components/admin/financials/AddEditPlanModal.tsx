'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateTier, useUpdateTier } from '@/services/financials';
import { Tier, TierConfiguration, TierVariant, TierQuotas, TierFeatureFlags, TierProgressBonuses } from '@/services/financials/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AddEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Tier;
  onSave: (plan: Tier) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

const defaultConfiguration: TierConfiguration = {
  quotas: {
    maxActiveCampaigns: 5,
    maxActiveRewards: 10,
    maxRewardsPerCampaign: 1,
    monthlyPointsAllowance: 500,
    maxTeamMembers: 1,
  },
  featureFlags: {
    canCreateCampaignFromScratch: false,
    canEditAdminTemplates: false,
    hasAccessToAdvancedAnalytics: false,
    hasAccessToCRM: false,
    canUpdateReward: false,
  },
  progressBonuses: {
    active_campaign_bonus: 0,
    trusted_campaign_bonus: 0,
    partner_campaign_bonus: 0,
  },
  enablePro: false,
  enableProPlus: false,
};

export function AddEditPlanModal({ isOpen, onClose, initialData, onSave, onShowFeedback }: AddEditPlanModalProps) {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');
  const [quaterlyPrice, setQuaterlyPrice] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);

  const [configuration, setConfiguration] = useState<TierConfiguration>(defaultConfiguration);

  const createTierMutation = useCreateTier();
  const updateTierMutation = useUpdateTier();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMonthlyPrice(initialData.monthlyPrice);
      setQuaterlyPrice(initialData.quaterlyPrice ?? '');
      setAnnualPrice(initialData.annualPrice);
      setFeatures(initialData.features.length > 0 ? initialData.features : ['']);

      // Helper to normalize configuration from API (camelCase) to Component (snake_case/specific keys)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalizeConfiguration = (config: any): TierConfiguration => {
        const normalizedFlags = {
          ...defaultConfiguration.featureFlags,
          ...config.featureFlags,
          // Fix casing mismatch: API returns hasAccessToCrm, component expects hasAccessToCRM
          hasAccessToCRM: config.featureFlags?.hasAccessToCrm ?? config.featureFlags?.hasAccessToCRM ?? false,
        };

        const normalizedBonuses = {
          ...defaultConfiguration.progressBonuses,
          ...config.progressBonuses,
          // Fix casing mismatch: API returns camelCase, component expects snake_case
          active_campaign_bonus: config.progressBonuses?.activeCampaignBonus ?? config.progressBonuses?.active_campaign_bonus ?? 0,
          trusted_campaign_bonus: config.progressBonuses?.trustedCampaignBonus ?? config.progressBonuses?.trusted_campaign_bonus ?? 0,
          partner_campaign_bonus: config.progressBonuses?.partnerCampaignBonus ?? config.progressBonuses?.partner_campaign_bonus ?? 0,
        };

        return {
          ...defaultConfiguration,
          ...config,
          quotas: { ...defaultConfiguration.quotas, ...config.quotas },
          featureFlags: normalizedFlags,
          progressBonuses: normalizedBonuses,
          // Recursively normalize variants if they exist
          pro: config.pro ? { ...config.pro, featureFlags: { ...config.pro.featureFlags, hasAccessToCRM: config.pro.featureFlags?.hasAccessToCrm ?? config.pro.featureFlags?.hasAccessToCRM }, progressBonuses: { ...config.pro.progressBonuses, active_campaign_bonus: config.pro.progressBonuses?.activeCampaignBonus ?? config.pro.progressBonuses?.active_campaign_bonus, trusted_campaign_bonus: config.pro.progressBonuses?.trustedCampaignBonus ?? config.pro.progressBonuses?.trusted_campaign_bonus, partner_campaign_bonus: config.pro.progressBonuses?.partnerCampaignBonus ?? config.pro.progressBonuses?.partner_campaign_bonus } } : undefined,
          pro_plus: config.pro_plus ? { ...config.pro_plus, featureFlags: { ...config.pro_plus.featureFlags, hasAccessToCRM: config.pro_plus.featureFlags?.hasAccessToCrm ?? config.pro_plus.featureFlags?.hasAccessToCRM }, progressBonuses: { ...config.pro_plus.progressBonuses, active_campaign_bonus: config.pro_plus.progressBonuses?.activeCampaignBonus ?? config.pro_plus.progressBonuses?.active_campaign_bonus, trusted_campaign_bonus: config.pro_plus.progressBonuses?.trustedCampaignBonus ?? config.pro_plus.progressBonuses?.trusted_campaign_bonus, partner_campaign_bonus: config.pro_plus.progressBonuses?.partnerCampaignBonus ?? config.pro_plus.progressBonuses?.partner_campaign_bonus } } : undefined,
        };
      };

      setConfiguration(normalizeConfiguration(initialData.configuration));
    } else {
      setName('');
      setMonthlyPrice('');
      setQuaterlyPrice('');
      setAnnualPrice('');
      setFeatures(['']);
      setConfiguration(defaultConfiguration);
    }
  }, [initialData, isOpen]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const planData = {
      name,
      monthly_price: parseFloat(monthlyPrice),
      quaterly_price: parseFloat(quaterlyPrice),
      annual_price: parseFloat(annualPrice),
      features: features.filter(f => f.trim() !== ''),
      configuration,
    };

    try {
      let savedPlan;
      if (initialData) {
        savedPlan = await updateTierMutation.mutateAsync({ ...planData, id: initialData.id });
      } else {
        savedPlan = await createTierMutation.mutateAsync(planData);
      }
      onSave(savedPlan);
      onClose();
    } catch (error) {
      onShowFeedback('Error', 'There was an error saving the plan.', 'OK');
    }
  };

  const updateQuota = (key: keyof TierQuotas, value: number) => {
    setConfiguration(prev => ({
      ...prev,
      quotas: { ...prev.quotas, [key]: value }
    }));
  };

  const updateFeatureFlag = (key: keyof TierFeatureFlags, value: boolean) => {
    setConfiguration(prev => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [key]: value }
    }));
  };

  const updateProgressBonus = (key: string, value: number) => {
    setConfiguration(prev => ({
      ...prev,
      progressBonuses: { ...prev.progressBonuses, [key]: value }
    }));
  };

  const updateVariant = (variantName: 'pro' | 'pro_plus', variantData: TierVariant) => {
    setConfiguration(prev => ({
      ...prev,
      [variantName]: variantData
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Subscription Plan</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="variants">Variants (Pro/Pro+)</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthlyPrice">Monthly Price</Label>
                <Input id="monthlyPrice" type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="quaterlyPrice">Quarterly Price</Label>
                <Input id="quaterlyPrice" type="number" value={quaterlyPrice} onChange={(e) => setQuaterlyPrice(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="annualPrice">Annual Price</Label>
                <Input id="annualPrice" type="number" value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Features (Display Only)</Label>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} />
                  <Button variant="destructive" size="icon" onClick={() => removeFeature(index)} disabled={features.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFeature}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6 py-4">
            <QuotasSection quotas={configuration.quotas} onChange={updateQuota} />
            <FeatureFlagsSection flags={configuration.featureFlags} onChange={updateFeatureFlag} />
            <ProgressBonusesSection bonuses={configuration.progressBonuses || {}} onChange={updateProgressBonus} />
          </TabsContent>

          <TabsContent value="variants" className="space-y-6 py-4">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="pro">
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <span>Pro Variant</span>
                    <Switch
                      checked={configuration.enablePro}
                      onCheckedChange={(checked) => setConfiguration(prev => ({ ...prev, enablePro: checked }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {configuration.enablePro && (
                    <VariantSection
                      variant={configuration.pro || {}}
                      onChange={(v) => updateVariant('pro', v)}
                      title="Pro"
                    />
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pro_plus">
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <span>Pro Plus Variant</span>
                    <Switch
                      checked={configuration.enableProPlus}
                      onCheckedChange={(checked) => setConfiguration(prev => ({ ...prev, enableProPlus: checked }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {configuration.enableProPlus && (
                    <VariantSection
                      variant={configuration.pro_plus || {}}
                      onChange={(v) => updateVariant('pro_plus', v)}
                      title="Pro Plus"
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createTierMutation.isPending || updateTierMutation.isPending}>
            {createTierMutation.isPending || updateTierMutation.isPending ? 'Saving...' : 'Save Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components

function QuotasSection({ quotas, onChange }: { quotas: Partial<TierQuotas>, onChange: (key: keyof TierQuotas, value: number) => void }) {
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-semibold text-lg">Quotas</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxActiveCampaigns">Max Active Campaigns (-1 for unlimited)</Label>
          <Input
            type="number"
            value={quotas.maxActiveCampaigns ?? ''}
            onChange={(e) => onChange('maxActiveCampaigns', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <Label htmlFor="maxActiveRewards">Max Active Rewards (-1 for unlimited)</Label>
          <Input
            type="number"
            value={quotas.maxActiveRewards ?? ''}
            onChange={(e) => onChange('maxActiveRewards', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <Label htmlFor="maxRewardsPerCampaign">Max Rewards Per Campaign</Label>
          <Input
            type="number"
            value={quotas.maxRewardsPerCampaign ?? ''}
            onChange={(e) => onChange('maxRewardsPerCampaign', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <Label htmlFor="monthlyPointsAllowance">Monthly Points Allowance</Label>
          <Input
            type="number"
            value={quotas.monthlyPointsAllowance ?? ''}
            onChange={(e) => onChange('monthlyPointsAllowance', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <Label htmlFor="maxTeamMembers">Max Team Members (-1 for unlimited)</Label>
          <Input
            type="number"
            value={quotas.maxTeamMembers ?? ''}
            onChange={(e) => onChange('maxTeamMembers', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureFlagsSection({ flags, onChange }: { flags: Partial<TierFeatureFlags>, onChange: (key: keyof TierFeatureFlags, value: boolean) => void }) {
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-semibold text-lg">Feature Flags</h3>
      <div className="grid grid-cols-2 gap-4">
        <FeatureFlagToggle
          label="Create Custom Campaigns"
          checked={flags.canCreateCampaignFromScratch}
          onChange={(v) => onChange('canCreateCampaignFromScratch', v)}
        />
        <FeatureFlagToggle
          label="Edit Admin Templates"
          checked={flags.canEditAdminTemplates}
          onChange={(v) => onChange('canEditAdminTemplates', v)}
        />
        <FeatureFlagToggle
          label="Advanced Analytics Access"
          checked={flags.hasAccessToAdvancedAnalytics}
          onChange={(v) => onChange('hasAccessToAdvancedAnalytics', v)}
        />
        <FeatureFlagToggle
          label="CRM Access"
          checked={flags.hasAccessToCRM}
          onChange={(v) => onChange('hasAccessToCRM', v)}
        />
        <FeatureFlagToggle
          label="Update Rewards"
          checked={flags.canUpdateReward}
          onChange={(v) => onChange('canUpdateReward', v)}
        />
      </div>
    </div>
  );
}

function FeatureFlagToggle({ label, checked, onChange }: { label: string, checked?: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <Label>{label}</Label>
      <Switch checked={checked || false} onCheckedChange={onChange} />
    </div>
  );
}

function ProgressBonusesSection({ bonuses, onChange }: { bonuses: Partial<TierProgressBonuses>, onChange: (key: string, value: number) => void }) {
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-semibold text-lg">Progress Bonuses (Extra Campaigns)</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Active Level Bonus</Label>
          <Input
            type="number"
            value={bonuses['active_campaign_bonus'] ?? ''}
            onChange={(e) => onChange('active_campaign_bonus', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <Label>Trusted Level Bonus</Label>
          <Input
            type="number"
            value={bonuses['trusted_campaign_bonus'] ?? ''}
            onChange={(e) => onChange('trusted_campaign_bonus', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <Label>Partner Level Bonus</Label>
          <Input
            type="number"
            value={bonuses['partner_campaign_bonus'] ?? ''}
            onChange={(e) => onChange('partner_campaign_bonus', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
      </div>
    </div>
  );
}

function VariantSection({ variant, onChange, title }: { variant: TierVariant, onChange: (v: TierVariant) => void, title: string }) {
  const updateQuota = (key: keyof TierQuotas, value: number) => {
    onChange({
      ...variant,
      quotas: { ...variant.quotas, [key]: value }
    });
  };

  const updateFeatureFlag = (key: keyof TierFeatureFlags, value: boolean) => {
    onChange({
      ...variant,
      featureFlags: { ...variant.featureFlags, [key]: value }
    });
  };

  const updateProgressBonus = (key: string, value: number) => {
    onChange({
      ...variant,
      progressBonuses: { ...variant.progressBonuses, [key]: value }
    });
  };

  const updatePricing = (key: keyof TierVariant, value: string | number) => {
    onChange({
      ...variant,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md space-y-4">
        <h3 className="font-semibold text-lg">{title} Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Monthly Price</Label>
            <Input type="number" value={variant.monthly_price ?? ''} onChange={(e) => updatePricing('monthly_price', parseFloat(e.target.value))} />
          </div>
          <div>
            <Label>Stripe Monthly ID</Label>
            <Input value={variant.stripe_monthly_price_id ?? ''} onChange={(e) => updatePricing('stripe_monthly_price_id', e.target.value)} />
          </div>

          <div>
            <Label>Quarterly Price</Label>
            <Input type="number" value={variant.quaterly_price ?? ''} onChange={(e) => updatePricing('quaterly_price', parseFloat(e.target.value))} />
          </div>
          <div>
            <Label>Stripe Quarterly ID</Label>
            <Input value={variant.stripe_quarterly_price_id ?? ''} onChange={(e) => updatePricing('stripe_quarterly_price_id', e.target.value)} />
          </div>

          <div>
            <Label>Annual Price</Label>
            <Input type="number" value={variant.annual_price ?? ''} onChange={(e) => updatePricing('annual_price', parseFloat(e.target.value))} />
          </div>
          <div>
            <Label>Stripe Annual ID</Label>
            <Input value={variant.stripe_annual_price_id ?? ''} onChange={(e) => updatePricing('stripe_annual_price_id', e.target.value)} />
          </div>
        </div>
      </div>

      <QuotasSection quotas={variant.quotas || {}} onChange={updateQuota} />
      <FeatureFlagsSection flags={variant.featureFlags || {}} onChange={updateFeatureFlag} />
      <ProgressBonusesSection bonuses={variant.progressBonuses || {}} onChange={updateProgressBonus} />
    </div>
  );
}