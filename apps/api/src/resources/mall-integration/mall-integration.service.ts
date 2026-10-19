import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { ServiceMeshService } from "../service-mesh/services/service-mesh.service";
import {
  DEFAULT_MALL_CLIENT_ID,
  SERVICE_SCOPE_MALL_READ,
  SERVICE_SCOPE_MALL_WRITE,
} from "../service-mesh/constants";

/** Mall product row returned by the partner catalogue. */
export interface MallCatalogProduct {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  productType: string | null;
  status: string | null;
  image: string | null;
}

/** Mall service row returned by the partner catalogue. */
export interface MallCatalogService {
  id: string;
  name: string;
  category: string | null;
  pricingModel: string;
  fixedPrice: number | null;
  basePrice: number | null;
  status: string | null;
  image: string | null;
}

export interface MallCatalogBusiness {
  business: {
    id: string;
    name: string;
    email: string | null;
    mcomUserId: string | null;
  };
  products: MallCatalogProduct[];
  services: MallCatalogService[];
}

/** Normalised instrument handle returned by mall. */
export interface MallInstrument {
  type: "voucher" | "gift_card" | "coupon";
  id: string;
  code: string;
}

export interface CreateInstrumentPayload {
  amount: number;
  recipientEmail: string;
  recipientName?: string;
  message?: string;
  businessName: string;
  /** Rewards-generated code so both apps show one code. */
  code?: string;
  /** Coupons only; vouchers/gift cards default to +1 year. */
  expiresAt?: string;
}

/**
 * MCOM Mall partner client.
 *
 * Reward-instrument creation and catalogue reads now run over the zero-hop
 * service mesh (`POST /api/v1/partner/instruments/*`, `GET /api/v1/partner/catalog/*`)
 * with a short-lived RS256 service token — there is no shared API key or IP
 * allowlist between the apps (handbook v3 §5, §13).
 *
 * SSO handoff and the mall plan/tier listing are NOT part of the rewards/mall
 * partner contract and remain on their legacy transport.
 */
@Injectable()
export class MallIntegrationService {
  private readonly logger = new Logger(MallIntegrationService.name);
  private mallApiUrl: string;
  private apiKey: string;
  private ssoSecret: string;
  private mallFrontendUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private serviceMesh: ServiceMeshService,
  ) {
    this.mallApiUrl =
      this.configService.get<string>("MALL_API_URL") || "http://localhost:3001"; // Default fallback
    this.apiKey = this.configService.get<string>("MALL_API_KEY") || "";
    this.ssoSecret = this.configService.get<string>("SSO_SECRET") || "";

    if (
      process.env.NODE_ENV === "production" &&
      (!this.apiKey || !this.ssoSecret)
    ) {
      throw new Error(
        "MALL_API_KEY and SSO_SECRET must be configured in production",
      );
    }

    // Dev-only fallbacks — never ship a known constant secret to production.
    this.apiKey = this.apiKey || "dev-mall-key";
    this.ssoSecret = this.ssoSecret || "dev-sso-secret";
    this.mallFrontendUrl =
      this.configService.get<string>("MALL_FRONTEND_URL") ||
      "http://localhost:3000";
  }

  private get mallClientId(): string {
    return (
      this.configService.get<string>("MCOM_MALL_CLIENT_ID") ||
      DEFAULT_MALL_CLIENT_ID
    );
  }

  // ─── Partner catalogue (mesh, mall:read) ────────────────────────────────────

  /** Resolve a mall business (and its catalogue) by owner Central id or email. */
  async getBusiness(identity: {
    mcomUserId?: string;
    email?: string;
  }): Promise<MallCatalogBusiness> {
    const qs = new URLSearchParams();
    if (identity.mcomUserId) qs.set("mcomUserId", identity.mcomUserId);
    if (identity.email) qs.set("email", identity.email);

    return this.serviceMesh.callPeerByClientId<MallCatalogBusiness>(
      this.mallClientId,
      `/api/v1/partner/catalog/business?${qs.toString()}`,
      { method: "GET", timeout: 8_000 },
      SERVICE_SCOPE_MALL_READ,
    );
  }

  async listProducts(businessId: string): Promise<MallCatalogProduct[]> {
    return this.serviceMesh.callPeerByClientId<MallCatalogProduct[]>(
      this.mallClientId,
      `/api/v1/partner/catalog/business/${encodeURIComponent(businessId)}/products`,
      { method: "GET", timeout: 8_000 },
      SERVICE_SCOPE_MALL_READ,
    );
  }

  async listServices(businessId: string): Promise<MallCatalogService[]> {
    return this.serviceMesh.callPeerByClientId<MallCatalogService[]>(
      this.mallClientId,
      `/api/v1/partner/catalog/business/${encodeURIComponent(businessId)}/services`,
      { method: "GET", timeout: 8_000 },
      SERVICE_SCOPE_MALL_READ,
    );
  }

  // ─── Instruments (mesh, mall:write) ─────────────────────────────────────────

  async createVoucher(
    payload: CreateInstrumentPayload,
  ): Promise<MallInstrument> {
    return this.createInstrument("vouchers", payload);
  }

  async createGiftCard(
    payload: CreateInstrumentPayload,
  ): Promise<MallInstrument> {
    return this.createInstrument("gift-cards", payload);
  }

  async createCoupon(
    payload: CreateInstrumentPayload,
  ): Promise<MallInstrument> {
    return this.createInstrument("coupons", payload);
  }

  private async createInstrument(
    kind: "vouchers" | "gift-cards" | "coupons",
    payload: CreateInstrumentPayload,
  ): Promise<MallInstrument> {
    const body = {
      amount: payload.amount,
      recipientEmail: payload.recipientEmail,
      recipientName: payload.recipientName,
      message: payload.message,
      businessName: payload.businessName,
      code: payload.code,
      expiresAt: payload.expiresAt,
    };

    try {
      return await this.serviceMesh.callPeerByClientId<MallInstrument>(
        this.mallClientId,
        `/api/v1/partner/instruments/${kind}`,
        { method: "POST", data: body, timeout: 10_000 },
        SERVICE_SCOPE_MALL_WRITE,
      );
    } catch (err) {
      this.logger.error(
        `Failed to materialise mall ${kind} instrument: ${(err as Error).message}`,
      );
      throw new InternalServerErrorException(
        "Failed to generate external reward in Mall API",
      );
    }
  }

  // ─── Legacy (out of the partner contract) ───────────────────────────────────

  async generateSsoToken(user: {
    email: string;
    name: string;
    role: "business" | "participant";
    phoneNumber?: string;
  }) {
    const payload = {
      email: user.email,
      name: user.name,
      role: user.role,
      phoneNumber: user.phoneNumber,
      iss: "mcom-loyalty",
      aud: "mcom-mall",
    };

    const token = this.jwtService.sign(payload, {
      secret: this.ssoSecret,
      expiresIn: "5m",
    });

    return {
      token,
      redirectUrl: `${this.mallFrontendUrl}/sso-login?token=${token}`,
    };
  }

  async getMallPlans(): Promise<any[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.mallApiUrl}/tiers`, {
          headers: {
            "x-system-api-key": this.apiKey,
          },
          timeout: 10000,
        }),
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching Mall plans:",
        error.response?.data || error.message,
      );
      return [];
    }
  }
}
