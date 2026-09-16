import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import Cookies from 'js-cookie';

export interface PlanVariantDto {
  id: string;
  tierLevel: 'STANDARD' | 'PRO' | 'PRO_PLUS' | string;
  sortOrder?: number;
  durationDays?: number | null;
  isCalendarYear?: boolean;
  price: number;
  currency?: string;
  features: string[];
  configuration?: {
    quotas?: Record<string, number | boolean>;
    featureFlags?: Record<string, boolean>;
    disabledNavIds?: string[];
    [key: string]: any;
  } | null;
  isActive: boolean;
}

export interface McomPlan {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  features: string[];
  configuration?: {
    quotas?: Record<string, number | boolean>;
    featureFlags?: Record<string, boolean>;
    [key: string]: any;
  } | null;
  isActive: boolean;
  isDefault?: boolean;
  type?: 'STANDARD' | 'TRIAL' | 'SEASONAL' | string;
  variants?: PlanVariantDto[];
}

export interface InitiatePurchaseDto {
  externalPlanId: string;
  billingCycle?: 'monthly' | 'quarterly' | 'annual' | string;
  provider: 'stripe' | 'paypal' | 'wallet' | 'mcom_wallet';
  returnUrl?: string;
  cancelUrl?: string;
}

export interface InitiatePurchaseResponse {
  clientSecret?: string;
  type?: 'payment' | 'setup';
  orderId?: string;
  approvalUrl?: string;
  holdId?: string;
  success?: boolean;
  transactionId?: string;
  plan?: any;
  [key: string]: any;
}

export interface ConfirmPurchaseDto {
  externalPlanId: string;
  billingCycle?: string;
  paymentIntentId?: string;
  setupIntentId?: string;
  orderId?: string;
  holdId?: string;
  provider?: string;
}

export interface MyPackageResponse {
  membership: any;
  isLinkedToMcom: boolean;
  mcomUserId: string | null;
  membershipLevel: string;
  membershipTier: string;
  membershipStatus: string;
  /** Local-first extras from GET /mcom/packages/my-package */
  planName?: string;
  planVariantId?: string | null;
  isExpired?: boolean;
  isTrial?: boolean;
  expiresAt?: string | null;
}

const MCOM_PACKAGES_KEY = 'mcom-packages';

export const getPurchasablePlans = async (): Promise<McomPlan[]> => {
  const { data } = await api.get<McomPlan[]>('/mcom/packages/plans');
  return data;
};

export const useGetPurchasablePlans = () => {
  return useQuery({
    queryKey: [MCOM_PACKAGES_KEY, 'plans'],
    queryFn: getPurchasablePlans,
  });
};

export const getMyPackage = async (): Promise<MyPackageResponse> => {
  const { data } = await api.get<MyPackageResponse>('/mcom/packages/my-package');
  return data;
};

export const useGetMyPackage = () => {
  return useQuery({
    queryKey: [MCOM_PACKAGES_KEY, 'my-package'],
    queryFn: getMyPackage,
  });
};

export const initiatePurchase = async (
  payload: InitiatePurchaseDto
): Promise<InitiatePurchaseResponse> => {
  const { data } = await api.post<InitiatePurchaseResponse>(
    '/mcom/packages/purchase/initiate',
    payload
  );
  return data;
};

export const useInitiatePurchase = () => {
  return useMutation({
    mutationFn: initiatePurchase,
  });
};

export const confirmPurchase = async (
  payload: ConfirmPurchaseDto
): Promise<any> => {
  const { data } = await api.post('/mcom/packages/purchase/confirm', payload);
  // Instant JWT refresh — backend returns fresh tokens after successful purchase
  // No hardcoded keys; cookie names match api.ts interceptor (access/refresh)
  const accessToken = (data as any)?.access_token;
  const refreshToken = (data as any)?.refresh_token;
  if (typeof window !== 'undefined' && accessToken) {
    Cookies.set('access', accessToken, { path: '/' });
    if (refreshToken) Cookies.set('refresh', refreshToken, { path: '/' });
    setBearerToken(accessToken);
  }
  return data;
};

export const useConfirmPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MCOM_PACKAGES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['payment'] });
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['businessSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
};

export const getSsoAuthorizeUrl = async (state?: string): Promise<{ authorizeUrl: string; state: string }> => {
  const { data } = await api.get<{ authorizeUrl: string; state: string }>('/sso/authorize-url', {
    params: state ? { state } : undefined,
  });
  return data;
};
