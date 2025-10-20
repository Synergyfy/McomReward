import { useMutation } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import { AdminLoginDto, AdminLoginResponse } from './types';
import Cookies from 'js-cookie';

// Admin Login
const adminSignIn = async (loginData: AdminLoginDto): Promise<AdminLoginResponse> => {
  const { data } = await api.post<AdminLoginResponse>('/admin/login', loginData);
  return data;
};

export const useAdminSignIn = () => {
  return useMutation({
    mutationFn: adminSignIn,
    onSuccess: (data) => {
      console.log('access', data.accessToken);
      Cookies.set('access', data.accessToken);
      setBearerToken(data.accessToken);
    },
  });
};
