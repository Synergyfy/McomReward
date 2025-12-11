import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken, removeBearerToken } from '../api';
import { AdminLoginDto, AdminLoginResponse, RefreshTokenResponse, ParticipantLoginDto, ParticipantLoginResponse, VerifyEmailDto, VerifyEmailResponse, ResendOtpDto } from './types';
import Cookies from 'js-cookie';

// Helper to remove tokens
const removeTokens = () => {
  Cookies.remove('access');
  Cookies.remove('refresh');
  localStorage.removeItem('authToken'); // Assuming this was also a token storage
  sessionStorage.clear(); // Clear any session storage
  removeBearerToken(); // Clear bearer token from API instance
};

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

// Logout
const logout = async (): Promise<void> => {
  const refreshTokenValue = Cookies.get('refresh');
  if (refreshTokenValue) {
    // Attempt to invalidate token on the server
    try {
      await api.post('/auth/logout', { refresh_token: refreshTokenValue });
    } catch (error) {
      console.error('Server-side logout failed:', error);
      // Continue with client-side logout even if server-side fails
    }
  }
  removeTokens();
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear(); // Clear all react-query cache
    },
    onError: (error) => {
      console.error('Logout mutation failed, performing client-side logout:', error);
      removeTokens(); // Ensure tokens are removed even if mutation errors out
    }
  });
};

// Verify Email
const verifyEmail = async (data: VerifyEmailDto): Promise<VerifyEmailResponse> => {
  const { data: responseData } = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
  return responseData;
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      // Update tokens in cookies
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      // Update bearer token for subsequent requests
      setBearerToken(data.accessToken);
    },
  });
};

// Resend OTP
const resendOtp = async (data: ResendOtpDto): Promise<string> => {
  const { data: responseData } = await api.post('/auth/resend-otp', data);
  return responseData;
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp,
  });
};
