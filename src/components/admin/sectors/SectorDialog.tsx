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
import { ChromePicker } from 'react-color';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';

// Note: You might need to install react-color: npm install react-color @types/react-color

interface Sector {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface SectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectorData: Sector) => void;
  sector?: Sector | null; // Pass sector data for editing
}

export default function SectorDialog({ isOpen, onClose, onSubmit, sector }: SectorDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    if (sector) {
      setName(sector.name || '');
      setDescription(sector.description || '');
      setIcon(sector.icon || '');
      setColor(sector.color || '#ffffff');
    } else {
      // Reset for new sector
      setName('');
      setDescription('');
      setIcon('');
      setColor('#ffffff');
    }
  }, [sector, isOpen]);

  const handleSubmit = () => {
    onSubmit({
      id: sector?.id, // Include id if editing
      name,
      description,
      icon,
      color,
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
              placeholder="e.g., Food & Dining"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">Description</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A short description of the sector."
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
                      alt="Uploaded sector icon"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-right pt-2">Color</label>
            <div className="col-span-3">
              <ChromePicker
                color={color}
                onChangeComplete={(color) => setColor(color.hex)}
                disableAlpha={true}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {sector ? 'Save Changes' : 'Create Sector'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}