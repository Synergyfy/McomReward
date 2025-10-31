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

interface CreateRewardWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const rewardTypes = [
  { value: 'voucher', label: 'Voucher', icon: '🎟️' },
  { value: 'gift_card', label: 'Gift Card', icon: '🎁' },
  { value: 'coupon', label: 'Coupon', icon: '🏷️' },
  { value: 'points_offer', label: 'Points Offer', icon: '⭐' },
  { value: 'physical_product', label: 'Physical Product', icon: '📦' },
];

export default function CreateRewardWizardModal({ isOpen, onClose }: CreateRewardWizardModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Step 1: Details
  const [rewardType, setRewardType] = useState('points_offer');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number | string>(0);
  const [pointsRequired, setPointsRequired] = useState<number | string>(0);
  const [badgeLevel, setBadgeLevel] = useState('');
  const [expiry, setExpiry] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default 30 days
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Step 2: Review (read-only)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCampaignPrompt, setShowCampaignPrompt] = useState(false);

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
    if (!selectedFile) newErrors.image = 'Image is required.';
    setErrors(newErrors);
  }, [rewardType, name, description, value, pointsRequired, badgeLevel, selectedFile]);

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
    // Prototype: Directly show campaign prompt without backend call
    setShowCampaignPrompt(true);
  };

  const handleCampaignYes = () => {
    setShowCampaignPrompt(false);
    onClose();
    resetForm();
    router.push('/dashboard/campaigns/create');
  };

  const handleCampaignNo = () => {
    setShowCampaignPrompt(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setRewardType('');
    setName('');
    setDescription('');
    setValue(0);
    setPointsRequired(0);
    setBadgeLevel('');
    setExpiry(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setErrors({});
  };

  const progressValue = (step / totalSteps) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Reward</DialogTitle>
            <Progress value={progressValue} className="mt-2" />
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reward Type</label>
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    {rewardTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">Select the type of reward, like a voucher or gift card.</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input id="name" placeholder="Reward Name" value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-sm text-muted-foreground mt-1">Give your reward a short, catchy name.</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea id="description" placeholder="Describe the reward" value={description} onChange={(e) => setDescription(e.target.value)} />
                <p className="text-sm text-muted-foreground mt-1">Explain what the reward is and any important details.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium mb-1">Value (£)</label>
                  <Input id="value" type="number" placeholder="0" value={value} onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} />
                  <p className="text-sm text-muted-foreground mt-1">Enter the monetary value of the reward in pounds.</p>
                </div>
                <div>
                  <label htmlFor="points" className="block text-sm font-medium mb-1">Points Required</label>
                  <Input id="points" type="number" placeholder="0" value={pointsRequired} onChange={(e) => setPointsRequired(e.target.value === '' ? '' : Number(e.target.value))} />
                  <p className="text-sm text-muted-foreground mt-1">How many points does a customer need to redeem this?</p>
                </div>
              </div>

              <div>
                <label htmlFor="badge" className="block text-sm font-medium mb-1">Badge Level (Optional)</label>
                <Select value={badgeLevel} onValueChange={(value) => setBadgeLevel(value === 'NONE' ? '' : value)}>
                  <SelectTrigger id="badge">
                    <SelectValue placeholder="Select a badge level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">
                      <em>None</em>
                    </SelectItem>
                    {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">If this reward is for a specific customer level, select it here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <DateTimePicker date={expiry} setDate={setExpiry} />
                <p className="text-sm text-muted-foreground mt-1">Customers won&apos;t be able to claim it after this date.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reward Image</label>
                <CloudinaryUpload onFileSelect={handleFileSelect} />
                <p className="text-sm text-muted-foreground mt-1">Upload an attractive image for the reward. This will be shown to customers.</p>
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
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {imagePreviewUrl && (
                          <Image
                            src={imagePreviewUrl}
                            alt={name}
                            layout="fill"
                            objectFit="cover"
                          />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{rewardTypes.find(t => t.value === rewardType)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Value:</span>
                      <span>£{value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Points:</span>
                      <span>{pointsRequired}</span>
                    </div>
                    {badgeLevel && (
                      <div className="flex justify-between">
                        <span className="font-medium">Badge Level:</span>
                        <span>{badgeLevel}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Expires:</span>
                      <span>{expiry.toLocaleDateString()}</span>
                    </div>
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
              <Button onClick={handleNext} disabled={!isStep1Valid}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Create Reward
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCampaignPrompt} onOpenChange={setShowCampaignPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reward Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your reward has been created. Do you want to launch a campaign for this reward?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCampaignNo}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleCampaignYes}>Yes, Launch Campaign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
