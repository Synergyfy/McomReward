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
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name must only contain letters, spaces, hyphens, or apostrophes"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name must only contain letters, spaces, hyphens, or apostrophes"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  referralCode: z
    .string()
    .max(50, "Referral code must be at most 50 characters")
    .regex(/^[a-zA-Z0-9]*$/, "Referral code must only contain letters and numbers")
    .optional()
    .or(z.literal('')),
  provisionCode: z
    .string()
    .max(50, "Provision code must be at most 50 characters")
    .regex(/^[a-zA-Z0-9]*$/, "Provision code must only contain letters and numbers")
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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
