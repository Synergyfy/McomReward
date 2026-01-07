'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloudinaryUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

export function CloudinaryUpload({ value, onChange, className, disabled }: CloudinaryUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync preview with value if value is a string URL (for edits - though this task is create)
  useEffect(() => {
    if (typeof value === 'string' && value.startsWith('http')) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file); // Pass the File object up
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
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
  );
}
