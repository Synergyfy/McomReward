import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosRequestConfig } from "axios";
import {
  DEFAULT_SERVICE_TOKEN_TTL_SECONDS,
  ECOSYSTEM_SERVICES_CACHE_TTL_MS,
  SERVICE_TOKEN_SAFETY_MARGIN_MS,
} from "../constants";

export interface EcosystemServiceEntry {
  clientId: string;
  name: string;
  platformSlug: string | null;
  baseUrl: string | null;
  appUrl: string | null;
  scopes: string[];
  /** Ingress policy — peers permitted to call this app. Empty = deny all; `*` = any. */
  allowedCallers: string[];
  isSystemApp: boolean;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

/**
 * Outbound half of the ecosystem service mesh.
 *
 * - `getServiceToken` mints/caches short-lived RS256 tokens via Central.
 * - `callPeer` performs DIRECT peer-to-peer HTTP (never transits MCOM).
 * - `listEcosystemServices` caches the public registry for peer discovery.
 */
@Injectable()
export class ServiceMeshService {
  private readonly logger = new Logger(ServiceMeshService.name);
  private readonly tokenCache = new Map<string, CachedToken>();
  private servicesCache: {
    data: EcosystemServiceEntry[];
    expiresAt: number;
  } | null = null;

  constructor(private readonly configService: ConfigService) {}

  getSolutionsUrl(): string {
    const url =
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      this.configService.get<string>("MCOM_CENTRAL_BASE_URL") ||
      "http://localhost:3010";
    return url.replace(/\/$/, "");
  }

  getClientId(): string {
    return this.configService.get<string>("MCOM_CLIENT_ID") || "mcom-rewards";
  }

  private getClientSecret(): string {
    return this.configService.get<string>("MCOM_CLIENT_SECRET") || "";
  }

  getServiceBaseUrl(): string {
    return (
      this.configService.get<string>("MCOM_SERVICE_BASE_URL") || ""
    ).replace(/\/$/, "");
  }

  getConfiguredScopes(): string[] {
    return (this.configService.get<string>("MCOM_SERVICE_SCOPES") || "")
      .split(/\s+/)
      .filter(Boolean);
  }

  /** OIDC-style discovery document from Central. */
  async getDiscovery(): Promise<any> {
    const { data } = await axios.get(
      `${this.getSolutionsUrl()}/api/v1/ecosystem/discovery`,
      { timeout: 5000 },
    );
    return data;
  }

  /** Cached public service registry. Never on the request hot path. */
  async listEcosystemServices(
    forceRefresh = false,
  ): Promise<EcosystemServiceEntry[]> {
    if (
      !forceRefresh &&
      this.servicesCache &&
      this.servicesCache.expiresAt > Date.now()
    ) {
      return this.servicesCache.data;
    }

    try {
      const { data } = await axios.get(
        `${this.getSolutionsUrl()}/api/v1/ecosystem/services`,
        { timeout: 5000 },
      );
      const list: EcosystemServiceEntry[] = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      this.servicesCache = {
        data: list,
        expiresAt: Date.now() + ECOSYSTEM_SERVICES_CACHE_TTL_MS,
      };
      return list;
    } catch (err) {
      this.logger.warn(
        `Failed to refresh ecosystem services: ${(err as Error).message}`,
      );
      return this.servicesCache?.data ?? [];
    }
  }

  async findService(
    clientIdOrSlug: string,
  ): Promise<EcosystemServiceEntry | null> {
    const list = await this.listEcosystemServices();
    return (
      list.find(
        (s) =>
          s.clientId === clientIdOrSlug || s.platformSlug === clientIdOrSlug,
      ) ?? null
    );
  }

  /**
   * Mint (or return a cached) client_credentials service token for a peer.
   * Tokens are cached until 60s before expiry.
   */
  async getServiceToken(audience: string, scope?: string): Promise<string> {
    const scopeKey = scope ?? this.getConfiguredScopes().join(" ");
    const cacheKey = `${audience}:${scopeKey}`;

    const cached = this.tokenCache.get(cacheKey);
    if (
      cached &&
      cached.expiresAt > Date.now() + SERVICE_TOKEN_SAFETY_MARGIN_MS
    ) {
      return cached.token;
    }

    const basicAuth = Buffer.from(
      `${this.getClientId()}:${this.getClientSecret()}`,
    ).toString("base64");

    const { data } = await axios.post(
      `${this.getSolutionsUrl()}/api/v1/auth/service-token`,
      {
        grant_type: "client_credentials",
        audience,
        scope: scope || undefined,
      },
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      },
    );

    const token: string | undefined = data?.access_token;
    if (!token) {
      throw new Error("MCOM Central did not return an access_token");
    }

    const ttl = Number(data?.expires_in) || DEFAULT_SERVICE_TOKEN_TTL_SECONDS;
    this.tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + ttl * 1000,
    });
    return token;
  }

  /**
   * RFC 8693 token exchange — turn a user's SSO access token into a delegated
   * service token bound to the target audience (carries `act.sub`).
   */
  async getDelegatedServiceToken(
    subjectToken: string,
    audience: string,
    scope?: string,
  ): Promise<string> {
    const basicAuth = Buffer.from(
      `${this.getClientId()}:${this.getClientSecret()}`,
    ).toString("base64");

    const { data } = await axios.post(
      `${this.getSolutionsUrl()}/api/v1/auth/service-token/exchange`,
      {
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token: subjectToken,
        audience,
        scope,
      },
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      },
    );

    const token: string | undefined = data?.access_token;
    if (!token) {
      throw new Error("MCOM Central did not return a delegated access_token");
    }
    return token;
  }

  /** @deprecated Use {@link getDelegatedServiceToken}. Kept for SSO callers. */
  getDelegatedUserToken(
    subjectToken: string,
    audience: string,
    scope?: string,
  ): Promise<string> {
    return this.getDelegatedServiceToken(subjectToken, audience, scope);
  }

  /**
   * Call a peer application DIRECTLY (bypassing MCOM Central).
   * @param peerBaseUrl Base URL of the target peer.
   * @param targetAudience Target peer clientId (e.g. "mcom-mall").
   * @param path Request path (e.g. "/api/v1/points/balance").
   * @param options Extra axios request options (method, data, …).
   * @param scope Service scope to request when minting the token.
   */
  async callPeer<T = any>(
    peerBaseUrl: string,
    targetAudience: string,
    path: string,
    options: AxiosRequestConfig = {},
    scope?: string,
  ): Promise<T> {
    const token = await this.getServiceToken(targetAudience, scope);
    const url = `${peerBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

    const response = await axios({
      ...options,
      url,
      headers: {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
        // Observability only — the receiver derives the caller from the token.
        "X-Caller-Id": this.getClientId(),
      },
    });

    return response.data as T;
  }

  /**
   * Resolve a peer's base URL from the ecosystem registry and call it DIRECTLY.
   * Convenience wrapper around {@link callPeer} for event/notification pushes.
   */
  async callPeerByClientId<T = any>(
    targetClientId: string,
    path: string,
    options: AxiosRequestConfig = {},
    scope?: string,
  ): Promise<T> {
    const service = await this.findService(targetClientId);
    const base = service?.baseUrl || service?.appUrl;
    if (!base) {
      throw new Error(
        `No registered base URL for peer "${targetClientId}" in the ecosystem registry`,
      );
    }
    return this.callPeer<T>(base, targetClientId, path, options, scope);
  }
}
