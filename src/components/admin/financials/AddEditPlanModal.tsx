'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateTier, useUpdateTier } from '@/services/financials';
import { Tier, TierConfiguration, TierQuotas, TierFeatureFlags, TierProgressBonuses, SeasonalVariant, ProgressionLevel, ProgressionConditions, ProgressionBenefits, TrialConfiguration } from '@/services/financials/types';
import { PlusCircle, Trash2, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

interface AddEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Tier;
  onSave: (plan: Tier) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
  planType?: 'standard' | 'seasonal';
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
    canCreateRewardFromScratch: false,
  },
  progressBonuses: {
    active_campaign_bonus: 0,
    trusted_campaign_bonus: 0,
    partner_campaign_bonus: 0,
  },
};

export function AddEditPlanModal({ isOpen, onClose, initialData, onSave, onShowFeedback, planType = 'standard' }: AddEditPlanModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'standard' | 'seasonal'>('standard');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fixedPrice, setFixedPrice] = useState('');
  const [qrCodeCount, setQrCodeCount] = useState<string>('0');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
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
      // Prioritize the passed planType (from selection modal) if available, otherwise fallback to existing data
      // This allows users to "convert" a plan or fix missing types
      setType(planType || initialData.type || 'standard');
      setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '');
      setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '');
      setFixedPrice(initialData.fixedPrice || '');
      setQrCodeCount(initialData.qrCodeCount?.toString() || '0');
      setStatus((initialData.status as 'draft' | 'published') || 'draft');
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
          // Ensure pro/pro_plus/seasonal are preserved if they exist
          pro: config.pro,
          pro_plus: config.pro_plus,
          winter: config.winter,
          summer: config.summer,
          autumn: config.autumn,
          spring: config.spring,
        };
      };

      setConfiguration(normalizeConfiguration(initialData.configuration));
    } else {
      setName('');
      setType(planType); // Use prop when creating
      setStartDate('');
      setEndDate('');
      setFixedPrice('');
      setQrCodeCount('0');
      setStatus('draft');
      setMonthlyPrice('');
      setQuaterlyPrice('');
      setAnnualPrice('');
      setFeatures(['']);
      setConfiguration(defaultConfiguration);
    }
  }, [initialData, isOpen, planType]);

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
      type,
      start_date: type === 'seasonal' && startDate ? new Date(startDate).toISOString() : undefined,
      end_date: type === 'seasonal' && endDate ? new Date(endDate).toISOString() : undefined,
      fixed_price: type === 'seasonal' && fixedPrice ? parseFloat(fixedPrice) : undefined,
      qrCodeCount: parseInt(qrCodeCount) || 0,
      status,
      monthly_price: parseFloat(monthlyPrice) || 0,
      quaterly_price: parseFloat(quaterlyPrice) || 0,
      annual_price: parseFloat(annualPrice) || 0,
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

  const updateProgressionLevel = (level: 'pro' | 'pro_plus', data: ProgressionLevel) => {
    setConfiguration(prev => ({
      ...prev,
      [level]: data
    }));
  };

  const updateSeasonalVariant = (season: 'winter' | 'summer' | 'autumn' | 'spring', variantData: SeasonalVariant) => {
    setConfiguration(prev => ({
      ...prev,
      [season]: variantData
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Subscription Plan</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="progression">Progression (Pro/Pro+)</TabsTrigger>
            {type === 'standard' && <TabsTrigger value="trial">Trial</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div>
              <LabelWithTooltip label="Plan Name" tooltip="The public name of the subscription plan (e.g., 'Bronze', 'Gold')." />
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gold Plan" />
              <p className="text-sm text-muted-foreground mt-1">This name will be displayed to users during checkout.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <LabelWithTooltip label="QR Code Plaque Count" tooltip="Number of physical QR code plaques included in this plan." />
                <Input type="number" value={qrCodeCount} onChange={(e) => setQrCodeCount(e.target.value)} />
              </div>
              <div className="flex flex-col justify-center">
                <LabelWithTooltip label="Status" tooltip="Draft plans are not visible to users." />
                <div className="flex items-center space-x-2 mt-1">
                  <Switch
                    checked={status === 'published'}
                    onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')}
                  />
                  <span className="text-sm font-medium">{status === 'published' ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            </div>

            {type === 'seasonal' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <LabelWithTooltip label="Fixed Price" tooltip="One-time price for this seasonal plan." />
                  <Input id="fixedPrice" type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <LabelWithTooltip label="Start Date" tooltip="When this seasonal plan becomes active." />
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <LabelWithTooltip label="End Date" tooltip="When this seasonal plan expires." />
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <LabelWithTooltip label="Monthly Price" tooltip="The cost of the plan billed monthly." />
                <Input id="monthlyPrice" type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <LabelWithTooltip label="Quarterly Price" tooltip="The cost of the plan billed every 3 months." />
                <Input id="quaterlyPrice" type="number" value={quaterlyPrice} onChange={(e) => setQuaterlyPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <LabelWithTooltip label="Annual Price" tooltip="The cost of the plan billed yearly." />
                <Input id="annualPrice" type="number" value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div>
              <LabelWithTooltip label="Features (Display Only)" tooltip="List of features to display on the pricing card. These are for display purposes only and do not affect functionality." />
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} placeholder="e.g. Advanced Analytics" />
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

          <TabsContent value="progression" className="space-y-6 py-4">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="pro">
                <AccordionTrigger>Pro Level</AccordionTrigger>
                <AccordionContent>
                  <ProgressionLevelSection
                    level={configuration.pro || { conditions: {}, benefits: {} }}
                    onChange={(data) => updateProgressionLevel('pro', data)}
                    title="Pro"
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pro_plus">
                <AccordionTrigger>Pro Plus Level</AccordionTrigger>
                <AccordionContent>
                  <ProgressionLevelSection
                    level={configuration.pro_plus || { conditions: {}, benefits: {} }}
                    onChange={(data) => updateProgressionLevel('pro_plus', data)}
                    title="Pro Plus"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>



          <TabsContent value="trial" className="space-y-6 py-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex gap-2 text-sm text-blue-700">
              <Info className="h-5 w-5 shrink-0" />
              <p>
                Configure specific limitations for users on a trial period. These settings override the base configuration when a user is in trial status.
              </p>
            </div>
            <TrialConfigurationSection
              trial={configuration.trial || { quotas: {}, featureFlags: {} }}
              onChange={(t) => setConfiguration(prev => ({ ...prev, trial: t }))}
            />
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

function InputWithUnlimitedCheckbox({ value, onChange, placeholder }: { value: number | undefined, onChange: (value: number) => void, placeholder?: string }) {
  const isUnlimited = value === -1;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onChange(-1);
    } else {
      onChange(0); // Reset to 0 or some default when unchecked
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else {
      onChange(0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox id={`unlimited-${Math.random()}`} checked={isUnlimited} onCheckedChange={handleCheckboxChange} />
        <label htmlFor={`unlimited-${Math.random()}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Unlimited
        </label>
      </div>
      <Input
        type="number"
        value={isUnlimited ? '' : (value ?? '')}
        onChange={handleInputChange}
        placeholder={isUnlimited ? 'Unlimited' : placeholder}
        disabled={isUnlimited}
      />
    </div>
  );
}

function LabelWithTooltip({ label, tooltip }: { label: string, tooltip: string }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <Label>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function QuotasSection({ quotas, onChange }: { quotas: Partial<TierQuotas>, onChange: (key: keyof TierQuotas, value: number) => void }) {
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-semibold text-lg">Quotas</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <LabelWithTooltip label="Max Active Campaigns" tooltip="The maximum number of campaigns a business can have active simultaneously. Check 'Unlimited' to set to -1." />
          <InputWithUnlimitedCheckbox
            value={quotas.maxActiveCampaigns}
            onChange={(val) => onChange('maxActiveCampaigns', val)}
            placeholder="Inherit"
          />
        </div>
        <div>
          <LabelWithTooltip label="Max Active Rewards" tooltip="The maximum number of active rewards a business can have. Check 'Unlimited' to set to -1." />
          <InputWithUnlimitedCheckbox
            value={quotas.maxActiveRewards}
            onChange={(val) => onChange('maxActiveRewards', val)}
            placeholder="Inherit"
          />
        </div>
        <div>
          <LabelWithTooltip label="Max Rewards Per Campaign" tooltip="The maximum number of rewards that can be attached to a single campaign." />
          <Input
            type="number"
            value={quotas.maxRewardsPerCampaign ?? ''}
            onChange={(e) => onChange('maxRewardsPerCampaign', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <LabelWithTooltip label="Monthly Points Allowance" tooltip="The amount of system points credited to the business each month." />
          <Input
            type="number"
            value={quotas.monthlyPointsAllowance ?? ''}
            onChange={(e) => onChange('monthlyPointsAllowance', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <LabelWithTooltip label="Max Team Members" tooltip="The maximum number of team members (staff) a business can have. Check 'Unlimited' to set to -1." />
          <InputWithUnlimitedCheckbox
            value={quotas.maxTeamMembers}
            onChange={(val) => onChange('maxTeamMembers', val)}
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
          tooltip="If enabled, the business can create custom campaigns. If disabled, they must use Admin-created templates."
          checked={flags.canCreateCampaignFromScratch}
          onChange={(v) => onChange('canCreateCampaignFromScratch', v)}
        />
        <FeatureFlagToggle
          label="Edit Admin Templates"
          tooltip="If enabled, the business can modify the details of a template. If disabled, the template is read-only."
          checked={flags.canEditAdminTemplates}
          onChange={(v) => onChange('canEditAdminTemplates', v)}
        />
        <FeatureFlagToggle
          label="Advanced Analytics Access"
          tooltip="Grants access to detailed analytics dashboards."
          checked={flags.hasAccessToAdvancedAnalytics}
          onChange={(v) => onChange('hasAccessToAdvancedAnalytics', v)}
        />
        <FeatureFlagToggle
          label="CRM Access"
          tooltip="Grants access to Customer Relationship Management features."
          checked={flags.hasAccessToCRM}
          onChange={(v) => onChange('hasAccessToCRM', v)}
        />
        <FeatureFlagToggle
          label="Update Rewards"
          tooltip="If enabled, the business can edit their existing rewards."
          checked={flags.canUpdateReward}
          onChange={(v) => onChange('canUpdateReward', v)}
        />
        <FeatureFlagToggle
          label="Create Custom Rewards"
          tooltip="If enabled, the business can create custom rewards. If disabled, they must use Admin-created templates."
          checked={flags.canCreateRewardFromScratch}
          onChange={(v) => onChange('canCreateRewardFromScratch', v)}
        />
      </div>
    </div>
  );
}

function FeatureFlagToggle({ label, tooltip, checked, onChange }: { label: string, tooltip: string, checked?: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
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
          <LabelWithTooltip label="Active Level Bonus" tooltip="Bonus campaigns allowed when business reaches 'Active' status." />
          <Input
            type="number"
            value={bonuses['active_campaign_bonus'] ?? ''}
            onChange={(e) => onChange('active_campaign_bonus', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <LabelWithTooltip label="Trusted Level Bonus" tooltip="Bonus campaigns allowed when business reaches 'Trusted' status." />
          <Input
            type="number"
            value={bonuses['trusted_campaign_bonus'] ?? ''}
            onChange={(e) => onChange('trusted_campaign_bonus', parseInt(e.target.value))}
            placeholder="Inherit"
          />
        </div>
        <div>
          <LabelWithTooltip label="Partner Level Bonus" tooltip="Bonus campaigns allowed when business reaches 'Partner' status." />
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

function ProgressionLevelSection({ level, onChange, title }: { level: ProgressionLevel, onChange: (v: ProgressionLevel) => void, title: string }) {
  const updateCondition = (key: keyof ProgressionConditions, value: number | boolean) => {
    onChange({
      ...level,
      conditions: { ...level.conditions, [key]: value }
    });
  };

  const updateBenefitQuota = (key: keyof TierQuotas, value: number) => {
    onChange({
      ...level,
      benefits: {
        ...level.benefits,
        quotas: { ...level.benefits.quotas, [key]: value }
      }
    });
  };

  const updateBenefitFlag = (key: keyof TierFeatureFlags, value: boolean) => {
    onChange({
      ...level,
      benefits: {
        ...level.benefits,
        featureFlags: { ...level.benefits.featureFlags, [key]: value }
      }
    });
  };

  const updateBonusPoints = (value: number) => {
    onChange({
      ...level,
      benefits: { ...level.benefits, bonusPoints: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md space-y-4">
        <h3 className="font-semibold text-lg">{title} Unlock Conditions</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip label="Min Campaigns Created" tooltip="Minimum total campaigns created to unlock this level." />
            <Input type="number" value={level.conditions.minCampaignsCreated ?? ''} onChange={(e) => updateCondition('minCampaignsCreated', parseInt(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Min Rewards Created" tooltip="Minimum total rewards created to unlock this level." />
            <Input type="number" value={level.conditions.minRewardsCreated ?? ''} onChange={(e) => updateCondition('minRewardsCreated', parseInt(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Min Points Used" tooltip="Minimum total points distributed/redeemed to unlock this level." />
            <Input type="number" value={level.conditions.minPointsUsed ?? ''} onChange={(e) => updateCondition('minPointsUsed', parseInt(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Min Customer Scans" tooltip="Minimum number of QR/NFC scans received to unlock this level." />
            <Input type="number" value={level.conditions.minCustomerScans ?? ''} onChange={(e) => updateCondition('minCustomerScans', parseInt(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Min Participants" tooltip="Minimum number of unique participants engaged to unlock this level." />
            <Input type="number" value={level.conditions.minParticipants ?? ''} onChange={(e) => updateCondition('minParticipants', parseInt(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Min Customer Interactions" tooltip="Total interactions (scans + redemptions) required to unlock this level." />
            <Input type="number" value={level.conditions.minCustomerInteractions ?? ''} onChange={(e) => updateCondition('minCustomerInteractions', parseInt(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Min Days Active" tooltip="Days since registration required to unlock this level." />
            <Input type="number" value={level.conditions.minDaysActive ?? ''} onChange={(e) => updateCondition('minDaysActive', parseInt(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={level.conditions.profileCompleted || false} onCheckedChange={(v) => updateCondition('profileCompleted', v)} />
            <LabelWithTooltip label="Profile Completed" tooltip="Requires the business profile to be fully filled." />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={level.conditions.kycVerified || false} onCheckedChange={(v) => updateCondition('kycVerified', v)} />
            <LabelWithTooltip label="KYC Verified" tooltip="Requires KYC documents to be verified." />
          </div>
        </div>
      </div>

      <div className="border p-4 rounded-md space-y-4">
        <h3 className="font-semibold text-lg">{title} Benefits</h3>
        <div className="space-y-4">
          <div>
            <LabelWithTooltip label="Bonus Points" tooltip="One-time or monthly bonus points added to allowance when this level is reached." />
            <Input type="number" value={level.benefits.bonusPoints ?? ''} onChange={(e) => updateBonusPoints(parseInt(e.target.value))} />
          </div>
          <QuotasSection quotas={level.benefits.quotas || {}} onChange={updateBenefitQuota} />
          <FeatureFlagsSection flags={level.benefits.featureFlags || {}} onChange={updateBenefitFlag} />
        </div>
      </div>
    </div>
  );
}

function SeasonalVariantSection({ variant, onChange, title }: { variant: SeasonalVariant, onChange: (v: SeasonalVariant) => void, title: string }) {
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

  const updatePricing = (key: keyof SeasonalVariant, value: string | number) => {
    onChange({
      ...variant,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md space-y-4">
        <h3 className="font-semibold text-lg">{title} Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip label="Price" tooltip="The specific price for this seasonal variant." />
            <Input type="number" value={variant.price ?? ''} onChange={(e) => updatePricing('price', parseFloat(e.target.value))} />
          </div>
          <div>
            <LabelWithTooltip label="Stripe Price ID" tooltip="The Stripe Price ID for this seasonal variant." />
            <Input value={variant.stripe_price_id ?? ''} onChange={(e) => updatePricing('stripe_price_id', e.target.value)} />
          </div>
          <div>
            <LabelWithTooltip label="PayPal Plan ID" tooltip="The PayPal Plan ID for this seasonal variant." />
            <Input value={variant.paypal_plan_id ?? ''} onChange={(e) => updatePricing('paypal_plan_id', e.target.value)} />
          </div>
        </div>
      </div>

      <QuotasSection quotas={variant.quotas || {}} onChange={updateQuota} />
      <FeatureFlagsSection flags={variant.featureFlags || {}} onChange={updateFeatureFlag} />
      <ProgressBonusesSection bonuses={variant.progressBonuses || {}} onChange={updateProgressBonus} />
    </div>
  );
}

function TrialConfigurationSection({ trial, onChange }: { trial: TrialConfiguration, onChange: (t: TrialConfiguration) => void }) {
  const updateQuota = (key: keyof TierQuotas, value: number) => {
    onChange({
      ...trial,
      quotas: { ...trial.quotas, [key]: value }
    });
  };

  const updateFeatureFlag = (key: keyof TierFeatureFlags, value: boolean) => {
    onChange({
      ...trial,
      featureFlags: { ...trial.featureFlags, [key]: value }
    });
  };

  return (
    <div className="space-y-6">
      <QuotasSection quotas={trial.quotas || {}} onChange={updateQuota} />
      <FeatureFlagsSection flags={trial.featureFlags || {}} onChange={updateFeatureFlag} />
    </div>
  );
}