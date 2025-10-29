'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { Deal } from '@/lib/mock-data/deals';

// Omitting id, businessId, businessName, and status for the form
type DealFormData = Omit<Deal, 'id' | 'businessId' | 'businessName' | 'status'>;

export default function DealForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DealFormData>();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const currentImageUrl = watch("imageUrl");

  useEffect(() => {
    if (currentImageUrl) {
      setImagePreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setImagePreviewUrl(previewUrl);
    setValue("imageUrl", previewUrl || '', { shouldValidate: true });
  };

  const onSubmit = (data: DealFormData) => {
    console.log(data);
    // Here you would typically handle form submission, e.g., API call
    setIsSuccessModalOpen(true);
  };

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
                  <Input id="title" {...register("title", { required: "Title is required" })} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter a concise title for your deal (e.g., &quot;20% Off Coffee&quot;).</p>
                </TooltipContent>
              </Tooltip>
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea id="description" {...register("description", { required: "Description is required" })} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Provide a detailed description of what the deal offers.</p>
                </TooltipContent>
              </Tooltip>
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="imageUrl" className="shrink-0">Deal Image</Label>
              <CloudinaryUpload
                onFileSelect={handleImageSelect}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
            </div>
            {imagePreviewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium">Image Preview:</p>
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-200">
                  <Image src={imagePreviewUrl} alt="Deal Image Preview" layout="fill" objectFit="cover" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="type">Deal Type</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select onValueChange={(value) => setValue("type", value as Deal['type'], { shouldValidate: true })}>
                          <SelectTrigger id="type">
                              <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Discount">Discount</SelectItem>
                              <SelectItem value="Package">Package</SelectItem>
                              <SelectItem value="Gig Reward">Gig Reward</SelectItem>
                              <SelectItem value="Special Offer">Special Offer</SelectItem>
                          </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose the category that best describes your deal.</p>
                    </TooltipContent>
                  </Tooltip>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (£)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input id="value" placeholder="e.g., 20, 10.50" {...register("value", { required: "Value is required" })} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the monetary value or percentage of the deal (e.g., &quot;20&quot;, &quot;10.50&quot;).</p>
                  </TooltipContent>
                </Tooltip>
                {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input type="date" id="startDate" {...register("startDate", { required: "Start date is required" })} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the date when your deal becomes active.</p>
                  </TooltipContent>
                </Tooltip>
                {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input type="date" id="endDate" {...register("endDate", { required: "End date is required" })} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the date when your deal expires.</p>
                  </TooltipContent>
                </Tooltip>
                {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select onValueChange={(value) => setValue("audience", value as Deal['audience'], { shouldValidate: true })}>
                      <SelectTrigger id="audience">
                          <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Local">Local</SelectItem>
                          <SelectItem value="National">National</SelectItem>
                      </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose whether your deal is for local or national customers.</p>
                </TooltipContent>
              </Tooltip>
              {errors.audience && <p className="text-red-500 text-sm">{errors.audience.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select onValueChange={(value) => setValue("category", value as Deal['category'], { shouldValidate: true })}>
                      <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                      </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the category that best fits your deal.</p>
                </TooltipContent>
              </Tooltip>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Textarea id="terms" {...register("terms")} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Outline any specific terms and conditions for this deal.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Deal</Button>
            </div>
          </form>
        </CardContent>

        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deal Created Successfully!</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Your new deal has been successfully created and is ready for review.
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={() => setIsSuccessModalOpen(false)}>
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
