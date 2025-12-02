'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Deal, CreateDealDto } from '@/services/deals/types';
import { initialSectors } from '@/lib/mock-data/sectors';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AddEditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Deal;
  onSave: (deal: CreateDealDto) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditDealModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}: AddEditDealModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Flatten categories for the dropdown
  const allCategories = useMemo(() => {
    return initialSectors.flatMap(sector => sector.categories);
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setValue(initialData.value);
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : null);
      setEndDate(initialData.endDate ? new Date(initialData.endDate) : null);
      setTermsAndConditions(initialData.termsAndConditions);
      setCategoryId(initialData.category?.id || '');
    } else {
      // Reset form for new entry
      setTitle('');
      setDescription('');
      setValue(0);
      setStartDate(null);
      setEndDate(null);
      setTermsAndConditions('');
      setCategoryId('');
    }
  }, [initialData, isOpen]); // Added isOpen to reset when opening fresh if needed

  const handleSave = () => {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('Title is required.');
    }
    if (!description.trim()) {
      errors.push('Description is required.');
    }
    if (value < 0) {
      errors.push('Value cannot be negative.');
    }
    if (!categoryId.trim()) {
      errors.push('Category is required.');
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
    if (!termsAndConditions.trim()) {
      errors.push('Terms and Conditions are required.');
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

    const dealToSave: CreateDealDto = {
      title,
      description,
      value,
      categoryId,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      termsAndConditions,
      // imageUrl: '' // Optional, handle if needed
    };

    onSave(dealToSave);
  };

  const dialogTitle = initialData ? `Edit Deal: ${initialData.title}` : 'Create New Deal';
  const dialogDescription = initialData ? 'Modify the details of this deal.' : 'Enter the details for a new deal.';

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
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">Value</Label>
            <Input id="value" type="number" value={value} onChange={(e) => setValue(parseFloat(e.target.value) || 0)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {allCategories.length > 0 ? (
                    allCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))
                ) : (
                    // Fallback if no categories are found in mock data
                    <SelectItem value="default">Default Category</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Start Date</Label>
            <div className="col-span-3">
                <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                dateFormat="Pp"
                showTimeSelect
                className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">End Date</Label>
            <div className="col-span-3">
                <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                dateFormat="Pp"
                showTimeSelect
                className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="terms" className="text-right">Terms & Conditions</Label>
            <Textarea id="terms" value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Deal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
