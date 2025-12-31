'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCampaignForm } from '@/context/CampaignFormContext';
import { Calendar, Users, Gift, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CampaignDetailPagePreview from './previews/CampaignDetailPagePreview';
import EarnPointsPagePreview from './previews/EarnPointsPagePreview';
import RedeemPointsPagePreview from './previews/RedeemPointsPagePreview';
import ContactUsPagePreview from './previews/ContactUsPagePreview';

import FooterPreview from './previews/FooterPreview';
import { useGetTiers } from '@/services/tiers/hook'; // Import to get tiers for seasonal dates

interface StepProps {
  onBack: () => void;
}

// Mock rewards data (should be fetched from API)
const mockRewards = [
  { id: '1', title: 'Summer Voucher ($50)', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Gift Card ($100)', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'Discount Coupon (20% off)', image: 'https://via.placeholder.com/150' },
];

import { useCreateCampaign } from '@/services/campaigns/hook';
import { CreateCampaignPayload } from '@/services/campaigns/types';
import { toast } from 'sonner';

export default function StepReviewAndCreate({ onBack }: StepProps) {
  const router = useRouter();
  const { formData, resetFormData } = useCampaignForm();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('campaignDetail');

  const { mutateAsync: createCampaign, isPending: isCreating } = useCreateCampaign(); // Use mutateAsync for Promise handling
  const [isUploading, setIsUploading] = useState(false);
  const { data: allTiers } = useGetTiers(); // Fetch tiers to get configured dates for seasonal

  const uploadImage = async (blobUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob);

      const uploadResponse = await fetch('/api/upload/campaigns', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await uploadResponse.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreateCampaign = async () => {
    // Basic date validation check (if not multi-tier standard, handled in step 4 usually but good safety)
    const isMultiTierStandard = formData.planType !== 'seasonal' && (formData.target_tier_ids?.length || 0) > 1;
    if (!isMultiTierStandard && (!formData.startDate || !formData.endDate)) {
      alert("Start date and end date are required.");
      return;
    }

    setIsUploading(true);
    let bannerUrl = formData.imageUrl;
    let logoUrl = formData.logoUrl;

    try {
      if (bannerUrl && bannerUrl.startsWith('blob:')) {
        const uploadedBanner = await uploadImage(bannerUrl);
        if (uploadedBanner) bannerUrl = uploadedBanner;
        else throw new Error('Failed to upload banner image');
      }

      if (logoUrl && logoUrl.startsWith('blob:')) {
        const uploadedLogo = await uploadImage(logoUrl);
        if (uploadedLogo) logoUrl = uploadedLogo;
        else throw new Error('Failed to upload logo image');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload images. Please try again.');
      setIsUploading(false);
      return;
    }

    // Determine target tiers
    const targetTierIds = (formData.target_tier_ids && formData.target_tier_ids.length > 0)
        ? formData.target_tier_ids
        : (formData.target_tier_id ? [formData.target_tier_id] : []);

    if (targetTierIds.length === 0) {
        alert("No tier selected.");
        setIsUploading(false);
        return;
    }

    try {
        // Iterate and create campaign for each tier
        const createPromises = targetTierIds.map(async (tierId) => {
            let startDateStr = '';
            let endDateStr = '';

            // Date Resolution Logic
            if (formData.planType === 'seasonal') {
                // For seasonal, get from tier configuration
                const tier = allTiers?.find(t => t.id === tierId);
                if (tier?.startDate && tier?.endDate) {
                    startDateStr = new Date(tier.startDate).toISOString();
                    endDateStr = new Date(tier.endDate).toISOString();
                } else if (!tier) {
                     // Fallback if tier not found but selected (shouldn't happen)
                     throw new Error(`Tier not found for id ${tierId}`);
                }

                // If seasonal and dates missing, that's an error
                if (!startDateStr || !endDateStr) {
                    throw new Error(`Missing dates for seasonal tier ${tierId}`);
                }
            }
            // For standard plans, we intentionally leave dates empty/null as requested.
            // (Previous logic for multi-tier standard dates is removed)

            const payload: CreateCampaignPayload = {
              name: formData.campaignName, // Note: Might want to append tier name if names must be unique? Assuming name can be same.
              campaign_type: formData.campaignType || 'qr_code',
              campaign_message: formData.campaignMessage,
              start_date: startDateStr,
              end_date: endDateStr,
              quantity: Number(formData.rewardsAvailable) || 0,
              audience_type: formData.audienceType[0] || 'members',
              signUpPoint: 0,
              banner_url: bannerUrl,
              logo_url: logoUrl,
              cta_text: formData.ctaButtonText,
              cta_background_color: formData.ctaBgColor,
              cta_text_color: formData.ctaTextColor,
              text_color: formData.bgColorTextColor,
              background_color: formData.bgColor,
              reward_type: 'regular',
              regular_points_threshold: 0,
              matching_points_threshold: 0,
              earn_point_page_title: formData.earnTitle || '',
              earn_point_page_description: formData.earnText || '',
              redeem_reward_page_title: formData.redeemTitle || '',
              redeem_reward_page_description: formData.redeemText || '',
              contact_us_page_title: formData.contactTitle || '',
              contact_us_page_description: formData.contactText || '',
              contact_email: formData.contactEmail || '',
              contact_phone_number: formData.contactPhone || '',
              footer_text: formData.footerText || '',
              ...(formData.rewardIds && formData.rewardIds.length > 0 ? { reward_ids: formData.rewardIds } : {}),
              // We likely need to pass the target_tier_id in the payload if the backend supports it now,
              // or rely on context/headers if that's how it's done.
              // Assuming we add it to payload as discussed in plan, but looking at CreateCampaignPayload interface
              // in previous turns, it didn't have target_tier_id.
              // However, typically Admin endpoints need it.
              // If not in type, I should cast or add it if the backend expects it.
              // Given I can't change backend, I will assume the prompt implies I should try to send it.
              // Checking types.ts content I read earlier... it does NOT have target_tier_id.
              // I'll add it as an extra property casting to any to avoid TS errors if strict, or just leave it out if logic is handled elsewhere.
              // Wait, previous instructions mentioned: "Since this is an Admin wizard, it is critical that the campaign is associated with the selected tier."
              // I will append it.
              ...({ target_tier_id: tierId } as any)
            };

            return createCampaign(payload);
        });

        await Promise.all(createPromises);

        console.log('All campaigns created successfully');
        setShowSuccessDialog(true);
        setIsUploading(false);

    } catch (error) {
        console.error('Failed to create campaigns:', error);
        alert('Failed to create one or more campaigns. Please try again.');
        setIsUploading(false);
    }
  };

  const handleDialogAcknowledge = () => {
    setShowSuccessDialog(false);
    resetFormData();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tour') === 'true') {
        router.push('/admin/users/business?tour=true');
    } else {
        router.push('/admin/campaigns/list');
    }
  };

  const selectedRewards = mockRewards.filter(r => formData.rewardIds.includes(r.id));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 10: Review and Create Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          {/* New Comprehensive Preview Section */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-xl border border-gray-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Interactive Campaign Preview</h4>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <Tabs value={activePreviewTab} onValueChange={setActivePreviewTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto p-0">
                  <TabsTrigger value="campaignDetail">Main Page</TabsTrigger>
                  <TabsTrigger value="earnPoints">Earn Points</TabsTrigger>
                  <TabsTrigger value="redeemPoints">Redeem Points</TabsTrigger>
                  <TabsTrigger value="contactUs">Contact Us</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                </TabsList>
                <div className="h-[600px] overflow-y-auto relative p-4">
                  <TabsContent value="campaignDetail">
                    <CampaignDetailPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="earnPoints">
                    <EarnPointsPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="redeemPoints">
                    <RedeemPointsPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="contactUs">
                    <ContactUsPagePreview campaignData={formData} />
                  </TabsContent>
                  <TabsContent value="footer">
                    <FooterPreview campaignData={formData} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          <h4 className="text-lg font-semibold mb-3 mt-6">Distribution Channels</h4>
          <div className="grid gap-2 mb-6 text-sm">
            <p><strong>QR Code:</strong> {formData.distributionChannels.qrCode ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Share Link:</strong> {formData.distributionChannels.shareLink ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Embed Button:</strong> {formData.distributionChannels.embedButton ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Email Send:</strong> {formData.distributionChannels.emailSend ? 'Enabled' : 'Disabled'}</p>
          </div>

          <h4 className="text-lg font-semibold mb-3">Scheduling & Auto Rules</h4>
          <div className="grid gap-2 mb-6 text-sm">
            <p><strong>Stop after claims:</strong> {Number(formData.schedulingRules.stopAfterClaims) > 0 ? formData.schedulingRules.stopAfterClaims : 'Unlimited'}</p>
            <p><strong>Pause on reward empty:</strong> {formData.schedulingRules.pauseOnRewardEmpty ? 'Yes' : 'No'}</p>
            <p><strong>Auto-switch to points:</strong> {formData.schedulingRules.autoSwitchToPoints ? 'Yes' : 'No'}</p>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack} disabled={isCreating || isUploading}>Back</Button>
            <Button id="campaign-submit-btn" onClick={handleCreateCampaign} disabled={isCreating || isUploading}>
              {isUploading ? 'Uploading Images...' : isCreating ? 'Creating... (' + (formData.target_tier_ids?.length || 1) + ')' : 'Create Campaign'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your new campaign(s) have been created. <br /><br />
              <strong>What's Next?</strong><br />
              You might want to add staff members to help manage this campaign.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogAcknowledge}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
