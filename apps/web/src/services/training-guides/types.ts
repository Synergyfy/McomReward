export interface TrainingGuideResource {
  id: string;
  title: string;
}

export interface TrainingGuide {
  id: string;
  title: string;
  description: string;
  target_tier_id?: string;
  targetTier?: { id: string; name: string };
  videos?: TrainingGuideResource[];
  articles?: TrainingGuideResource[];
  createdAt: string;
}

export interface CreateTrainingGuideDto {
  title: string;
  description: string;
  target_tier_id: string;
  video_ids?: string[];
  article_ids?: string[];
}

export type UpdateTrainingGuideDto = Partial<CreateTrainingGuideDto>;

export interface GetTrainingGuidesParams {
  page?: number;
  limit?: number;
  title?: string;
  target_tier_id?: string;
}

export interface TrainingGuideResponse {
  data: TrainingGuide[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}