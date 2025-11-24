"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useBusinessOnboard,
  useGetSectors,
  useGetCategories,
  useGetSubcategories,
} from "@/services/business/hook";
import { CreateBusinessDto } from "@/services/business/types";
import { createBusinessSchema } from "@/lib/validators/signupSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const LoadingSpinner: React.FC = () => (
  <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" />
);

type OnboardingFormInputs = CreateBusinessDto;

export default function BusinessOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    control,
  } = useForm<OnboardingFormInputs>({
    mode: "onTouched",
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      socialMedia: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialMedia",
  });

  const selectedSector = watch("sectorId");
  const selectedCategory = watch("categoryId");

  const { data: sectors } = useGetSectors();
  const { data: categories } = useGetCategories(selectedSector || "");
  const { data: subcategories } = useGetSubcategories(selectedCategory || "");
  const { mutateAsync: onboardBusiness, isPending } = useBusinessOnboard();

  const stepFields: Record<number, (keyof OnboardingFormInputs)[]> = {
    1: ["sectorId", "categoryId", "subCategoryId"],
    2: ["phone", "address", "website", "socialMedia"],
    3: ["referralCapacity"],
  };

  const handleNext = async () => {
    const isValid = await trigger(stepFields[step]);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const goBack = () => setStep((prev) => prev - 1);

  const onSubmit = async (data: OnboardingFormInputs) => {
    try {
      await onboardBusiness(data);
      toast.success("Business account created successfully!");
      router.push("/pricing");
    } catch (error) {
      toast.error("Failed to create business account. Please try again.");
      console.error("Onboarding error:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-orange-600 text-white p-10">
        <div className="max-w-md text-center space-y-5">
          <h1 className="text-3xl font-semibold">
            Create Your Business Profile
          </h1>
          <p className="text-white/90">
            Let’s get your business set up in just a few simple steps to start
            rewarding your customers.
          </p>
          <div className="flex justify-center gap-2 pt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-all ${
                  i <= step ? "bg-white" : "bg-orange-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-lg shadow-xl border-gray-200">
          <CardContent className="py-8 px-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Step 1: Business Details
                    </h2>
                    <div>
                      <Label htmlFor="sectorId">Sector <span className="text-red-500">*</span></Label>
                      <select
                        id="sectorId"
                        {...register("sectorId")}
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mt-1"
                      >
                        <option value="">Select a sector</option>
                        {sectors?.map((sector) => (
                          <option key={sector.id} value={sector.id}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                      {errors.sectorId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sectorId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
                      <select
                        id="categoryId"
                        {...register("categoryId")}
                        disabled={!selectedSector}
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mt-1 disabled:bg-gray-100"
                      >
                        <option value="">Select a category</option>
                        {categories?.data.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="subCategoryId">Subcategory (optional)</Label>
                      <select
                        id="subCategoryId"
                        {...register("subCategoryId")}
                        disabled={!selectedCategory}
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mt-1 disabled:bg-gray-100"
                      >
                        <option value="">Select a subcategory</option>
                        {subcategories?.data.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                      {errors.subCategoryId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.subCategoryId.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Next
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Step 2: Contact Information
                    </h2>
                    <div>
                      <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        {...register("phone")}
                        className="mt-1"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="address">Business Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street, Anytown, USA"
                        {...register("address")}
                        className="mt-1"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="website">Website URL (optional)</Label>
                      <Input
                        id="website"
                        placeholder="https://yourbusiness.com"
                        {...register("website")}
                        className="mt-1"
                      />
                      {errors.website && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.website.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2">Social Media Profiles (optional)</Label>
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <Input
                              placeholder="e.g., Facebook"
                              {...register(`socialMedia.${index}.name`)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="https://facebook.com/yourbusiness"
                              {...register(`socialMedia.${index}.link`)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => append({ name: "", link: "" })}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Social Profile
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Next
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Step 3: Confirmation and Referral
                    </h2>
                    <div>
                      <Label htmlFor="referralCapacity">
                        Referral Capacity <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Set the maximum number of new customers you can accept
                        from referrals each month.
                      </p>
                      <Input
                        id="referralCapacity"
                        type="number"
                        placeholder="e.g., 50"
                        {...register("referralCapacity", {
                          valueAsNumber: true,
                        })}
                        className="mt-1"
                      />
                      {errors.referralCapacity && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.referralCapacity.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-start space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 mt-1 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            className="text-orange-600 hover:underline"
                          >
                            Terms & Conditions
                          </a>
                          .
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPending || !agreedToTerms}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400"
                      >
                        {isPending && <LoadingSpinner />}
                        Submit
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
