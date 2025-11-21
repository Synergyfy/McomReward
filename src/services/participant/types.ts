import * as z from "zod";
import { participantSignUpSchema, participantLoginSchema, joinCampaignSchema } from "@/lib/validators/participantSchemas";

export type ParticipantSignUpDto = z.infer<typeof participantSignUpSchema>;
export type ParticipantLoginDto = z.infer<typeof participantLoginSchema>;
export type JoinCampaignDto = z.infer<typeof joinCampaignSchema>;

export interface ParticipantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  // Add other fields if returned by the API
}

export interface ParticipantLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: ParticipantUser;
}
