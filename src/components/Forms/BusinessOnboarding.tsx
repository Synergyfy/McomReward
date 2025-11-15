"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Facebook,
  Instagram,
  Twitter,
  PlusCircle,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusinessOnboard, useGetSectors } from "@/services/business/hook";
import { CreateBusinessDto } from "@/services/business/types";
import { createBusinessSchema } from "@/lib/validators/signupSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const LoadingSpinner: React.FC = () => (
  <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" />
);

const socialOptions = {
  facebook: {
    icon: <Facebook className="h-4 w-4" />,
    placeholder: "e.g., yourbusiness",
  },
  twitter: {
    icon: <Twitter className="h-4 w-4" />,
    placeholder: "e.g., @yourbusiness",
  },
  instagram: {
    icon: <Instagram className="h-4 w-4" />,
    placeholder: "e.g., @yourbusiness",
  },
};

type SocialPlatform = keyof typeof socialOptions;
type OnboardingFormInputs = CreateBusinessDto;

export default function BusinessOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [socialInputs, setSocialInputs] = useState<SocialPlatform[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<OnboardingFormInputs>({
    mode: "onTouched",
    resolver: zodResolver(createBusinessSchema),
  });

  const selectedSector = watch("sectorId");

  const { data: sectors } = useGetSectors();
  const { mutateAsync: onboardBusiness, isPending } = useBusinessOnboard();

  const stepFields: Record<number, (keyof OnboardingFormInputs)[]> = {
    1: ["sectorId", "categoryId", "subCategoryId"],
    2: ["phone", "address", "website"],
    3: ["referralCapacity"],
  };

  const handleNext = async () => {
    const isValid = await trigger(stepFields[step]);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const goBack = () => setStep((prev) => prev - 1);

  const addSocialInput = (platform: SocialPlatform) => {
    if (!socialInputs.includes(platform)) {
      setSocialInputs([...socialInputs, platform]);
    }
  };

  const onSubmit = async (data: OnboardingFormInputs) => {
    try {
      await onboardBusiness(data);
      toast.success("Business account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create business account. Please try again.");
      console.error("Onboarding error:", error);
    }
  };

  const availableSocials = (
    Object.keys(socialOptions) as SocialPlatform[]
  ).filter((s) => !socialInputs.includes(s));

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
                      <Label htmlFor="sectorId">Sector</Label>
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
                      <Label htmlFor="phone">Phone Number</Label>
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
                      <Label htmlFor="address">Business Address</Label>
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
                      <Label htmlFor="website">Website URL</Label>
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
                      <Label className="mb-2">Social Media Profiles</Label>
                      <div className="space-y-3">
                        {socialInputs.map((social) => (
                          <div key={social} className="flex items-center gap-2">
                            <div className="text-gray-500">
                              {socialOptions[social].icon}
                            </div>
                            <Input
                              placeholder={socialOptions[social].placeholder}
                              {...register(`socialMedia.${social}`)}
                              className="flex-1"
                            />
                          </div>
                        ))}
                        {availableSocials.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Social Profile
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {availableSocials.map((social) => (
                                <DropdownMenuItem
                                  key={social}
                                  onSelect={() => addSocialInput(social)}
                                >
                                  {socialOptions[social].icon}
                                  <span className="ml-2 capitalize">
                                    {social}
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                        Referral Capacity
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
