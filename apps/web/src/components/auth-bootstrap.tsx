'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { refreshAuthTokens } from '@/services/api';
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
} from '@/lib/auth-cookies';

const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/staff', '/participant'];

/**
 * Restores the session when the page is reopened after the 1h access token has
 * expired. The refresh token now persists across browser sessions, so we can
 * silently exchange it for a fresh access token instead of waiting for the
 * first API call to fail.
 */
export function AuthBootstrap() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      // Bypass mode intentionally disables all auth.
      if (process.env.NEXT_PUBLIC_BYPASS_SSO === 'true') return;

      const refreshToken = getRefreshToken();
      if (!refreshToken) return;

      const accessToken = getAccessToken();
      if (accessToken && !isAccessTokenExpired(accessToken)) return;

      try {
        await refreshAuthTokens();
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        const isAuthError = status === 400 || status === 401 || status === 403;

        // Transient failures (offline, API restart, 5xx) keep the session
        // intact so the next request can retry the refresh.
        if (!isAuthError) return;

        clearAuthCookies();

        if (cancelled) return;

        const isProtectedRoute = PROTECTED_PREFIXES.some(
          (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
        );

        if (isProtectedRoute && !pathname?.includes('/login')) {
          router.replace('/login');
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
