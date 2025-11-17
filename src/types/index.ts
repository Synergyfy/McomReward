export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
  isRecommended?: boolean;
}
