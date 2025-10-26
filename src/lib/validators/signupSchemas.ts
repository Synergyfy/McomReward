// src/lib/validators/signupSchemas.ts
import z from "zod";

const socialMediaSchema = z
  .object({
    facebook: z.string().url().nullish().or(z.literal("")).optional(),
    twitter: z.string().url().nullish().or(z.literal("")).optional(),
    instagram: z.string().url().nullish().or(z.literal("")).optional(),
  })
  .optional();

export const createBusinessSchema = z.object({
  sectorId: z.string(),
  phone: z.string().min(7, "Valid phone number is required"),
  address: z.string(),
  website: z.url().nullish().or(z.literal("")).optional(),
  socialMedia: socialMediaSchema,
  referralCapacity: z.number({
    error: "Referral capacity is required",
}).min(0, "Referral capacity must be >= 0")
 
});

export const staffSchema = z.object({
  staffName: z.string().min(2, "Staff name required").optional().nullable(),
  staffEmail: z.string().email("Valid staff email required").optional().nullable(),
  staffPassword: z.string().min(10, "Valid staff password required").optional().nullable(),
  staffAvatar: z
    .any()
    .refine(
      (file) => {
        if (file == null) return true; // optional
        return file instanceof File;
      },
      { message: "Invalid file type" }
    ).optional()
    .nullable(),


});

export const rewardSchema = z.object({
  rewardTitle: z.string().min(2, "Reward title required"),
  pointsRequired: z.number().min(1, "Points must be >= 1"),
  cashValue: z.number().min(0, "Cash value must be >= 0"),
  rewardDescription: z.string().optional().nullable(),
  rewardImage: z
    .any()
    .refine(
      (file) => {
        if (file == null) return false; // required
        return file instanceof File;
      },
      { message: "Invalid file type" }
    )
});

// export const onboardingFullSchema = z.object({
//   ...businessInfoSchema.shape,
//   ...staffSchema.shape,
//   ...rewardSchema.shape,
// })
