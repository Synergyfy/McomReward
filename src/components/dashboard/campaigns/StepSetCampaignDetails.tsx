'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Select, { CSSObjectWithLabel } from 'react-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import DateTimePicker from './datePicker';
import Image from 'next/image';
import { Calendar, Users, Gift, Tag } from 'lucide-react';
import { useCampaignForm } from '@/context/CampaignFormContext';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { useGetTiers } from '@/services/tiers/hook'; // Import useGetTiers hook

const mockWishlistInsights = [
  { itemName: 'Gourmet Burger', category: 'Food', estimatedCount: 124 },
  { itemName: 'Winter Jacket', category: 'Fashion', estimatedCount: 78 },
  { itemName: 'Wireless Headphones', category: 'Electronics', estimatedCount: 210 },
];

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

  // Fetch rewards using the hook
  const { data: rewardsData, isLoading: isLoadingRewards } = useGetBusinessRewards(1, 100); // Fetching first 100 for now
  const rewards = rewardsData?.data || [];

  // Fetch tiers using the hook
  const { data: tiersData } = useGetTiers();
  const tiers = tiersData || [];

  const rewardOptions = rewards.map(r => ({
    value: r.reward.id,
    label: r.reward.title
  })) || [];

  useEffect(() => {
    const from = searchParams.get('from');
    const itemName = searchParams.get('itemName');
    const wishlistId = searchParams.get('wishlistId'); // Capture wishlistId

    if (from === 'wishlist' && itemName) {
      updateFormData({
        campaignName: formData.campaignName || `${itemName} Campaign`,
        audienceType: formData.audienceType.includes('wishlist_target')
          ? formData.audienceType
          : [...formData.audienceType, 'wishlist_target'],
        wishlistItemIds: [itemName],
        wishlistAggregateId: wishlistId || undefined, // Store wishlist ID
      });
    } else if (dealName && !formData.campaignName) {
      updateFormData({
        campaignName: `${dealName} Campaign`,
        audienceType: ['wishlist_target'], // Assuming dealName also implies wishlist_target
        wishlistItemIds: [dealName],
      });
    }
  }, [searchParams, formData.campaignName, updateFormData, dealName, formData.audienceType]);

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
    const { campaignName, rewardIds, startDate, endDate, rewardsAvailable, campaignMessage, ctaButtonText, audienceType, badgeLevels, wishlistItemIds } = formData;

    if (!campaignName.trim()) newErrors.campaignName = true;
    if (rewardIds.length === 0) newErrors.rewardIds = true;
    if (!startDate) newErrors.startDate = true;
    if (!endDate) newErrors.endDate = true;
    if (rewardsAvailable === '' || Number(rewardsAvailable) <= 0) newErrors.rewardsAvailable = true;
    if (!campaignMessage.trim()) newErrors.campaignMessage = true;
    if (!ctaButtonText.trim()) newErrors.ctaButtonText = true;
    if (audienceType.length === 0) newErrors.audienceType = true;
    if (audienceType.includes('badge_level') && (!badgeLevels || badgeLevels.length === 0)) newErrors.badgeLevels = true;
    if (audienceType.includes('wishlist_target') && (!wishlistItemIds || wishlistItemIds.length === 0)) newErrors.wishlistItemIds = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const toSelectOptions = (arr: string[]) => arr.map(item => ({ value: item, label: item }));

  const selectErrorStyle = {
    control: (base: CSSObjectWithLabel) => ({ ...base, borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444', '&:hover': { borderColor: '#ef4444' } })
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

          {/* Rewards to Attach */}
          <div>
            <Label htmlFor="rewardToAttach">Rewards to Attach</Label>
            <Select
              isMulti
              options={rewardOptions}
              value={rewardOptions.filter(opt => formData.rewardIds.includes(opt.value))}
              onChange={(opts) => updateFormData({ rewardIds: opts.map(o => o.value) })}
              styles={errors.rewardIds ? selectErrorStyle : {}}
              placeholder={isLoadingRewards ? "Loading rewards..." : "Select..."}
              isDisabled={isLoadingRewards}
            />
            <p className="text-sm text-gray-500 mt-1">Choose the rewards to be given out in this campaign.</p>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date & Time</Label>
              <div className={`flex items-center rounded-md border px-3 ${errors.startDate ? 'border-red-500' : ''}`}><Calendar className="mr-2 h-4 w-4 opacity-50" /><DateTimePicker date={formData.startDate} setDate={(date) => updateFormData({ startDate: date || undefined })} /></div>
              <p className="text-sm text-gray-500 mt-1">When the campaign will become active.</p>
            </div>
            <div>
              <Label>End Date & Time</Label>
              <div className={`flex items-center rounded-md border px-3 ${errors.endDate ? 'border-red-500' : ''}`}><Calendar className="mr-2 h-4 w-4 opacity-50" /><DateTimePicker date={formData.endDate} setDate={(date) => updateFormData({ endDate: date || undefined })} /></div>
              <p className="text-sm text-gray-500 mt-1">When the campaign will automatically deactivate.</p>
            </div>
          </div>

          {/* Rewards Available */}
          <div>
            <Label htmlFor="rewardsAvailable">Number of Rewards Available</Label>
            <Input id="rewardsAvailable" type="number" placeholder="0" value={formData.rewardsAvailable} onChange={(e) => updateFormData({ rewardsAvailable: e.target.value === '' ? '' : Number(e.target.value) })} className={errors.rewardsAvailable ? 'border-red-500' : ''} />
            <p className="text-sm text-gray-500 mt-1">The total number of rewards that can be claimed.</p>
          </div>

          {/* Audience Type */}
          <div>
            <Label>Audience Type</Label>
            <div className={`p-2 rounded-md ${errors.audienceType ? 'border border-red-500' : ''}`}>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="members" checked={formData.audienceType.includes('members')} onCheckedChange={(checked) => updateFormData({ audienceType: checked ? [...formData.audienceType, 'members'] : formData.audienceType.filter(t => t !== 'members') })} />
                  <Label htmlFor="members">Members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="badge_level" checked={formData.audienceType.includes('badge_level')} onCheckedChange={(checked) => updateFormData({ audienceType: checked ? [...formData.audienceType, 'badge_level'] : formData.audienceType.filter(t => t !== 'badge_level') })} />
                  <Label htmlFor="badge_level">Badge Level</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="wishlist_target" checked={formData.audienceType.includes('wishlist_target')} onCheckedChange={(checked) => updateFormData({ audienceType: checked ? [...formData.audienceType, 'wishlist_target'] : formData.audienceType.filter(t => t !== 'wishlist_target') })} />
                  <Label htmlFor="wishlist_target">Target Wishlist</Label>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Choose who can participate in this campaign.</p>
            {formData.audienceType.includes('badge_level') && (
              <Select
                isMulti
                className="mt-2"
                options={tiers.map(tier => ({ value: tier.name, label: tier.name }))}
                value={formData.badgeLevels?.map(levelName => ({ value: levelName, label: levelName }))}
                onChange={(opts) => updateFormData({ badgeLevels: opts.map(o => o.value) })}
                placeholder="Select badge levels..."
                styles={errors.badgeLevels ? selectErrorStyle : {}}
              />
            )}
            {formData.audienceType.includes('wishlist_target') && (
              <Select isMulti className="mt-2" options={mockWishlistInsights.map(item => ({ value: item.itemName, label: `${item.itemName} (${item.estimatedCount} users)` }))} value={toSelectOptions(formData.wishlistItemIds || [])} onChange={(opts) => updateFormData({ wishlistItemIds: opts.map(o => o.value) })} placeholder="Select wishlist items..." styles={errors.wishlistItemIds ? selectErrorStyle : {}} />
            )}
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

          {/* CTA Button */}
          <div>
            <Label htmlFor="ctaButtonText">CTA Button</Label>
            <Select options={[{ value: 'Claim Reward', label: 'Claim Reward' }, { value: 'Join Now', label: 'Join Now' }, { value: 'Refer & Earn', label: 'Refer & Earn' }]} value={{ value: formData.ctaButtonText, label: formData.ctaButtonText }} onChange={(opt) => updateFormData({ ctaButtonText: opt?.value || 'Claim Reward' })} styles={errors.ctaButtonText ? selectErrorStyle : {}} />
            <p className="text-sm text-gray-500 mt-1">The call-to-action text for the button.</p>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="bgColor">BG Color</Label><Input id="bgColor" type="color" value={formData.bgColor} onChange={(e) => updateFormData({ bgColor: e.target.value })} /><p className="text-sm text-gray-500 mt-1">Background color of the campaign card.</p></div>
            <div><Label htmlFor="bgColorTextColor">BG Text Color</Label><Input id="bgColorTextColor" type="color" value={formData.bgColorTextColor} onChange={(e) => updateFormData({ bgColorTextColor: e.target.value })} /><p className="text-sm text-gray-500 mt-1">Text color on the campaign card.</p></div>
            <div><Label htmlFor="ctaBgColor">CTA BG Color</Label><Input id="ctaBgColor" type="color" value={formData.ctaBgColor} onChange={(e) => updateFormData({ ctaBgColor: e.target.value })} /><p className="text-sm text-gray-500 mt-1">Background color of the CTA button.</p></div>
            <div><Label htmlFor="ctaTextColor">CTA Text Color</Label><Input id="ctaTextColor" type="color" value={formData.ctaTextColor} onChange={(e) => updateFormData({ ctaTextColor: e.target.value })} /><p className="text-sm text-gray-500 mt-11">Text color of the CTA button.</p></div>
          </div>

          {/* Campaign Preview */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-xl border border-gray-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Campaign Preview</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">See how your campaign will appear on web and mobile devices.</p>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{ backgroundColor: formData.bgColor }}>
              <div className="relative h-48 w-full overflow-hidden bg-gray-200">{imagePreviewUrl && <Image src={imagePreviewUrl} alt="Campaign Preview" layout="fill" objectFit="cover" />}</div>
              <div className="relative px-5"><div className="absolute -top-12 left-1/2 -translate-x-1/2"><div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">{logoPreviewUrl ? <Image src={logoPreviewUrl} alt="Logo Preview" layout="fill" objectFit="cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-500"><span className="text-xs">Logo</span></div>}</div></div></div>
              <div className="pt-16 p-5 text-center" style={{ color: formData.bgColorTextColor }}>
                <h5 className="font-extrabold text-2xl mb-2">{formData.campaignName || '[Campaign Name]'}</h5>
                <p className="text-base mb-4">{formData.campaignMessage || '[Campaign Message]'}</p>
                <div className="space-y-3 text-sm mb-5 border-t pt-4">
                  <div className="flex items-center justify-between"><span className="flex items-center font-medium"><Gift className="h-4 w-4 mr-2 text-blue-500" />Rewards:</span><span className="text-right">{formData.rewardIds.join(', ') || '[Select Rewards]'}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center font-medium"><Tag className="h-4 w-4 mr-2 text-green-500" />Available:</span><span className="text-right">{Number(formData.rewardsAvailable) > 0 ? formData.rewardsAvailable : 'Unlimited'}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center font-medium"><Calendar className="h-4 w-4 mr-2 text-purple-500" />Starts:</span><span className="text-right">{formData.startDate ? formData.startDate.toLocaleDateString() : '[Start Date]'}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center font-medium"><Calendar className="h-4 w-4 mr-2 text-red-500" />Ends:</span><span className="text-right">{formData.endDate ? formData.endDate.toLocaleDateString() : '[End Date]'}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center font-medium"><Users className="h-4 w-4 mr-2 text-orange-500" />Audience:</span><span className="text-right">{formData.audienceType.map(type => type === 'badge_level' ? `Badge: ${formData.badgeLevels?.join(', ') || '[Level]'}` : type === 'wishlist_target' ? `Wishlist: ${formData.wishlistItemIds?.join(', ') || '[Item]'}` : type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}</span></div>
                </div>
                <Button className="w-full py-3 text-lg font-semibold transition-colors duration-200" style={{ backgroundColor: formData.ctaBgColor, color: formData.ctaTextColor }}>{formData.ctaButtonText}</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleNextClick}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}