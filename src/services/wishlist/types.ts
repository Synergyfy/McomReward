export interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  created_at: string; // Changed to match API doc
  updated_at: string; // Changed to match API doc
  deleted_at: string | null; // Changed to match API doc
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
  category: {
    id: string;
    name: string;
    // The wishlist item response might still use camelCase or whatever the wishlist endpoint returns.
    // Based on previous wishlist doc, it was nested object.
    // Let's assume the wishlist endpoint returns the category object as defined there.
    // However, for fetching categories list, we use the snake_case one.
    // Let's keep this generic or permissive if possible.
    [key: string]: string | number | boolean | null | undefined;
  };
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

export type UpdateWishlistDto = Partial<CreateWishlistDto>;

export interface WishlistAggregate {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  itemName: string;
  category: {
      id: string;
      name: string;
  };
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
  businessId?: string;
}
