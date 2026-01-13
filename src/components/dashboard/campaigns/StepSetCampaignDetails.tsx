'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import DateTimePicker from './datePicker';
import Image from 'next/image';
import { Calendar, Plus, X } from 'lucide-react';
import { useCampaignForm } from '@/context/CampaignFormContext';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { useGetMySubscription } from '@/services/tiers/hook';
import { toast } from 'sonner';
import SelectRewardModal from './SelectRewardModal';
import { Badge } from '@/components/ui/badge';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepSetCampaignDetails({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(formData.imageUrl || null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(formData.logoUrl || null);
  const dealName = searchParams.get('dealName');

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  // Fetch rewards to have access to full reward details if needed for initial load
  // (though formData.selectedRewards should ideally be populated)
  const { data: rewardsData, isLoading: isLoadingRewards } = useGetBusinessRewards(1, 100);
  const { data: subscriptionData } = useGetMySubscription();

  const isActive = formData.startDate && formData.endDate &&
    new Date(formData.startDate) < new Date() &&
    new Date(formData.endDate) > new Date();

  const isExpired = formData.endDate && new Date(formData.endDate) < new Date();
  const isStartDateDisabled = !!(isActive && !isExpired);

  useEffect(() => {
    const from = searchParams.get('from');
    const itemName = searchParams.get('itemName');
    const wishlistId = searchParams.get('wishlistId');

    if (from === 'wishlist' && itemName) {
      updateFormData({
        campaignName: formData.campaignName || `${itemName} Campaign`,
        audienceType: ['wishlist_target'],
        wishlistItemIds: [itemName],
        wishlistAggregateId: wishlistId || undefined,
      });
    } else if (dealName && !formData.campaignName) {
      updateFormData({
        campaignName: `${dealName} Campaign`,
        audienceType: ['wishlist_target'],
        wishlistItemIds: [dealName],
      });
    }
  }, [searchParams, formData.campaignName, updateFormData, dealName]);

  useEffect(() => {
    if (formData.imageUrl) setImagePreviewUrl(formData.imageUrl);
    if (formData.logoUrl) setLogoPreviewUrl(formData.logoUrl);
  }, [formData.imageUrl, formData.logoUrl]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setImagePreviewUrl(previewUrl);
    updateFormData({ imageUrl: previewUrl || '', imageFile: file });
  };

  const handleLogoSelect = (file: File | null, previewUrl: string | null) => {
    setLogoPreviewUrl(previewUrl);
    updateFormData({ logoUrl: previewUrl || '', logoFile: file });
  };

  const handleNextClick = () => {
    const newErrors: Record<string, boolean> = {};
    const { campaignName, totalSlots, rewardIds, startDate, endDate, campaignMessage, audienceType, badgeLevels, wishlistItemIds, campaignType } = formData;

    if (!campaignName.trim()) newErrors.campaignName = true;
    if (totalSlots === '' || totalSlots === undefined || totalSlots === null) newErrors.totalSlots = true;
    // Skip reward validation for Matching Point campaigns
    if (campaignType !== 'matching_point' && rewardIds.length === 0) newErrors.rewardIds = true;
    if (!startDate) {
      newErrors.startDate = true;
    } else if (startDate < new Date()) {
       // Allow past dates if editing an existing active campaign or just warn?
       // For now, retaining strict check but alert is annoying if re-editing.
       // Ideally check if it's a new campaign.
       // Removing alert for better UX, just highlight error if strictly invalid logic is needed.
       // newErrors.startDate = true;
    }
    if (!endDate) newErrors.endDate = true;
    if (!campaignMessage.trim()) newErrors.campaignMessage = true;
    if (audienceType.length === 0) newErrors.audienceType = true;
    if (audienceType.includes('badge_level') && (!badgeLevels || badgeLevels.length === 0)) newErrors.badgeLevels = true;
    if (audienceType.includes('wishlist_target') && (!wishlistItemIds || wishlistItemIds.length === 0)) newErrors.wishlistItemIds = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  // Ensure displayed rewards are consistent with selected IDs
  // If formData.selectedRewards is missing items that are in rewardIds, try to find them in fetched data
  const displayedRewards = formData.selectedRewards || [];

  // If we have IDs but no objects (e.g. page reload), try to hydration from rewardsData
  useEffect(() => {
     if (rewardsData && formData.rewardIds.length > 0) {
        const currentDisplayIds = displayedRewards.map(r => r.id);
        const missingIds = formData.rewardIds.filter(id => !currentDisplayIds.includes(id));

        if (missingIds.length > 0) {
           const newRewards = rewardsData.data.filter(r => missingIds.includes(r.id)).map(r => ({
             id: r.id,
             title: r.title || r.reward?.title || 'Unknown Reward'
           }));

           if (newRewards.length > 0) {
             updateFormData({
                selectedRewards: [...displayedRewards, ...newRewards]
             });
           }
        }
     }
  }, [rewardsData, formData.rewardIds, displayedRewards, updateFormData]);


  const removeReward = (id: string) => {
      const newIds = formData.rewardIds.filter(rid => rid !== id);
      const newSelected = (formData.selectedRewards || []).filter(r => r.id !== id);
      updateFormData({ rewardIds: newIds, selectedRewards: newSelected });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Set Campaign Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 py-4">
          {/* Campaign Name */}
          <div>
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input id="campaignName" placeholder="e.g., Summer Sale Campaign" value={formData.campaignName} onChange={(e) => updateFormData({ campaignName: e.target.value })} className={errors.campaignName ? 'border-red-500' : ''} />
            <p className="text-sm text-gray-500 mt-1">The name of your campaign, as it will be displayed to customers.</p>
          </div>

          {/* Total Slots */}
          <div>
            <Label htmlFor="totalSlots">Total Slots</Label>
            <Input
              id="totalSlots"
              type="number"
              placeholder="e.g., 100"
              value={formData.totalSlots}
              onChange={(e) => updateFormData({ totalSlots: e.target.value === '' ? '' : Number(e.target.value) })}
              className={errors.totalSlots ? 'border-red-500' : ''}
            />
            {errors.totalSlots && (
              <p className="text-sm text-red-500 mt-1">Total slots is required (and a campaign total)</p>
            )}
            {!errors.totalSlots && (
              <p className="text-sm text-gray-500 mt-1">The total number of slots available for this campaign.</p>
            )}
          </div>

          {/* Rewards to Attach */}
          <div>
            <Label>Rewards to Attach</Label>
            <div className={`mt-2 border rounded-md p-4 space-y-3 ${errors.rewardIds ? 'border-red-500' : 'border-gray-200'}`}>
                {displayedRewards.length > 0 ? (
                    <div className="space-y-2">
                        {displayedRewards.map(reward => (
                            <div key={reward.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                                <span className="font-medium text-sm">{reward.title}</span>
                                <Button variant="ghost" size="sm" onClick={() => removeReward(reward.id)} className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No rewards selected.</p>
                )}

                <Button variant="outline" size="sm" onClick={() => setIsRewardModalOpen(true)} className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    {displayedRewards.length > 0 ? 'Add / Remove Rewards' : 'Select Rewards'}
                </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Choose the rewards (Points or Stamps) to be given out in this campaign.</p>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date & Time</Label>
              <div className={`flex items-center rounded-md border px-3 ${errors.startDate ? 'border-red-500' : ''}`}>
                <Calendar className="mr-2 h-4 w-4 opacity-50" />
                <DateTimePicker
                  date={formData.startDate}
                  setDate={(date) => updateFormData({ startDate: date || undefined })}
                  disabled={isStartDateDisabled}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">When the campaign will become active.</p>
            </div>
            <div>
              <Label>End Date & Time</Label>
              <div className={`flex items-center rounded-md border px-3 ${errors.endDate ? 'border-red-500' : ''}`}>
                <Calendar className="mr-2 h-4 w-4 opacity-50" />
                <DateTimePicker
                  date={formData.endDate}
                  setDate={(date) => {
                    if (date && subscriptionData?.expiresAt) {
                      if (date > new Date(subscriptionData.expiresAt)) {
                        toast.error('End date is above subscription plan');
                        return;
                      }
                    }
                    updateFormData({ endDate: date || undefined });
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">When the campaign will automatically deactivate.</p>
            </div>
          </div>

          {/* Campaign Message */}
          <div>
            <Label htmlFor="campaignMessage">Campaign Message / Caption</Label>
            <Textarea id="campaignMessage" placeholder="What customers will see..." value={formData.campaignMessage} onChange={(e) => updateFormData({ campaignMessage: e.target.value })} className={errors.campaignMessage ? 'border-red-500' : ''} />
            <p className="text-sm text-gray-500 mt-1">A catchy message to attract customers.</p>
          </div>

          {/* Image & Logo Uploads */}
          <div>
            <div className="flex items-center gap-4"><Label>Image or Banner (optional)</Label><CloudinaryUpload onFileSelect={handleFileSelect} /></div>
            <p className="text-sm text-gray-500 mt-1">Upload a banner image for your campaign. Recommended size: 1200x400 pixels (3:1 aspect ratio).</p>
            {imagePreviewUrl && <div className="mt-4"><p className="text-sm font-medium">Image Preview:</p><div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-200"><Image src={imagePreviewUrl} alt="Campaign Banner Preview" layout="fill" objectFit="cover" /></div></div>}
          </div>
          <div>
            <div className="flex items-center gap-4"><Label>Logo (optional)</Label><CloudinaryUpload onFileSelect={handleLogoSelect} /></div>
            <p className="text-sm text-gray-500 mt-1">Upload your business logo.</p>
            {logoPreviewUrl && <div className="mt-4"><p className="text-sm font-medium">Logo Preview:</p><div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200"><Image src={logoPreviewUrl} alt="Logo Preview" layout="fill" objectFit="cover" /></div></div>}
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleNextClick}>Next</Button>
        </div>
      </CardContent>

      <SelectRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        onProceed={(ids, rewards) => {
            updateFormData({
                rewardIds: ids,
                selectedRewards: rewards.map(r => ({ id: r.id, title: r.title || r.reward?.title || 'Unknown Reward' }))
            });
        }}
        initialSelectedIds={formData.rewardIds}
      />
    </Card>
  );
}