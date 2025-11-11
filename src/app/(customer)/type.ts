export type CampaignStatus = "Active" | "Completed" | "Expired" | "Available";


export interface Campaign {
  id: number;
  title: string;
  category: string;
  business: string;
  occasion?: string;
  rewardType: string;
  points: number;
  status: CampaignStatus;
  expiryDate: string;
  joined?: boolean;
}

export interface CampaignCardProps {
  campaign: Campaign;
  mode?: "my" | "available";
  onClaim?: (id: number) => void;
  onJoin?: (id: number) => void;
}



// export interface DemoCampaign {
//   id: number;
//   title: string;
//   business: string;
//   rewardType: string;
//   points: number;
//   status: CampaignStatus;
//   expiryDate: string;
// }

export interface DemoReward {
  id: number;
  title: string;
  type: "Gift Card" | "Voucher" | "Discount" | "Product";
  requiredPoints: number;
  badgeLevel: string;
  description: string;
  expiry: string;
}

export interface DemoWishlist {
  id: number;
  name: string;
  category: string;
  occasion: string;
  targetDate: string;
  priority: "Low" | "Medium" | "High";
}

export interface DemoTransaction {
  id: number;
  description: string;
  type: "Earned" | "Redeemed";
  amount: number;
  date: string;
}

export interface DemoPointsTransaction {
  id: number;
    source: string;
    points: number;
   type: "Earned" | "Redeemed" | "Bonus (Matching)";
  date: string;
}
