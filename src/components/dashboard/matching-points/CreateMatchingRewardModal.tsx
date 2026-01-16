'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateMatchingReward } from '@/services/matching-points/hook';
import { CreateMatchingRewardDto, TargetAudience } from '@/services/matching-points/types';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { useUploadToCloudinary } from '@/services/upload/hook';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateMatchingRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE_MB = 10; // Direct upload can handle larger files

export default function CreateMatchingRewardModal({ isOpen, onClose, onSuccess }: CreateMatchingRewardModalProps) {
  const { mutate: createReward, isPending: isCreating } = useCreateMatchingReward();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadToCloudinary();

  // State for files
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<{ file: File; preview: string }[]>([]);

  const [formData, setFormData] = useState<CreateMatchingRewardDto>({
    title: '',
    short_description: '',
    long_description: '',
    required_points: 0,
    quantity: 0,
    main_image: '',
    gallery_images: [],
    target_audience: 'BUSINESS_ONLY',
    start_datetime: new Date().toISOString().split('T')[0],
    end_datetime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
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

  const validateFile = (file: File) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max ${MAX_FILE_SIZE_MB}MB.`);
          return false;
      }
      return true;
  };

  const handleMainImageSelect = (file: File | null) => {
      if (file && !validateFile(file)) return;
      setMainImageFile(file);
  };

  const handleGalleryUpload = (file: File | null) => {
    if (file) {
      if (!validateFile(file)) return;
      const preview = URL.createObjectURL(file);
      setGalleryFiles(prev => [...prev, { file, preview }]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let mainImageUrl = formData.main_image;
    const galleryImageUrls: string[] = [...formData.gallery_images];

    try {
        // Upload Main Image
        if (mainImageFile) {
            const result = await uploadImage({ file: mainImageFile, folder: 'matching-rewards' });
            mainImageUrl = result.secure_url;
        }

        // Upload Gallery Images
        if (galleryFiles.length > 0) {
            const uploadPromises = galleryFiles.map(gf => uploadImage({ file: gf.file, folder: 'matching-rewards-gallery' }));
            const results = await Promise.all(uploadPromises);
            results.forEach(res => galleryImageUrls.push(res.secure_url));
        }

    } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload images. Check your connection.");
        return;
    }

    if (!mainImageUrl) {
        toast.error("Please provide a main image (URL or Upload)");
        return;
    }

    // Prepare payload
    const payload: CreateMatchingRewardDto = {
        ...formData,
        main_image: mainImageUrl,
        gallery_images: galleryImageUrls,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
    };

    createReward(payload, {
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
                start_datetime: new Date().toISOString().split('T')[0],
                end_datetime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            });
            setMainImageFile(null);
            setGalleryFiles([]);
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create Matching Point Reward</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                    Title
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild><span className="text-gray-400 cursor-help">(?)</span></TooltipTrigger>
                            <TooltipContent>The main name of the reward displayed to users.</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Free Marketing Consultation"
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
                  placeholder="Detailed description..."
                  required
                  className="min-h-[100px]"
                />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="required_points">Points Cost</Label>
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
              <Label htmlFor="quantity">Quantity</Label>
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

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="start_datetime">Start Date</Label>
                <Input
                    id="start_datetime"
                    name="start_datetime"
                    type="date"
                    value={formData.start_datetime}
                    onChange={handleChange}
                    required
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="end_datetime">End Date</Label>
                <Input
                    id="end_datetime"
                    name="end_datetime"
                    type="date"
                    value={formData.end_datetime}
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

          {/* Image Section */}
          <div className="space-y-4 border-t pt-4">
             <h3 className="font-semibold text-sm">Media</h3>

             {/* Main Image */}
             <div className="space-y-2">
                 <Label>Main Image</Label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <CloudinaryUpload
                            value={mainImageFile ? undefined : formData.main_image}
                            onChange={(file) => handleMainImageSelect(file)}
                            className="h-40 w-full"
                        />
                     </div>
                     <div className="space-y-2 flex flex-col justify-end">
                        <Label htmlFor="main_image_url" className="text-xs">Or URL</Label>
                        <Input
                            id="main_image_url"
                            name="main_image"
                            value={formData.main_image}
                            onChange={handleChange}
                            placeholder="https://..."
                            disabled={!!mainImageFile}
                        />
                     </div>
                 </div>
             </div>

             {/* Gallery Images */}
             <div className="space-y-2">
                 <Label>Gallery Images</Label>
                 <div className="flex flex-wrap gap-4">
                    {galleryFiles.map((file, index) => (
                        <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden border">
                            <img src={file.preview} alt="gallery" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <div className="h-24 w-24 relative">
                        <CloudinaryUpload
                            onChange={(file) => handleGalleryUpload(file)}
                            className="h-full w-full rounded-md border-dashed"
                        />
                    </div>
                 </div>
             </div>
          </div>

          <DialogFooter className="pt-4 sticky bottom-0 bg-white z-10 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading Images...' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
