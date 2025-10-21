// src/components/forms/MultiStepWizard/index.tsx
"use client";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  businessInfoSchema,
  staffSchema,
  rewardSchema,
  onboardingFullSchema,
} from "@/lib/validators/signupSchemas";
import useFormPersistence from "@/hooks/useFormPersistence";
import BusinessInfoStep from "./steps/BusinessOnboarding";
import StaffSetupStep from "./steps/StaffSetup";
import RewardsSetupStep from "./steps/RewardsSetup";
import ReviewSubmitStep from "./steps/ReviewSubmit";
import { useBusinessOnboard } from "@/services/business/hook"; // your existing hook
import { z } from "zod";


type FormValues = z.infer<typeof onboardingFullSchema>;

export default function MultiStepWizard() {
  // use the full schema for final validation, step-level validation handled manually
  const methods = useForm<FormValues>({
    resolver: zodResolver(onboardingFullSchema),
    mode: "onBlur",
    defaultValues: {
      businessName: "",
      businessSector: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      businessWebsite: "",
      businessLogo: null,
      staffName: "",
      staffEmail: "",
      staffPassword: "",
      staffAvatar: null,
      rewardTitle: "",
      pointsRequired: undefined ,
      cashValue: undefined,
      rewardDescription: "",
      rewardImage: null,
    },
  });

  // autosave draft to localStorage
  useFormPersistence("business-onboarding-draft", methods);

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const mutation = useBusinessOnboard();

  // next with step-specific validation
  const next = async () => {
    // trigger only fields relevant to step
    console.log("Validating step", step);
    let ok = false;
    if (step === 1) {
      console.log("Validating business info fields");
      ok = await methods.trigger(Object.keys(businessInfoSchema.shape) as [keyof FormValues]);
      if (!ok) {
  console.log("Step 1 failed fields:", methods.formState.errors);
  return;
}
    } else if (step === 2) {
      console.log("Validating staff setup fields");
      // staff is optional; validate only if filled
      const data = methods.getValues();
      if (data.staffName || data.staffEmail || data.staffAvatar || data.staffPassword) {
        ok = await methods.trigger(Object.keys(staffSchema.shape) as any);
      } else ok = true;
    } else if (step === 3) {
      console.log("Validating rewards setup fields");
      // reward is optional but if partially filled validate
      const data = methods.getValues();
      if (data.rewardTitle || data.pointsRequired || data.cashValue || data.rewardDescription || data.rewardImage) {
        ok = await methods.trigger(Object.keys(rewardSchema.shape) as any);
      } else ok = true;
    } else {
      ok = true;
    }
    console.log("Step", step, "validation result:", ok);

    if (!ok) return;
    setStep((s) => Math.min(totalSteps, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync({
        businessName: values.businessName,
        businessEmail: values.businessEmail,
        // add other required fields to your API payload
        businessPhone: values.businessPhone ? values.businessPhone : " ",
        businessAddress: values.businessAddress ? values.businessAddress : " ",
        businessWebsite: values.businessWebsite ? values.businessWebsite : " ",
        businessSector: values.businessSector ? values.businessSector : " ",
        // optionally include staff/rewards - adapt to your API shape
        staffName: values.staffName ? values.staffName : " ",
        staffEmail: values.staffEmail ? values.staffEmail : " ",
        staffPassword: values.staffPassword ? values.staffPassword : " ",
        staffAvatar: values.staffAvatar ? values.staffAvatar : null,
        rewardTitle: values.rewardTitle ? values.rewardTitle : " ",
        pointsRequired: values.pointsRequired ? values.pointsRequired : 0,
        cashValue: values.cashValue ? values.cashValue : 0,
        rewardDescription: values.rewardDescription ? values.rewardDescription : " ",
        rewardImage: values.rewardImage ? values.rewardImage : null,
      });

      // clear draft
      try { localStorage.removeItem("business-signup-draft"); } catch {}
      // redirect or show success toast
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      // show UI error — you can integrate toast here
      alert("Failed to create business. See console for details.");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create Business (Step {step}/{totalSteps})</h2>
          <div className="text-sm text-gray-500">Progress: {(step / totalSteps) * 100}%</div>
        </div>

        {step === 1 && <BusinessInfoStep />}
        {step === 2 && <StaffSetupStep />}
        {step === 3 && <RewardsSetupStep />}
        {step === 4 && <ReviewSubmitStep />}

        <div className="flex justify-between mt-6">
          <button type="button" disabled={step === 1} onClick={back} className="px-4 py-2 border rounded">
            Back
          </button>

          {step < totalSteps ? (
            <button type="button" onClick={next} className="px-4 py-2 bg-orange-500 text-white rounded">
              Next
            </button>
          ) : (
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-emerald-600 text-white rounded">
              {mutation.isPending ? "Creating…" : "Create Business"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
