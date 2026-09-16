export type ReferralStatus = 'PENDING' | 'SUCCESSFUL';

export interface MyReferral {
  id: string;
  refereeEmail: string;
  status: ReferralStatus;
  pointsEarned: number;
  code: string;
  created_at: string;
  createdAt?: string;
  referee?: {
    id: string;
    name: string;
  } | null;
  campaign?: {
    id: string;
    title?: string;
  } | null;
}