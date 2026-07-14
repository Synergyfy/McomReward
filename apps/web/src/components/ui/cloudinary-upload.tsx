'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageCropper } from './image-cropper';


interface CloudinaryUploadProps {
  value?: string | File | null;
  onChange?: (file: File | null) => void;
  onFileSelect?: (file: File | null, previewUrl: string | null) => void;
  folder?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: number;
}

export function CloudinaryUpload({ value, onChange, onFileSelect, className, disabled, aspectRatio = 1 }: CloudinaryUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('blob:'))) {
      setPreview(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImage(url);
      setIsCropping(true);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', {
      type: 'image/jpeg',
    });
    const url = URL.createObjectURL(croppedBlob);

    setPreview(url);
    setSelectedFile(croppedFile);
    setIsCropping(false);
    setTempImage(null);

    onChange?.(croppedFile);
    onFileSelect?.(croppedFile, url);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    onChange?.(null);
    onFileSelect?.(null, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer overflow-hidden group",
          preview ? "border-primary/50 bg-primary/5" : "border-gray-200 hover:border-primary/30 bg-gray-50/50",
          className
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={disabled}
        />

        {preview ? (
          <div className="relative w-full h-full group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white font-bold text-sm bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Change Image</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              <CheckCircle2 size={12} />
              Ready to Upload
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900">Select Deal Image</p>
              <p className="text-xs text-gray-400 font-medium max-w-[200px]">PNG, JPG or WebP. Max 5MB recommended for faster loading.</p>
            </div>
          </div>
        )}
      </div>

      {isCropping && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          aspect={aspectRatio}
          onCancel={() => {
            setIsCropping(false);
            setTempImage(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      )}
    </>
  );
}

