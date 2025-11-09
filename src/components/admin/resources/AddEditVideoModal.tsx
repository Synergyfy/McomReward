'use client';

import React, { useState, useEffect } from 'react';
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
import { TrainingVideo } from '@/lib/mock-data/resources';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

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
  const [duration, setDuration] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  // State for Feedback Dialog (local to modal for validation errors)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState({
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
      setDuration(initialData.duration);
      setTargetAudience(initialData.targetAudience);
    } else {
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setDuration('');
      setTargetAudience('');
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required.');
    if (!videoUrl.trim()) errors.push('Video URL is required.');
    if (!duration.trim()) errors.push('Duration is required.');
    if (!targetAudience.trim()) errors.push('Target Audience is required.');

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

    const videoToSave: TrainingVideo = {
      id: initialData?.id || `new-vid-${Date.now()}`,
      title,
      description,
      videoUrl,
      duration,
      targetAudience,
    };

    onSave(videoToSave);
    onClose();
  };

  const dialogTitle = initialData ? `Edit Video: ${initialData.title}` : 'Add New Training Video';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoUrl" className="text-right">Video URL</Label>
            <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration</Label>
            <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 5:30" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAudience" className="text-right">Target Audience</Label>
            <Input id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., All Businesses" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Video</Button>
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
