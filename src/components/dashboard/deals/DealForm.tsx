'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, addWeeks, addMonths, startOfToday } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Loader2,
  CircleHelp,
  ChevronRight,
  ChevronLeft,
  Tag,
  Banknote,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PremiumCalendar } from '@/components/ui/PremiumCalendar';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from '@/components/ui/switch';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { CloudinaryMultiUpload } from '@/components/ui/CloudinaryMultiUpload';
import { cn } from '@/lib/utils';
import { useCreateDeal, useUpdateDeal } from '@/services/deals/hook';
import { Deal } from '@/services/deals/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGetCategories } from '@/services/sectors/hook';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadToCloudinary } from '@/services/upload/hook';

const dealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  shortDescription: z.string().min(5, 'Short description must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.enum(['DISCOUNT', 'BUNDLE', 'BOGO', 'FLASH_SALE', 'GIFT_CARD', 'SERVICE_PACKAGE', 'INTRO_OFFER', 'SEASONAL', 'EARLY_BIRD', 'REFERRAL_DEAL']),

  dealPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Price must be a positive number'),
  originalPrice: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Price must be a positive number'),
  value: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Value must be a positive number'),
  maxQuantity: z.string().optional(),
  perCustomerLimit: z.string().optional(),

  startDate: z.date(),
  endDate: z.date(),
  location: z.string().optional(),
  redemptionMethod: z.enum(['QR_SCAN', 'VOUCHER_CODE', 'E_CARD', 'APPOINTMENT', 'ONLINE_CHECKOUT']),

  imageUrl: z.any().refine((val) => val instanceof File || (typeof val === 'string' && val.length > 0), 'Main image is required'),
  images: z.array(z.string()).optional().default([]),
  galleryImages: z.array(z.any()).optional().default([]),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  isReward: z.boolean().default(false),
  pointsCost: z.string().optional(),
  pointsEarned: z.string().optional(),
  stampsCost: z.string().optional(),
  stampsEarned: z.string().optional(),
  termsAndConditions: z.string().min(10, 'Terms and conditions must be at least 10 characters'),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormProps {
  deal?: Deal;
  dealId?: string;
}

export default function DealForm({ deal, dealId }: DealFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: createDeal, isPending: isCreating } = useCreateDeal();
  const { mutate: updateDeal, isPending: isUpdating } = useUpdateDeal();
  const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();
  const { data: categoriesData } = useGetCategories();

  const isEditMode = !!deal && !!dealId;

  const categories = React.useMemo(() => {
    return categoriesData || [];
  }, [categoriesData]);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema) as any,
    defaultValues: {
      title: deal?.title || '',
      shortDescription: deal?.shortDescription || '',
      description: deal?.description || '',
      categoryId: deal?.category?.id || '',
      type: (deal?.type as DealFormValues['type']) || 'DISCOUNT',
      dealPrice: deal?.dealPrice?.toString() || '',
      originalPrice: deal?.originalPrice?.toString() || '',
      value: deal?.value?.toString() || '',
      maxQuantity: deal?.maxQuantity?.toString() || '',
      perCustomerLimit: deal?.perCustomerLimit?.toString() || '',
      redemptionMethod: (deal?.redemptionMethod as DealFormValues['redemptionMethod']) || 'QR_SCAN',
      imageUrl: deal?.imageUrl || null,
      images: deal?.images || [],
      visibility: deal?.visibility || 'PUBLIC',
      isReward: deal?.isReward || false,
      pointsCost: deal?.pointsCost?.toString() || '',
      pointsEarned: deal?.pointsEarned?.toString() || '',
      stampsCost: '',
      stampsEarned: '',
      termsAndConditions: deal?.termsAndConditions || '',
      startDate: deal?.startDate ? new Date(deal.startDate) : new Date(),
      endDate: deal?.endDate ? new Date(deal.endDate) : addMonths(new Date(), 1),
      location: deal?.location || '',
      galleryImages: deal?.galleryImages || [],
    },
  });

  const onSubmit = async (data: DealFormValues) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Handle file upload if it's a File object
      if (data.imageUrl instanceof File) {
        setIsUploading(true);
        const uploadResult = await uploadToCloudinary({
          file: data.imageUrl,
          folder: 'deals'
        });
        finalImageUrl = uploadResult.secure_url;
      }

      // Handle gallery images
      const finalGalleryImages: string[] = [];
      if (data.galleryImages && data.galleryImages.length > 0) {
        setIsUploading(true);
        for (const img of data.galleryImages) {
          if (img instanceof File) {
            const uploadResult = await uploadToCloudinary({
              file: img,
              folder: 'deals'
            });
            finalGalleryImages.push(uploadResult.secure_url);
          } else if (typeof img === 'string') {
            finalGalleryImages.push(img);
          }
        }
      }

      const { stampsCost, stampsEarned, ...cleanedData } = data;

      const payload = {
        ...cleanedData,
        imageUrl: finalImageUrl as string,
        galleryImages: finalGalleryImages,
        value: parseFloat(data.value),
        dealPrice: parseFloat(data.dealPrice),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
        maxQuantity: data.maxQuantity ? parseInt(data.maxQuantity) : undefined,
        perCustomerLimit: data.perCustomerLimit ? parseInt(data.perCustomerLimit) : undefined,
        pointsCost: data.pointsCost ? parseInt(data.pointsCost) : undefined,
        pointsEarned: data.pointsEarned ? parseInt(data.pointsEarned) : undefined,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };

      if (isEditMode && dealId) {
        updateDeal({ id: dealId, ...payload }, {
          onSuccess: () => {
            toast.success('Deal updated successfully', {
              description: 'Your changes have been saved.'
            });
            router.push('/dashboard/deals');
          },
          onError: (error) => {
            toast.error('Failed to update deal');
            console.error(error);
          },
          onSettled: () => {
            setIsUploading(false);
          }
        });
      } else {
        createDeal(payload, {
          onSuccess: () => {
            toast.success('Deal created successfully', {
              description: 'Your deal has been submitted for review.'
            });
            router.push('/dashboard/deals');
          },
          onError: (error) => {
            toast.error('Failed to create deal');
            console.error(error);
          },
          onSettled: () => {
            setIsUploading(false);
          }
        });
      }

    } catch (error) {
      setIsUploading(false);
      toast.error('Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof DealFormValues)[] = [];
    if (step === 1) fieldsToValidate = ['title', 'shortDescription', 'description', 'categoryId', 'type'];
    if (step === 2) fieldsToValidate = ['dealPrice', 'value'];
    if (step === 3) fieldsToValidate = ['startDate', 'endDate', 'redemptionMethod'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(prev => prev + 1);
    else toast.error("Please fix the errors before proceeding.");
  };

  const prevStep = () => setStep(prev => prev - 1);

  const FormFieldHelp = ({ content }: { content: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
          <CircleHelp className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[250px] p-3 text-xs leading-relaxed">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  const DatePickerShortcuts = ({ onSelect, selectedDate }: { onSelect: (date: Date) => void, selectedDate?: Date }) => {
    const today = startOfToday();
    const shortcuts = [
      { label: 'Today', value: today },
      { label: 'Tomorrow', value: addDays(today, 1) },
      { label: '+1 Week', value: addWeeks(today, 1) },
      { label: '+1 Month', value: addMonths(today, 1) },
    ];

    return (
      <div className="flex flex-wrap gap-2 p-4 border-b bg-gray-50/50">
        {shortcuts.map((shortcut) => {
          const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(shortcut.value, 'yyyy-MM-dd');
          return (
            <Button
              key={shortcut.label}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full px-4 h-8 text-xs font-medium transition-all",
                !isSelected && "bg-white hover:bg-primary/5 hover:border-primary/30"
              )}
              onClick={() => onSelect(shortcut.value)}
            >
              {shortcut.label}
            </Button>
          );
        })}
      </div>
    );
  };

  const DatePickerHeader = ({ date, label }: { date?: Date, label: string }) => (
    <div className="p-4 bg-primary text-primary-foreground">
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">
        {date ? format(date, "EEEE, MMM do") : "Select a date"}
      </p>
    </div>
  );

  const stepLabels = [
    { icon: Info, label: 'Identity' },
    { icon: Banknote, label: 'Economics' },
    { icon: Zap, label: 'Logistics' },
    { icon: ImageIcon, label: 'Finish' }
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Modern Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto bg-white/50 backdrop-blur p-4 rounded-3xl border border-gray-100 shadow-sm">
            {stepLabels.map((s, i) => (
              <div key={i} className="flex items-center group">
                <div className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-1 bg-transparent transition-all duration-500",
                  step === i + 1 ? "scale-110" : ""
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                    step === i + 1 ? "bg-primary border-primary text-white shadow-primary/20" :
                      step > i + 1 ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                        "bg-white border-gray-50 text-gray-300"
                  )}>
                    {step > i + 1 ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    step === i + 1 ? "text-primary" : "text-gray-400"
                  )}>{s.label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="w-12 h-0.5 mx-2 bg-gray-50 rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full bg-primary transition-all duration-700",
                      step > i + 1 ? "w-full" : "w-0"
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="relative h-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50"
              >
                <div className="space-y-2 border-b border-gray-50 pb-6 mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Core <span className="text-primary">Identity</span></h2>
                  <p className="text-gray-400">What is your deal called and what makes it special?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wide text-gray-700">Deal Title</Label>
                      <FormFieldHelp content="A catchy title often leads to 3x more rewards. Keep it punchy!" />
                    </div>
                    <Input id="title" {...form.register('title')} placeholder="e.g. 50% Off Weekend Special" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all text-base" />
                    {form.formState.errors.title && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.title.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="type" className="text-sm font-bold uppercase tracking-wide text-gray-700">Deal Category</Label>
                      <FormFieldHelp content="Select the main sector and category your deal belongs to." />
                    </div>
                    <Controller
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-14 rounded-2xl border-gray-100 px-5 text-base focus:ring-primary/10 transition-all">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id} className="rounded-xl">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.categoryId && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.categoryId.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="type" className="text-sm font-bold uppercase tracking-wide text-gray-700">Deal Type</Label>
                      <FormFieldHelp content="What kind of offer is this? This affects how it appears in search." />
                    </div>
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-14 rounded-2xl border-gray-100 px-5 text-base">
                            <SelectValue placeholder="Deal Type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            <SelectItem value="DISCOUNT" className="rounded-xl">Discount</SelectItem>
                            <SelectItem value="BOGO" className="rounded-xl">BOGO (Buy 1 Get 1)</SelectItem>
                            <SelectItem value="BUNDLE" className="rounded-xl">Bundle Pack</SelectItem>
                            <SelectItem value="FLASH_SALE" className="rounded-xl">Flash Sale</SelectItem>
                            <SelectItem value="SEASONAL" className="rounded-xl">Seasonal Offer</SelectItem>
                            <SelectItem value="INTRO_OFFER" className="rounded-xl">Introductory Offer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="shortDescription" className="text-sm font-bold uppercase tracking-wide text-gray-700">Punchy Summary</Label>
                      <FormFieldHelp content="A short 1-sentence summary that appears on cards." />
                    </div>
                    <Input id="shortDescription" {...form.register('shortDescription')} placeholder="e.g. Save big this weekend" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all text-base" />
                    {form.formState.errors.shortDescription && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.shortDescription.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wide text-gray-700">Full Details</Label>
                    <FormFieldHelp content="Provide detailed information about what this deal includes and why it's great." />
                  </div>
                  <Textarea id="description" {...form.register('description')} placeholder="Describe the deal in detail..." className="min-h-[140px] rounded-3xl border-gray-100 p-5 focus:ring-primary/10 transition-all text-base resize-none" />
                  {form.formState.errors.description && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.description.message}</p>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50"
              >
                <div className="space-y-2 border-b border-gray-50 pb-6 mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Economic <span className="text-primary">Value</span></h2>
                  <p className="text-gray-400">How much does it cost and what is its worth?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="dealPrice" className="text-sm font-bold uppercase tracking-wide text-gray-700">Deal Price (£)</Label>
                      <FormFieldHelp content="The amount the customer will actually pay." />
                    </div>
                    <Input id="dealPrice" type="number" step="0.01" {...form.register('dealPrice')} placeholder="0.00" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all text-lg font-bold" />
                    {form.formState.errors.dealPrice && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.dealPrice.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="originalPrice" className="text-sm font-bold uppercase tracking-wide text-gray-700">Original Price (£)</Label>
                      <FormFieldHelp content="The price before the deal. Used to show savings percentages." />
                    </div>
                    <Input id="originalPrice" type="number" step="0.01" {...form.register('originalPrice')} placeholder="0.00" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all text-lg font-semibold text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="value" className="text-sm font-bold uppercase tracking-wide text-gray-700">Total Value (£)</Label>
                      <FormFieldHelp content="The total monetary value of the benefits/package." />
                    </div>
                    <Input id="value" type="number" step="0.01" {...form.register('value')} placeholder="0.00" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all text-lg font-bold text-primary" />
                    {form.formState.errors.value && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.value.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="maxQuantity" className="text-sm font-bold uppercase tracking-wide text-gray-700">Stock Limit</Label>
                      <FormFieldHelp content="Total number of deals available for redemption. Leave empty for unlimited." />
                    </div>
                    <Input id="maxQuantity" type="number" {...form.register('maxQuantity')} placeholder="No limit" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all font-semibold" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="perCustomerLimit" className="text-sm font-bold uppercase tracking-wide text-gray-700">Customer Limit</Label>
                      <FormFieldHelp content="Maximum renewals per single customer." />
                    </div>
                    <Input id="perCustomerLimit" type="number" {...form.register('perCustomerLimit')} placeholder="No limit" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all font-semibold" />
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-none">Deal Preview Insight</h4>
                    <p className="text-sm text-gray-500 max-w-md">Customers will see this as a <span className="font-bold text-primary italic">Deal worth £{form.watch('value') || '0.00'}</span> for only <span className="font-bold text-primary uppercase">£{form.watch('dealPrice') || '0.00'}</span>.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50"
              >
                <div className="space-y-2 border-b border-gray-50 pb-6 mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Timeline & <span className="text-primary">Reach</span></h2>
                  <p className="text-gray-400">When and where is this deal accessible?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-bold uppercase tracking-wide text-gray-700">Active From</Label>
                      <FormFieldHelp content="When should this deal become active and visible to customers?" />
                    </div>
                    <Controller
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-14 pl-5 text-left font-bold border-gray-100 hover:border-primary hover:bg-primary/5 transition-all rounded-2xl text-base shadow-sm ring-0 focus-visible:ring-0",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50 text-primary" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[360px] p-0 overflow-hidden rounded-3xl shadow-2xl border-none ring-1 ring-black/5" align="start">
                            <DatePickerHeader date={field.value} label="Starting On" />
                            <DatePickerShortcuts onSelect={field.onChange} selectedDate={field.value} />
                            <div className="bg-white">
                              <PremiumCalendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < startOfToday()} initialFocus />
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {form.formState.errors.startDate && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.startDate.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-bold uppercase tracking-wide text-gray-700">Valid Until</Label>
                      <FormFieldHelp content="When should this deal expire and no longer be available?" />
                    </div>
                    <Controller
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-14 pl-5 text-left font-bold border-gray-100 hover:border-primary hover:bg-primary/5 transition-all rounded-2xl text-base shadow-sm ring-0 focus-visible:ring-0",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50 text-primary" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[360px] p-0 overflow-hidden rounded-3xl shadow-2xl border-none ring-1 ring-black/5" align="start">
                            <DatePickerHeader date={field.value} label="Ending On" />
                            <DatePickerShortcuts onSelect={field.onChange} selectedDate={field.value} />
                            <div className="bg-white">
                              <PremiumCalendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues('startDate') || startOfToday())} initialFocus />
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {form.formState.errors.endDate && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.endDate.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="location" className="text-sm font-bold uppercase tracking-wide text-gray-700">Target Location</Label>
                      <FormFieldHelp content="Where can customers find this deal? Useful for local SEO." />
                    </div>
                    <Input id="location" {...form.register('location')} placeholder="e.g. London, SE15" className="h-14 rounded-2xl border-gray-100 px-5 focus:ring-primary/10 transition-all text-base font-semibold" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="redemptionMethod" className="text-sm font-bold uppercase tracking-wide text-gray-700">Redemption Method</Label>
                      <FormFieldHelp content="How will customers unlock/redeem this offer?" />
                    </div>
                    <Controller
                      control={form.control}
                      name="redemptionMethod"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-14 rounded-2xl border-gray-100 px-5 text-base font-semibold">
                            <SelectValue placeholder="Redemption Method" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            <SelectItem value="QR_SCAN" className="rounded-xl">QR Scan In-Store</SelectItem>
                            <SelectItem value="VOUCHER_CODE" className="rounded-xl">Voucher Code</SelectItem>
                            <SelectItem value="E_CARD" className="rounded-xl">E-Reward Card</SelectItem>
                            <SelectItem value="APPOINTMENT" className="rounded-xl">Booking/Appointment</SelectItem>
                            <SelectItem value="ONLINE_CHECKOUT" className="rounded-xl">Online Checkout</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50"
              >
                <div className="space-y-2 border-b border-gray-50 pb-6 mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Finalize <span className="text-primary">Media</span></h2>
                  <p className="text-gray-400">Add the visual spark and loyalty rules.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold uppercase tracking-wide text-gray-700">Main Cover Image</Label>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase">Required</span>
                      </div>
                      <Controller
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <CloudinaryUpload
                            value={field.value}
                            onChange={field.onChange}
                            folder="deals"
                            aspectRatio={16 / 9}
                            className="h-64 rounded-3xl border-2 border-dashed border-gray-100 hover:border-primary/30 transition-all bg-gray-50/50"
                          />
                        )}
                      />
                      {form.formState.errors.imageUrl && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.imageUrl.message as string}</p>}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold uppercase tracking-wide text-gray-700">Gallery Images</Label>
                        <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase">Optional</span>
                      </div>
                      <Controller
                        control={form.control}
                        name="galleryImages"
                        render={({ field }) => (
                          <CloudinaryMultiUpload
                            value={field.value}
                            onChange={field.onChange}
                            folder="deals"
                            className="bg-gray-50/50 p-4 rounded-3xl border-2 border-dashed border-gray-100"
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
                      <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-gray-900 leading-none">Public</Label>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Visibility</p>
                        </div>
                        <Controller
                          control={form.control}
                          name="visibility"
                          render={({ field }) => (
                            <Switch
                              checked={field.value === 'PUBLIC'}
                              onCheckedChange={(checked) => field.onChange(checked ? 'PUBLIC' : 'PRIVATE')}
                              className="data-[state=checked]:bg-primary"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-gray-900 leading-none">Reward</Label>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Redeemable</p>
                        </div>
                        <Controller
                          control={form.control}
                          name="isReward"
                          render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {form.watch('isReward') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-6 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Points Required</Label>
                              <FormFieldHelp content="How many points does a customer need to redeem this deal?" />
                            </div>
                            <Input type="number" {...form.register('pointsCost')} placeholder="0" className="h-12 rounded-xl border-gray-100 shadow-sm" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Points Earned</Label>
                              <FormFieldHelp content="How many points will a customer earn when they claim this deal?" />
                            </div>
                            <Input type="number" {...form.register('pointsEarned')} placeholder="0" className="h-12 rounded-xl border-gray-100 shadow-sm" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Stamps Required</Label>
                              <FormFieldHelp content="How many digital stamps does a customer need to redeem this deal?" />
                            </div>
                            <Input type="number" {...form.register('stampsCost')} placeholder="0" className="h-12 rounded-xl border-gray-100 shadow-sm" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Stamps Earned</Label>
                              <FormFieldHelp content="How many digital stamps will a customer earn when they claim this deal?" />
                            </div>
                            <Input type="number" {...form.register('stampsEarned')} placeholder="0" className="h-12 rounded-xl border-gray-100 shadow-sm" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="termsAndConditions" className="text-sm font-bold uppercase tracking-wide text-gray-700">Terms & Rules</Label>
                        <FormFieldHelp content="List any specific rules, restrictions, or requirements for this deal." />
                      </div>
                      <Textarea id="termsAndConditions" {...form.register('termsAndConditions')} placeholder="e.g. Valid until stocks last, non-transferable..." className="h-40 rounded-[32px] border-gray-100 p-5 focus:ring-primary/10 transition-all text-sm resize-none" />
                      {form.formState.errors.termsAndConditions && <p className="text-xs font-semibold text-rose-500 mt-1 pl-1 flex items-center gap-1"><Info size={12} />{form.formState.errors.termsAndConditions.message}</p>}
                    </div>

                    <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50 flex items-start gap-4">
                      <div className="p-3 bg-emerald-500 rounded-2xl shadow-emerald-200 shadow-lg text-white">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-gray-900 mb-1 leading-none">Ready for Launch</h4>
                        <p className="text-sm text-emerald-700/80 leading-snug">Everything looks great! Review all steps before submitting for final internal approval.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Footer Controls */}
          <div className="mt-12 flex items-center justify-between bg-white/30 backdrop-blur-md p-6 rounded-[40px] border border-white shadow-xl">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className={cn(
                "h-14 px-8 rounded-2xl border-gray-200 font-bold hover:bg-gray-50 transition-all group gap-2",
                step === 1 && "invisible"
              )}
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {stepLabels.map((_, i) => (
                <div key={i} className={cn(
                  "h-1.5 transition-all duration-300 rounded-full",
                  step === i + 1 ? "w-8 bg-primary" : "w-1.5 bg-gray-200"
                )} />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-14 px-10 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all group"
              >
                Next Step
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isCreating || isUpdating || isUploading}
                className="h-14 px-12 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
              >
                {isCreating || isUpdating || isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>{isUploading ? 'Uploading...' : isEditMode ? 'Saving...' : 'Launching...'}</span>
                  </div>
                ) : (
                  <>{isEditMode ? 'Update Deal' : 'Launch Deal'} <Zap size={20} className="fill-white" /></>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
