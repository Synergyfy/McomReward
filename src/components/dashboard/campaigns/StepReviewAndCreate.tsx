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
import { Calendar, Users, Gift, Tag, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CampaignDetailPagePreview from './previews/CampaignDetailPagePreview';
import EarnPointsPagePreview from './previews/EarnPointsPagePreview';
import RedeemPointsPagePreview from './previews/RedeemPointsPagePreview';
import ContactUsPagePreview from './previews/ContactUsPagePreview';

import FooterPreview from './previews/FooterPreview';
import { useCreateCampaign } from '@/services/campaigns/hook';
import { useCreateCampaignFromWishlist } from '@/services/campaigns/hook_wishlist';
import { CreateCampaignPayload } from '@/services/campaigns/types';
import { CreateCampaignFromWishlistDto } from '@/services/campaigns/types_wishlist';
import { toast } from 'sonner';

interface StepProps {
  onBack: () => void;
}

// Mock rewards data (should be fetched from API)
const mockRewards = [
  { id: '1', title: 'Summer Voucher ($50)', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Gift Card ($100)', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'Discount Coupon (20% off)', image: 'https://via.placeholder.com/150' },
];

export default function StepReviewAndCreate({ onBack }: StepProps) {
  const router = useRouter();
  const { formData, resetFormData } = useCampaignForm();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('campaignDetail'); // State for managing active preview tab
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCampaignMutation = useCreateCampaign();
  const createCampaignFromWishlistMutation = useCreateCampaignFromWishlist();

  const handleCreateCampaign = async () => {
    setIsSubmitting(true);
    try {
      if (formData.wishlistAggregateId && formData.audienceType.includes('wishlist_target')) {
        // Create campaign from wishlist
        const wishlistPayload: CreateCampaignFromWishlistDto = {
          wishlistAggregateId: formData.wishlistAggregateId,
          name: formData.campaignName,
          campaign_type: formData.campaignType.toUpperCase(),
          campaign_message: formData.campaignMessage,
          start_date: formData.startDate?.toISOString() || new Date().toISOString(),
          end_date: formData.endDate?.toISOString() || new Date().toISOString(),
          quantity: Number(formData.rewardsAvailable) || 0,
          audience_type: 'ALL', // Or specific audience type for wishlist if needed
          banner_url: formData.imageUrl,
          logo_url: formData.logoUrl,
          cta_text: formData.ctaButtonText,
          cta_background_color: formData.ctaBgColor,
          cta_text_color: formData.ctaTextColor,
          text_color: formData.bgColorTextColor,
          background_color: formData.bgColor,
          signUpPoint: 0, // Default or from form if available
          reward_type: 'REGULAR', // Default
          regular_points_threshold: 0, // Default
          matching_points_threshold: 0, // Default
          business_reward_ids: formData.rewardIds,
          reward_ids: [], // Assuming admin rewards are separate or mixed
        };

        await createCampaignFromWishlistMutation.mutateAsync(wishlistPayload);
      } else {
        // Create regular campaign
        // Note: You need to map formData to CreateCampaignPayload correctly
        // This is a simplified mapping, ensure all fields match your DTO
        const regularPayload: CreateCampaignPayload = {
          name: formData.campaignName,
          campaign_type: formData.campaignType.toUpperCase(),
          campaign_message: formData.campaignMessage,
          start_date: formData.startDate?.toISOString() || new Date().toISOString(),
          end_date: formData.endDate?.toISOString() || new Date().toISOString(),
          quantity: Number(formData.rewardsAvailable) || 0,
          audience_type: formData.audienceType.join(','), // Adjust format as needed
          signUpPoint: 0,
          banner_url: formData.imageUrl,
          logo_url: formData.logoUrl,
          cta_text: formData.ctaButtonText,
          cta_background_color: formData.ctaBgColor,
          cta_text_color: formData.ctaTextColor,
          text_color: formData.bgColorTextColor,
          background_color: formData.bgColor,
          reward_type: 'REGULAR',
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
          business_reward_ids: formData.rewardIds,
        };
        await createCampaignMutation.mutateAsync(regularPayload);
      }

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogAcknowledge = () => {
    setShowSuccessDialog(false);
    resetFormData();
    router.push('/dashboard/campaigns');
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
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button onClick={handleCreateCampaign} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Campaign'}
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