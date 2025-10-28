'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Deal } from '@/lib/mock-data/deals';

// Omitting id, businessId, businessName, and status for the form
type DealFormData = Omit<Deal, 'id' | 'businessId' | 'businessName' | 'status'>;

export default function DealForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<DealFormData>();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
                  <p>Enter a concise title for your deal (e.g., "20% Off Coffee").</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="type">Deal Type</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select onValueChange={() => {}}>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (£)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input id="value" placeholder="e.g., 20, 10.50" {...register("value", { required: "Value is required" })} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the monetary value or percentage of the deal (e.g., "20", "10.50").</p>
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
                  <Select onValueChange={() => {}}>
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
