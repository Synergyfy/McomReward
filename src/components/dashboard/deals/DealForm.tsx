'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCreateDeal } from '@/services/deals/hook';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGetSectors } from '@/services/sectors/hook';

const dealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  value: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Value must be a positive number'),
  startDate: z.date(),
  endDate: z.date(),
  termsAndConditions: z.string().min(10, 'Terms and conditions must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
});

type DealFormValues = z.infer<typeof dealSchema>;

export default function DealForm() {
  const router = useRouter();
  const { mutate: createDeal, isPending } = useCreateDeal();
  const { data: sectors } = useGetSectors();

  // Flatten categories from sectors
  const categories = React.useMemo(() => {
    return sectors?.flatMap(sector => sector.categories) || [];
  }, [sectors]);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      description: '',
      value: '',
      termsAndConditions: '',
      categoryId: '',
    },
  });

  const onSubmit = (data: DealFormValues) => {
    createDeal(
      {
        ...data,
        value: parseFloat(data.value),
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Deal created successfully');
          router.push('/dashboard/deals'); // Adjust redirect as needed
        },
        onError: (error) => {
          toast.error('Failed to create deal');
          console.error(error);
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} placeholder="Deal Title" />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register('description')} placeholder="Deal Description" />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

       <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.categoryId && (
          <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
        )}
      </div>

       <div className="space-y-2">
        <Label htmlFor="value">Value ($)</Label>
        <Input id="value" type="number" step="0.01" {...form.register('value')} placeholder="0.00" />
        {form.formState.errors.value && (
          <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Controller
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
           {form.formState.errors.startDate && (
            <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Controller
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
           {form.formState.errors.endDate && (
            <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
        <Textarea id="termsAndConditions" {...form.register('termsAndConditions')} placeholder="Terms..." className="h-32" />
         {form.formState.errors.termsAndConditions && (
          <p className="text-sm text-red-500">{form.formState.errors.termsAndConditions.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Deal
      </Button>
    </form>
  );
}
