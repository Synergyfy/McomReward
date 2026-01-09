"use client";

import api, { setBearerToken } from '../api';
import {
  Business,
  BusinessLoginDto,
  BusinessLoginResponse,
  BusinessSignUpDto,
  CreateBusinessDto,
  PaginatedResponse,
  Category,
  Subcategory,
  BusinessProfile,
  UpdateBusinessProfileDto,
  BusinessMonthlyBalance,
  TierUsageResponse,
  BusinessSetupStatus,
  PointPackageBalance,
  ReferralStatsResponseDto
} from './types';
// ... existing code

// ------------------- REFERRAL STATS -------------------
const getReferralStats = async (): Promise<ReferralStatsResponseDto> => {
  const { data } = await api.get('/business/referral-stats');
  return data;
};

export const useGetReferralStats = () => useQuery({ queryKey: ['referralStats'], queryFn: getReferralStats });

import { SectorResponse } from '@/services/sectors/types';
import Cookies from 'js-cookie';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// ... rest of your code


const BUSINESS_QUERY_KEY = 'business';

// ------------------- BUSINESS SIGN-UP -------------------
const businessSignUp = async (signUpData: BusinessSignUpDto): Promise<string> => {
  const { data } = await api.post<string>('/business/signup', signUpData);
  return data;
};

export const useBusinessSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessSignUp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BUSINESS_QUERY_KEY] }),
  });
};

// ------------------- AUTH -------------------
const login = async (loginData: BusinessLoginDto): Promise<BusinessLoginResponse> => {
  const { data } = await api.post<BusinessLoginResponse>('/auth/login', loginData);
  return data;
};

export const useAuth = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: async (data, variables) => {
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('isOnboarded', String(data.user.isOnboarded));
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);

      if (data.user.role === 'Business' && !data.user.isEmailVerified) {
        // Auto-trigger resend OTP for existing users
        try {
          await api.post('/auth/resend-otp', { email: variables.email });
        } catch (error) {
          console.error('Failed to resend OTP:', error);
          // Continue to verification page even if resend fails
        }
        router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
      } else if (data.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'Staff') {
        router.push('/staff/dashboard');
      } else if (data.user.role === 'Business' && !data.user.isOnboarded) {
        router.push('/business/onboard');
      } else if (data.user.role === 'Participant') {
        router.push('/participant/wallet');
      } else {
        router.push('/dashboard');
      }
    },
  });
};

// Alias for useAuth to maintain backward compatibility
export const useBusinessSignIn = (options?: { skipRedirect?: boolean }) => {
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: async (data, variables) => {
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);

      // Only redirect if skipRedirect is not true
      if (!options?.skipRedirect) {
        if (data.user.role === 'Business' && !data.user.isEmailVerified) {
          // Auto-trigger resend OTP for existing users
          try {
            await api.post('/auth/resend-otp', { email: variables.email });
          } catch (error) {
            console.error('Failed to resend OTP:', error);
            // Continue to verification page even if resend fails
          }
          router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
        } else if (data.user.role === 'Admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'Staff') {
          router.push('/staff/dashboard');
        } else if (data.user.role === 'Business' && !data.user.isOnboarded) {
          router.push('/business/onboard');
        } else if (data.user.role === 'Participant') {
          router.push('/participant/wallet');
        } else {
          router.push('/dashboard');
        }
      }
    },
  });
};

// ------------------- BUSINESS ONBOARDING -------------------
const businessOnboard = async (onboardData: CreateBusinessDto): Promise<string> => {
  const { data } = await api.post<string>('/business/onboarding', onboardData);
  return data;
};

export const useBusinessOnboard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: businessOnboard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BUSINESS_QUERY_KEY] }),
  });
};

// ------------------- SECTORS & CATEGORIES -------------------
const getSectors = async (): Promise<SectorResponse[]> => {
  const { data } = await api.get<SectorResponse[]>('/sectors');
  return data;
};

export const useGetSectors = () => useQuery({ queryKey: ['sectors'], queryFn: getSectors });

