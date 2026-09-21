/**
 * Centralized SSO Redirection Utilities for MCOM Ecosystem
 */

export function getCentralCustomerSignupUrl(returnPath: string = "/auth/sso"): string {
  const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "http://localhost:3010";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");
  const callbackUrl = `${appUrl}${returnPath.startsWith("/") ? returnPath : `/${returnPath}`}`;
  const clientId = process.env.NEXT_PUBLIC_MCOM_CLIENT_ID || process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "mcom-rewards";

  const params = new URLSearchParams({
    client_id: clientId,
    source: "rewards",
    redirect_uri: callbackUrl,
    redirect: callbackUrl,
  });

  return `${solutionsUrl}/register/customer?${params.toString()}`;
}

export function getCentralBusinessSignupUrl(returnPath: string = "/auth/sso"): string {
  const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "http://localhost:3010";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");
  const callbackUrl = `${appUrl}${returnPath.startsWith("/") ? returnPath : `/${returnPath}`}`;
  const clientId = process.env.NEXT_PUBLIC_MCOM_CLIENT_ID || process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "mcom-rewards";

  const params = new URLSearchParams({
    client_id: clientId,
    source: "rewards",
    redirect_uri: callbackUrl,
    redirect: callbackUrl,
  });

  return `${solutionsUrl}/getstarted/business?${params.toString()}`;
}

export function getCentralLoginUrl(returnPath: string = "/auth/callback", state?: string): string {
  const solutionsUrl = (process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "http://localhost:3010").replace(/\/$/, "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");
  const callbackUrl = process.env.NEXT_PUBLIC_MCOM_REDIRECT_URI || `${appUrl}${returnPath.startsWith("/") ? returnPath : `/${returnPath}`}`;
  const clientId = process.env.NEXT_PUBLIC_MCOM_CLIENT_ID || "mcom-rewards";
  const scopes = process.env.NEXT_PUBLIC_MCOM_SCOPES || "profile email business packages membership";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: scopes,
  });

  if (state) {
    params.append("state", state);
  }

  return `${solutionsUrl}/api/v1/auth/sso/authorize?${params.toString()}`;
}
