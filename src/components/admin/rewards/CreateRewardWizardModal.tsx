'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';
import DateTimePicker from '@/components/dashboard/campaigns/datePicker';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RewardResponse, CreateRewardRequest } from '@/services/rewards/types';
import { useCreateReward } from '@/services/rewards/hook';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// Import tiers service
import { useGetSectors } from '@/services/sectors/hook';
import { useGetTiers } from '@/services/tiers/hook';
import toast from 'react-hot-toast';
import { useGuide } from '@/context/GuideContext';

interface CreateRewardWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'duplicate';
  reward?: RewardResponse | null;
  onSuccess?: () => void;
  startTour?: boolean;
}

const rewardTypes = [
  { value: 'Voucher', label: 'Voucher', icon: '🎟️' },
  { value: 'gift card', label: 'Gift Card', icon: '💳' },
  { value: 'coupon', label: 'Coupon', icon: '🏷️' },
  { value: 'point offer', label: 'Point Offer', icon: '✨' },
  { value: 'physical product', label: 'Physical Product', icon: '📦' },
];

export default function CreateRewardWizardModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  reward,
  startTour = false,
}: CreateRewardWizardModalProps) {
  const router = useRouter();
  const { startGuide, goToStep } = useGuide();
  const { mutate: createReward, isPending: isCreating } = useCreateReward();
  const { data: sectors = [] } = useGetSectors();
  const { data: tiers = [] } = useGetTiers();
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [rewardType, setRewardType] = useState('Voucher');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number | string>(0);
  const [pointsRequired, setPointsRequired] = useState<number | string>(0);
  const [badgeLevel, setBadgeLevel] = useState<string[]>([]);
  const [expiry, setExpiry] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<RewardResponse['status']>('draft');
  const [selectedSector, setSelectedSector] = useState('');
  // const [rewardSource, setRewardSource] = useState('mcom vault');
  const [audience, setAudience] = useState('all business');
  const [newRewardId, setNewRewardId] = useState<string | null>(null);

  // Effect to reset sector when audience changes to 'all business'
  useEffect(() => {
    if (audience === 'all business') {
      setSelectedSector('');
    }
  }, [audience]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCampaignPrompt, setShowCampaignPrompt] = useState(false);

  // Removed useMemos for availableCategories/SubCategories as they are now direct hook results

  const resetForm = () => {
    setStep(1);
    setRewardType('voucher');
    setName('');
    setDescription('');
    setValue(0);
    setPointsRequired(0);
    setBadgeLevel([]);
    setExpiry(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setGalleryFiles([]);
    setGalleryPreviewUrls([]);
    setStatus('draft');
    setSelectedSector('');
    // setRewardSource('mcom vault');
    setAudience('all business');
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      if ((mode === 'edit' || mode === 'duplicate') && reward) {
        setName(mode === 'duplicate' ? `Copy of ${reward.title}` : reward.title);
        setDescription(reward.description);
        setRewardType(reward.type);
        setValue(reward.value);
       setPointsRequired(reward.max_points ?? '');
        setExpiry(reward.expiry ? new Date(reward.expiry) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        setImagePreviewUrl(reward.image);
        if (reward.gallery && Array.isArray(reward.gallery)) {
            setGalleryPreviewUrls(reward.gallery);
        } else {
            setGalleryPreviewUrls([]);
        }
        setStatus(reward.status);
        // Handle badgeLevel - convert string to array if needed
        if (reward.badgeLevel) {
          // If badgeLevel is a string, convert to array; if already array, use as is
          setBadgeLevel(Array.isArray(reward.badgeLevel) ? reward.badgeLevel : [reward.badgeLevel]);
        } else {
          setBadgeLevel([]);
        }
        // Note: Sector/Category and other new fields are not in the mock reward object, so we can't pre-fill them.
      } else {
        resetForm();
      }

      // Start tour if requested
      if (startTour && mode === 'create') {
        startGuide('REWARD');
      }
    }
  }, [isOpen, mode, reward, startTour, startGuide]);


  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + galleryFiles.length > 3) {
        toast.error("You can only upload up to 3 gallery images.");
        return;
      }
      const validFiles = files.filter(file => {
          if (file.size > 5 * 1024 * 1024) {
              toast.error(`File ${file.name} is too large. Max size is 5MB.`);
              return false;
          }
          return true;
      });

      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setGalleryFiles(prev => [...prev, ...validFiles]);
      setGalleryPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeGalleryImage = (index: number) => {
      setGalleryFiles(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Validation for Step 1
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!rewardType) newErrors.rewardType = 'Reward type is required.';
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (Number(value) <= 0) newErrors.value = 'Value must be greater than 0.';
    if (Number(pointsRequired) <= 0 && badgeLevel.length === 0) newErrors.pointsOrBadge = 'Max Points or Badge Level is required.';
    if (!imagePreviewUrl) newErrors.image = 'Image is required.';
    setErrors(newErrors);
  }, [rewardType, name, description, value, pointsRequired, badgeLevel, imagePreviewUrl]);

  const isStep1Valid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
      goToStep(1); // Assuming 0-indexed steps in guide
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      let finalImageUrl = imagePreviewUrl || '';

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload/rewards', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Image upload failed');
        }

        const uploadResult = await uploadResponse.json();
        finalImageUrl = uploadResult.secure_url;
      }

      const uploadedGalleryUrls: string[] = [];
      // Upload gallery images
      for (const file of galleryFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const uploadResponse = await fetch('/api/upload/rewards', {
              method: 'POST',
              body: formData,
          });
          if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              toast.error(`Failed to upload gallery image: ${file.name}`);
              console.error(errorData);
              continue; // Skip this file and continue
          }
          const uploadResult = await uploadResponse.json();
          uploadedGalleryUrls.push(uploadResult.secure_url);
      }
      
      // Combine existing URLs (from edit mode) with new uploaded URLs
      // Assuming galleryPreviewUrls contains both blobs (new) and http (existing)
      // We only uploaded the files in galleryFiles.
      // We need to keep the existing URLs that were not removed.
      
      const finalGalleryUrls = [
          ...galleryPreviewUrls.filter(url => !url.startsWith('blob:')), // Existing URLs
          ...uploadedGalleryUrls // New URLs
      ];


      const payload: CreateRewardRequest = {
        title: name,
        max_points: Number(pointsRequired),
        value: Number(value),
        description,
        image: finalImageUrl,
        gallery: finalGalleryUrls,
        quantity: 100, // Default or add field if needed
        reward_type: rewardType,
        // reward_source: rewardSource,
        audience,
        expiry_datetime: expiry.toISOString(),
        status,
        sector_ids: selectedSector ? [selectedSector] : [],
        tier_ids: badgeLevel,
      };

      createReward(payload, {
        onSuccess: (newlyCreatedReward) => {
          setNewRewardId(newlyCreatedReward.id);
          // First, close the main wizard dialog
          onClose();
          // Then, show the success prompt. A timeout ensures the first dialog has time to close.
          setTimeout(() => {
            setShowCampaignPrompt(true);
          }, 150);
        },
        onError: (error: unknown) => {
          console.error('Failed to create reward:', error);
          // Toast is handled in the hook
        }
      });
    } catch (error: unknown) {
      console.error('Error submitting reward:', error);
      let errorMessage = 'An unexpected error occurred during submission.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleCampaignYes = () => {
    setShowCampaignPrompt(false);
    // If we were in a tour, continue it
    const queryParams = new URLSearchParams();
    if (newRewardId) queryParams.set('rewardId', newRewardId);
    if (startTour) {
        queryParams.set('tour', 'true');
        startGuide('CAMPAIGN');
    }

    router.push(`/admin/campaigns/create?${queryParams.toString()}`);
  };

  const handleCampaignNo = () => {
    setShowCampaignPrompt(false);
  };

  const progressValue = (step / totalSteps) * 100;
  const modalTitle = mode === 'edit' ? 'Edit Reward' : mode === 'duplicate' ? 'Duplicate Reward' : 'Create New Reward';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <Progress value={progressValue} className="mt-2" />
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-4 py-4" id="create-reward-modal-content">
              {/* Reward Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Reward Type</label>
                <p className="text-xs text-muted-foreground mb-2">Choose the type of reward you're offering (voucher, physical item, or digital product)</p>
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger id="reward-type-select-trigger"><SelectValue placeholder="Select reward type" /></SelectTrigger>
                  <SelectContent position="popper" className="z-[10000]">
                    {rewardTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.icon} {type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <p className="text-xs text-muted-foreground mb-2">Enter a clear, descriptive name for this reward</p>
                <Input id="reward-name-input" placeholder="e.g., £10 Coffee Voucher" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <p className="text-xs text-muted-foreground mb-2">Provide details about what this reward includes and how to use it</p>
                <Textarea id="reward-description-input" placeholder="e.g., Enjoy a £10 voucher redeemable at any participating coffee shop" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Audience - moved to be directly after Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Audience</label>
                <p className="text-xs text-muted-foreground mb-2">Select who can access this reward - all businesses or specific sectors only</p>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="reward-audience-select-trigger"><SelectValue placeholder="Select Audience" /></SelectTrigger>
                  <SelectContent position="popper" className="z-[10000]">
                    <SelectItem value="all business">All Businesses</SelectItem>
                    <SelectItem value="specific sectors">Specific Sectors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium mb-1">Sector</label>
                <p className="text-xs text-muted-foreground mb-2">Choose a specific business sector if you selected "Specific Sectors" above</p>
                <Select
                  value={selectedSector}
                  onValueChange={setSelectedSector}
                  disabled={audience === 'all business'}
                >
                  <SelectTrigger><SelectValue placeholder="Select Sector" /></SelectTrigger>
                  <SelectContent position="popper" className="z-[10000]">
                    {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Value and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium mb-1">Value (£)</label>
                  <p className="text-xs text-muted-foreground mb-2">Monetary value of the reward</p>
                  <Input id="reward-value-input" type="number" placeholder="0" value={value} onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div>
                  <label htmlFor="points" className="block text-sm font-medium mb-1">Maximum point</label>
                  <p className="text-xs text-muted-foreground mb-2">Points needed to redeem this reward</p>
                  <Input id="reward-points-input" type="number" placeholder="0" value={pointsRequired} onChange={(e) => setPointsRequired(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>

              {/* Badge Level and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Badge Level (Optional)</label>
                  <p className="text-xs text-muted-foreground mb-2">Restrict this reward to specific tier levels</p>
                  <div className="space-y-2 border rounded-md p-3">
                    {tiers.map((tier) => (
                      <div key={tier.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`badge-${tier.id}`}
                          checked={badgeLevel.includes(tier.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBadgeLevel([...badgeLevel, tier.id]);
                            } else {
                              setBadgeLevel(badgeLevel.filter((l) => l !== tier.id));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`badge-${tier.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tier.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {badgeLevel.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {badgeLevel.map((tierId) => {
                        const tier = tiers.find(t => t.id === tierId);
                        return tier ? (
                          <Badge key={tierId} variant="secondary" className="text-xs">
                            {tier.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <p className="text-xs text-muted-foreground mb-2">Set as draft to save for later or active to publish</p>
                  <Select value={status} onValueChange={(v) => setStatus(v as RewardResponse['status'])}>
                    <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expiry and Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <p className="text-xs text-muted-foreground mb-2">Set when this reward offer expires and is no longer available</p>
                <DateTimePicker date={expiry} setDate={setExpiry} minDate={new Date()} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reward Image</label>
                <p className="text-xs text-muted-foreground mb-2">Upload an attractive image representing this reward</p>
                <CloudinaryUpload onFileSelect={handleFileSelect} />
                {imagePreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Image Preview:</p>
                    <div className="relative h-24 w-24 rounded-full overflow-hidden">
                      <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Gallery Images (Optional)</label>
                <p className="text-xs text-muted-foreground mb-2">Upload up to 3 additional images (max 5MB each)</p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                        disabled={galleryPreviewUrls.length >= 3}
                      >
                        Upload Gallery Images
                      </Button>
                      <input
                        id="gallery-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleGallerySelect}
                        disabled={galleryPreviewUrls.length >= 3}
                      />
                      <span className="text-xs text-muted-foreground">{galleryPreviewUrls.length}/3 images</span>
                  </div>
                  
                  {galleryPreviewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-2">
                      {galleryPreviewUrls.map((url, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border">
                          <Image src={url} alt={`Gallery ${index + 1}`} layout="fill" objectFit="cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-5 w-5 flex items-center justify-center text-xs"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 py-4">
              <h3 className="text-lg font-semibold mb-4">Review Your Reward</h3>
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {imagePreviewUrl && <Image src={imagePreviewUrl} alt={name} layout="fill" objectFit="cover" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="font-medium">Type:</span><span>{rewardTypes.find(t => t.value === rewardType)?.label}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Value:</span><span>£{value}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Max Points:</span><span>{pointsRequired}</span></div>
                    {badgeLevel.length > 0 && (
                      <div className="flex justify-between">
                        <span className="font-medium">Badge Level:</span>
                        <span>{badgeLevel.map(tierId => tiers.find(t => t.id === tierId)?.name).filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {selectedSector && <div className="flex justify-between"><span className="font-medium">Sector:</span><span>{sectors.find(s => s.id === selectedSector)?.name}</span></div>}
                    <div className="flex justify-between"><span className="font-medium">Audience:</span><span>{audience.replace('_', ' ')}</span></div>
                    {/* <div className="flex justify-between"><span className="font-medium">Source:</span><span>{rewardSource === 'mcom vault' ? 'MCOM Vault' : 'Partner'}</span></div> */}
                    <div className="flex justify-between"><span className="font-medium">Expires:</span><span>{expiry.toLocaleDateString()}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Back
            </Button>
            {step < totalSteps ? (
              <Button id="reward-next-btn" onClick={handleNext} disabled={!isStep1Valid}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? 'Creating...' : (mode === 'edit' ? 'Save Changes' : 'Create Reward')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCampaignPrompt} onOpenChange={setShowCampaignPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Your reward has been saved. Do you want to launch a campaign for this reward now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCampaignNo}>No, Finish</AlertDialogCancel>
            <AlertDialogAction onClick={handleCampaignYes}>Yes, Launch Campaign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
