import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export type McomPayMethod = "stripe" | "paypal" | "wallet";

/**
 * Ledger intent labels from the MCOM Payments guide (Part H). The intent is
 * stored on the transfer and drives analytics and the payer's wallet history.
 */
export type McomPaymentIntent =
  | "ORDER"
  | "BOOKING"
  | "DELEGATION"
  | "PURCHASE"
  | "SUBSCRIPTION"
  | "REFERRAL_COMMISSION"
  | "TOP_UP"
  | "REFUND"
  | "PAYOUT"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "FEE";

/**
 * Payee split (guide Part G). MCOM Rewards does not currently pay third-party
 * sellers, but the client supports the shape so marketplace/booking flows can
 * be added without another transport change.
 */
export interface McomChargeSplit {
  payeeType: "mcom_user" | "external";
  payeeUserId?: string;
  payeeExternalId?: string;
  amountMinor: string;
}

export interface McomChargeSplitResult {
  id: string;
  payeeType: "mcom_user" | "external";
  payeeUserId?: string;
  payeeExternalId?: string;
  amountMinor: string;
  feeMinor: string;
  netMinor: string;
  status: "pending" | "credited" | "failed";
  walletTransactionId?: string | null;
  failureReason?: string | null;
}

export interface McomChargeSplits {
  chargeId: string;
  settlementState: "PENDING" | "SETTLED" | "PARTIAL" | "FAILED";
  splits: McomChargeSplitResult[];
}

export interface McomAppBalance {
  currency: string;
  payableMinor: string;
  pendingPayoutMinor: string;
  availableMinor: string;
  paidOutMinor: string;
}

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
  intent?: McomPaymentIntent;
  provider?: string;
  providerRef?: string;
  mcomUserId?: string;
  externalCustomerId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  paidAt?: string;
  refundedAt?: string;
  refundedMinor?: string;
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
  intent?: McomPaymentIntent;
  mcomUserId?: string;
  externalCustomerId?: string;
  metadata?: Record<string, unknown>;
  splits?: McomChargeSplit[];
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
const MAX_SPLITS = 50;
const MINOR_UNIT_PATTERN = /^[1-9]\d*$/;

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

  private assertMinorUnits(amountMinor: string, field: string): void {
    if (
      typeof amountMinor !== "string" ||
      !MINOR_UNIT_PATTERN.test(amountMinor)
    ) {
      throw new BadRequestException(
        `${field} must be a positive integer string in minor units`,
      );
    }
  }

  /**
   * Validate a charge before it leaves this app: exact minor units, and splits
   * that reconcile to the charge amount (guide Part G4).
   */
  private validateChargeInput(input: CreateMcomChargeInput): void {
    this.assertMinorUnits(input.amountMinor, "amountMinor");

    if (!input.splits) return;

    if (input.splits.length === 0) {
      throw new BadRequestException("splits must not be empty when provided");
    }
    if (input.splits.length > MAX_SPLITS) {
      throw new BadRequestException(
        `A charge can have at most ${MAX_SPLITS} splits`,
      );
    }

    const seenPayees = new Set<string>();
    let total = 0n;

    for (const split of input.splits) {
      if (split.payeeType !== "mcom_user" && split.payeeType !== "external") {
        throw new BadRequestException(
          "payeeType must be either 'mcom_user' or 'external'",
        );
      }
      this.assertMinorUnits(split.amountMinor, "splits[].amountMinor");

      const payeeKey =
        split.payeeType === "mcom_user"
          ? `mcom_user:${split.payeeUserId || ""}`
          : `external:${split.payeeExternalId || ""}`;

      if (split.payeeType === "mcom_user" && !split.payeeUserId) {
        throw new BadRequestException(
          "payeeUserId is required for mcom_user splits",
        );
      }
      if (split.payeeType === "external" && !split.payeeExternalId) {
        throw new BadRequestException(
          "payeeExternalId is required for external splits",
        );
      }
      if (seenPayees.has(payeeKey)) {
        throw new BadRequestException(
          "Only one split is allowed per payee",
        );
      }

      seenPayees.add(payeeKey);
      total += BigInt(split.amountMinor);
    }

    if (total !== BigInt(input.amountMinor)) {
      throw new BadRequestException(
        "splits must sum exactly to amountMinor",
      );
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

      // Guide B6: only INSUFFICIENT_BALANCE is a top-up condition. Other 422s
      // (validation, daily/monthly/amount limits) must keep their real code so
      // the UI can explain what actually went wrong.
      if (code === "INSUFFICIENT_BALANCE" || res.status === 402) {
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
    this.validateChargeInput(input);
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
    idempotencyKey?: string,
  ): Promise<McomChargeResponse> {
    if (amountMinor !== undefined) {
      this.assertMinorUnits(amountMinor, "amountMinor");
    }

    // The live MCOM Pay API also requires an idempotency key on refunds. Derive
    // a deterministic one per charge + amount so a retry cannot refund twice.
    const refundKey =
      idempotencyKey ||
      `mcom-rewards-refund-${chargeId}-${amountMinor || "full"}`.slice(0, 255);

    return this.call<McomChargeResponse>(
      `/charges/${encodeURIComponent(chargeId)}/refund`,
      {
        ...(amountMinor ? { amountMinor } : {}),
        ...(reason ? { reason } : {}),
      },
      "POST",
      refundKey,
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

  /** Payee splits and their settlement status for a charge (guide Part G5). */
  getSplits(
    chargeId: string,
  ): Promise<{ success: boolean; data: McomChargeSplits }> {
    return this.call<{ success: boolean; data: McomChargeSplits }>(
      `/charges/${encodeURIComponent(chargeId)}/splits`,
      undefined,
      "GET",
    );
  }

  /**
   * This app's payable balance, pending payouts and lifetime paid-out amount
   * (guide Part G6). Payouts are approved by MCOM admins.
   */
  getBalance(): Promise<{ success: boolean; data: McomAppBalance }> {
    return this.call<{ success: boolean; data: McomAppBalance }>(
      "/balance",
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
