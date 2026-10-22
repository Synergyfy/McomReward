import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import { setAuthTokens } from '@/lib/auth-cookies';

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
  /** Stable id for this checkout attempt; retries reuse the same MCOM Pay charge. */
  checkoutId?: string;
}

export interface InitiatePurchaseResponse {
  checkoutId?: string;
  chargeId?: string;
  amountMinor?: string;
  currency?: string;
  status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';
  method?: 'stripe' | 'paypal' | 'wallet';
  topUpUrl?: string;
  clientSecret?: string;
  type?: 'payment' | 'setup';
  orderId?: string;
  approvalUrl?: string;
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
  checkoutId?: string;
  chargeId?: string;
}

export interface ProgrammeTask {
  taskId: string;
  title: string;
  description: string;
  deadlineDays: number;
  rewardPoints: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
}

export interface PlatformEntitlement {
  version: '2026-10-01';
  targetPlatform: {
    clientId: string;
    platformSlug: string;
    name: string;
  };
  access: {
    hasAccess: boolean;
    accessType: 'PAID_MEMBERSHIP' | 'TRIAL_PROGRAMME' | 'DIRECT_PACKAGE' | 'NONE';
    reason?:
      | 'PLATFORM_NOT_IN_MEMBERSHIP'
      | 'TRIAL_NO_TASKS'
      | 'TRIAL_EXPIRED'
      | 'UNVERIFIED'
      | 'MEMBERSHIP_EXPIRED'
      | 'NO_ACTIVE_ENTITLEMENT';
    upgradeUrl: string;
  };
  plan: {
    planId: string;
    planName: string;
    source: 'membership' | 'trial' | 'direct';
    status: 'active' | 'trial' | 'expired';
    billingCycle?: string | null;
    expiresAt?: string | null;
    quotas: Record<string, unknown>;
    limits: Record<string, unknown>;
    features: string[];
  } | null;
  membershipContext: {
    membershipPlanName: string | null;
    membershipLevel: string;
    membershipStatus: string;
    isIncludedInMembership: boolean;
  };
  trialContext: {
    isInTrial: boolean;
    hasPaidVerificationFee: boolean;
    trialExpiresAt: string | null;
    daysRemaining: number;
    programmeTasks: ProgrammeTask[];
  };
}

export interface MyPackageResponse {
  membership: any;
  subscription?: any;
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
  hasAccess?: boolean;
  accessType?: 'PAID_MEMBERSHIP' | 'TRIAL_PROGRAMME' | 'DIRECT_PACKAGE' | 'NONE';
  source?: 'membership' | 'trial' | 'direct' | string;
  entitlement?: PlatformEntitlement | null;
  trialTasks?: ProgrammeTask[];
  hasPaidVerificationFee?: boolean;
  daysRemaining?: number;
  upgradeUrl?: string;
  expiresAt?: string | null;
  autoRenew?: boolean;
  billingMethod?: 'wallet' | 'stripe' | 'paypal' | string | null;
  nextBillingAt?: string | null;
  renewalAttempts?: number;
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

const setAutoRenewRequest = async (autoRenew: boolean) => {
  const { data } = await api.post(
    `/mcom/packages/subscription/${autoRenew ? 'resume' : 'cancel'}`,
  );
  return data;
};

export const useSetAutoRenew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAutoRenewRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MCOM_PACKAGES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['businessSubscription'] });
    },
  });
};

export const getIntrospectionEntitlement = async (): Promise<PlatformEntitlement | null> => {
  const { data } = await api.get<PlatformEntitlement | null>('/sso/entitlement');
  return data;
};

export const useGetIntrospectionEntitlement = () => {
  return useQuery({
    queryKey: ['sso', 'entitlement'],
    queryFn: getIntrospectionEntitlement,
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
    setAuthTokens(accessToken, refreshToken);
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
