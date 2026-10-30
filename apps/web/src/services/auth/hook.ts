import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken, removeBearerToken } from '../api';
import { AdminLoginDto, AdminLoginResponse, RefreshTokenResponse, ParticipantLoginDto, ParticipantLoginResponse, VerifyEmailDto, VerifyEmailResponse, ResendOtpDto } from './types';
import { clearAuthCookies, getRefreshToken, setAuthTokens } from '@/lib/auth-cookies';

// Helper to remove tokens
const removeTokens = () => {
  clearAuthCookies();
  localStorage.removeItem('authToken'); // Assuming this was also a token storage
  localStorage.removeItem('user');
  localStorage.removeItem('mcom_central_business_profile');
  sessionStorage.clear(); // Clear any session storage
  removeBearerToken(); // Clear bearer token from API instance
};

const storeCentralBusinessProfile = (data: any) => {
  if (typeof window === 'undefined') return;
  const businessProfile = data?.user?.businessProfile;
  const user = data?.user ?? (
    data?.userId || data?.name || data?.role
      ? { id: data.userId, name: data.name, role: data.role }
      : null
  );
  if (businessProfile) {
    localStorage.setItem('mcom_central_business_profile', JSON.stringify(businessProfile));
  } else {
    localStorage.removeItem('mcom_central_business_profile');
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Admin Login
const adminSignIn = async (loginData: AdminLoginDto): Promise<AdminLoginResponse> => {
  const { data } = await api.post<AdminLoginResponse>('/auth/admin/login', loginData);
  return data;
};

export const useAdminSignIn = () => {
  return useMutation({
    mutationFn: adminSignIn,
    onSuccess: (data) => {
      const accessToken = data.accessToken || data.access_token;
      const refreshToken = data.refreshToken || data.refresh_token;
      if (accessToken) {
        setAuthTokens(accessToken, refreshToken);
        setBearerToken(accessToken);
        localStorage.setItem('authToken', accessToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
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
      setAuthTokens(data.accessToken, data.refreshToken);
      setBearerToken(data.accessToken);
    },
  });
};

// Refresh Token
const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const { data } = await api.post<RefreshTokenResponse>('/auth/refresh-token', {
    refreshToken: refreshTokenValue,
  });
  return data;
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      const accessToken = data.accessToken || data.access_token || '';
      const refreshTokenValue = data.refreshToken || data.refresh_token || '';
      // Update tokens in cookies
      setAuthTokens(accessToken, refreshTokenValue);
      // Update bearer token for subsequent requests
      setBearerToken(accessToken);
    },
  });
};

// Logout
const logout = async (): Promise<void> => {
  const refreshTokenValue = getRefreshToken();
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
      setAuthTokens(data.accessToken, data.refreshToken);
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

// SSO Login (shared-secret token flow)
const ssoLogin = async (token: string): Promise<any> => {
  const { data } = await api.post('/sso/login', { token });
  return data;
};

export const useSsoLogin = () => {
  return useMutation({
    mutationFn: ssoLogin,
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setBearerToken(data.accessToken);
      storeCentralBusinessProfile(data);
    },
  });
};

// SSO Exchange (OAuth2 code flow)
const ssoExchange = async (params: string | { code: string; redirectUri?: string }): Promise<any> => {
  const code = typeof params === 'string' ? params : params.code;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3005');
  const redirectUri = typeof params === 'object' && params.redirectUri ? params.redirectUri : `${appUrl}/auth/callback`;
  const { data } = await api.post('/sso/exchange', { code, redirectUri });
  return data;
};

export const useSsoExchange = () => {
  return useMutation({
    mutationFn: ssoExchange,
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      setBearerToken(data.accessToken);
      storeCentralBusinessProfile(data);
    },
  });
};
