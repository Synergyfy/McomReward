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
import { type Reward } from '@/app/admin/rewards/page';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
// Using mock data for prototype purposes
import { initialSectors, type Sector } from '@/lib/mock-data/sectors';

interface CreateRewardWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit' | 'duplicate';
  reward?: Reward | null;
}

const rewardTypes = [
  { value: 'voucher', label: 'Voucher', icon: '🎟️' },
  { value: 'gift_card', label: 'Gift Card', icon: '🎁' },
  { value: 'coupon', label: 'Coupon', icon: '🏷️' },
  { value: 'points_offer', label: 'Points Offer', icon: '⭐' },
  { value: 'physical_product', label: 'Physical Product', icon: '📦' },
];

export default function CreateRewardWizardModal({ isOpen, onClose, mode = 'create', reward }: CreateRewardWizardModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Form State
  const [rewardType, setRewardType] = useState('points_offer');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number | string>(0);
  const [pointsRequired, setPointsRequired] = useState<number | string>(0);
  const [badgeLevel, setBadgeLevel] = useState('');
  const [expiry, setExpiry] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Reward['status']>('draft');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [rewardSource, setRewardSource] = useState('mcom');
  const [audience, setAudience] = useState('all_businesses');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCampaignPrompt, setShowCampaignPrompt] = useState(false);

  const availableCategories = useMemo(() => {
    if (!selectedSector) return [];
    return initialSectors.find(s => s.id === selectedSector)?.categories || [];
  }, [selectedSector]);

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return availableCategories.find(c => c.id === selectedCategory)?.subCategories || [];
  }, [selectedCategory, availableCategories]);

  const resetForm = () => {
    setStep(1);
    setRewardType('points_offer');
    setName('');
    setDescription('');
    setValue(0);
    setPointsRequired(0);
    setBadgeLevel('');
    setExpiry(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setStatus('draft');
    setSelectedSector('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setRewardSource('mcom');
    setAudience('all_businesses');
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      if ((mode === 'edit' || mode === 'duplicate') && reward) {
        setName(mode === 'duplicate' ? `Copy of ${reward.name}` : reward.name);
        setDescription(reward.description);
        setRewardType(reward.type);
        setValue(reward.value);
        setPointsRequired(reward.pointsRequired);
        setExpiry(new Date(reward.expiry));
        setImagePreviewUrl(reward.image);
        setStatus(reward.status);
        // Note: Sector/Category and other new fields are not in the mock reward object, so we can't pre-fill them.
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, reward]);


  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  // Validation for Step 1
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!rewardType) newErrors.rewardType = 'Reward type is required.';
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (Number(value) <= 0) newErrors.value = 'Value must be greater than 0.';
    if (Number(pointsRequired) <= 0 && !badgeLevel) newErrors.pointsOrBadge = 'Points Required or Badge Level is required.';
    if (!imagePreviewUrl) newErrors.image = 'Image is required.';
    setErrors(newErrors);
  }, [rewardType, name, description, value, pointsRequired, badgeLevel, imagePreviewUrl]);

  const isStep1Valid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Submitting reward:', {
      id: mode === 'edit' ? reward?.id : undefined,
      mode,
      name,
      description,
      rewardType,
      value,
      pointsRequired,
      badgeLevel,
      expiry,
      image: imagePreviewUrl,
      status,
      sector: selectedSector,
      category: selectedCategory,
      subCategory: selectedSubCategory,
      source: rewardSource,
      audience,
    });
    setShowCampaignPrompt(true);
  };

  const handleCampaignYes = () => {
    setShowCampaignPrompt(false);
    onClose();
    router.push('/dashboard/campaigns/create');
  };

  const handleCampaignNo = () => {
    setShowCampaignPrompt(false);
    onClose();
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
            <div className="grid gap-4 py-4">
              {/* Reward Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Reward Type</label>
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger><SelectValue placeholder="Select reward type" /></SelectTrigger>
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
                <Input id="name" placeholder="Reward Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea id="description" placeholder="Describe the reward" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Sector/Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sector</label>
                  <Select value={selectedSector} onValueChange={v => { setSelectedSector(v); setSelectedCategory(''); setSelectedSubCategory(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select Sector" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      {initialSectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setSelectedSubCategory(''); }} disabled={!selectedSector}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      {availableCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sub-Category</label>
                  <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory} disabled={!selectedCategory}>
                    <SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      {availableSubCategories.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Value and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium mb-1">Value (£)</label>
                  <Input id="value" type="number" placeholder="0" value={value} onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div>
                  <label htmlFor="points" className="block text-sm font-medium mb-1">Points Required</label>
                  <Input id="points" type="number" placeholder="0" value={pointsRequired} onChange={(e) => setPointsRequired(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>

              {/* Badge Level and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="badge" className="block text-sm font-medium mb-1">Badge Level (Optional)</label>
                  <Select value={badgeLevel} onValueChange={(value) => setBadgeLevel(value === 'NONE' ? '' : value)}>
                    <SelectTrigger id="badge"><SelectValue placeholder="Select a badge level" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      <SelectItem value="NONE"><em>None</em></SelectItem>
                      {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Reward['status'])}>
                    <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reward Source and Audience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Reward Source</label>
                    <RadioGroup value={rewardSource} onValueChange={setRewardSource} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mcom" id="mcom" />
                            <Label htmlFor="mcom">MCOM Vault</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partner" id="partner" />
                            <Label htmlFor="partner">Partner</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Audience</label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger><SelectValue placeholder="Select Audience" /></SelectTrigger>
                    <SelectContent position="popper" className="z-[10000]">
                      <SelectItem value="all_businesses">All Businesses</SelectItem>
                      <SelectItem value="specific_sectors">Specific Sectors</SelectItem>
                      <SelectItem value="specific_tiers">Specific Tiers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expiry and Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <DateTimePicker date={expiry} setDate={setExpiry} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reward Image</label>
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
                    <div className="flex justify-between"><span className="font-medium">Points:</span><span>{pointsRequired}</span></div>
                    {badgeLevel && <div className="flex justify-between"><span className="font-medium">Badge Level:</span><span>{badgeLevel}</span></div>}
                    {selectedSector && <div className="flex justify-between"><span className="font-medium">Sector:</span><span>{initialSectors.find(s => s.id === selectedSector)?.name}</span></div>}
                    {selectedCategory && <div className="flex justify-between"><span className="font-medium">Category:</span><span>{availableCategories.find(c => c.id === selectedCategory)?.name}</span></div>}
                    <div className="flex justify-between"><span className="font-medium">Audience:</span><span>{audience.replace('_', ' ')}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Source:</span><span>{rewardSource === 'mcom' ? 'MCOM Vault' : 'Partner'}</span></div>
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
              <Button onClick={handleNext} disabled={!isStep1Valid}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>
                {mode === 'edit' ? 'Save Changes' : 'Create Reward'}
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
