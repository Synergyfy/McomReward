'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSector } from "@/services/sectors/hook";
import { CreateSectorRequest } from "@/services/sectors/types";
import { useState } from "react";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import Image from "next/image";

interface CreateSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateSectorDialog({ isOpen, onClose }: CreateSectorDialogProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { mutate: createSector, isPending: isCreatingSector } = useCreateSector();

  const handleSubmit = () => {
    const sectorData: CreateSectorRequest = { name, imageUrl };
    createSector(sectorData, {
      onSuccess: () => {
        alert('Sector created successfully!');
        onClose();
      },
      onError: (error) => {
        alert(`Error creating sector: ${error.message}`);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Sector</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right col-span-1">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="image" className="text-right col-span-1">
              Image
            </label>
            <CloudinaryUpload onFileSelect={(file, previewUrl) => setImageUrl(previewUrl || '')} />
            {imageUrl && (
              <div className="col-span-4 mt-4">
                <p className="text-sm font-medium">Uploaded Image:</p>
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
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
        <Button onClick={handleSubmit} disabled={isCreatingSector}>
          {isCreatingSector ? 'Creating...' : 'Create Sector'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