const getCategories = async (sectorId: string, page = 1, limit = 10): Promise<PaginatedResponse<Category>> => {
  const { data } = await api.get(`/sectors/${sectorId}/categories`, { params: { page, limit } });
  return data;
};

export const useGetCategories = (sectorId: string, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['categories', sectorId, page, limit],
    queryFn: () => getCategories(sectorId, page, limit),
    enabled: !!sectorId,
  });

const getSubcategories = async (categoryId: string, page = 1, limit = 10): Promise<PaginatedResponse<Subcategory>> => {
  const { data } = await api.get(`/categories/${categoryId}/subcategories`, { params: { page, limit } });
  return data;
};

export const useGetSubcategories = (categoryId: string, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['subcategories', categoryId, page, limit],
    queryFn: () => getSubcategories(categoryId, page, limit),
    enabled: !!categoryId,
  });

// ------------------- BUSINESS PROFILE -------------------
const getBusinessProfile = async (businessId?: string): Promise<BusinessProfile> => {
  const { data } = await api.get('/business/profile', { params: { businessId } });
  return data;
};

export const useGetBusinessProfile = (
  businessIdOrOptions?: string | Omit<UseQueryOptions<BusinessProfile, Error>, 'queryKey' | 'queryFn'>,
  options?: Omit<UseQueryOptions<BusinessProfile, Error>, 'queryKey' | 'queryFn'>
) => {
  const isId = typeof businessIdOrOptions === 'string';
  const businessId = isId ? businessIdOrOptions : undefined;
  const queryOptions = isId ? options : businessIdOrOptions;

  return useQuery<BusinessProfile, Error>({
    queryKey: ['businessProfile', businessId],
    queryFn: () => getBusinessProfile(businessId),
    ...(queryOptions as any)
  });
};

const updateBusinessProfile = async (updateData: UpdateBusinessProfileDto, businessId?: string): Promise<BusinessProfile> => {
  const { data } = await api.patch('/business/profile', updateData, { params: { businessId } });
  return data;
};

export const useUpdateBusinessProfile = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updateData: UpdateBusinessProfileDto) => updateBusinessProfile(updateData, businessId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessProfile', businessId] }),
  });
};

// ------------------- BALANCES & USAGE -------------------
const getBusinessMonthlyBalance = async (): Promise<BusinessMonthlyBalance> => {
  const { data } = await api.get('/business/points/balance/monthly');
  return data;
};

export const useGetBusinessMonthlyBalance = () => useQuery({ queryKey: ['businessMonthlyBalance'], queryFn: getBusinessMonthlyBalance });

const getBusinessMonthlyStampBalance = async (): Promise<any> => {
  const { data } = await api.get('/business/stamps/balance/monthly');
  return data;
};

export const useGetBusinessMonthlyStampBalance = () => useQuery({ queryKey: ['businessMonthlyStampBalance'], queryFn: getBusinessMonthlyStampBalance });

const getBusinessTierUsage = async (): Promise<TierUsageResponse> => {
  const { data } = await api.get('/business/tier-usage');
  return data;
};

export const useGetBusinessTierUsage = () => useQuery({ queryKey: ['businessTierUsage'], queryFn: getBusinessTierUsage });

// ------------------- BUSINESS SETUP STATUS -------------------
const getBusinessSetupStatus = async (): Promise<BusinessSetupStatus> => {
  const { data } = await api.get('/business/setup/status');
  return data;
};

export const useGetBusinessSetupStatus = () => useQuery({ queryKey: ['businessSetupStatus'], queryFn: getBusinessSetupStatus });

// ------------------- POINT PACKAGE BALANCE -------------------
const getPointPackageBalance = async (): Promise<PointPackageBalance> => {
  const { data } = await api.get('/point-packages/business/balance');
  return data;
};

export const useGetPointPackageBalance = () => useQuery({ queryKey: ['pointPackageBalance'], queryFn: getPointPackageBalance });

