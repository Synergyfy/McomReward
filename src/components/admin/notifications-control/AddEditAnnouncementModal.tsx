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
import { Announcement } from '@/lib/mock-data/notifications';
import DateTimePicker from '@/components/dashboard/campaigns/datePicker';

interface AddEditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Announcement; // Optional data for editing
  onSave: (announcement: Announcement) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditAnnouncementModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<Announcement['status']>('draft');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setTargetAudience(initialData.targetAudience);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setStatus(initialData.status);
    } else {
      // Reset form for new entry
      setTitle('');
      setContent('');
      setTargetAudience('');
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus('draft');
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('Title is required.');
    }
    if (!content.trim()) {
      errors.push('Content is required.');
    }
    if (!targetAudience.trim()) {
      errors.push('Target Audience is required.');
    }
    if (!startDate) {
      errors.push('Start Date is required.');
    }
    if (!endDate) {
      errors.push('End Date is required.');
    }
    if (startDate && endDate && startDate > endDate) {
      errors.push('Start Date cannot be after End Date.');
    }

    if (errors.length > 0) {
      onShowFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    const announcementToSave: Announcement = {
      id: initialData?.id || `new-ann-${Date.now()}`,
      title,
      content,
      targetAudience,
      startDate: startDate!,
      endDate: endDate!,
      status,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(announcementToSave);
    onClose();
  };

  const dialogTitle = initialData ? `Edit Announcement: ${initialData.title}` : 'Create New Announcement';
  const dialogDescription = initialData ? 'Modify the details of this announcement.' : 'Enter the details for a new announcement.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAudience" className="text-right">Target Audience</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="All Users">All Users</SelectItem>
                <SelectItem value="All Businesses">All Businesses</SelectItem>
                <SelectItem value="All Consumers">All Consumers</SelectItem>
                <SelectItem value="Sector: Food & Dining">Sector: Food & Dining</SelectItem>
                <SelectItem value="Tier: Gold">Tier: Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Start Date</Label>
            <div className="col-span-3">
              <DateTimePicker date={startDate} setDate={setStartDate} />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">End Date</Label>
            <div className="col-span-3">
              <DateTimePicker date={endDate} setDate={setEndDate} />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={status} onValueChange={(value: Announcement['status']) => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Announcement</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
