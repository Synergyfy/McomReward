export interface CreateCampaignFromWishlistDto {
  wishlistAggregateId: string;
  name: string;
  campaign_type: string;
  campaign_message: string;
  start_date: string;
  end_date: string;
  quantity: number;
  audience_type: string;
  banner_url: string;
  logo_url: string;
  cta_text: string;
  cta_background_color: string;
  cta_text_color: string;
  text_color: string;
  background_color: string;
  signUpPoint: number;
  reward_type: string;
  regular_points_threshold: number;
  matching_points_threshold: number;
  business_reward_ids: string[];
  reward_ids: string[];
}
