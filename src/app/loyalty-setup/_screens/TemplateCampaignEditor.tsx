'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { CampaignFormProvider, useCampaignForm } from '@/context/CampaignFormContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, X } from 'lucide-react';
import FullCampaignPreview from '@/components/dashboard/campaigns/previews/FullCampaignPreview';
import EarnPointsPagePreview from '@/components/dashboard/campaigns/previews/EarnPointsPagePreview';
import RedeemPointsPagePreview from '@/components/dashboard/campaigns/previews/RedeemPointsPagePreview';
import ContactUsPagePreview from '@/components/dashboard/campaigns/previews/ContactUsPagePreview';
import FooterPreview from '@/components/dashboard/campaigns/previews/FooterPreview';
import StepChooseCampaignType from '@/components/dashboard/campaigns/StepChooseCampaignType';
import StepSetCampaignDetails from '@/components/dashboard/campaigns/StepSetCampaignDetails';
import StepConfigureEarnPoints from '@/components/dashboard/campaigns/StepConfigureEarnPoints';
import StepConfigureRedeemPoints from '@/components/dashboard/campaigns/StepConfigureRedeemPoints';
import StepConfigureContactUs from '@/components/dashboard/campaigns/StepConfigureContactUs';
import StepConfigureFooter from '@/components/dashboard/campaigns/StepConfigureFooter';
import type { TemplateCampaign, TemplateReward } from '@/services/loyalty-setup/types';

interface TemplateCampaignEditorProps {
  campaign: TemplateCampaign;
  templateRewards?: TemplateReward[];
  onSave: (data: TemplateCampaign) => void;
  onClose: () => void;
}

function TemplateReviewStep({ onBack, onSave }: { onBack: () => void; onSave: (data: TemplateCampaign) => void }) {
  const { formData } = useCampaignForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewTab, setActivePreviewTab] = useState('campaignDetail');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    if (isPreviewOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const campaignTypeMap: Record<string, string> = {
        'QR Code': 'qr_code', 'Referral': 'referral', 'Social / Email': 'social_email',
        'Special Occasion': 'special_occasion', 'matching_point': 'matching_point',
      };
      const campaign_type = campaignTypeMap[formData.campaignType] || 'qr_code';
      const audienceTypeMap: Record<string, string> = {
        'members': 'members', 'badge_level': 'badge_level', 'wishlist_target': 'target_wishlist',
      };
      const audience_type = formData.audienceType.map(t => audienceTypeMap[t] || t).join(',');

      onSave({
        id: '',
        key: campaign_type,
        name: formData.campaignName,
        description: formData.campaignMessage,
        includedRewardKeys: formData.selectedRewards?.map((r) => r.id) || [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 7: Review & Save</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-green-600">
          <span className="font-medium">Review your campaign details before saving.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Name</span><span className="text-sm font-medium">{formData.campaignName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Type</span><span className="text-sm font-medium">{formData.campaignType || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Message</span><span className="text-sm font-medium line-clamp-2">{formData.campaignMessage || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Start Date</span><span className="text-sm font-medium">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">End Date</span><span className="text-sm font-medium">{formData.endDate ? new Date(formData.endDate).toLocaleDateString() : '—'}</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Audience</span><span className="text-sm font-medium">{formData.audienceType?.join(', ') || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">CTA Button</span><span className="text-sm font-medium">{formData.ctaButtonText || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Rewards</span><span className="text-sm font-medium">{formData.selectedRewards?.length || 0} selected</span></div>
            {formData.earnTitle && <div className="flex justify-between"><span className="text-sm text-gray-500">Earn Page</span><span className="text-sm font-medium line-clamp-1">{formData.earnTitle}</span></div>}
            {formData.redeemTitle && <div className="flex justify-between"><span className="text-sm text-gray-500">Redeem Page</span><span className="text-sm font-medium line-clamp-1">{formData.redeemTitle}</span></div>}
          </div>
        </div>

        {formData.selectedRewards && formData.selectedRewards.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Included Rewards</p>
            <div className="flex flex-wrap gap-2">
              {formData.selectedRewards.map((r) => (
                <Badge key={r.id} variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{r.title}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? 'Saving...' : 'Save Campaign'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCampaignWizard({ campaign, templateRewards, onSave, onClose }: TemplateCampaignEditorProps) {
  const { updateFormData } = useCampaignForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);
  const totalSteps = 7;

  useEffect(() => {
    if (campaign && !dataLoaded) {
      const campaignTypeMap: Record<string, string> = {
        'qr_code': 'QR Code', 'referral': 'Referral', 'social_email': 'Social / Email',
        'special_occasion': 'Special Occasion', 'matching_point': 'Matching Point Campaign',
      };

      const selectedRewards = templateRewards?.map((r) => ({ id: r.id, title: r.name })) || [];
      const rewardIds = templateRewards?.map((r) => r.id) || [];

      updateFormData({
        campaignName: campaign.name,
        campaignType: campaignTypeMap[campaign.key] || campaign.key || '',
        campaignMessage: campaign.description,
        audienceType: ['members'],
        selectedRewards,
        rewardIds,
      });
      setDataLoaded(true);
    }
  }, [campaign, templateRewards, updateFormData, dataLoaded]);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepChooseCampaignType onNext={handleNext} onBack={handleBack} />;
      case 2: return <StepSetCampaignDetails onNext={handleNext} onBack={handleBack} />;
      case 3: return <StepConfigureEarnPoints onNext={handleNext} onBack={handleBack} />;
      case 4: return <StepConfigureRedeemPoints onNext={handleNext} onBack={handleBack} />;
      case 5: return <StepConfigureContactUs onNext={handleNext} onBack={handleBack} />;
      case 6: return <StepConfigureFooter onNext={handleNext} onBack={handleBack} />;
      case 7: return <TemplateReviewStep onBack={handleBack} onSave={onSave} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Edit Campaign</h2>
        <p className="text-sm text-gray-500">Configure your campaign across all steps.</p>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} />
      {renderStep()}
    </div>
  );
}

export default function TemplateCampaignEditor({ campaign, templateRewards, onSave, onClose }: TemplateCampaignEditorProps) {
  return (
    <CampaignFormProvider>
      <TemplateCampaignWizard campaign={campaign} templateRewards={templateRewards} onSave={onSave} onClose={onClose} />
    </CampaignFormProvider>
  );
}
