export interface CreateDealDto {
  title: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  value: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
}
