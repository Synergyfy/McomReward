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
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateMatchingRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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
    start_datetime: new Date().toISOString().split('T')[0], // Default today (YYYY-MM-DD for input)
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

  const handleGalleryUpload = (file: File | null) => {
    if (file) {
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
    const galleryImageUrls: string[] = [...formData.gallery_images]; // Start with existing URLs if any

    try {
        // Upload Main Image if file selected
        if (mainImageFile) {
            const uploadResult = await uploadImage({ file: mainImageFile, folder: 'matching-rewards' });
            mainImageUrl = uploadResult.secure_url;
        }

        // Upload Gallery Images
        if (galleryFiles.length > 0) {
            const uploadPromises = galleryFiles.map(gf => uploadImage({ file: gf.file, folder: 'matching-rewards-gallery' }));
            const results = await Promise.all(uploadPromises);
            results.forEach(res => galleryImageUrls.push(res.secure_url));
        }

    } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload images");
        return;
    }

    if (!mainImageUrl) {
        toast.error("Please provide a main image (URL or Upload)");
        return;
    }

    // Prepare payload ensuring dates are ISO strings if they came from date inputs
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Matching Point Reward</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4">
        <form onSubmit={handleSubmit} className="space-y-6 p-1">

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
                <p className="text-xs text-muted-foreground">Make it catchy and clear.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  placeholder="Brief summary appearing on the card..."
                  required
                />
                <p className="text-xs text-muted-foreground">Visible on the reward card preview.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long_description">Long Description</Label>
                <Textarea
                  id="long_description"
                  name="long_description"
                  value={formData.long_description}
                  onChange={handleChange}
                  placeholder="Detailed description of terms, benefits, and how to claim..."
                  required
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">Full details shown in the modal.</p>
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
              <p className="text-xs text-muted-foreground">Points needed to redeem.</p>
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
              <p className="text-xs text-muted-foreground">Total inventory available.</p>
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
             <p className="text-xs text-muted-foreground">Who can see and redeem this reward?</p>
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
                            onChange={(file) => setMainImageFile(file)}
                            className="h-40 w-full"
                        />
                        <p className="text-xs text-center text-muted-foreground">Primary display image</p>
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
                    {/* Render uploaded previews */}
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

                    {/* Upload Button */}
                    <div className="h-24 w-24 relative">
                        <CloudinaryUpload
                            onChange={(file) => handleGalleryUpload(file)}
                            className="h-full w-full rounded-md border-dashed"
                        />
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground">Additional images for the reward details.</p>
             </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading Media...' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
