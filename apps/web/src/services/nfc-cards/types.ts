export interface NfcCard {
  id: string;
  type: 'Business' | 'Staff' | 'Premium';
  status: 'Active' | 'Inactive';
  tapCount: number;
  linkedPage: string | null;
}

export interface NfcCardsResponse {
    data: NfcCard[];
    // You might also want to include pagination meta data here if the API supports it
    // total: number;
    // page: number;
    // limit: number;
}

export interface NfcCardQueryDto {
    businessId?: string; // For admin impersonation
    // Add other filters like status or type if needed
}