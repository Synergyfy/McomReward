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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LearningModule, mockTrainingVideos, mockHelpArticles } from '@/lib/mock-data/resources';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface AddEditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: LearningModule;
  onSave: (module: LearningModule) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditModuleModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditModuleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tierLevel, setTierLevel] = useState('');
  const [selectedResources, setSelectedResources] = useState<(string | { type: 'video' | 'article'; id: string })[]>([]);

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
      setTierLevel(initialData.tierLevel);
      setSelectedResources(initialData.resources);
    } else {
      setTitle('');
      setDescription('');
      setTierLevel('');
      setSelectedResources([]);
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required.');
    if (!tierLevel.trim()) errors.push('Target Tier is required.');
    if (selectedResources.length === 0) errors.push('At least one resource must be selected.');

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

    const moduleToSave: LearningModule = {
      id: initialData?.id || `new-mod-${Date.now()}`,
      title,
      description,
      tierLevel,
      resources: selectedResources,
    };

    onSave(moduleToSave);
    onClose();
  };

  const handleResourceToggle = (type: 'video' | 'article', id: string) => {
    const resource = { type, id };
    setSelectedResources(prev =>
      prev.some(r => typeof r === 'object' && r.id === id)
        ? prev.filter(r => typeof r !== 'object' || r.id !== id)
        : [...prev, resource]
    );
  };

  const dialogTitle = initialData ? `Edit Module: ${initialData.title}` : 'Add New Learning Module';

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
            <Label htmlFor="tierLevel" className="text-right">Target Tier</Label>
            <Select value={tierLevel} onValueChange={setTierLevel}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Trusted">Trusted</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Resources</Label>
            <div className="col-span-3 space-y-4 max-h-60 overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">Videos</h4>
                {mockTrainingVideos.map((video) => (
                  <div key={video.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vid-${video.id}`}
                      checked={selectedResources.some(r => typeof r === 'object' && r.id === video.id)}
                      onCheckedChange={() => handleResourceToggle('video', video.id)}
                    />
                    <label htmlFor={`vid-${video.id}`} className="text-sm">{video.title}</label>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Articles</h4>
                {mockHelpArticles.map((article) => (
                  <div key={article.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`art-${article.id}`}
                      checked={selectedResources.some(r => typeof r === 'object' && r.id === article.id)}
                      onCheckedChange={() => handleResourceToggle('article', article.id)}
                    />
                    <label htmlFor={`art-${article.id}`} className="text-sm">{article.title}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Module</Button>
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
