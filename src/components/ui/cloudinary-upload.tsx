'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CloudinaryUploadProps {
  onFileSelect: (file: File | null, previewUrl: string | null) => void;
}

export function CloudinaryUpload({ onFileSelect }: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    } else {
      onFileSelect(null, null);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button 
        type="button" 
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Image
      </Button>
    </>
  );
}
