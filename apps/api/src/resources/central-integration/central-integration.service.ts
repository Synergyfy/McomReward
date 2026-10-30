import {
  BadGatewayException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isAxiosError } from "axios";
import { ServiceMeshService } from "../service-mesh/services/service-mesh.service";
import {
  DEFAULT_CENTRAL_CLIENT_ID,
  SERVICE_SCOPE_CENTRAL_ISSUE,
  SERVICE_SCOPE_CENTRAL_READ,
} from "../service-mesh/constants";

export interface CentralMembershipTier {
  id: string;
  tier: string;
  durationDays: number;
  fullPrice: number;
  features?: string[];
  entitlements?: Array<{ resourceKey: string; quotaValue: string }>;
  paymentOptions?: Array<Record<string, any>>;
}

export interface CentralMembershipPlan {
  id: string;
  name: string;
  description?: string | null;
  billingCycle?: string | null;
  platformAccess?: string[];
  features?: string[];
  whoItIsFor?: string | null;
  badge?: string | null;
  color?: string | null;
  tiers?: CentralMembershipTier[];
  appBundles?: Array<Record<string, any>>;
}

export interface CentralAccessPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  platformAccess?: string[];
  features?: string[];
  whoItIsFor?: string | null;
  badge?: string | null;
  color?: string | null;
  appBundles?: Array<Record<string, any>>;
}

export interface CentralRecipient {
  mcomUserId: string;
  email: string;
  name?: string | null;
  role?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  businessStatus?: string | null;
  membershipLevel?: string | null;
  membershipTier?: string | null;
  membershipStatus?: string | null;
  membershipExpiresAt?: string | null;
}

export interface GrantMembershipInput {
  issuanceId: string;
  recipientMcomUserId: string;
  planId: string;
  tier?: string;
  durationDays?: number;
  extendExisting?: boolean;
  replaceExisting?: boolean;
  note?: string;
}

export interface GrantMembershipResult {
  success: boolean;
  grantId: string;
  businessId: string;
  planId: string;
  planName: string;
  tier: string;
  startsAt: string;
  expiresAt: string;
  replayed: boolean;
  recipientMcomUserId: string;
}

export interface IssueAccessPassCodeInput {
  issuanceId: string;
  accessPlanId: string;
  recipientEmail?: string;
  recipientMcomUserId?: string;
  mode?: "GIFT" | "CODE";
  sendEmail?: boolean;
  note?: string;
}

export interface IssueAccessPassCodeResult {
  success: boolean;
  code: string;
  accessPlanId: string;
  planName: string;
  durationDays: number;
  status: string;
  recipientEmail?: string | null;
  expiresAt?: string | null;
  replayed: boolean;
  grantId?: string | null;
}

export interface CreateCentralCouponInput {
  issuanceId: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  appliesToAllMemberships?: boolean;
  membershipPlanIds?: string[];
  appliesToAllAccess?: boolean;
  accessPlanIds?: string[];
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  validFrom?: string;
  expiresAt?: string | null;
  lockedToUserId?: string | null;
  isActive?: boolean;
}

export interface CentralCouponResult {
  success: boolean;
  id: string;
  code: string;
  status: string;
  discountType: string;
  discountValue: number;
  lockedToUserId?: string | null;
  validFrom?: string | null;
  expiresAt?: string | null;
  replayed?: boolean;
  [key: string]: any;
}

/**
 * Central Hub partner client.
 *
 * All calls are direct peer-to-peer over the zero-hop mesh; Central is never in
 * the data path. Mutations use `issuanceId` as the provider idempotency key.
 */
@Injectable()
export class CentralIntegrationService {
  private readonly logger = new Logger(CentralIntegrationService.name);

  constructor(
    private readonly serviceMesh: ServiceMeshService,
    private readonly config: ConfigService,
  ) {}

  private get centralClientId(): string {
    return (
      this.config.get<string>("MCOM_CENTRAL_CLIENT_ID") ||
      DEFAULT_CENTRAL_CLIENT_ID
    );
  }

  // ─── Catalogue (central:read) ──────────────────────────────────────────────

  listMemberships(): Promise<CentralMembershipPlan[]> {
    return this.read<CentralMembershipPlan[]>(
      "/api/v1/partner/catalog/memberships",
    );
  }

