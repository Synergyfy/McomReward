'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface SubCategory {
  id?: string;
  name: string;
  description: string;
}

interface SubCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subCategoryData: SubCategory) => void;
  subCategory?: SubCategory | null;
  categoryName?: string;
}

export default function SubCategoryDialog({ isOpen, onClose, onSubmit, subCategory, categoryName }: SubCategoryDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (subCategory) {
      setName(subCategory.name || '');
      setDescription(subCategory.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [subCategory, isOpen]);

  const handleSubmit = () => {
    onSubmit({
      id: subCategory?.id,
      name,
      description,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subCategory ? 'Edit Sub-Category' : 'Create New Sub-Category'}</DialogTitle>
          {categoryName && <DialogDescription>For category: {categoryName}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Fine Dining"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">Description</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A short description of the sub-category."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {subCategory ? 'Save Changes' : 'Create Sub-Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}