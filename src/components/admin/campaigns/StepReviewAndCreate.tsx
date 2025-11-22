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
import { toast } from 'sonner'; // Assuming sonner is used, or use standard alert if not available. Reverting to console/alert if unsure, but keeping it simple.

// ... imports

export default function StepReviewAndCreate({ onBack }: StepProps) {
  const router = useRouter();
  const { formData, resetFormData } = useCampaignForm();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('campaignDetail');

  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();
  const [isUploading, setIsUploading] = useState(false);

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
    if (!formData.startDate || !formData.endDate) {
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

    const payload: CreateCampaignPayload = {
      name: formData.campaignName,
      campaign_type: formData.campaignType || 'qr_code',
      campaign_message: formData.campaignMessage,
      start_date: formData.startDate.toISOString(),
      end_date: formData.endDate.toISOString(),
      quantity: Number(formData.rewardsAvailable) || 0,
      audience_type: formData.audienceType[0] || 'members', // Taking first element or default
      signUpPoint: 0, // Default as not in form
      banner_url: bannerUrl,
      logo_url: logoUrl,
      cta_text: formData.ctaButtonText,
      cta_background_color: formData.ctaBgColor,
      cta_text_color: formData.ctaTextColor,
      text_color: formData.bgColorTextColor,
      background_color: formData.bgColor,
      reward_type: 'regular', // Default
      regular_points_threshold: 0, // Default
      matching_points_threshold: 0, // Default
      earn_point_page_title: formData.earnTitle || '',
      earn_point_page_description: formData.earnText || '',
      redeem_reward_page_title: formData.redeemTitle || '',
      redeem_reward_page_description: formData.redeemText || '',
      contact_us_page_title: formData.contactTitle || '',
      contact_us_page_description: formData.contactText || '',
      contact_email: formData.contactEmail || '',
      contact_phone_number: formData.contactPhone || '',
      footer_text: formData.footerText || '',
      business_reward_ids: formData.rewardIds,
    };

    console.log('Creating campaign with payload:', payload);

    createCampaign(payload, {
      onSuccess: (data) => {
        console.log('Campaign created successfully:', data);
        setShowSuccessDialog(true);
        setIsUploading(false);
      },
      onError: (error) => {
        console.error('Failed to create campaign:', error);
        alert('Failed to create campaign. Please try again.');
        setIsUploading(false);
      }
    });
  };

  const handleDialogAcknowledge = () => {
    setShowSuccessDialog(false);
    resetFormData();
    router.push('/admin/campaigns/list'); // Updated path to likely correct one based on file structure
  };

  const selectedRewards = mockRewards.filter(r => formData.rewardIds.includes(r.id));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 9: Review and Create Campaign</CardTitle>
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
            <Button onClick={handleCreateCampaign} disabled={isCreating || isUploading}>
              {isUploading ? 'Uploading Images...' : isCreating ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your new campaign has been created.
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
