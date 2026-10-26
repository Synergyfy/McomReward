import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '@/lib/auth-cookies';
import { isLocalBusinessPreviewEnabled } from '@/lib/local-business-preview';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _skipAuthRedirect?: boolean;
  }
}

export const baseURL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api/v1'
).replace(/\/$/, '');

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
    const token = getAccessToken();
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

// Single-flight refresh so the boot-time check and concurrent 401s share one
// refresh request instead of racing each other.
let refreshPromise: Promise<string> | null = null;

export const refreshAuthTokens = async (): Promise<string> => {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
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

        if (!accessToken) {
          throw new Error('Refresh response did not include an access token');
        }

        // If the session was cleared (e.g. logout) while this request was in
        // flight, do not resurrect it.
        if (!getRefreshToken()) {
          throw new Error('Session cleared during refresh');
        }

        setAuthTokens(accessToken, refreshToken);
        setBearerToken(accessToken);

        return accessToken as string;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

/** Redirect to login unless in bypass mode, already there, or opted out. */
const redirectToLogin = (originalRequest: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return;
  // Local business preview is UI-only; allow protected data requests to fail
  // without turning the preview into an authentication or payment bypass.
  if (isLocalBusinessPreviewEnabled()) return;

  const isBypassSso = localStorage.getItem('mcom_bypass_sso') === 'true';
  const isAlreadyOnLoginPage = window.location.pathname.includes('/login');

  if (!isBypassSso && !originalRequest._skipAuthRedirect && !isAlreadyOnLoginPage) {
    window.location.href = '/login';
  }
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isLoginRequest = originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/participant/login') ||
      originalRequest.url?.includes('/admin/login');

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

      if (!getRefreshToken()) {
        // No refresh token, clear everything
        clearAuthCookies();
        removeBearerToken();
        processQueue(error, null);
        isRefreshing = false;
        redirectToLogin(originalRequest);

        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const accessToken = await refreshAuthTokens();

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        const status = (refreshError as AxiosError)?.response?.status;
        // Only discard the session when the refresh token itself is rejected.
        // Network errors, API restarts and 5xx responses must not log the user
        // out; the next request can try to refresh again.
        const isAuthError = status === 400 || status === 401 || status === 403;

        if (isAuthError) {
          clearAuthCookies();
          removeBearerToken();
        }

        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        if (isAuthError) {
          redirectToLogin(originalRequest);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

