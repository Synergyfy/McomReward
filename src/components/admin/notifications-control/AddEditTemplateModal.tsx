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
import { NotificationTemplate } from '@/lib/mock-data/notifications';

interface AddEditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: NotificationTemplate; // Optional data for editing
  onSave: (template: NotificationTemplate) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditTemplateModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditTemplateModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<NotificationTemplate['type']>('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [status, setStatus] = useState<NotificationTemplate['status']>('draft');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setSubject(initialData.subject);
      setBody(initialData.body);
      setTargetAudience(initialData.targetAudience);
      setStatus(initialData.status);
    } else {
      // Reset form for new entry
      setName('');
      setType('email');
      setSubject('');
      setBody('');
      setTargetAudience('');
      setStatus('draft');
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Template Name is required.');
    }
    if (!subject.trim()) {
      errors.push('Subject is required.');
    }
    if (!body.trim()) {
      errors.push('Body content is required.');
    }
    if (!targetAudience.trim()) {
      errors.push('Target Audience is required.');
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

    const templateToSave: NotificationTemplate = {
      id: initialData?.id || `new-temp-${Date.now()}`,
      name,
      type,
      subject,
      body,
      targetAudience,
      status,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(templateToSave);
    onClose();
  };

  const dialogTitle = initialData ? `Edit Template: ${initialData.name}` : 'Create New Template';
  const dialogDescription = initialData ? 'Modify the details of this notification template.' : 'Enter the details for a new notification template.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select value={type} onValueChange={(value: NotificationTemplate['type']) => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="in-app">In-App Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="body" className="text-right">Body</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAudience" className="text-right">Target Audience</Label>
            <Input id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., All Users, Sector: Food" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={status} onValueChange={(value: NotificationTemplate['status']) => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}