// src/lib/validators/signupSchemas.ts
import z from "zod";


const socialMediaSchema = z.array(
  z.object({
    name: z.string().min(1, "Social media platform name is required"),
    link: z.string().url("Please enter a valid URL"),
  })
).optional();

export const createBusinessSchema = z.object({
  sectorId: z.string(),
  categoryId: z.string(),
  subCategoryId: z.string().optional().nullable(),
  phone: z.string().min(7, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  website: z.string().optional(),
  socialMedia: socialMediaSchema,
  referralCapacity: z.enum(["12+", "25+", "50+", "100+"], {
    message: "Please select a referral capacity",
  })

});

export const businessSignUpSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  email: z.email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
  inviteCode: z.string().optional(),
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
