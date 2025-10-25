'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import DateTimePicker from '@/components/dashboard/campaigns/datePicker';
import Image from 'next/image';
import { Calendar, Users, Gift, Tag } from 'lucide-react'; // Added icons
import { useCampaignForm } from '@/context/CampaignFormContext';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

// Mock rewards data (replace with actual API call later)
const mockRewards = [
  { id: '1', title: 'Summer Voucher ($50)', image: 'https://images.unsplash.com/photo-1529592691919-7a6aa481f520?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '2', title: 'Gift Card ($100)', image: 'https://images.unsplash.com/photo-1579621970795-87f943b9e7a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '3', title: 'Discount Coupon (20% off)', image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

export default function StepSetCampaignDetails({ onNext, onBack }: StepProps) {
  const { formData, updateFormData } = useCampaignForm();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(formData.imageUrl || null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(formData.logoUrl || null);

  useEffect(() => {
    if (formData.imageUrl) {
      setImagePreviewUrl(formData.imageUrl);
    }
    if (formData.logoUrl) {
      setLogoPreviewUrl(formData.logoUrl);
    }
  }, [formData.imageUrl, formData.logoUrl]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
    updateFormData({ imageUrl: previewUrl || '' });
  };

  const handleLogoSelect = (file: File | null, previewUrl: string | null) => {
    setLogoPreviewUrl(previewUrl);
    updateFormData({ logoUrl: previewUrl || '' });
  };

  const isFormValid = () => {
    return (
      formData.campaignName.trim() !== '' &&
      formData.rewardId.trim() !== '' &&
      formData.startDate !== undefined &&
      formData.endDate !== undefined &&
      formData.rewardsAvailable > 0 &&
      formData.campaignMessage.trim() !== '' &&
      formData.ctaButtonText.trim() !== ''
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Set Campaign Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              placeholder="e.g., Summer Sale Campaign"
              value={formData.campaignName}
              onChange={(e) => updateFormData({ campaignName: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">The name of your campaign, as it will be displayed to customers.</p>
          </div>

          <div>
            <Label htmlFor="rewardToAttach">Reward to Attach</Label>
            <Select
              value={formData.rewardId}
              onValueChange={(value) => updateFormData({ rewardId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reward" />
              </SelectTrigger>
              <SelectContent>
                {mockRewards.map((reward) => (
                  <SelectItem key={reward.id} value={reward.id}>
                    {reward.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Choose the reward to be given out in this campaign.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date & Time</Label>
              <DateTimePicker
                date={formData.startDate}
                setDate={(date) => updateFormData({ startDate: date || undefined })}
              />
              <p className="text-sm text-gray-500 mt-1">When the campaign will become active.</p>
            </div>
            <div>
              <Label>End Date & Time</Label>
              <DateTimePicker
                date={formData.endDate}
                setDate={(date) => updateFormData({ endDate: date || undefined })}
              />
              <p className="text-sm text-gray-500 mt-1">When the campaign will automatically deactivate.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="rewardsAvailable">Number of Rewards Available</Label>
            <Input
              id="rewardsAvailable"
              type="number"
              placeholder="0"
              value={formData.rewardsAvailable}
              onChange={(e) => updateFormData({ rewardsAvailable: Number(e.target.value) })}
            />
            <p className="text-sm text-gray-500 mt-1">The total number of rewards that can be claimed.</p>
          </div>

          <div>
            <Label>Audience Type</Label>
            <RadioGroup
              value={formData.audienceType}
              onValueChange={(value: 'everyone' | 'members' | 'badge_level') => updateFormData({ audienceType: value })}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="everyone" id="r1" />
                <Label htmlFor="r1">Everyone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="members" id="r2" />
                <Label htmlFor="r2">Members</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="badge_level" id="r3" />
                <Label htmlFor="r3">Badge Level</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-gray-500 mt-1">Choose who can participate in this campaign.</p>
            {formData.audienceType === 'badge_level' && (
              <Input
                className="mt-2"
                placeholder="e.g., Gold, Platinum"
                value={formData.badgeLevel || ''}
                onChange={(e) => updateFormData({ badgeLevel: e.target.value })}
              />
            )}
          </div>

          <div>
            <Label htmlFor="campaignMessage">Campaign Message / Caption</Label>
            <Textarea
              id="campaignMessage"
              placeholder="What customers will see..."
              value={formData.campaignMessage}
              onChange={(e) => updateFormData({ campaignMessage: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">A catchy message to attract customers.</p>
          </div>

          <div>
            <Label>Image or Banner (optional)</Label>
            <CloudinaryUpload onFileSelect={handleFileSelect} />
            <p className="text-sm text-gray-500 mt-1">Upload a banner image for your campaign.</p>
            {imagePreviewUrl && ( // Display image preview if available
              <div className="mt-4">
                <p className="text-sm font-medium">Image Preview:</p>
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-200">
                  <Image src={imagePreviewUrl} alt="Campaign Banner Preview" layout="fill" objectFit="cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Logo (optional)</Label>
            <CloudinaryUpload onFileSelect={handleLogoSelect} />
            <p className="text-sm text-gray-500 mt-1">Upload your business logo.</p>
            {logoPreviewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Logo Preview:</p>
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                  <Image src={logoPreviewUrl} alt="Logo Preview" layout="fill" objectFit="cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="ctaButtonText">CTA Button</Label>
            <Select
              value={formData.ctaButtonText}
              onValueChange={(value: 'Claim Reward' | 'Join Now' | 'Refer & Earn') => updateFormData({ ctaButtonText: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CTA text" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Claim Reward">Claim Reward</SelectItem>
                <SelectItem value="Join Now">Join Now</SelectItem>
                <SelectItem value="Refer & Earn">Refer & Earn</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">The call-to-action text for the button.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bgColor">BG Color</Label>
              <Input
                id="bgColor"
                type="color"
                value={formData.bgColor}
                onChange={(e) => updateFormData({ bgColor: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">Background color of the campaign card.</p>
            </div>
            <div>
              <Label htmlFor="bgColorTextColor">BG Text Color</Label>
              <Input
                id="bgColorTextColor"
                type="color"
                value={formData.bgColorTextColor}
                onChange={(e) => updateFormData({ bgColorTextColor: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">Text color on the campaign card.</p>
            </div>
            <div>
              <Label htmlFor="ctaBgColor">CTA BG Color</Label>
              <Input
                id="ctaBgColor"
                type="color"
                value={formData.ctaBgColor}
                onChange={(e) => updateFormData({ ctaBgColor: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">Background color of the CTA button.</p>
            </div>
            <div>
              <Label htmlFor="ctaTextColor">CTA Text Color</Label>
              <Input
                id="ctaTextColor"
                type="color"
                value={formData.ctaTextColor}
                onChange={(e) => updateFormData({ ctaTextColor: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">Text color of the CTA button.</p>
            </div>
          </div>

          {/* Campaign Preview Section */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-xl border border-gray-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Campaign Preview</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">See how your campaign will appear on web and mobile devices.</p>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{ backgroundColor: formData.bgColor }}>
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    {imagePreviewUrl && (
                        <Image src={imagePreviewUrl} alt="Campaign Preview" layout="fill" objectFit="cover" />
                    )}
                </div>
                <div className="relative px-5">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
                            {logoPreviewUrl ? (
                                <Image src={logoPreviewUrl} alt="Logo Preview" layout="fill" objectFit="cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500">
                                    <span className="text-xs">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              <div className="pt-16 p-5 text-center" style={{ color: formData.bgColorTextColor }}>
                <h5 className="font-extrabold text-2xl mb-2">{formData.campaignName || '[Campaign Name]'}</h5>
                <p className="text-base mb-4">{formData.campaignMessage || '[Campaign Message]'}</p>

                <div className="space-y-3 text-sm mb-5 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center font-medium"><Gift className="h-4 w-4 mr-2 text-blue-500" />Reward:</span>
                    <span className="text-right">{mockRewards.find(r => r.id === formData.rewardId)?.title || '[Select Reward]'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center font-medium"><Tag className="h-4 w-4 mr-2 text-green-500" />Available:</span>
                    <span className="text-right">{formData.rewardsAvailable > 0 ? formData.rewardsAvailable : 'Unlimited'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center font-medium"><Calendar className="h-4 w-4 mr-2 text-purple-500" />Starts:</span>
                    <span className="text-right">{formData.startDate ? formData.startDate.toLocaleDateString() : '[Start Date]'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center font-medium"><Calendar className="h-4 w-4 mr-2 text-red-500" />Ends:</span>
                    <span className="text-right">{formData.endDate ? formData.endDate.toLocaleDateString() : '[End Date]'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center font-medium"><Users className="h-4 w-4 mr-2 text-orange-500" />Audience:</span>
                    <span className="text-right">
                      {formData.audienceType === 'badge_level'
                        ? `Badge Level: ${formData.badgeLevel || '[Level]'}`
                        : formData.audienceType}
                    </span>
                  </div>
                </div>
                <Button className="w-full py-3 text-lg font-semibold transition-colors duration-200" style={{ backgroundColor: formData.ctaBgColor, color: formData.ctaTextColor }}>
                  {formData.ctaButtonText}
                </Button>
              </div>
            </div>
          </div>

        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onNext} disabled={!isFormValid()}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
