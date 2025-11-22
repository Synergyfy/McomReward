import { useMutation } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import { AdminLoginDto, AdminLoginResponse, RefreshTokenResponse, ParticipantLoginDto, ParticipantLoginResponse } from './types';
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
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);
    },
  });
};

// Participant Login
const participantSignIn = async (loginData: ParticipantLoginDto): Promise<ParticipantLoginResponse> => {
  const { data } = await api.post<ParticipantLoginResponse>('/participant/login', loginData);
  return data;
};

export const useParticipantLogin = () => {
  return useMutation({
    mutationFn: participantSignIn,
    onSuccess: (data) => {
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);
    },
  });
};

// Refresh Token
const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const refreshTokenValue = Cookies.get('refresh');
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const { data } = await api.post<RefreshTokenResponse>('/auth/refresh', {
    refresh_token: refreshTokenValue,
  });
  return data;
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      // Update tokens in cookies
      Cookies.set('access', data.access_token);
      Cookies.set('refresh', data.refresh_token);
      // Update bearer token for subsequent requests
      setBearerToken(data.access_token);
    },
  });
};
