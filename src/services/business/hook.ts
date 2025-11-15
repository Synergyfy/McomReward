import api, { setBearerToken } from '../api';
import {  Business,  BusinessLoginDto,  BusinessLoginResponse, BusinessSignUpDto, CreateBusinessDto} from './types';
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
