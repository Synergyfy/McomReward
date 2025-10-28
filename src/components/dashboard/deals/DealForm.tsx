'use client';

import React from 'react';
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
import { Deal } from '@/lib/mock-data/deals';

// Omitting id, businessId, businessName, and status for the form
type DealFormData = Omit<Deal, 'id' | 'businessId' | 'businessName' | 'status'>;

export default function DealForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<DealFormData>();

  const onSubmit = (data: DealFormData) => {
    console.log(data);
    // Here you would typically handle form submission, e.g., API call
    alert('Deal created successfully! (See console for data)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title</Label>
            <Input id="title" {...register("title", { required: "Title is required" })} />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description", { required: "Description is required" })} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="type">Deal Type</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value (e.g., 20%, $10 Off)</Label>
              <Input id="value" {...register("value", { required: "Value is required" })} />
              {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" {...register("startDate", { required: "Start date is required" })} />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" id="endDate" {...register("endDate", { required: "End date is required" })} />
              {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Select onValueChange={() => {}}>
                <SelectTrigger id="audience">
                    <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea id="terms" {...register("terms")} />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Deal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
