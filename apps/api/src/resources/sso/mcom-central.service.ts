import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export interface CentralPackage {
  platform: string;
  packageName: string;
  planName: string;
  status: "active" | "inactive" | "expired";
  limits: Record<string, number>;
  expiresAt: string;
  provider: string;
  providerSubscriptionId: string;
}

export interface CentralUserInfo {
  sub: string;
  email: string;
  name: string;
  role?: string;
  packages?: CentralPackage[];
  membershipLevel?: string;
  membershipTier?: string;
  membershipStatus?: string;
}

@Injectable()
export class McomCentralService {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly hmacSecret: string;
  private readonly internalServiceId: string;
  private readonly internalApiSecret: string;
  private readonly logger = new Logger(McomCentralService.name);

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      this.configService.get<string>("MCOM_CENTRAL_BASE_URL") ||
      "http://localhost:3010"
    ).replace(/\/$/, "");

    this.clientId =
      this.configService.get<string>("MCOM_CLIENT_ID") ||
      this.configService.get<string>("SSO_CLIENT_ID") ||
      "mcom-rewards";

    this.clientSecret =
      this.configService.get<string>("MCOM_CLIENT_SECRET") ||
      this.configService.get<string>("SSO_CLIENT_SECRET") ||
      "cs_ec63957d787b758514e4bd3decc22dd6fd010620dc7f9c2932ac8d84b0f20201";

    this.hmacSecret =
      this.configService.get<string>("MCOM_HMAC_SECRET") ||
      this.configService.get<string>("SSO_API_SECRET") ||
      "hm_3033b6a3f741f50b0ed3da462ccde80f9eb6447e3d879a6ba95e9be26d90ae55";

    this.internalServiceId = this.configService.get<string>(
      "INTERNAL_SERVICE_ID",
      "mcom-rewards"
    );
    this.internalApiSecret = this.configService.get<string>(
      "INTERNAL_SERVICE_SECRET",
      "hm_3033b6a3f741f50b0ed3da462ccde80f9eb6447e3d879a6ba95e9be26d90ae55"
    );
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getClientId(): string {
    return this.clientId;
  }

  getHmacHeaders(customServiceId?: string, customApiSecret?: string): Record<string, string> {
    const serviceId = customServiceId || this.clientId;
    const secret = customApiSecret || this.hmacSecret;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${serviceId}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex");

    return {
      "X-Service-Id": serviceId,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Content-Type": "application/json",
    };
  }

  getAuthorizeUrl(state: string, redirectUri?: string): string {
    const defaultRedirect =
      this.configService.get<string>("MCOM_REDIRECT_URI") ||
      `${this.configService.get<string>("LOYALTY_FRONTEND_URL", "http://localhost:3005")}/auth/callback`;

    const scopes =
      this.configService.get<string>("MCOM_SCOPES") ||
      "profile email business packages membership";

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri || defaultRedirect,
      scope: scopes,
      state,
      response_type: "code",
    });

    return `${this.baseUrl}/api/v1/auth/sso/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {
    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const response = await fetch(`${this.baseUrl}/api/v1/auth/sso/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        client_id: this.clientId,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Token exchange failed: ${response.status} ${errorText}`
      );
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const response = await fetch(`${this.baseUrl}/api/v1/auth/sso/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Token refresh failed: ${response.status} ${errorText}`);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token || refreshToken,
      expiresIn: data.expiresIn || data.expires_in || 3600,
    };
  }

  async getUserMembership(
    userIdOrParams: string | { userId?: string; email?: string }
  ): Promise<any> {
    let query = "";
    if (typeof userIdOrParams === "string") {
      query = `userId=${encodeURIComponent(userIdOrParams)}`;
    } else {
      query = userIdOrParams.email
        ? `email=${encodeURIComponent(userIdOrParams.email)}`
        : `userId=${encodeURIComponent(userIdOrParams.userId || "")}`;
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/data/user?${query}`,
      {
        method: "GET",
        headers: this.getHmacHeaders(
          this.internalServiceId,
          this.internalApiSecret
        ),
      }
    );

    if (!response.ok) {
      this.logger.warn(`Failed to get user membership: ${response.status}`);
      return null;
    }

    return response.json();
  }

  async fetchUserPermissions(mcomUserId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/user/${mcomUserId}/permissions`,
        {
          method: "GET",
          headers: this.getHmacHeaders(),
        }
      );

      if (!response.ok) {
        this.logger.warn(`Failed to get user permissions: ${response.status}`);
        return null;
      }

      const res = await response.json();
      return res.data || res;
    } catch (error) {
      this.logger.error(`Error fetching user permissions: ${error?.message}`);
      return null;
    }
  }

  async getUserInfo(accessToken: string): Promise<CentralUserInfo | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/auth/sso/userinfo`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...this.getHmacHeaders(),
          },
        }
      );

      if (!response.ok) {
        // Fallback to /api/v1/sso/userinfo
        const fallbackRes = await fetch(
          `${this.baseUrl}/api/v1/sso/userinfo`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ...this.getHmacHeaders(),
            },
          }
        );

        if (!fallbackRes.ok) {
          this.logger.warn(
            `Failed to get user info from MCOM Central: ${fallbackRes.status}`
          );
          return null;
        }

        return fallbackRes.json();
      }

      return response.json();
    } catch (error) {
      this.logger.error(
        `Error fetching user info from MCOM Central: ${error?.message}`,
        error?.stack
      );
      return null;
    }
  }
}
