import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export interface SsoResponse {
  token: string;
  redirectUrl: string;
}

export interface MallPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  features: string[];
  configuration?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  type: string;
  trialDuration?: number;
  seasonId?: string;
  stripeMonthlyPriceId?: string;
  stripeQuarterlyPriceId?: string;
  stripeAnnualPriceId?: string;
  paypalMonthlyPlanId?: string;
  paypalQuarterlyPlanId?: string;
  paypalAnnualPlanId?: string;
  created_at: string;
  updated_at: string;
}

export const mallIntegrationService = {
  getSsoUrl: async (): Promise<SsoResponse> => {
    const response = await api.get("/mall-integration/sso-url");
    return response.data;
  },

  getMallPlans: async (): Promise<MallPlan[]> => {
    const response = await api.get("/mall-integration/plans");
    return response.data;
  },
};

export const useGetMallPlans = () => {
  return useQuery({
    queryKey: ["mall-plans"],
    queryFn: mallIntegrationService.getMallPlans,
    staleTime: 5 * 60 * 1000,
  });
};
