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
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';

interface Category {
  id?: string;
  name: string;
  description: string;
  icon: string;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: Category) => void;
  category?: Category | null;
  sectorName?: string;
}

export default function CategoryDialog({ isOpen, onClose, onSubmit, category, sectorName }: CategoryDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setIcon(category.icon || '');
    } else {
      setName('');
      setDescription('');
      setIcon('');
    }
  }, [category, isOpen]);

  const handleSubmit = () => {
    onSubmit({
      id: category?.id,
      name,
      description,
      icon,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          {sectorName && <DialogDescription>For sector: {sectorName}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Restaurants"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">Description</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A short description of the category."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="icon" className="text-right">Icon</label>
            <div className="col-span-3">
              <CloudinaryUpload onFileSelect={(file, previewUrl) => setIcon(previewUrl || '')} />
              {icon && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Image Preview:</p>
                  <div className="relative h-24 w-24 rounded-md overflow-hidden">
                    <Image
                      src={icon}
                      alt="Uploaded category icon"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {category ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}