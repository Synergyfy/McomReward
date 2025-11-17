export enum CampaignType {
  QR_CODE = 'qr_code',
  REFERRAL = 'referral',
  SOCIAL_OR_EMAIL = 'social_or_email',
  SPECIAL_OCCASION = 'special_occasion',
}

export enum AudienceType {
  MEMBERS = 'members',
  BADGE_LEVEL = 'badge_level',
  TARGET_WISHLIST = 'target_wishlist',
}

export interface Campaign {
  id: string;
  name: string;
  campaign_type: CampaignType;
  campaign_message: string;
  start_date: string; // ISO 8601 date string
  end_date: string;   // ISO 8601 date string
  quantity: number;
  audience_type: AudienceType;
  banner_url: string;
  logo_url?: string;
  cta_text: string;
  cta_background_color: string;
  cta_text_color: string;
  text_color: string;
  background_color: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

export interface PaginatedCampaignResponse {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
  next_page: number | null;
}

// Minimal Business interface to satisfy the reference
export interface Business {
  id: string;
  name: string;
  // ... other business properties
}


export interface BusinessCampaign {
  id: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  business: Business; // The business object
  campaign: Campaign; // The campaign object that was added
}
