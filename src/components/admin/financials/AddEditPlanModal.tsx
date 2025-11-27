'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateTier, useUpdateTier } from '@/services/financials';
import { Tier, TierConfiguration } from '@/services/financials/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Tier;
  onSave: (plan: Tier) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditPlanModal({ isOpen, onClose, initialData, onSave, onShowFeedback }: AddEditPlanModalProps) {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');
  const [quaterlyPrice, setQuaterlyPrice] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);

  // Configuration State
  const [maxActiveCampaigns, setMaxActiveCampaigns] = useState<number>(5);
  const [maxRewardsPerCampaign, setMaxRewardsPerCampaign] = useState<number>(1);
  const [monthlyPointsAllowance, setMonthlyPointsAllowance] = useState<number>(500);

  const [canCreateCampaignFromScratch, setCanCreateCampaignFromScratch] = useState<boolean>(false);
  const [canEditAdminTemplates, setCanEditAdminTemplates] = useState<boolean>(false);
  const [hasAccessToAdvancedAnalytics, setHasAccessToAdvancedAnalytics] = useState<boolean>(false);
  const [hasAccessToCRM, setHasAccessToCRM] = useState<boolean>(false);

  const [activeCampaignBonus, setActiveCampaignBonus] = useState<number>(0);
  const [trustedCampaignBonus, setTrustedCampaignBonus] = useState<number>(0);
  const [partnerCampaignBonus, setPartnerCampaignBonus] = useState<number>(0);

  const createTierMutation = useCreateTier();
  const updateTierMutation = useUpdateTier();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMonthlyPrice(initialData.monthlyPrice);
      setQuaterlyPrice(initialData.quaterlyPrice ?? '');
      setAnnualPrice(initialData.annualPrice);
      setFeatures(initialData.features.length > 0 ? initialData.features : ['']);

      // Populate Configuration
      if (initialData.configuration) {
        setMaxActiveCampaigns(initialData.configuration.quotas.maxActiveCampaigns);
        setMaxRewardsPerCampaign(initialData.configuration.quotas.maxRewardsPerCampaign);
        setMonthlyPointsAllowance(initialData.configuration.quotas.monthlyPointsAllowance);

        setCanCreateCampaignFromScratch(initialData.configuration.featureFlags.canCreateCampaignFromScratch);
        setCanEditAdminTemplates(initialData.configuration.featureFlags.canEditAdminTemplates);
        setHasAccessToAdvancedAnalytics(initialData.configuration.featureFlags.hasAccessToAdvancedAnalytics);
        setHasAccessToCRM(initialData.configuration.featureFlags.hasAccessToCRM);

        if (initialData.configuration.progressBonuses) {
          setActiveCampaignBonus(initialData.configuration.progressBonuses['active_campaign_bonus'] || 0);
          setTrustedCampaignBonus(initialData.configuration.progressBonuses['trusted_campaign_bonus'] || 0);
          setPartnerCampaignBonus(initialData.configuration.progressBonuses['partner_campaign_bonus'] || 0);
        }
      }
    } else {
      setName('');
      setMonthlyPrice('');
      setQuaterlyPrice('');
      setAnnualPrice('');
      setFeatures(['']);

      // Reset Configuration
      setMaxActiveCampaigns(5);
      setMaxRewardsPerCampaign(1);
      setMonthlyPointsAllowance(500);
      setCanCreateCampaignFromScratch(false);
      setCanEditAdminTemplates(false);
      setHasAccessToAdvancedAnalytics(false);
      setHasAccessToCRM(false);
      setActiveCampaignBonus(0);
      setTrustedCampaignBonus(0);
      setPartnerCampaignBonus(0);
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
    const configuration: TierConfiguration = {
      quotas: {
        maxActiveCampaigns,
        maxRewardsPerCampaign,
        monthlyPointsAllowance,
      },
      featureFlags: {
        canCreateCampaignFromScratch,
        canEditAdminTemplates,
        hasAccessToAdvancedAnalytics,
        hasAccessToCRM,
      },
      progressBonuses: {
        active_campaign_bonus: activeCampaignBonus,
        trusted_campaign_bonus: trustedCampaignBonus,
        partner_campaign_bonus: partnerCampaignBonus,
      },
    };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Subscription Plan</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="configuration">Configuration & Capabilities</TabsTrigger>
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

            {/* Quotas Section */}
            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="font-semibold text-lg">Quotas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxActiveCampaigns">Max Active Campaigns (-1 for unlimited)</Label>
                  <Input
                    id="maxActiveCampaigns"
                    type="number"
                    value={maxActiveCampaigns}
                    onChange={(e) => setMaxActiveCampaigns(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxRewardsPerCampaign">Max Rewards Per Campaign</Label>
                  <Input
                    id="maxRewardsPerCampaign"
                    type="number"
                    value={maxRewardsPerCampaign}
                    onChange={(e) => setMaxRewardsPerCampaign(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyPointsAllowance">Monthly Points Allowance</Label>
                  <Input
                    id="monthlyPointsAllowance"
                    type="number"
                    value={monthlyPointsAllowance}
                    onChange={(e) => setMonthlyPointsAllowance(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags Section */}
            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="font-semibold text-lg">Feature Flags</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="canCreateCampaignFromScratch">Create Custom Campaigns</Label>
                  <Switch
                    id="canCreateCampaignFromScratch"
                    checked={canCreateCampaignFromScratch}
                    onCheckedChange={setCanCreateCampaignFromScratch}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="canEditAdminTemplates">Edit Admin Templates</Label>
                  <Switch
                    id="canEditAdminTemplates"
                    checked={canEditAdminTemplates}
                    onCheckedChange={setCanEditAdminTemplates}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="hasAccessToAdvancedAnalytics">Advanced Analytics Access</Label>
                  <Switch
                    id="hasAccessToAdvancedAnalytics"
                    checked={hasAccessToAdvancedAnalytics}
                    onCheckedChange={setHasAccessToAdvancedAnalytics}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="hasAccessToCRM">CRM Access</Label>
                  <Switch
                    id="hasAccessToCRM"
                    checked={hasAccessToCRM}
                    onCheckedChange={setHasAccessToCRM}
                  />
                </div>
              </div>
            </div>

            {/* Progress Bonuses Section */}
            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="font-semibold text-lg">Progress Bonuses (Extra Campaigns)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="activeCampaignBonus">Active Level Bonus</Label>
                  <Input
                    id="activeCampaignBonus"
                    type="number"
                    value={activeCampaignBonus}
                    onChange={(e) => setActiveCampaignBonus(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="trustedCampaignBonus">Trusted Level Bonus</Label>
                  <Input
                    id="trustedCampaignBonus"
                    type="number"
                    value={trustedCampaignBonus}
                    onChange={(e) => setTrustedCampaignBonus(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="partnerCampaignBonus">Partner Level Bonus</Label>
                  <Input
                    id="partnerCampaignBonus"
                    type="number"
                    value={partnerCampaignBonus}
                    onChange={(e) => setPartnerCampaignBonus(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

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