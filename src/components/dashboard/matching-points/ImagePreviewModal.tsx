'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export default function ImagePreviewModal({ isOpen, onClose, imageUrl }: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none flex justify-center items-center h-full max-h-screen">
        <VisuallyHidden>
            <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>
        <div className="relative">
            <button
                onClick={onClose}
                className="absolute -top-10 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-all"
            >
                <X size={24} />
            </button>
            <img
                src={imageUrl}
                alt="Preview"
                className="max-h-[85vh] max-w-full rounded-md shadow-2xl object-contain"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
