import api, { setBearerToken } from '../api';
import { Business, BusinessLoginDto, BusinessLoginResponse, BusinessSignUpDto, CreateBusinessDto, PaginatedResponse, Category, Subcategory, BusinessProfile, UpdateBusinessProfileDto } from './types';
import { SectorResponse } from '@/services/sectors/types';
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

// General Auth Hook
const login = async (loginData: BusinessLoginDto): Promise<BusinessLoginResponse> => {
  const { data } = await api.post<BusinessLoginResponse>('/auth/login', loginData);
  return data;
};

export const useAuth = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);

      if (data.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'Staff') {
        router.push('/staff/dashboard');
      } else if (data.user.role === 'Business' && !data.user.isOnboarded) {
        router.push('/business/onboard');
      } else if (data.user.role === 'Participant') {
        router.push('/wallet');
      } else {
        router.push('/dashboard');
      }
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
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: [BUSINESS_QUERY_KEY] })
    }

  })
}

// Get Sectors
const getSectors = async (): Promise<SectorResponse[]> => {
  const { data } = await api.get<SectorResponse[]>('/sectors');
  return data;
};

export const useGetSectors = () => {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: getSectors,
  });
};

// Get Categories for a Sector
const getCategories = async (sectorId: string, page = 1, limit = 10): Promise<PaginatedResponse<Category>> => {
  const { data } = await api.get<PaginatedResponse<Category>>(`/sectors/${sectorId}/categories`, {
    params: { page, limit },
  });
  return data;
};

export const useGetCategories = (sectorId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['categories', sectorId, page, limit],
    queryFn: () => getCategories(sectorId, page, limit),
    enabled: !!sectorId, // Only fetch if sectorId is available
  });
};

// Get Subcategories for a Category
const getSubcategories = async (categoryId: string, page = 1, limit = 10): Promise<PaginatedResponse<Subcategory>> => {
  const { data } = await api.get<PaginatedResponse<Subcategory>>(`/categories/${categoryId}/subcategories`, {
    params: { page, limit },
  });
  return data;
};

export const useGetSubcategories = (categoryId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['subcategories', categoryId, page, limit],
    queryFn: () => getSubcategories(categoryId, page, limit),
    enabled: !!categoryId, // Only fetch if categoryId is available
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
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);

      if (!options?.skipRedirect) {
        if (data.user.role === 'Admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'Staff') {
          router.push('/staff/dashboard');
        } else {
          router.push('/dashboard');
        }
      };
    },
  });
};

const BUSINESS_PROFILE_QUERY_KEY = 'businessProfile';

// Get Business Profile
const getBusinessProfile = async (): Promise<BusinessProfile> => {
    const { data } = await api.get<BusinessProfile>('/business/profile');
    return data;
};

export const useGetBusinessProfile = () => {
    return useQuery({
        queryKey: [BUSINESS_PROFILE_QUERY_KEY],
        queryFn: getBusinessProfile,
    });
};

// Update Business Profile
const updateBusinessProfile = async (updateData: UpdateBusinessProfileDto): Promise<BusinessProfile> => {
    const { data } = await api.patch<BusinessProfile>('/business/profile', updateData);
    return data;
};

export const useUpdateBusinessProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBusinessProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BUSINESS_PROFILE_QUERY_KEY] });
        },
    });
};

