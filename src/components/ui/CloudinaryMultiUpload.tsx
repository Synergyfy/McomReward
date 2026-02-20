'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageCropper } from './image-cropper';

interface CloudinaryMultiUploadProps {
    value?: string[];
    onChange?: (files: (File | string)[]) => void;
    folder?: string;
    className?: string;
    disabled?: boolean;
    aspectRatio?: number;
}

export function CloudinaryMultiUpload({ value = [], onChange, className, disabled, aspectRatio = 1 }: CloudinaryMultiUploadProps) {
    const [items, setItems] = useState<(File | string)[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [currentCropIndex, setCurrentCropIndex] = useState<number>(-1);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value && value.length > 0) {
            setItems(value);
            setPreviews(value);
        }
    }, [value]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setPendingFiles(files);
            setCurrentCropIndex(0);
            setTempImage(URL.createObjectURL(files[0]));
        }
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const currentFile = pendingFiles[currentCropIndex];
        const croppedFile = new File([croppedBlob], currentFile.name, {
            type: 'image/jpeg',
        });
        const url = URL.createObjectURL(croppedBlob);

        const newItems = [...items, croppedFile];
        const newPreviews = [...previews, url];

        setItems(newItems);
        setPreviews(newPreviews);
        onChange?.(newItems);

        // Process next file if any
        if (currentCropIndex < pendingFiles.length - 1) {
            const nextIndex = currentCropIndex + 1;
            setCurrentCropIndex(nextIndex);
            setTempImage(URL.createObjectURL(pendingFiles[nextIndex]));
        } else {
            setPendingFiles([]);
            setCurrentCropIndex(-1);
            setTempImage(null);
        }
    };

    const removeItem = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newItems = items.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setItems(newItems);
        setPreviews(newPreviews);
        onChange?.(newItems);
    };

    return (
        <>
            <div className={cn("space-y-4", className)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm bg-gray-50"
                        >
                            <img
                                src={preview}
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={(e) => removeItem(index, e)}
                                    className="p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {typeof items[index] !== 'string' && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                                    <CheckCircle2 size={10} />
                                    New
                                </div>
                            )}
                        </div>
                    ))}

                    {!disabled && (
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 group-hover:scale-110 transition-transform text-gray-400 group-hover:text-primary">
                                <Plus size={24} />
                            </div>
                            <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-primary">Add More</p>
                            <input
                                type="file"
                                ref={inputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                                multiple
                            />
                        </div>
                    )}
                </div>
            </div>

            {currentCropIndex !== -1 && tempImage && (
                <ImageCropper
                    image={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        // Skip current image and move to next or finish
                        if (currentCropIndex < pendingFiles.length - 1) {
                            const nextIndex = currentCropIndex + 1;
                            setCurrentCropIndex(nextIndex);
                            setTempImage(URL.createObjectURL(pendingFiles[nextIndex]));
                        } else {
                            setPendingFiles([]);
                            setCurrentCropIndex(-1);
                            setTempImage(null);
                        }
                    }}
                    aspect={aspectRatio}
                />
            )}
        </>
    );
}

