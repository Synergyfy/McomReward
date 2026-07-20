'use client';

import React, { useState, useMemo } from 'react';
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
import { useCampaignForm, CampaignFormData } from '@/context/CampaignFormContext';
import { Loader2, Monitor, Smartphone, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FullCampaignPreview from './previews/FullCampaignPreview';
import EarnPointsPagePreview from './previews/EarnPointsPagePreview';
import RedeemPointsPagePreview from './previews/RedeemPointsPagePreview';
import ContactUsPagePreview from './previews/ContactUsPagePreview';

import FooterPreview from './previews/FooterPreview';
import { useCreateCampaign, useUpdateCampaign } from '@/services/campaigns/hook';
import { useCreateCampaignFromWishlist } from '@/services/campaigns/hook_wishlist';
import { CreateCampaignPayload, CampaignResponse, UpdateCampaignPayload, BusinessCampaign } from '@/services/campaigns/types';
import { CreateCampaignFromWishlistDto } from '@/services/campaigns/types_wishlist';
import { toast } from 'sonner';

interface StepProps {
  onBack: () => void;
  campaignId?: string;
  isClaimed?: boolean;
  originalCampaign?: CampaignResponse | BusinessCampaign;
}

export default function StepReviewAndCreate({ onBack, campaignId, isClaimed = false, originalCampaign }: StepProps) {
  const router = useRouter();
  const { formData, resetFormData } = useCampaignForm();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('campaignDetail');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const createCampaignFromWishlistMutation = useCreateCampaignFromWishlist();

  // Handle Esc key to close preview
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    if (isPreviewOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewOpen]);

  // Type guard to determine if the campaign is a BusinessCampaign
  const isBusinessCampaign = (campaign: CampaignResponse | BusinessCampaign): campaign is BusinessCampaign => {
    return (campaign as BusinessCampaign).campaign_type !== undefined;
  };

  const transformedCampaign: CampaignResponse = useMemo(() => {
    // Helper function to convert optional Date to ISO string
    const toISOString = (date?: Date) => date ? date.toISOString() : '';

    return {
      id: campaignId || '',
      name: formData.campaignName,
      campaignType: formData.campaignType,
      campaignMessage: formData.campaignMessage,
      startDate: toISOString(formData.startDate),
      endDate: toISOString(formData.endDate),
      quantity: Number(formData.schedulingRules.stopAfterClaims) || 0,
      audienceType: formData.audienceType.join(','), // Assuming AudienceType is a comma-separated string
      bannerUrl: formData.imageUrl || '',
      logoUrl: formData.logoUrl || '',
      ctaText: formData.ctaButtonText || 'Join Now',
      ctaBackgroundColor: formData.ctaBgColor || '',
      ctaTextColor: formData.ctaTextColor || '',
      textColor: formData.bgColorTextColor || '',
      backgroundColor: formData.bgColor || '',
      signUpPoint: 0, // Not available in CampaignFormData, default to 0
      rewardType: '', // Not available in CampaignFormData, default to empty string
      regularPointsThreshold: 0, // Not available in CampaignFormData, default to 0
      matchingPointsThreshold: 0, // Not available in CampaignFormData, default to 0
      earnPointPageTitle: formData.earnTitle || '',
      earnPointPageDescription: formData.earnText || '',
      redeemRewardPageTitle: formData.redeemTitle || '',
      redeemRewardPageDescription: formData.redeemText || '',
      contactUsPageTitle: formData.contactTitle || '',
      contactUsPageDescription: formData.contactText || '',
      contactEmail: formData.contactEmail || '',
      contactPhoneNumber: formData.contactPhone || '',
      footerText: formData.footerText || '',
      rewards: [], // CampaignFormData does not contain full Reward objects, default to empty array
      uniqueCode: null, // Not available in CampaignFormData, default to null
      createdAt: new Date().toISOString(), // Default to current time
      updatedAt: new Date().toISOString(), // Default to current time
      deletedAt: null,
      disabled: false,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      totalMatchingPointsEarned: 0,
      matchingPointsDisabledByAdmin: false,
    };
  }, [formData, campaignId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let bannerUrl = formData.imageUrl;
      let logoUrl = formData.logoUrl;

      // Upload Banner if file exists
      if (formData.imageFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('file', formData.imageFile);
        bannerFormData.append('folder', 'campaigns'); // Add folder if needed by API
        const bannerRes = await fetch('/api/upload/campaigns', {
          method: 'POST',
          body: bannerFormData,
        });
        if (!bannerRes.ok) throw new Error('Failed to upload banner');
        const bannerData = await bannerRes.json();
        bannerUrl = bannerData.secure_url;
      }

      // Upload Logo if file exists
      if (formData.logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', formData.logoFile);
        logoFormData.append('folder', 'campaigns'); // Add folder if needed by API
        const logoRes = await fetch('/api/upload/campaigns', {
          method: 'POST',
          body: logoFormData,
        });
        if (!logoRes.ok) throw new Error('Failed to upload logo');
        const logoData = await logoRes.json();
        logoUrl = logoData.secure_url;
      }

      const campaignTypeMap: Record<string, string> = {
        'QR Code': 'qr_code',
        'Referral': 'referral',
        'Social / Email': 'social_or_email',
        'Special Occasion': 'special_occasion',
        'matching_point': 'matching_point', // Ensure raw value is preserved if set directly
        'Matching Point Campaign': 'matching_point'
      };

      const audienceTypeMap: Record<string, string> = {
        'members': 'members',
        'badge_level': 'badge_level',
        'wishlist_target': 'target_wishlist'
      };

      const campaign_type = campaignTypeMap[formData.campaignType] || 'qr_code';
      const audience_type = formData.audienceType.map(t => audienceTypeMap[t] || t).join(',');

      if (campaignId) {
        // Update existing campaign
        const updatePayload: UpdateCampaignPayload = {};

        if (originalCampaign) {
          const currentCampaign = originalCampaign;
          
          const oldName = currentCampaign.name;
          const oldCampaignType = isBusinessCampaign(currentCampaign) ? currentCampaign.campaign_type : currentCampaign.campaignType;
          const oldCampaignMessage = isBusinessCampaign(currentCampaign) ? currentCampaign.campaign_message : currentCampaign.campaignMessage;
          const oldStartDate = isBusinessCampaign(currentCampaign) ? currentCampaign.start_date : currentCampaign.startDate;
          const oldEndDate = isBusinessCampaign(currentCampaign) ? currentCampaign.end_date : currentCampaign.endDate;
          const oldQuantity = currentCampaign.quantity;
          const oldTotalSlots = isBusinessCampaign(currentCampaign) ? currentCampaign.total_slots : currentCampaign.total_slots;
          const oldAudienceType = isBusinessCampaign(currentCampaign) ? currentCampaign.audience_type : currentCampaign.audienceType;
          const oldBannerUrl = isBusinessCampaign(currentCampaign) ? currentCampaign.banner_url : currentCampaign.bannerUrl;
          const oldLogoUrl = isBusinessCampaign(currentCampaign) ? currentCampaign.logo_url : currentCampaign.logoUrl;
          const oldCtaText = isBusinessCampaign(currentCampaign) ? currentCampaign.cta_text : currentCampaign.ctaText;
          const oldCtaBgColor = isBusinessCampaign(currentCampaign) ? currentCampaign.cta_background_color : currentCampaign.ctaBackgroundColor;
          const oldCtaTextColor = isBusinessCampaign(currentCampaign) ? currentCampaign.cta_text_color : currentCampaign.ctaTextColor;
          const oldTextColor = isBusinessCampaign(currentCampaign) ? currentCampaign.text_color : currentCampaign.textColor;
          const oldBgColor = isBusinessCampaign(currentCampaign) ? currentCampaign.background_color : currentCampaign.backgroundColor;
          const oldEarnTitle = isBusinessCampaign(currentCampaign) ? currentCampaign.earn_point_page_title : currentCampaign.earnPointPageTitle;
          const oldEarnText = isBusinessCampaign(currentCampaign) ? currentCampaign.earn_point_page_description : currentCampaign.earnPointPageDescription;
          const oldRedeemTitle = isBusinessCampaign(currentCampaign) ? currentCampaign.redeem_reward_page_title : currentCampaign.redeemRewardPageTitle;
          const oldRedeemText = isBusinessCampaign(currentCampaign) ? currentCampaign.redeem_reward_page_description : currentCampaign.redeemRewardPageDescription;
          const oldContactTitle = isBusinessCampaign(currentCampaign) ? currentCampaign.contact_us_page_title : currentCampaign.contactUsPageTitle;
          const oldContactText = isBusinessCampaign(currentCampaign) ? currentCampaign.contact_us_page_description : currentCampaign.contactUsPageDescription;
          const oldContactEmail = isBusinessCampaign(currentCampaign) ? currentCampaign.contact_email : currentCampaign.contactEmail;
          const oldContactPhone = isBusinessCampaign(currentCampaign) ? currentCampaign.contact_phone_number : currentCampaign.contactPhoneNumber;
          const oldFooterText = isBusinessCampaign(currentCampaign) ? currentCampaign.footer_text : currentCampaign.footerText;
          
          const oldRewards = isBusinessCampaign(currentCampaign) ? currentCampaign.businessRewards : currentCampaign.rewards || [];
          const oldRewardIds = oldRewards.map((r: { id: string }) => r.id).sort();
          const newRewardIds = [...formData.rewardIds].sort();

          if (formData.campaignName !== oldName) updatePayload.name = formData.campaignName;
          if (campaign_type !== oldCampaignType) updatePayload.campaign_type = campaign_type;
          if (formData.campaignMessage !== oldCampaignMessage) updatePayload.campaign_message = formData.campaignMessage;
          
          // Date comparisons
          if (formData.startDate && (!oldStartDate || new Date(formData.startDate).getTime() !== new Date(oldStartDate).getTime())) {
            updatePayload.start_date = formData.startDate.toISOString();
          }
          if (formData.endDate && (!oldEndDate || new Date(formData.endDate).getTime() !== new Date(oldEndDate).getTime())) {
            updatePayload.end_date = formData.endDate.toISOString();
          }

          // Calculate new total_slots based on (Used + New Available)
          const oldTotal = currentCampaign.total_slots ?? currentCampaign.quantity ?? 0;
          const oldAvailable = currentCampaign.remainingSlots ?? currentCampaign.quantity ?? 0;
          const used = Math.max(0, oldTotal - oldAvailable);
          const newAvailable = Number(formData.totalSlots);
          const newTotal = used + newAvailable;

          if (newTotal !== oldTotal) {
             updatePayload.total_slots = newTotal;
          }

          if (audience_type !== oldAudienceType) updatePayload.audience_type = audience_type;
          if (bannerUrl !== oldBannerUrl) updatePayload.banner_url = bannerUrl || '';
          if (logoUrl !== oldLogoUrl) updatePayload.logo_url = logoUrl || '';
          
          if (formData.earnTitle !== oldEarnTitle) updatePayload.earn_point_page_title = formData.earnTitle;
          if (formData.earnText !== oldEarnText) updatePayload.earn_point_page_description = formData.earnText;
          if (formData.redeemTitle !== oldRedeemTitle) updatePayload.redeem_reward_page_title = formData.redeemTitle;
          if (formData.redeemText !== oldRedeemText) updatePayload.redeem_reward_page_description = formData.redeemText;
          if (formData.contactTitle !== oldContactTitle) updatePayload.contact_us_page_title = formData.contactTitle;
          if (formData.contactText !== oldContactText) updatePayload.contact_us_page_description = formData.contactText;
          if (formData.contactEmail !== oldContactEmail) updatePayload.contact_email = formData.contactEmail;
          if (formData.contactPhone !== oldContactPhone) updatePayload.contact_phone_number = formData.contactPhone;
          if (formData.footerText !== oldFooterText) updatePayload.footer_text = formData.footerText;

          // Reward IDs comparison
          const rewardIdsChanged = JSON.stringify(oldRewardIds) !== JSON.stringify(newRewardIds);
          if (rewardIdsChanged) {
            updatePayload.business_reward_ids = formData.rewardIds;
          }
        } else {
          // Fallback if originalCampaign is missing
          updatePayload.name = formData.campaignName;
          updatePayload.campaign_type = campaign_type;
          updatePayload.campaign_message = formData.campaignMessage;
          updatePayload.start_date = formData.startDate?.toISOString() || new Date().toISOString();
          updatePayload.end_date = formData.endDate?.toISOString() || new Date().toISOString();
          updatePayload.total_slots = Number(formData.totalSlots);
          updatePayload.audience_type = audience_type;
          updatePayload.banner_url = bannerUrl || '';
          updatePayload.logo_url = logoUrl || '';
          updatePayload.earn_point_page_title = formData.earnTitle;
          updatePayload.earn_point_page_description = formData.earnText;
          updatePayload.redeem_reward_page_title = formData.redeemTitle;
          updatePayload.redeem_reward_page_description = formData.redeemText;
          updatePayload.contact_us_page_title = formData.contactTitle;
          updatePayload.contact_us_page_description = formData.contactText;
          updatePayload.contact_email = formData.contactEmail;
          updatePayload.contact_phone_number = formData.contactPhone;
          updatePayload.footer_text = formData.footerText;

          updatePayload.business_reward_ids = formData.rewardIds;
        }

        if (Object.keys(updatePayload).length === 0) {
          toast.info("No changes detected.");
          setShowSuccessDialog(true);
          return;
        }

        await updateCampaignMutation.mutateAsync({
          id: campaignId,
          data: updatePayload
        });
        toast.success("Campaign updated successfully");
      } else {
        // Create new campaign
        const createPayload: CreateCampaignPayload = {
          name: formData.campaignName,
          campaign_type,
          campaign_message: formData.campaignMessage,
          start_date: formData.startDate?.toISOString() || new Date().toISOString(),
          end_date: formData.endDate?.toISOString() || new Date().toISOString(),
          quantity: Number(formData.schedulingRules.stopAfterClaims) || 0,
          total_slots: Number(formData.totalSlots),
          audience_type,
          signUpPoint: 0,
          banner_url: bannerUrl || '',
          logo_url: logoUrl || '',
          cta_text: formData.ctaButtonText || 'Join Now',
          cta_background_color: formData.ctaBgColor || '',
          cta_text_color: formData.ctaTextColor || '',
          text_color: formData.bgColorTextColor || '',
          background_color: formData.bgColor || '',
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
          business_reward_ids: formData.rewardIds
        };

        if (formData.wishlistAggregateId && formData.audienceType.includes('wishlist_target')) {
          // Create campaign from wishlist
          const wishlistPayload: CreateCampaignFromWishlistDto = {
            wishlistAggregateId: formData.wishlistAggregateId,
            name: createPayload.name,
            campaign_type: createPayload.campaign_type,
            campaign_message: createPayload.campaign_message,
            start_date: createPayload.start_date,
            end_date: createPayload.end_date,
            quantity: createPayload.quantity,
            audience_type: 'target_wishlist',
            banner_url: createPayload.banner_url,
            logo_url: createPayload.logo_url,
            cta_text: createPayload.cta_text,
            cta_background_color: createPayload.cta_background_color,
            cta_text_color: createPayload.cta_text_color,
            text_color: createPayload.text_color,
            background_color: createPayload.background_color,
            signUpPoint: createPayload.signUpPoint,
            reward_type: createPayload.reward_type,
            regular_points_threshold: createPayload.regular_points_threshold,
            matching_points_threshold: createPayload.matching_points_threshold,
            business_reward_ids: formData.rewardIds,
            reward_ids: [],
          };
          await createCampaignFromWishlistMutation.mutateAsync(wishlistPayload);
        } else {
          // Create regular campaign
          await createCampaignMutation.mutateAsync(createPayload);
        }
      }

      setShowSuccessDialog(true);
    } catch (error) {
      console.error(campaignId ? "Failed to update campaign:" : "Failed to create campaign:", error);
      toast.error(campaignId ? "Failed to update campaign. Please try again." : "Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogAcknowledge = () => {
    setShowSuccessDialog(false);
    resetFormData();
    router.push('/dashboard/campaigns/list');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 7: Review and {campaignId ? 'Update' : 'Create'} Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Preview Launch Section */}
          <div className="mt-6 mb-8 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center">
            <h4 className="text-2xl font-bold text-indigo-900 mb-2">Ready to see your campaign?</h4>
            <p className="text-gray-600 mb-6 max-w-lg">Preview your campaign exactly as your customers will see it. Switch between desktop and mobile views to ensure it looks perfect.</p>
            <Button 
              onClick={() => setIsPreviewOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Monitor className="mr-2 w-5 h-5" />
              Preview Campaign Page
            </Button>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {campaignId ? 'Updating...' : 'Creating...'}</> : (campaignId ? 'Update Campaign' : 'Create Campaign')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
          {/* Preview Toolbar */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
             <div className="flex items-center gap-4">
               <h2 className="font-bold text-gray-800 text-lg">Campaign Preview</h2>
               <div className="bg-gray-100 rounded-lg p-1 flex items-center gap-1">
                 <Button 
                   variant={previewMode === 'desktop' ? 'outline' : 'ghost'} 
                   size="sm"
                   className={`h-8 px-3 ${previewMode === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                   onClick={() => setPreviewMode('desktop')}
                 >
                   <Monitor className="w-4 h-4 mr-2" />
                   Desktop
                 </Button>
                 <Button 
                   variant={previewMode === 'mobile' ? 'outline' : 'ghost'} 
                   size="sm"
                   className={`h-8 px-3 ${previewMode === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                   onClick={() => setPreviewMode('mobile')}
                 >
                   <Smartphone className="w-4 h-4 mr-2" />
                   Mobile
                 </Button>
               </div>
             </div>
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setIsPreviewOpen(false)}
               className="hover:bg-red-50 hover:text-red-600 rounded-full"
             >
               <X className="w-6 h-6" />
             </Button>
          </div>

          {/* Preview Content Area */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-8 flex justify-center">
            <div 
              className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden relative ${
                previewMode === 'mobile' 
                  ? 'w-[375px] h-[812px] rounded-[40px] border-8 border-gray-900 overflow-y-auto hide-scrollbar' 
                  : 'w-full h-full rounded-md overflow-y-auto'
              }`}
            >
              {/* If mobile, maybe wrap content in a scaling container or just let it flow naturally */}
              <div className={previewMode === 'mobile' ? 'min-h-full pb-20' : ''}>
                <FullCampaignPreview formData={formData} isMobile={previewMode === 'mobile'} />
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign {campaignId ? 'Updated' : 'Created'} Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your campaign has been {campaignId ? 'updated' : 'created'}.
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