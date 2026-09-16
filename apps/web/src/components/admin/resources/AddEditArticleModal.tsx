'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCenterArticle } from '@/services/help-center-articles/types';
import { useCreateHelpCenterArticle, useUpdateHelpCenterArticle } from '@/services/help-center-articles/hook';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface AddEditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HelpCenterArticle;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditArticleModal({
  isOpen,
  onClose,
  initialData,
  onShowFeedback,
}: AddEditArticleModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'participant' | 'business' | 'all' | ''>('');

  const createArticleMutation = useCreateHelpCenterArticle();
  const updateArticleMutation = useUpdateHelpCenterArticle();
  const isPending = createArticleMutation.isPending || updateArticleMutation.isPending;

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
      setContent(initialData.content);
      setCategory(initialData.category);
      setShortDescription(initialData.short_description);
      setTargetAudience(initialData.target_audience);
    } else {
      setTitle('');
      setContent('');
      setCategory('');
      setShortDescription('');
      setTargetAudience('');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required.');
    if (!content.trim()) errors.push('Content is required.');
    if (!category.trim()) errors.push('Category is required.');
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

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      short_description: shortDescription.trim(),
      target_audience: targetAudience as 'participant' | 'business' | 'all',
    };

    const onSuccess = () => {
      onClose();
      onShowFeedback("Success", `Article "${title}" has been saved successfully.`);
    };

    const onError = (error: any) => {
      handleShowLocalFeedback("Error", error?.response?.data?.message || "Failed to save article.");
    };

    if (initialData) {
      updateArticleMutation.mutate({ id: initialData.id, ...payload }, { onSuccess, onError });
    } else {
      createArticleMutation.mutate(payload, { onSuccess, onError });
    }
  };

  const dialogTitle = initialData ? `Edit Article: ${initialData.title}` : 'Add New Help Article';

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
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Getting Started" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAudience" className="text-right">Target Audience</Label>
            <Select value={targetAudience || undefined} onValueChange={(val) => setTargetAudience(val as 'participant' | 'business' | 'all')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="business">Business Owners</SelectItem>
                <SelectItem value="participant">Consumers</SelectItem>
                <SelectItem value="all">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shortDescription" className="text-right">Short Description</Label>
            <Textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="col-span-3" rows={2} />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" rows={10} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Article'}</Button>
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