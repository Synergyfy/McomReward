import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _skipAuthRedirect?: boolean;
  }
}

export const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window === 'undefined'
    ? 'https://mcom-loyalty-api.vercel.app/api/v1'
    : '/api/v1');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This function sets the bearer token for all subsequent API requests.
export const setBearerToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// This function removes the bearer token
export const removeBearerToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Initialize the token from cookies when the application loads
const initialToken = Cookies.get('access');
if (initialToken) {
  setBearerToken(initialToken);
}

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

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        Cookies.remove('access');
        Cookies.remove('refresh');
        removeBearerToken();
        processQueue(error, null);
        isRefreshing = false;

        // Redirect to login page if in browser AND not skipping auth redirect
        if (typeof window !== 'undefined' && !originalRequest._skipAuthRedirect) {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken: refreshTokenValue },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { access_token, refresh_token } = response.data;

        // Update tokens in cookies
        Cookies.set('access', access_token);
        Cookies.set('refresh', refresh_token);

        // Update bearer token
        setBearerToken(access_token);

        // Process queued requests
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything
        Cookies.remove('access');
        Cookies.remove('refresh');
        removeBearerToken();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        // Redirect to login page if in browser AND not skipping auth redirect
        if (typeof window !== 'undefined' && !originalRequest._skipAuthRedirect) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
