import { Business } from "@/services/business/types";

// From the API documentation

export interface Reward {
  id: string;
  title: string;
  points_required: number;
  value: number;
  description: string;
  image: string;
  quantity: number;
  disabled: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  campaign_message: string;
  start_date: string;
  end_date: string;
  quantity: number;
  audience_type: string;
  banner_url: string;
  logo_url: string | null;
  cta_text: string;
  cta_background_color: string;
  cta_text_color: string;
  text_color: string;
  background_color: string;
  disabled: boolean;
  rewards: Reward[];
}

export interface PaginatedCampaignsResponse {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
}

export interface BusinessCampaign {
  id: string;
  uniqueCode: string;
  business: Business;
  campaign: Campaign;
}

// For analytics
export interface CampaignAnalytics {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  disabled: boolean;
  sector: string;
  status: 'active' | 'inactive';
  total_participants: string;
  total_points_awarded: string;
  total_rewards_redeemed: string;
  redemption_rate: number;
}

export interface PaginatedCampaignAnalyticsResponse {
  data: CampaignAnalytics[];
  total: number;
  page: number;
  limit: number;
}

export interface WeeklyChartData {
  date: string;
  points_awarded: string;
  rewards_redeemed: string;
  new_participants: string;
}

export interface RankedParticipant {
  id: string;
  name: string;
  email: string;
  total_points_earned: string;
  total_redemptions: string;
}

export interface TopReward {
  id: string;
  title: string;
  points_required: number;
  total_redemptions: string;
}

export interface DetailedCampaignAnalytics {
  total_participants: string;
  total_rewards_redeemed: string;
  total_points_awarded: string;
  redemption_rate: number;
  weekly_chart_data: WeeklyChartData[];
  ranked_participants: RankedParticipant[];
  top_rewards: TopReward[];
}

// DTOs for requests
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}
