import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export type McomPayMethod = "stripe" | "paypal" | "wallet";

export interface McomCharge {
  id: string;
  appClientId: string;
  amountMinor: string;
  currency: string;
  feeMinor: string;
  netMinor: string;
  method: McomPayMethod;
  status: "pending" | "paid" | "failed" | "refunded" | "canceled";
  reference: string;
  provider?: string;
  providerRef?: string;
  mcomUserId?: string;
  externalCustomerId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  paidAt?: string;
  refundedAt?: string;
}

export interface McomChargeResponse {
  charge: McomCharge;
  clientSecret?: string;
  approvalUrl?: string;
}

export interface CreateMcomChargeInput {
  amountMinor: string;
  method: McomPayMethod;
  reference: string;
  currency?: string;
  description?: string;
  mcomUserId?: string;
  externalCustomerId?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

export interface ConfirmMcomChargeInput {
  paymentIntentId?: string;
  orderId?: string;
}

export class McomPaymentsError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpStatus: number,
    public topUpUrl?: string,
  ) {
    super(message);
    this.name = "McomPaymentsError";
  }
}

const TRANSIENT_STATUSES = new Set([409, 429, 500, 503]);
const TOP_UP_PATH = "/dashboard/wallet";

/**
 * HMAC partner client for MCOM Pay (`/api/v1/app-payments`).
 *
 * Charges are always created server-side with amounts in minor units. The
 * customer's browser only ever receives a provider handle (clientSecret or
 * approvalUrl), never an amount it can change.
 *
 * See MCOM Payments Partner Integration Guide, Part B and Part E.
 */
@Injectable()
export class McomPaymentsService {
  private readonly logger = new Logger(McomPaymentsService.name);
  private readonly base: string;
  private readonly clientId: string;
  private readonly hmacSecret: string;
  readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const rawBase =
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      "https://api.centralhubsolution.com";
    this.base = `${rawBase.replace(/\/$/, "")}/api/v1/app-payments`;

    this.clientId =
      this.configService.get<string>("MCOM_CLIENT_ID") || "mcom-rewards";
    this.hmacSecret = this.configService.get<string>("MCOM_HMAC_SECRET") || "";

    // Enabled by default when credentials exist; explicit false is a kill switch.
    const payFlag = (this.configService.get<string>("MCOM_PAY_ENABLED") || "")
      .trim()
      .toLowerCase();
    this.enabled = payFlag !== "false";
  }

  isConfigured(): boolean {
    return this.enabled && !!this.hmacSecret;
  }

  assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new HttpException(
        {
          error: "MCOM_PAY_DISABLED",
          message: "MCOM Pay is not configured for this platform.",
        },
        503,
      );
    }
  }

  topUpUrl(): string {
    const rawBase =
      this.configService.get<string>("MCOM_CENTRAL_WEB_URL") ||
      this.configService.get<string>("NEXT_PUBLIC_MCOM_SOLUTIONS_URL") ||
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      "https://api.centralhubsolution.com";
    return `${rawBase.replace(/\/$/, "")}${TOP_UP_PATH}`;
  }

  private sign(body: unknown): string {
    const raw = typeof body === "string" ? body : JSON.stringify(body);
    return (
      "sha256=" +
      crypto.createHmac("sha256", this.hmacSecret).update(raw).digest("hex")
    );
  }

  private headers(body: unknown, idempotencyKey?: string) {
    this.assertIdempotencyKey(idempotencyKey);

    return {
      "Content-Type": "application/json",
      "X-Mcom-Client-ID": this.clientId,
      "X-Mcom-Signature": this.sign(body),
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
    };
  }

  private assertIdempotencyKey(idempotencyKey?: string): void {
    if (idempotencyKey && !/^[\x20-\x7E]{1,255}$/.test(idempotencyKey)) {
      throw new BadRequestException("Invalid idempotency key format");
    }
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs = 10000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private async call<T>(
    path: string,
    body: unknown,
    method: "GET" | "POST" = "POST",
    idempotencyKey?: string,
    maxRetries = 3,
  ): Promise<T> {
    this.assertConfigured();
    this.assertIdempotencyKey(idempotencyKey);

    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let res: Response;

      try {
        res = await this.fetchWithTimeout(`${this.base}${path}`, {
          method,
          headers: this.headers(
            method === "GET" ? "" : body,
            idempotencyKey,
          ) as any,
          ...(method === "GET" ? {} : { body: JSON.stringify(body ?? {}) }),
        });
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) throw error;
        await this.sleep(2 ** attempt * 500);
        continue;
      }

      const json: any = await res.json().catch(() => ({}));
      if (res.ok) return json as T;

      const rawError = json?.error;
      const code =
        (typeof rawError === "string" ? rawError : rawError?.code) ||
        json?.code ||
        `HTTP_${res.status}`;
      const message =
        json?.message ||
        (typeof rawError === "object" ? rawError?.message : undefined) ||
        res.statusText ||
        "MCOM Pay request failed";

      if (code === "INSUFFICIENT_BALANCE" || res.status === 422) {
        throw new McomPaymentsError(
          "WALLET_INSUFFICIENT_FUNDS",
          message || "Top up your MCOM Wallet to continue.",
          402,
          this.topUpUrl(),
        );
      }

      if (res.status === 401) {
        this.logger.error(
          "MCOM Pay authentication failed — check MCOM_HMAC_SECRET rotation",
        );
      }

      if (TRANSIENT_STATUSES.has(res.status) && attempt < maxRetries) {
        lastError = new McomPaymentsError(code, message, res.status);
        // Same idempotency key on every retry per the guide.
        await this.sleep(res.status === 409 ? 1500 : 2 ** attempt * 1000);
        continue;
      }

      throw new McomPaymentsError(code, message, res.status);
    }

    throw lastError instanceof Error
      ? lastError
      : new McomPaymentsError("INTERNAL_ERROR", "MCOM Pay request failed", 500);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  createCharge(input: CreateMcomChargeInput): Promise<McomChargeResponse> {
    const { idempotencyKey, ...body } = input;
    return this.call<McomChargeResponse>(
      "/charges",
      body,
      "POST",
      idempotencyKey,
    );
  }

  confirmCharge(
    chargeId: string,
    handle: ConfirmMcomChargeInput = {},
  ): Promise<McomChargeResponse> {
    return this.call<McomChargeResponse>(
      `/charges/${encodeURIComponent(chargeId)}/confirm`,
      handle,
      "POST",
    );
  }

  refundCharge(
    chargeId: string,
    amountMinor?: string,
    reason?: string,
  ): Promise<McomChargeResponse> {
    return this.call<McomChargeResponse>(
      `/charges/${encodeURIComponent(chargeId)}/refund`,
      {
        ...(amountMinor ? { amountMinor } : {}),
        ...(reason ? { reason } : {}),
      },
      "POST",
    );
  }

  getCharge(chargeId: string): Promise<McomChargeResponse> {
    return this.call<McomChargeResponse>(
      `/charges/${encodeURIComponent(chargeId)}`,
      undefined,
      "GET",
    );
  }

  listCharges(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.call<{ data: McomCharge[]; total?: number }>(
      `/charges${suffix}`,
      undefined,
      "GET",
    );
  }

  /** Convert transport/provider failures to the HTTP shape controllers expect. */
  toHttpException(error: unknown): never {
    if (error instanceof McomPaymentsError) {
      throw new HttpException(
        {
          error: error.code,
          message: error.message,
          ...(error.topUpUrl ? { topUpUrl: error.topUpUrl } : {}),
        },
        error.httpStatus,
      );
    }
    throw error;
  }
}
