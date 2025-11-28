'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { useCreateDeal } from '@/services/deals/hook';
import { CreateDealDto } from '@/services/deals/types';
import { useGetCategories } from '@/services/business/hook';
import { SectorSelect } from '@/components/SectorSelect';
import { useUploadToCloudinary } from '@/services/upload/hook';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DealForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDealDto>();
  
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState<string>('');

  const { data: categories, isLoading: isLoadingCategories } = useGetCategories(selectedSector);
  const { mutateAsync: createDeal, isPending: isCreatingDeal } = useCreateDeal();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadToCloudinary();

  const currentImageUrl = watch('imageUrl');

  useEffect(() => {
    // This is useful for pre-populating the form in an "edit" scenario
    if (currentImageUrl) {
      setImagePreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setImagePreviewUrl(previewUrl);
    setSelectedFile(file);
    // Clear the field value so react-hook-form knows it's empty if no file is selected
    setValue('imageUrl', '', { shouldValidate: !!file });
  };

  const onSubmit = async (data: CreateDealDto) => {
    let finalImageUrl = data.imageUrl; // Use existing URL if any

    if (selectedFile) {
      try {
        const uploadResult = await uploadImage({ file: selectedFile, folder: 'deals' });
        finalImageUrl = uploadResult.secure_url;
      } catch (error) {
        toast.error('Image upload failed. Please try again.');
        console.error('Cloudinary upload error:', error);
        return; // Stop submission if upload fails
      }
    }

    if (!finalImageUrl) {
      toast.error('Please select an image for the deal.');
      return;
    }

    const finalData = { ...data, imageUrl: finalImageUrl };

    try {
      await createDeal(finalData);
      toast.success('Deal created successfully!');
      router.push('/dashboard/deals');
    } catch (error) {
      toast.error('Failed to create deal. Please try again.');
      console.error('Create deal error:', error);
    }
  };

  const isSaving = isCreatingDeal || isUploadingImage;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Enter a concise title for your deal (e.g., &quot;20% Off
                    Coffee&quot;).
                  </p>
                </TooltipContent>
              </Tooltip>
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea
                    id="description"
                    {...register('description', {
                      required: 'Description is required',
                    })}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Provide a detailed description of what the deal offers.
                  </p>
                </TooltipContent>
              </Tooltip>
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="imageUrl" className="shrink-0">
                Deal Image
              </Label>
              <CloudinaryUpload onFileSelect={handleImageSelect} />
              {errors.imageUrl && (
                <p className="text-red-500 text-sm">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
            {imagePreviewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Image Preview:</p>
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={imagePreviewUrl}
                    alt="Deal Image Preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sectorId">Sector</Label>
                <SectorSelect
                  value={selectedSector}
                  onChange={setSelectedSector}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select
                      onValueChange={value => setValue('categoryId', value)}
                      disabled={!selectedSector || isLoadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          categories?.data?.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the category that best fits your deal.</p>
                  </TooltipContent>
                </Tooltip>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (£)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="value"
                      type="number"
                      placeholder="e.g., 20"
                      {...register('value', {
                        required: 'Value is required',
                        valueAsNumber: true,
                      })}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Enter the monetary value or percentage of the deal (e.g.,
                      &quot;20&quot;, &quot;10.50&quot;).
                    </p>
                  </TooltipContent>
                </Tooltip>
                {errors.value && (
                  <p className="text-red-500 text-sm">
                    {errors.value.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      type="date"
                      id="startDate"
                      {...register('startDate', {
                        required: 'Start date is required',
                      })}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the date when your deal becomes active.</p>
                  </TooltipContent>
                </Tooltip>
                {errors.startDate && (
                  <p className="text-red-500 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      type="date"
                      id="endDate"
                      {...register('endDate', {
                        required: 'End date is required',
                      })}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the date when your deal expires.</p>
                  </TooltipContent>
                </Tooltip>
                {errors.endDate && (
                  <p className="text-red-500 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea
                    id="termsAndConditions"
                    {...register('termsAndConditions')}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Outline any specific terms and conditions for this deal.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Deal'}
              </Button>
            </div>
          </form>
        </CardContent>

        {/* This dialog is no longer used, as we use toast notifications now */}
        {/* Keeping it here in case it's needed for other purposes */}
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success!</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              This is a placeholder success dialog.
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
}
