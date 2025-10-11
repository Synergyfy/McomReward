import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import { Business, CreateBusinessDto, BusinessLoginDto, BusinessLoginResponse } from './types';
import Cookies from 'js-cookie';

const BUSINESS_QUERY_KEY = 'business';

// Business Sign-up
const businessSignUp = async (signUpData: CreateBusinessDto): Promise<Business> => {
  const { data } = await api.post<Business>('/business/signup', signUpData);
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

// Business Login
const businessSignIn = async (loginData: BusinessLoginDto): Promise<BusinessLoginResponse> => {
  const { data } = await api.post<BusinessLoginResponse>('/auth/login', loginData);
  return data;
};

export const useBusinessSignIn = () => {
  return useMutation({
    mutationFn: businessSignIn,
    onSuccess: (data) => {
      Cookies.set('access', data.access_token);
      Cookies.set('refresh', data.refresh_token);
      setBearerToken(data.access_token);
    },
  });
};
