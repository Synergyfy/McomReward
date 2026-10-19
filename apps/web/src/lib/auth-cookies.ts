import Cookies from 'js-cookie';

/**
 * Centralized auth cookie helpers.
 *
 * Auth cookies used to be written without an `expires` attribute, which makes
 * them *session* cookies: the browser throws them away as soon as the
 * browsing session ends (closing the browser / last window, mobile tab
 * eviction, etc.). Everything now carries an explicit lifetime so the 7-day
 * refresh token actually survives.
 *
 * The names are prefixed per app because cookies are scoped by host, not by
 * port. The mall, mall admin and rewards frontends all run on `localhost`
 * during development, so a generic `access`/`refresh` cookie is overwritten by
 * whichever app was used last. Each app's JWT is signed with its own secret,
 * so the other app would then 401 and clear the shared cookie, logging the
 * first app out.
 */

export const ACCESS_TOKEN_COOKIE = 'mcom_rewards_access';
export const REFRESH_TOKEN_COOKIE = 'mcom_rewards_refresh';
export const SSO_STATE_COOKIE = 'mcom_rewards_sso_state';

/**
 * Cookie lifetime in days. The access JWT itself still expires in 1h; keeping
 * the cookie around for longer lets the API client observe a 401 and refresh
 * it instead of losing the session.
 */
export const ACCESS_COOKIE_DAYS = 7;
export const REFRESH_COOKIE_DAYS = 7;

const isSecureContext = () =>
  typeof window !== 'undefined' && window.location.protocol === 'https:';

const cookieOptions = (days: number): Cookies.CookieAttributes => ({
  path: '/',
  sameSite: 'lax',
  secure: isSecureContext(),
  expires: days,
});

/** Persist the access and/or refresh token in the browser. */
export function setAuthTokens(
  accessToken?: string | null,
  refreshToken?: string | null,
): void {
  if (typeof window === 'undefined') return;

  if (accessToken) {
    Cookies.set(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      cookieOptions(ACCESS_COOKIE_DAYS),
    );
  }

  if (refreshToken) {
    Cookies.set(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      cookieOptions(REFRESH_COOKIE_DAYS),
    );
  }
}

/** Persist only the access token (used when the refresh token is unchanged). */
export function setAccessToken(accessToken?: string | null): void {
  if (typeof window === 'undefined' || !accessToken) return;
  Cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    cookieOptions(ACCESS_COOKIE_DAYS),
  );
}

/**
 * Read a cookie, preferring the last matching entry. `document.cookie` lists
 * the most specific path first, so older path-scoped duplicates (written
 * before cookies used `path: '/'`) shadow the root cookie with `Cookies.get`.
 */
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const prefix = `${name}=`;
  const matches = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .filter((entry) => entry.startsWith(prefix));

  if (matches.length === 0) return undefined;

  const raw = matches[matches.length - 1].slice(prefix.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function getAccessToken(): string | undefined {
  return readCookie(ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(): string | undefined {
  return readCookie(REFRESH_TOKEN_COOKIE);
}

/** True when either an access or a refresh token is present. */
export function hasAuthSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

/** Persist the OAuth CSRF state for the current SSO attempt. */
export function setSsoState(state: string): void {
  Cookies.set(SSO_STATE_COOKIE, state, cookieOptions(1 / 144));
}

export function getSsoState(): string | undefined {
  return readCookie(SSO_STATE_COOKIE);
}

export function clearSsoState(): void {
  Cookies.remove(SSO_STATE_COOKIE, { path: '/' });
}

/** Remove only this app's auth cookies; other MCOM apps use their own names. */
export function clearAuthCookies(): void {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
}

/**
 * Decode a JWT payload without verifying the signature. Used only to decide
 * whether the access token should be refreshed proactively.
 */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Whether the stored access token is missing or within `skewSeconds` of
 * expiring. Tokens without an `exp` claim are treated as valid.
 */
export function isAccessTokenExpired(
  token?: string | null,
  skewSeconds = 30,
): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
