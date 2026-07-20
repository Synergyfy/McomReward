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
  packages: CentralPackage[];
}

@Injectable()
export class McomCentralService {
  private readonly baseUrl: string;
  private readonly serviceId: string;
  private readonly apiSecret: string;
  private readonly internalServiceId: string;
  private readonly internalApiSecret: string;
  private readonly logger = new Logger(McomCentralService.name);

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      "MCOM_CENTRAL_BASE_URL",
      "http://localhost:3010"
    );
    this.serviceId = this.configService.get<string>(
      "SSO_CLIENT_ID",
      "mcom-loyalty"
    );
    this.apiSecret = this.configService.get<string>(
      "SSO_API_SECRET",
      "mcom_loyalty_dev_secret_change_in_prod"
    );
    this.internalServiceId = this.configService.get<string>(
      "INTERNAL_SERVICE_ID",
      "mcom-rewards"
    );
    this.internalApiSecret = this.configService.get<string>(
      "INTERNAL_SERVICE_SECRET",
      "mcom_rewards_dev_secret_change_in_prod"
    );
  }

  private getHmacHeaders(customServiceId?: string, customApiSecret?: string): Record<string, string> {
    const sId = customServiceId || this.serviceId;
    const secret = customApiSecret || this.apiSecret;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${sId}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex");

    return {
      "X-Service-Id": sId,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Content-Type": "application/json",
    };
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {
    const clientId = this.configService.get<string>(
      "SSO_CLIENT_ID",
      "mcom-loyalty"
    );
    const clientSecret = this.configService.get<string>(
      "SSO_CLIENT_SECRET",
      "loyalty_secret_123"
    );

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const response = await fetch(`${this.baseUrl}/api/v1/auth/sso/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        client_id: clientId,
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

  async getUserInfo(accessToken: string): Promise<CentralUserInfo | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/sso/userinfo`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...this.getHmacHeaders(),
          },
        }
      );

      if (!response.ok) {
        this.logger.warn(
          `Failed to get user info from MCOM Central: ${response.status}`
        );
        return null;
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
