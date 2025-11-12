import api, { setBearerToken } from '../api';
import {  Business,  BusinessLoginDto,  BusinessLoginResponse,  Sector, BusinessSignUpDto, CreateBusinessDto, Category, SubCategory} from './types';
import Cookies from 'js-cookie';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const BUSINESS_QUERY_KEY = 'business';

// Business Sign-up

const businessSignUp = async (signUpData: BusinessSignUpDto): Promise<string> => {
  const dataToSend = { ...signUpData, referralCode: signUpData.inviteCode };
  // Remove inviteCode if it's not needed on the backend or if referralCode replaces it
  delete dataToSend.inviteCode; 
  const { data } = await api.post<string>('/business/signup', dataToSend);

  return data;
};

export const useBusinessSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: businessSignUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUSINESS_QUERY_KEY] });
    },
  });
};


// Business onboard
const businessOnboard = async (onboardData: CreateBusinessDto): Promise<string> => {
  const { data } = await api.post<string>('/business/onboarding', onboardData);
  return data;
};

export const useBusinessOnboard = () => {
  const QueryClient = useQueryClient();
  return useMutation({
    mutationFn: businessOnboard,
    mutationKey: [BUSINESS_QUERY_KEY],
    onSuccess: () =>
    {
      QueryClient.invalidateQueries({queryKey: [BUSINESS_QUERY_KEY]})
    }

  })
}

// Get Sectors
const getSectors = async (): Promise<Sector[]> => {
  const { data } = await api.get<Sector[]>('/sectors');
  return data;
};

export const useGetSectors = () => {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: getSectors,
  });
};

// Get Categories
const getCategories = async (sectorId?: string): Promise<Category[]> => {
    const endpoint = sectorId ? `/categories?sectorId=${sectorId}` : '/categories';
    const { data } = await api.get<Category[]>(endpoint);
    return data;
};

export const useGetCategories = (sectorId?: string) => {
    return useQuery({
        queryKey: ['categories', sectorId],
        queryFn: () => getCategories(sectorId),
        enabled: !!sectorId, // Only fetch if sectorId is provided
    });
};

// Get SubCategories
const getSubCategories = async (categoryId?: string): Promise<SubCategory[]> => {
    const endpoint = categoryId ? `/subcategories?categoryId=${categoryId}` : '/subcategories';
    const { data } = await api.get<SubCategory[]>(endpoint);
    return data;
};

export const useGetSubCategories = (categoryId?: string) => {
    return useQuery({
        queryKey: ['subcategories', categoryId],
        queryFn: () => getSubCategories(categoryId),
        enabled: !!categoryId, // Only fetch if categoryId is provided
    });
};


// Business Login
const businessSignIn = async (loginData: BusinessLoginDto): Promise<BusinessLoginResponse> => {
  const { data } = await api.post<BusinessLoginResponse>('/auth/login', loginData);
  return data;
};

export const useBusinessSignIn = (options?: { skipRedirect?: boolean }) => {
  const router = useRouter();

  return useMutation({
    mutationFn: businessSignIn,
    onSuccess: (data) => {
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);

      if (!options?.skipRedirect) {
        if (data.user.role === 'Admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      };
    },
  });
};
