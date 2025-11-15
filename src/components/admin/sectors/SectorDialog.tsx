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

interface Sector {
  id?: string;
  name: string;
  imageUrl: string;
}

interface SectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectorData: Sector) => void;
  sector?: Sector | null; // Pass sector data for editing
}

export default function SectorDialog({ isOpen, onClose, onSubmit, sector }: SectorDialogProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (sector) {
      setName(sector.name || '');
      setImageUrl(sector.imageUrl || '');
      setImageFile(null); // Clear file when editing existing
    } else {
      // Reset for new sector
      setName('');
      setImageUrl('');
      setImageFile(null);
    }
  }, [sector, isOpen]);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/sectors', {
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

    let finalImageUrl = imageUrl;

    // If we have a new file (blob URL), upload it to Cloudinary
    if (imageFile && imageUrl.startsWith('blob:')) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload image');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (!imageUrl.trim()) {
      toast.error('Image is required');
      return;
    }

    onSubmit({
      id: sector?.id, // Include id if editing
      name: name.trim(),
      imageUrl: finalImageUrl,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{sector ? 'Edit Sector' : 'Create New Sector'}</DialogTitle>
          <DialogDescription>
            Sectors are the highest-level organization for your businesses.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Fashion"
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
                      alt="Uploaded sector image"
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
          <Button onClick={handleSubmit} disabled={!name.trim() || !imageUrl.trim() || isUploading}>
            {isUploading ? 'Uploading...' : (sector ? 'Save Changes' : 'Create Sector')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}