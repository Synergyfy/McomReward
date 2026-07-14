import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import Cookies from 'js-cookie';
import {
  Tier,
  StripeInitiateRequest,
  StripeInitiateResponse,
  StripeVerifyRequest,
  StripeVerifyResponse,
  PayPalInitiateRequest,
  PayPalInitiateResponse,
  PayPalVerifyRequest,
  PayPalVerifyResponse,
  UpdateTierProgressionDto,
  PointPackage,
  BuyPackageDto,
  ConfirmPurchaseDto,
  BusinessPointPackage,
  PointPackageListResponse,
  JoinTrialDto,
  TrialSubscriptionResponse
} from './types';

const PAYMENT_QUERY_KEY = 'payment';

const getTiers = async (): Promise<Tier[]> => {
  const { data } = await api.get<Tier[]>('/tier');
  return data;
};

export const useGetTiers = () => {
  return useQuery({
    queryKey: [PAYMENT_QUERY_KEY, 'tiers'],
    queryFn: getTiers,
  });
};

const updateTierProgression = async ({ id, payload }: { id: string; payload: UpdateTierProgressionDto }): Promise<Tier> => {
  const { data } = await api.patch<Tier>(`/tier/${id}/progression`, payload);
  return data;
};

export const useUpdateTierProgression = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTierProgression,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEY, 'tiers'] });
    },
  });
};

// Stripe Payment Hooks
const initiateStripePayment = async (payload: StripeInitiateRequest): Promise<StripeInitiateResponse> => {
  const { data } = await api.post<StripeInitiateResponse>('/payment/stripe/initiate', payload);
  return data;
};

export const useStripeInitiate = () => {
  return useMutation({
    mutationFn: initiateStripePayment,
  });
};

const verifyStripePayment = async (payload: StripeVerifyRequest): Promise<StripeVerifyResponse> => {
  const { data } = await api.post<StripeVerifyResponse>('/payment/stripe/verify', payload);
  return data;
};

export const useStripeVerify = () => {
  return useMutation({
    mutationFn: verifyStripePayment,
    onSuccess: (data) => {
      // Update tokens in cookies after successful payment
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);
    },
  });
};

// PayPal Payment Hooks
const initiatePayPalPayment = async (payload: PayPalInitiateRequest): Promise<PayPalInitiateResponse> => {
  const { data } = await api.post<PayPalInitiateResponse>('/payment/paypal/initiate', payload);
  return data;
};

export const usePayPalInitiate = () => {
  return useMutation({
    mutationFn: initiatePayPalPayment,
  });
};

const verifyPayPalPayment = async (payload: PayPalVerifyRequest): Promise<PayPalVerifyResponse> => {
  const { data } = await api.post<PayPalVerifyResponse>('/payment/paypal/verify', payload);
  return data;
};

export const usePayPalVerify = () => {
  return useMutation({
    mutationFn: verifyPayPalPayment,
    onSuccess: (data) => {
      // Update tokens in cookies after successful payment
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);
    },
  });
};

// Trial Subscription Hook
const joinTrial = async (payload: JoinTrialDto): Promise<TrialSubscriptionResponse> => {
  const { data } = await api.post<TrialSubscriptionResponse>('/membership/join-trial', payload);
  return data;
};

export const useJoinTrial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinTrial,
    onSuccess: () => {
      // Invalidate subscription queries to refresh user's subscription status
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
    },
  });
};

// Point Package Hooks
const getAvailablePointPackages = async (): Promise<PointPackage[]> => {
  const { data } = await api.get<PointPackageListResponse>('/point-packages/business/available');
  return data.data;
};

export const useGetAvailablePointPackages = () => {
  return useQuery({
    queryKey: [PAYMENT_QUERY_KEY, 'availablePointPackages'],
    queryFn: getAvailablePointPackages,
  });
};

const buyPointPackage = async (payload: BuyPackageDto): Promise<{ clientSecret?: string; approvalUrl?: string; orderId?: string }> => {
  const { data } = await api.post<{ clientSecret?: string; approvalUrl?: string; orderId?: string }>('/point-packages/business/buy', payload);
  return data;
};

export const useBuyPointPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: buyPointPackage,
    onSuccess: () => {
      // Invalidate queries that show available packages or user's point balance
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEY, 'availablePointPackages'] });
      // Potentially invalidate user's wallet/balance query if one exists
      // queryClient.invalidateQueries({ queryKey: ['userWallet'] });
    },
  });
};


const getPointPackagesByTier = async (tierId: string): Promise<PointPackage[]> => {
  const { data } = await api.get<PointPackage[]>(`/point-packages/tier/${tierId}`);
  return data;
};

export const useGetPointPackagesByTier = (tierId?: string) => {
  return useQuery({
    queryKey: [PAYMENT_QUERY_KEY, 'pointPackagesByTier', tierId],
    queryFn: () => getPointPackagesByTier(tierId!),
    enabled: !!tierId,
  });
};

const confirmPointPackagePurchase = async (payload: ConfirmPurchaseDto): Promise<BusinessPointPackage> => {
  const { data } = await api.post<BusinessPointPackage>('/point-packages/business/confirm-purchase', payload);
  return data;
};

export const useConfirmPointPackagePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPointPackagePurchase,
    onSuccess: () => {
      // Invalidate queries that show user's purchased packages or point balance
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEY, 'myPackages'] });
      // Potentially invalidate user's wallet/balance query if one exists
      // queryClient.invalidateQueries({ queryKey: ['userWallet'] });
    },
  });
};