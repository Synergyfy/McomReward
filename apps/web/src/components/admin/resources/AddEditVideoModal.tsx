'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { useGetTiers } from '@/services/tiers/hook';
import { Checkbox } from '@/components/ui/checkbox';
import { TrainingVideo, CreateTrainingVideoDto } from '@/services/training-videos/types';
import { useCreateTrainingVideo } from '@/services/training-videos/hook';
import { getYouTubeThumbnail } from '@/lib/video-utils';
import { useUploadToCloudinary } from '@/services/upload/hook';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface AddEditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TrainingVideo;
  onSave: (video: TrainingVideo) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditVideoModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditVideoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'business' | 'participant' | ''>('');
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: tiers = [] } = useGetTiers();
  const createVideoMutation = useCreateTrainingVideo();
  const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Feedback Dialog (local to modal for validation errors)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{
    title: string;
    description: React.ReactNode;
    actionText: string;
  }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowLocalFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setVideoUrl(initialData.videoUrl);
      setCoverImage(initialData.coverImage || '');
      setTargetAudience(initialData.targetAudience);
      setSelectedTierIds(initialData.targetTierIds || []);
    } else {
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setCoverImage('');
      setTargetAudience('');
      setSelectedTierIds([]);
    }
  }, [initialData, isOpen]);

  // Auto-extract YouTube thumbnail
  useEffect(() => {
    if (videoUrl && !coverImage) {
        const thumbnail = getYouTubeThumbnail(videoUrl);
        if (thumbnail) {
            setCoverImage(thumbnail);
        }
    }
  }, [videoUrl]);

  // Handle manual file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const { secure_url } = await uploadToCloudinary({ file, folder: 'training-videos' });
        setCoverImage(secure_url);
    } catch (error) {
        console.error('Upload failed:', error);
        handleShowLocalFeedback('Upload Error', 'Failed to upload cover image. Please try again.');
    } finally {
        setIsUploading(false);
    }
  };

  const handleRemoveCoverImage = () => {
      setCoverImage('');
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
      // If there is a video URL, it might auto-repopulate on next render if we are not careful.
      // The useEffect checks `if (!coverImage)`, so clearing it might trigger it again if we don't handle it.
      // However, the user explicitly removed it.
      // For simplicity, if they remove it, we let it be empty.
      // If they want the YouTube one back, they can re-paste the URL or we can add a "Reset to YouTube" button.
      // But actually, the useEffect depends on `videoUrl` change. If `videoUrl` doesn't change, it won't re-run.
  };

  const handleSave = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required.');
    if (!videoUrl.trim()) errors.push('Video URL is required.');
    if (!targetAudience) errors.push('Target Audience is required.');

    if (errors.length > 0) {
      handleShowLocalFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    const payload: CreateTrainingVideoDto = {
        title,
        description,
        video_url: videoUrl,
        cover_image: coverImage,
        target_audience: targetAudience as 'business' | 'participant',
        target_tier_ids: targetAudience === 'business' ? selectedTierIds : [],
    };

    createVideoMutation.mutate(payload, {
        onSuccess: (data) => {
            onSave(data);
            onClose();
            onShowFeedback("Success", `Video "${title}" has been saved successfully.`);
        },
        onError: (error: any) => {
            handleShowLocalFeedback("Error", error?.response?.data?.message || "Failed to save video.");
        }
    });
  };

  const handleTierToggle = (tierId: string) => {
    setSelectedTierIds(prev =>
      prev.includes(tierId)
        ? prev.filter(id => id !== tierId)
        : [...prev, tierId]
    );
  };

  const dialogTitle = initialData ? `Edit Video: ${initialData.title}` : 'Add New Training Video';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>

          {/* Video URL */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoUrl" className="text-right">Video URL</Label>
            <div className="col-span-3">
                <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Paste a YouTube link to automatically generate a thumbnail.
                </p>
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Cover Image</Label>
            <div className="col-span-3 space-y-3">
                {/* Preview */}
                {coverImage ? (
                    <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-gray-100 group">
                        <Image
                            src={coverImage}
                            alt="Cover Preview"
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={handleRemoveCoverImage}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            title="Remove Image"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="aspect-video w-full rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                        <ImagePlus className="h-8 w-8 mb-2" />
                        <span className="text-sm">No cover image</span>
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                            </>
                        ) : (
                            <>
                                <ImagePlus className="mr-2 h-4 w-4" /> Upload Custom Cover
                            </>
                        )}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                        Optional. Overrides YouTube thumbnail.
                    </p>
                </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAudience" className="text-right">Target Audience</Label>
            <Select value={targetAudience} onValueChange={(val) => setTargetAudience(val as 'business' | 'participant')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="business">Business Owners</SelectItem>
                <SelectItem value="participant">Consumers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Tiers (Conditional) */}
          {targetAudience === 'business' && (
             <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Target Tiers</Label>
                <div className="col-span-3 space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                    {tiers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tiers available.</p>
                    ) : (
                        tiers.map((tier) => (
                            <div key={tier.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`tier-${tier.id}`}
                                    checked={selectedTierIds.includes(tier.id)}
                                    onCheckedChange={() => handleTierToggle(tier.id)}
                                />
                                <Label htmlFor={`tier-${tier.id}`} className="cursor-pointer font-normal">
                                    {tier.name}
                                </Label>
                            </div>
                        ))
                    )}
                </div>
                <div className="col-start-2 col-span-3">
                    <p className="text-xs text-muted-foreground">Select specific business tiers (leave empty for all).</p>
                </div>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createVideoMutation.isPending || isUploading}>Cancel</Button>
          <Button onClick={handleSave} disabled={createVideoMutation.isPending || isUploading}>
            {createVideoMutation.isPending ? 'Saving...' : 'Save Video'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </Dialog>
  );
}
