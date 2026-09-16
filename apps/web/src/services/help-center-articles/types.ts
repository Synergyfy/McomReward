export type TrainingTargetAudience = 'participant' | 'business' | 'all';

export interface HelpCenterArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  short_description: string;
  target_audience: TrainingTargetAudience;
  targetTiers?: { id: string; name: string }[];
  createdAt: string;
}

export interface CreateHelpCenterArticleDto {
  title: string;
  category: string;
  content: string;
  short_description: string;
  target_audience: TrainingTargetAudience;
  target_tier_ids?: string[];
}

export type UpdateHelpCenterArticleDto = Partial<CreateHelpCenterArticleDto>;

export interface GetHelpCenterArticlesParams {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
}

export interface HelpCenterArticleResponse {
  data: HelpCenterArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}