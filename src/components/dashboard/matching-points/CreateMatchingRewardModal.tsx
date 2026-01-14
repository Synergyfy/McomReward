'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateMatchingReward } from '@/services/matching-points/hook';
import { CreateMatchingRewardDto, TargetAudience } from '@/services/matching-points/types';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { useUploadToCloudinary } from '@/services/upload/hook';

interface CreateMatchingRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateMatchingRewardModal({ isOpen, onClose, onSuccess }: CreateMatchingRewardModalProps) {
  const { mutate: createReward, isPending: isCreating } = useCreateMatchingReward();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadToCloudinary();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CreateMatchingRewardDto>({
    title: '',
    short_description: '',
    long_description: '',
    required_points: 0,
    quantity: 0,
    main_image: '',
    gallery_images: [],
    target_audience: 'BUSINESS_ONLY',
    start_datetime: new Date().toISOString(),
    end_datetime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Default 1 year
  });

  const loading = isCreating || isUploading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleAudienceChange = (value: TargetAudience) => {
    setFormData(prev => ({ ...prev, target_audience: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.main_image;

    if (selectedFile) {
        try {
            const uploadResult = await uploadImage({ file: selectedFile, folder: 'matching-rewards' });
            imageUrl = uploadResult.secure_url;
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload image");
            return;
        }
    }

    if (!imageUrl) {
        toast.error("Please provide an image (URL or Upload)");
        return;
    }

    createReward({ ...formData, main_image: imageUrl }, {
        onSuccess: () => {
            toast.success('Reward created successfully');
            setFormData({
                title: '',
                short_description: '',
                long_description: '',
                required_points: 0,
                quantity: 0,
                main_image: '',
                gallery_images: [],
                target_audience: 'BUSINESS_ONLY',
                start_datetime: new Date().toISOString(),
                end_datetime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            });
            setSelectedFile(null);
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || 'Failed to create reward';
            toast.error(msg);
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Matching Point Reward</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Reward Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Free Consultation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="Brief summary..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              name="long_description"
              value={formData.long_description}
              onChange={handleChange}
              placeholder="Detailed description of the reward..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_points">Points Required</Label>
              <Input
                id="required_points"
                name="required_points"
                type="number"
                min="1"
                value={formData.required_points}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Available</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="target_audience">Target Audience</Label>
             <Select
                value={formData.target_audience}
                onValueChange={handleAudienceChange}
             >
                <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="BUSINESS_ONLY">Business Only</SelectItem>
                    <SelectItem value="PARTICIPANT_ONLY">Participant Only</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
             </Select>
          </div>

          <div className="space-y-2">
             <Label>Reward Image</Label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <p className="text-xs text-gray-500">Upload Image</p>
                    <CloudinaryUpload
                        value={selectedFile ? undefined : formData.main_image}
                        onChange={(file) => setSelectedFile(file)}
                        className="h-32"
                    />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs text-gray-500">Or Image URL</p>
                    <Input
                        id="main_image"
                        name="main_image"
                        value={formData.main_image}
                        onChange={handleChange}
                        placeholder="https://..."
                        disabled={!!selectedFile}
                    />
                 </div>
             </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
