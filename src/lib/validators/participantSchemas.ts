import { z } from "zod";

export const participantSignUpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const participantLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const joinCampaignSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
});
