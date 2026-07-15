import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _skipAuthRedirect?: boolean;
  }
}

export const baseURL =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcom-reward-api-one.vercel.app/api/v1')
    : '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bypass SSO flag — set early so the response interceptor can check it
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BYPASS_SSO === 'true') {
  localStorage.setItem('mcom_bypass_sso', 'true');
}

// This function sets the bearer token for all subsequent API requests.
export const setBearerToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// This function removes the bearer token
export const removeBearerToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Variable to store the impersonation ID
let impersonationBusinessId: string | null = null;
let impersonationParticipantId: string | null = null;

// Functions to handle business impersonation
export const setBusinessRequest = (businessId: string) => {
  impersonationBusinessId = businessId;
  // Also set it in defaults as a backup, but the interceptor is primary
  api.defaults.headers.common['x-business-id'] = businessId;
};

export const clearBusinessRequest = () => {
  impersonationBusinessId = null;
  delete api.defaults.headers.common['x-business-id'];
};

// Functions to handle participant impersonation
export const setParticipantRequest = (participantId: string) => {
  impersonationParticipantId = participantId;
  api.defaults.headers.common['x-participant-id'] = participantId;
};

export const clearParticipantRequest = () => {
  impersonationParticipantId = null;
  delete api.defaults.headers.common['x-participant-id'];
};

// Request interceptor to attach auth token and impersonation headers on every request
api.interceptors.request.use((config) => {
  // Read auth token from cookie fresh on every request
  // This is robust against module re-evaluation (SSR, HMR, page navigation)
  if (typeof window !== 'undefined') {
    const token = Cookies.get('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // If we have an active impersonation ID in memory, attach it.
  if (impersonationBusinessId) {
    config.headers['x-business-id'] = impersonationBusinessId;
  }
  else if (impersonationParticipantId) {
    config.headers['x-participant-id'] = impersonationParticipantId;
  }
  // Fallback: Check localStorage if memory is empty (e.g. after hard refresh)
  // This is crucial because memory variables are lost on refresh, but localStorage survives.
  else if (typeof window !== 'undefined') {
      try {
        const storedBusiness = localStorage.getItem('impersonation_state');
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness);
            if (parsed.isImpersonating && parsed.businessId) {
                config.headers['x-business-id'] = parsed.businessId;
                // Sync back to memory
                impersonationBusinessId = parsed.businessId;
            }
        }
        
        const storedParticipant = localStorage.getItem('impersonation_participant_state');
        if (storedParticipant) {
            const parsed = JSON.parse(storedParticipant);
            if (parsed.isImpersonating && parsed.participantId) {
                config.headers['x-participant-id'] = parsed.participantId;
                // Sync back to memory
                impersonationParticipantId = parsed.participantId;
            }
        }
      } catch (e) {
        // ignore parsing errors
      }
  }
  return config;
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isLoginRequest = originalRequest?.url?.includes('/login') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/participant/login') ||
      originalRequest?.url?.includes('/admin/login');

    // If error is 401, not a login request, and we haven't tried to refresh yet
    if (error.response?.status === 401 && !isLoginRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = Cookies.get('refresh');

      if (!refreshTokenValue) {
        // No refresh token, clear everything
        Cookies.remove('access', { path: '/' });
        Cookies.remove('refresh', { path: '/' });
        removeBearerToken();
        processQueue(error, null);
        isRefreshing = false;

        // Skip redirect in bypass mode
        const isBypassSso = typeof window !== 'undefined' && localStorage.getItem('mcom_bypass_sso') === 'true';
        if (!isBypassSso) {
          // Redirect to login page if in browser AND not skipping auth redirect AND not already on login page
          const isAlreadyOnLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');
          if (typeof window !== 'undefined' && !originalRequest._skipAuthRedirect && !isAlreadyOnLoginPage) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refreshToken: refreshTokenValue },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const accessToken = response.data.accessToken || response.data.access_token;
        const refreshToken = response.data.refreshToken || response.data.refresh_token;

        // Update tokens in cookies
        Cookies.set('access', accessToken, { path: '/' });
        Cookies.set('refresh', refreshToken, { path: '/' });

        // Update bearer token
        setBearerToken(accessToken);

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything
        Cookies.remove('access', { path: '/' });
        Cookies.remove('refresh', { path: '/' });
        removeBearerToken();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        // Skip redirect in bypass mode
        const isBypassSsoRefresh = typeof window !== 'undefined' && localStorage.getItem('mcom_bypass_sso') === 'true';
        if (!isBypassSsoRefresh) {
          // Redirect to login page if in browser AND not skipping auth redirect AND not already on login page
          const isAlreadyOnLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');
          if (typeof window !== 'undefined' && !originalRequest._skipAuthRedirect && !isAlreadyOnLoginPage) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

