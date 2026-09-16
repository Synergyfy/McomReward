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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { TrainingGuide } from '@/services/training-guides/types';
import { useCreateTrainingGuide, useUpdateTrainingGuide } from '@/services/training-guides/hook';
import { useGetTrainingVideos } from '@/services/training-videos/hook';
import { useGetHelpCenterArticles } from '@/services/help-center-articles/hook';
import { useGetTiers } from '@/services/tiers/hook';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface AddEditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TrainingGuide;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditModuleModal({
  isOpen,
  onClose,
  initialData,
  onShowFeedback,
}: AddEditModuleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetTierId, setTargetTierId] = useState('');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);

  const { data: tiers = [] } = useGetTiers();
  const { data: videosData } = useGetTrainingVideos({ page: 1, limit: 100 });
  const { data: articlesData } = useGetHelpCenterArticles({ page: 1, limit: 100 });

  const createGuideMutation = useCreateTrainingGuide();
  const updateGuideMutation = useUpdateTrainingGuide();
  const isPending = createGuideMutation.isPending || updateGuideMutation.isPending;

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
      setTargetTierId(initialData.target_tier_id || '');
      setSelectedVideoIds((initialData.videos ?? []).map((v) => v.id));
      setSelectedArticleIds((initialData.articles ?? []).map((a) => a.id));
    } else {
      setTitle('');
      setDescription('');
      setTargetTierId('');
      setSelectedVideoIds([]);
      setSelectedArticleIds([]);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required.');
    if (!targetTierId) errors.push('Target Tier is required.');
    if (selectedVideoIds.length === 0 && selectedArticleIds.length === 0) {
      errors.push('At least one resource must be selected.');
    }

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
      description: description.trim(),
      target_tier_id: targetTierId,
      video_ids: selectedVideoIds,
      article_ids: selectedArticleIds,
    };

    const onSuccess = () => {
      onClose();
      onShowFeedback("Success", `Module "${title}" has been saved successfully.`);
    };

    const onError = (error: any) => {
      handleShowLocalFeedback("Error", error?.response?.data?.message || "Failed to save module.");
    };

    if (initialData) {
      updateGuideMutation.mutate({ id: initialData.id, ...payload }, { onSuccess, onError });
    } else {
      createGuideMutation.mutate(payload, { onSuccess, onError });
    }
  };

  const handleResourceToggle = (
    id: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(current.includes(id) ? current.filter((r) => r !== id) : [...current, id]);
  };

  const dialogTitle = initialData ? `Edit Module: ${initialData.title}` : 'Add New Learning Module';

  const videos = videosData?.items ?? [];
  const articles = articlesData?.data ?? [];

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
            <Label htmlFor="targetTier" className="text-right">Target Tier</Label>
            <Select value={targetTierId || undefined} onValueChange={setTargetTierId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Resources</Label>
            <div className="col-span-3 space-y-4 max-h-60 overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">Videos</h4>
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vid-${video.id}`}
                      checked={selectedVideoIds.includes(video.id)}
                      onCheckedChange={() => handleResourceToggle(video.id, selectedVideoIds, setSelectedVideoIds)}
                    />
                    <label htmlFor={`vid-${video.id}`} className="text-sm">{video.title}</label>
                  </div>
                ))}
                {videos.length === 0 && <p className="text-sm text-muted-foreground">No training videos available.</p>}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Articles</h4>
                {articles.map((article) => (
                  <div key={article.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`art-${article.id}`}
                      checked={selectedArticleIds.includes(article.id)}
                      onCheckedChange={() => handleResourceToggle(article.id, selectedArticleIds, setSelectedArticleIds)}
                    />
                    <label htmlFor={`art-${article.id}`} className="text-sm">{article.title}</label>
                  </div>
                ))}
                {articles.length === 0 && <p className="text-sm text-muted-foreground">No help center articles available.</p>}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Module'}
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