  getMembership(id: string): Promise<CentralMembershipPlan> {
    return this.read<CentralMembershipPlan>(
      `/api/v1/partner/catalog/memberships/${encodeURIComponent(id)}`,
    );
  }

  listAccessPlans(): Promise<CentralAccessPlan[]> {
    return this.read<CentralAccessPlan[]>(
      "/api/v1/partner/catalog/access-plans",
    );
  }

  getAccessPlan(id: string): Promise<CentralAccessPlan> {
    return this.read<CentralAccessPlan>(
      `/api/v1/partner/catalog/access-plans/${encodeURIComponent(id)}`,
    );
  }

  resolveRecipient(identity: {
    email?: string;
    mcomUserId?: string;
  }): Promise<CentralRecipient | null> {
    const qs = new URLSearchParams();
    if (identity.mcomUserId) qs.set("mcomUserId", identity.mcomUserId);
    if (identity.email) qs.set("email", identity.email);
    if (![...qs.keys()].length) {
      return Promise.resolve(null);
    }
    return this.read<CentralRecipient | null>(
      `/api/v1/partner/users/resolve?${qs.toString()}`,
    );
  }

  // ─── Grants (central:issue) ────────────────────────────────────────────────

  async grantMembership(
    input: GrantMembershipInput,
  ): Promise<GrantMembershipResult> {
    return this.write<GrantMembershipResult>(
      "/api/v1/partner/grants/membership",
      input,
    );
  }

  async issueAccessPassCode(
    input: IssueAccessPassCodeInput,
  ): Promise<IssueAccessPassCodeResult> {
    return this.write<IssueAccessPassCodeResult>(
      "/api/v1/partner/access-pass-codes",
      input,
    );
  }

  async revokeGrant(grantId: string): Promise<any> {
    return this.write(
      `/api/v1/partner/grants/${encodeURIComponent(grantId)}/revoke`,
      {},
    );
  }

  // ─── Coupons (central:issue / central:read) ────────────────────────────────

  async createCoupon(
    input: CreateCentralCouponInput,
  ): Promise<CentralCouponResult> {
    return this.write<CentralCouponResult>(
      "/api/v1/partner/coupons",
      input,
    );
  }

  inspectCoupon(code: string): Promise<CentralCouponResult> {
    return this.read<CentralCouponResult>(
      `/api/v1/partner/coupons/${encodeURIComponent(code)}`,
    );
  }

  async revokeCoupon(code: string): Promise<any> {
    return this.write(
      `/api/v1/partner/coupons/${encodeURIComponent(code)}/revoke`,
      {},
    );
  }

  // ─── Transport ─────────────────────────────────────────────────────────────

  private read<T>(path: string): Promise<T> {
    return this.execute<T>("GET", path, undefined, SERVICE_SCOPE_CENTRAL_READ);
  }

  private write<T = any>(
    path: string,
    data: Record<string, any>,
  ): Promise<T> {
    return this.execute<T>("POST", path, data, SERVICE_SCOPE_CENTRAL_ISSUE);
  }

  private async execute<T>(
    method: "GET" | "POST",
    path: string,
    data: Record<string, any> | undefined,
    scope: string,
  ): Promise<T> {
    try {
      return await this.serviceMesh.callPeerByClientId<T>(
        this.centralClientId,
        path,
        {
          method,
          ...(data ? { data } : {}),
          timeout: 12_000,
        },
        scope,
      );
    } catch (err) {
      const providerCode = this.providerCode(err);
      const status = isAxiosError(err) ? err.response?.status : undefined;
      const message = this.providerMessage(err);
      this.logger.warn(
        `Central partner call ${method} ${path} failed${
          status ? ` (${status})` : ""
        }: ${providerCode || message}`,
      );
      throw new BadGatewayException({
        code: providerCode || "CENTRAL_PROVIDER_ERROR",
        message,
        statusCode: status,
      });
    }
  }

  private providerCode(err: unknown): string | undefined {
    if (!isAxiosError(err)) return undefined;
    const body = err.response?.data as any;
    return body?.code || body?.error?.code || undefined;
  }

  private providerMessage(err: unknown): string {
    if (isAxiosError(err)) {
      const body = err.response?.data as any;
      return (
        body?.message ||
        body?.error?.message ||
        err.message ||
        "Central provider request failed"
      );
    }
    return err instanceof Error
      ? err.message
      : "Central provider request failed";
  }
}
