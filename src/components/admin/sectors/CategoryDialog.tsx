'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import toast from 'react-hot-toast';

interface Category {
  id?: string;
  name: string;
  imageUrl: string;
  sectorId?: string;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: Category) => void;
  category?: Category | null;
  sectorName?: string;
  sectorId?: string;
}

export default function CategoryDialog({ isOpen, onClose, onSubmit, category, sectorName, sectorId }: CategoryDialogProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setImageUrl(category.imageUrl || '');
      setImageFile(null); // Clear file when editing existing
    } else {
      setName('');
      setImageUrl('');
      setImageFile(null);
    }
  }, [category, isOpen]);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/categories', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!sectorId) {
      toast.error('Sector selection is required');
      return;
    }

    let finalImageUrl = imageUrl;

    // If we have a new file (blob URL), upload it to Cloudinary
    if (imageFile && imageUrl.startsWith('blob:')) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to upload image');
        } else {
          toast.error('Failed to upload image');
        }
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (!imageUrl.trim()) {
      toast.error('Image is required');
      return;
    }

    onSubmit({
      id: category?.id,
      name: name.trim(),
      imageUrl: finalImageUrl,
      sectorId,
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
              placeholder="e.g., Clothing"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="imageUrl" className="text-right">Image</label>
            <div className="col-span-3">
              <CloudinaryUpload
                onFileSelect={(file, previewUrl) => {
                  setImageFile(file);
                  setImageUrl(previewUrl || '');
                }}
                disabled={isUploading}
              />
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Image Preview:</p>
                  <div className="relative h-24 w-24 rounded-md overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Uploaded category image"
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
          <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !imageUrl.trim() || !sectorId || isUploading}>
            {isUploading ? 'Uploading...' : (category ? 'Save Changes' : 'Create Category')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}