export interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Participant {
  id: string;
  // ... other participant fields as needed
}

export interface WishlistItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  updatedAtFormatted?: string; // Optional helper for UI
  deletedAt: string | null;
  itemName: string;
  itemImageUrl: string | null;
  category: Category;
  participant: Participant;
  isForThirdParty: boolean;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  relationship: 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'HUSBAND' | 'WIFE' | 'OTHERS' | null;
  occasion: 'BIRTHDAY' | 'ANNIVERSARY' | 'NONE' | 'CUSTOM';
  season: 'AUTUMN' | 'WINTER' | 'SUMMER' | 'SPRING' | 'NONE';
  targetDate: string | null; // Format: YYYY-MM-DD
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  marketingConsent: boolean;
}

export interface CreateWishlistDto {
  itemName: string;
  itemImageUrl?: string;
  categoryId: string;
  occasion?: 'BIRTHDAY' | 'ANNIVERSARY' | 'NONE' | 'CUSTOM';
  season?: 'AUTUMN' | 'WINTER' | 'SUMMER' | 'SPRING' | 'NONE';
  targetDate?: string; // Format: YYYY-MM-DD
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  marketingConsent: boolean;
  isForThirdParty: boolean;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  relationship?: 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'HUSBAND' | 'WIFE' | 'OTHERS';
}

export interface WishlistAggregate {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  itemName: string;
  category: Category;
  audienceSize: number;
  targetDates: (string | null)[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}
