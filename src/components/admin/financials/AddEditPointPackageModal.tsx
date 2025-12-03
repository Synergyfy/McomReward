'use client';

import React, { useEffect, ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreatePointPackage, useUpdatePointPackage, useGetTiers } from '@/services/financials';
import { PointPackage, PointPackageCreateInput } from '@/services/financials/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AxiosError } from 'axios';

const pointPackageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  points: z.string()
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && Number.isInteger(val) && val >= 1, {
      message: 'Points must be a positive integer',
    }),
  price: z.string()
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && val >= 0, {
      message: 'Price cannot be negative',
    }),
  currency: z.string().optional(),
  tier_ids: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

type PointPackageOutput = z.infer<typeof pointPackageSchema>;

interface FormInput extends Omit<PointPackageOutput, 'points' | 'price'> {
  points: string;
  price: string;
}

interface AddEditPointPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PointPackage;
  onSave: (pkg: PointPackage) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export const AddEditPointPackageModal: React.FC<AddEditPointPackageModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  onShowFeedback,
}) => {
  const createMutation = useCreatePointPackage();
  const updateMutation = useUpdatePointPackage();
  const { data: tiers, isLoading: isLoadingTiers } = useGetTiers();

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, PointPackageOutput>({
    resolver: zodResolver(pointPackageSchema),
    defaultValues: {
      name: '',
      description: '',
      points: '0', // Default as string
      price: '0',  // Default as string
      currency: 'GBP',
      tier_ids: [],
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
          points: String(initialData.points), // Convert to string for form input
          price: String(initialData.price),   // Convert to string for form input
          currency: initialData.currency,
          tier_ids: initialData.tiers.map(t => t.id),
          is_active: initialData.is_active,
        });
      }
      else {
        reset({
          name: '',
          description: '',
          points: '100', // Default as string
          price: '10',   // Default as string
          currency: 'GBP',
          tier_ids: [],
          is_active: true,
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: PointPackageOutput) => {
    try {
      let savedPackage: PointPackage;
      const payload: PointPackageCreateInput = {
        ...data,
        tier_ids: data.tier_ids || [],
      }

      if (initialData) {
        savedPackage = await updateMutation.mutateAsync({ id: initialData.id, ...payload });
      } else {
        savedPackage = await createMutation.mutateAsync(payload);
      }
      onSave(savedPackage);
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      onShowFeedback('Error', errorMessage, 'OK');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Create'} Point Package</DialogTitle>
          <DialogDescription>
            Configure the details of the point package for businesses to purchase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" {...register('points')} />
              {errors.points && <p className="text-red-500 text-sm">{errors.points.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (£)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register('currency')} disabled />
              {errors.currency && <p className="text-red-500 text-sm">{errors.currency.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Applicable Tiers</Label>
            <p className="text-sm text-muted-foreground">Select which subscription tiers can purchase this package. If none are selected, it's available to all.</p>
            {isLoadingTiers ? <p>Loading tiers...</p> : (
              <Controller
                name="tier_ids"
                control={control}
                render={({ field }) => (
                  <ScrollArea className="h-32 w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {tiers?.map((tier) => (
                        <div key={tier.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={tier.id}
                            checked={field.value?.includes(tier.id)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value || []), tier.id]
                                : (field.value || []).filter((id) => id !== tier.id);
                              field.onChange(newValue);
                            }}
                          />
                          <Label htmlFor={tier.id} className="font-normal">{tier.name}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="is_active">Package is Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};