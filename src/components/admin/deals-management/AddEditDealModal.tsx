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
import { Switch } from '@/components/ui/switch';
import { Deal, DealCategory } from '@/lib/mock-data/deals'; // Import DealCategory
import { initialSectors } from '@/lib/mock-data/sectors';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
// import { FeedbackDialog } from '@/components/ui/feedback-dialog'; // Remove FeedbackDialog import

interface AddEditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Deal; // Optional data for editing
  onSave: (deal: Deal) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void; // New prop
}

export function AddEditDealModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback, // Destructure new prop
}: AddEditDealModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<Deal['status']>('draft');
  const [sectorId, setSectorId] = useState('');
  const [visibilityRules, setVisibilityRules] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submittedByBusinessId, setSubmittedByBusinessId] = useState('');
  const [businessName, setBusinessName] = useState(''); // New
  const [value, setValue] = useState(''); // New
  const [startDate, setStartDate] = useState<Date | null>(null); // New
  const [endDate, setEndDate] = useState<Date | null>(null); // New
  const [terms, setTerms] = useState(''); // New
  const [category, setCategory] = useState<DealCategory>('Food & Drink'); // New

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setStatus(initialData.status);
      setSectorId(initialData.sectorId);
      setVisibilityRules(initialData.visibilityRules || '');
      setIsFeatured(initialData.isFeatured);
      setSubmittedByBusinessId(initialData.submittedByBusinessId || '');
      setBusinessName(initialData.businessName || ''); // New
      setValue(initialData.value || ''); // New
      setStartDate(initialData.startDate || null); // New
      setEndDate(initialData.endDate || null); // New
      setTerms(initialData.terms || ''); // New
      setCategory(initialData.category || 'Food & Drink'); // New
    } else {
      // Reset form for new entry
      setTitle('');
      setDescription('');
      setPrice(0);
      setStatus('draft');
      setSectorId('');
      setVisibilityRules('');
      setIsFeatured(false);
      setSubmittedByBusinessId('');
      setBusinessName(''); // New
      setValue(''); // New
      setStartDate(null); // New
      setEndDate(null); // New
      setTerms(''); // New
      setCategory('Food & Drink'); // New
    }
  }, [initialData]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('Title is required.');
    }
    if (!description.trim()) {
      errors.push('Description is required.');
    }
    if (price < 0) {
      errors.push('Price cannot be negative.');
    }
    if (!sectorId.trim()) {
      errors.push('Sector is required.');
    }
    if (!businessName.trim()) {
      errors.push('Business Name is required.');
    }
    if (!value.trim()) {
      errors.push('Value is required.');
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
    if (!terms.trim()) {
      errors.push('Terms and Conditions are required.');
    }
    // Category is a select, so it should always have a value if initialized correctly.

    if (errors.length > 0) {
      onShowFeedback( // Use prop for feedback
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    const dealToSave: Deal = {
      id: initialData?.id || `new-deal-${Date.now()}`,
      title,
      description,
      price,
      status,
      sectorId,
      visibilityRules,
      isFeatured,
      submittedByBusinessId: submittedByBusinessId || undefined,
      businessName, // New
      value, // New
      startDate: startDate!, // New, asserted as non-null after validation
      endDate: endDate!, // New, asserted as non-null after validation
      terms, // New
      category, // New
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(dealToSave);
    onClose(); // Close the modal after saving
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
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={status} onValueChange={(value: Deal['status']) => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sector" className="text-right">Sector</Label>
            <Select value={sectorId} onValueChange={setSectorId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {initialSectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibilityRules" className="text-right">Visibility Rules</Label>
            <Textarea id="visibilityRules" value={visibilityRules} onChange={(e) => setVisibilityRules(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isFeatured" className="text-right">Featured Deal</Label>
            <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="submittedBy" className="text-right">Submitted By (Business ID)</Label>
            <Input id="submittedBy" value={submittedByBusinessId} onChange={(e) => setSubmittedByBusinessId(e.target.value)} placeholder="Optional" className="col-span-3" />
          </div>
          {/* New fields */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="businessName" className="text-right">Business Name</Label>
            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">Value</Label>
            <Input id="value" value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Start Date</Label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              dateFormat="Pp"
              showTimeSelect
              className="col-span-3 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">End Date</Label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              dateFormat="Pp"
              showTimeSelect
              className="col-span-3 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="terms" className="text-right">Terms</Label>
            <Textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={category} onValueChange={(value: DealCategory) => setCategory(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Deal</Button>
        </DialogFooter>
      </DialogContent>

      {/* Removed FeedbackDialog from here */}
    </Dialog>
  );
}