export interface StorefrontVideoAnalytics {
  views: number;
  watchTime: string; // e.g., '2m 30s'
  conversions: number;
}

export interface StorefrontVideo {
  url: string;
  thumbnail: string;
  analytics: StorefrontVideoAnalytics;
}

export interface GalleryItem {
  type: 'video' | 'image' | 'logo';
  url: string;
  thumbnail: string;
}

export interface StorefrontMediaResponse {
  storefrontVideo: StorefrontVideo;
  gallery: GalleryItem[];
}

export interface StorefrontMediaQueryDto {
    businessId?: string; // For admin impersonation
}