"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBusinessOnboard, useGetSectors } from "@/services/business/hook";
import { CreateBusinessDto } from "@/services/business/types";
import { createBusinessSchema} from "@/lib/validators/signupSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Small inline loading spinner used in the submit button to avoid an unresolved identifier.
 */
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 mr-2 inline-block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);


const DEMO_SECTORS = [
  { id: 1, name: "Hospitality" },
  { id: 2, name: "Service" },
];

const DEMO_SUBCATEGORIES: Record<number, { id: string; name: string }[]> = {
  1: [
    { id: "11", name: "Hotels" },
    { id: "12", name: "Restaurants" },
    { id: "13", name: "Resorts" },
  ],
  2: [
    { id: "21", name: "Salons" },
    { id: "22", name: "Consulting" },
    { id: "23", name: "Cleaning" },
  ],
};

export default function BusinessOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { data: sectors } = useGetSectors();
  const {mutateAsync: onboardBusiness, isPending} = useBusinessOnboard();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  
  } = useForm<CreateBusinessDto>(
    {
      mode: "onSubmit",
      resolver: zodResolver(createBusinessSchema),
    }
  );
 const stepFields: Record<
  number,
  ("sectorId" | "subsectorId" | "phone" | "address" | "website" | "socialMedia" | "referralCapacity" | "socialMedia.facebook" | "socialMedia.twitter" | "socialMedia.instagram")[]
> = {
  1: ["sectorId", "subsectorId", "phone", "address"],
  2: ["website", "socialMedia.facebook", "socialMedia.twitter", "socialMedia.instagram"],
  3: ["referralCapacity"],
};


const handleNext = async () => {
  const valid = await trigger(stepFields[step]);
  if (valid) setStep((prev) => prev + 1);
};
  const onSubmit = async (data: CreateBusinessDto) => {
    if (step < 3) {
      setStep((step) => step + 1);
      console.log("Proceeding to step", step + 1);
    } else {
      try {
        await onboardBusiness(data);
        toast.success("Business onboarded successfully!");
        router.push("/dashboard");
      } catch (error) {
        toast.error(`Failed to onboard business try again.`);
        console.error("Onboarding error:", error);
      }

      console.log("Form submitted:", data);
    }
  };

  const goBack = () => setStep(step - 1);

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-y-hidden">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-orange-600 text-white p-10">
        <div className="max-w-md text-center space-y-5">
          <h1 className="text-3xl font-semibold">Welcome to Business Onboarding</h1>
          <p className="text-white">
            Let’s get your business set up in just a few simple steps.
          </p>
          <div className="flex justify-center gap-2 pt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-10 rounded-full transition-all ${
                  i <= step ? "bg-white" : "bg-orange-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-lg shadow-md border-none">
          <CardContent className="py-8 px-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Step 1: Business Details
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Label className="mb-2">Sector</Label>
                      <select
                        {...register("sectorId")}
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select sector</option>
                        {DEMO_SECTORS?.map((sector) => (
                          <option key={sector.id} value={sector.id}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                      {errors.sectorId && (
                        <p className="text-red-500 text-sm">
                          {errors.sectorId.message as unknown as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2">Subsector</Label>
                      <select
                        {...register("subsectorId")}
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select subsector</option>
                        {DEMO_SUBCATEGORIES[Number(watch("sectorId"))]?.map((subsector) => (
                          <option key={subsector.id} value={subsector.id}>
                            {subsector.name}
                          </option>
                        ))}
                      </select>
                      {errors.subsectorId && (
                        <p className="text-red-500 text-sm">
                          {errors.subsectorId.message as unknown as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2">Address</Label>
                      <Input
                        type="text"
                        placeholder="123 Business St."
                        {...register("address")}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm">
                          {errors.address.message as unknown as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-2">Phone</Label>
                      <Input
                        placeholder="+234 801 234 5678"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">
                          {errors.phone.message as unknown as string}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" onClick={handleNext} className="bg-orange-600 hover:bg-orange-700">
                        Next
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Step 2: Online Presence
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Label>Website</Label>
                      <Input
                        placeholder="https://yourbusiness.com"
                        {...register("website")}
                      />
                    </div>

                    <div>
                      <Label>Facebook</Label>
                      <Input
                        placeholder="facebook.com/yourprofile"
                        {...register("socialMedia.facebook")}
                      />
                      {errors.socialMedia?.facebook && (
                        <p className="text-red-500 text-sm">
                          {errors.socialMedia.facebook.message as unknown as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Twitter</Label>
                      <Input
                        placeholder="twitter.com/yourprofile"
                        {...register("socialMedia.twitter")}
                      />
                      {errors.socialMedia?.twitter && (
                        <p className="text-red-500 text-sm">
                          {errors.socialMedia.twitter.message as unknown as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Instagram</Label>
                      <Input
                        placeholder="instagram.com/yourprofile"
                        {...register("socialMedia.instagram")}
                      />
                      {errors.socialMedia?.instagram && (
                        <p className="text-red-500 text-sm">
                          {errors.socialMedia.instagram.message as unknown as string}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={goBack} type="button">
                        Back
                      </Button>
                      <Button type="button" onClick={handleNext} className="bg-orange-600 hover:bg-orange-700">
                        Next
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Step 3: Referral & Confirmation
                  </h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Label>Referral Capacity</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 10"

                        {...register("referralCapacity",  { valueAsNumber: true })}
                      />
                      {errors.referralCapacity && (
                        <p className="text-red-500 text-sm">
                          {errors.referralCapacity.message as unknown as string}
                        </p>
                      )}
                    </div>

                    <p className="text-gray-500 text-sm">
                      Review your information before submitting.
                    </p>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={goBack} type="button">
                        Back
                      </Button>
                      <Button disabled={isPending} type="submit" className="bg-orange-600 hover:bg-orange-700">
                        {isPending ? <LoadingSpinner /> : "Submit"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
