export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Mapped from video_url
  coverImage?: string; // Mapped from cover_image
  targetAudience: 'business' | 'participant'; // Mapped from target_audience
  targetTierIds?: string[]; // Mapped from target_tier_ids
  createdAt: string; // Mapped from created_at
}

export interface CreateTrainingVideoDto {
  title: string;
  description: string;
  video_url: string;
  cover_image?: string;
  target_audience: 'business' | 'participant';
  target_tier_ids?: string[];
}

export interface GetTrainingVideosParams {
  page?: number;
  limit?: number;
  target_audience?: 'business' | 'participant';
  title?: string;
}

export interface TrainingVideoResponse {
  items: TrainingVideo[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
