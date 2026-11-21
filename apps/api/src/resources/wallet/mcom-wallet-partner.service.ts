import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export class McomWalletError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpStatus: number,
    public topUpUrl?: string,
  ) {
    super(message);
    this.name = "McomWalletError";
  }
}

export interface CentralBalance {
  success: boolean;
  balance: number;
  availableBalance: number;
  status: string;
  currency: string;
}

export interface CentralReceipt {
  success: boolean;
  transactionId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  reference?: string;
  idempotencyKey?: string;
  processedAt?: string;
}

export interface CentralHold {
  success: boolean;
  holdId: string;
  amount?: number;
  status?: string;
  expiresAt?: string;
  availableBalance?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  currency?: string;
}

export interface CentralTransaction {
  id: string;
  type?: string;
  amount?: number;
  balanceAfter?: number;
  category?: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  processedAt?: string;
  [key: string]: unknown;
}

export interface WalletWriteOptions {
  category?: string;
  description: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

const TRANSIENT_STATUSES = new Set([409, 429, 500, 503]);
const TOP_UP_PATH = "/dashboard/wallet";

/**
 * HMAC partner client for the central MCOM Wallet (McomSolutions).
 * Single source of truth for balances — local BusinessWallet is a mirror.
 * See MCOM Wallet Partner Integration Guide.
 */
@Injectable()
export class McomWalletPartnerService {
  private readonly logger = new Logger(McomWalletPartnerService.name);
  private readonly base: string;
  private readonly clientId: string;
  private readonly hmacSecret: string;
  readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const rawBase =
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      "https://api.centralhubsolution.com";
    this.base = `${rawBase.replace(/\/$/, "")}/api/v1/wallet/partner`;
    this.clientId =
      this.configService.get<string>("MCOM_CLIENT_ID") || "mcom-rewards";
    this.hmacSecret =
      this.configService.get<string>("MCOM_HMAC_SECRET") || "";
    // Central wallet is the source of truth. Treat it as enabled whenever the
    // app is configured for HMAC, unless it was explicitly switched off.
    // Previously this required MCOM_WALLET_ENABLED="true", which meant an
    // unset flag silently fell back to the empty local mirror.
    const walletFlag = (
      this.configService.get<string>("MCOM_WALLET_ENABLED") || ""
    )
      .trim()
      .toLowerCase();
    this.enabled = walletFlag !== "false";
  }

  isConfigured(): boolean {
    return this.enabled && !!this.hmacSecret;
  }

  /**
   * Public URL of the central wallet UI (NOT the API host).
   * MCOM_CENTRAL_WEB_URL should point at the central frontend, e.g.
   * http://localhost:3000 in development.
   */
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
    if (idempotencyKey && !/^[\x20-\x7E]{1,255}$/.test(idempotencyKey)) {
      throw new BadRequestException("Invalid idempotency key format");
    }
    return {
      "Content-Type": "application/json",
      "X-Mcom-Client-ID": this.clientId,
      "X-Mcom-Signature": this.sign(body),
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
    };
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs = 5000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async getBalance(userId: string): Promise<CentralBalance> {
    // GET -> sign empty string per guide
    const res = await this.fetchWithTimeout(
      `${this.base}/balance/${encodeURIComponent(userId)}`,
      { headers: this.headers("") as any },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new McomWalletError(
        "BALANCE_ERROR",
        text || `Central balance check failed (${res.status})`,
        res.status,
      );
    }
    return res.json();
  }

  async getTransactions(userId: string): Promise<CentralTransaction[]> {
    const res = await this.fetchWithTimeout(
      `${this.base}/transactions/${encodeURIComponent(userId)}`,
      { headers: this.headers("") as any },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.logger.warn(`Central transactions failed ${res.status}: ${text}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  }

  /**
   * Look up one transaction originated by this platform (guide A5). Pass
   * `by: "idempotencyKey"` when you only have the key that was sent.
   */
  async getTransaction(
    id: string,
    by?: "id" | "idempotencyKey",
  ): Promise<CentralTransaction> {
    const query = by === "idempotencyKey" ? "?by=idempotencyKey" : "";
    const res = await this.fetchWithTimeout(
      `${this.base}/transaction/${encodeURIComponent(id)}${query}`,
      { headers: this.headers("") as any },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new McomWalletError(
        "TRANSACTION_ERROR",
        text || `Central transaction lookup failed (${res.status})`,
        res.status,
      );
    }
    return res.json();
  }

  async debit(
    userId: string,
    amount: number,
    opts: WalletWriteOptions,
  ): Promise<CentralReceipt> {
    this.assertAmount(amount);
    // The idempotency key travels in the header only (guide A4/A5.1).
    const { idempotencyKey, ...payload } = opts;
    return this.write(
      "debit",
      { userId, amount, ...payload },
      idempotencyKey,
    );
  }

  async credit(
    userId: string,
    amount: number,
    opts: WalletWriteOptions,
  ): Promise<CentralReceipt> {
    this.assertAmount(amount);
    const { idempotencyKey, ...payload } = opts;
    return this.write(
      "credit",
      { userId, amount, ...payload },
      idempotencyKey,
    );
  }

  /**
   * Reserve funds before confirming an order (guide A5.3). Holds auto-expire
   * after the platform TTL (default 24h); capture converts a hold into a real
   * debit, release returns the funds to the available balance.
   */
  async placeHold(
    userId: string,
    amount: number,
    opts: {
      description?: string;
      reference?: string;
      metadata?: Record<string, unknown>;
      idempotencyKey?: string;
    } = {},
  ): Promise<CentralHold> {
    this.assertAmount(amount);
    const { idempotencyKey, ...payload } = opts;
    return this.write(
      "hold/place",
      { userId, amount, ...payload },
      idempotencyKey,
    );
  }

  /**
   * Capture a hold. The partner API captures the full held amount and accepts
   * only `holdId` in the body (extra properties are rejected by validation).
   */
  async captureHold(
    holdId: string,
    opts: { idempotencyKey?: string } = {},
  ): Promise<CentralReceipt> {
    return this.write("hold/capture", { holdId }, opts.idempotencyKey);
  }

  /** Release a hold. Like capture, the body is just `{ holdId }`. */
  async releaseHold(
    holdId: string,
    opts: { idempotencyKey?: string } = {},
  ): Promise<CentralHold> {
    return this.write("hold/release", { holdId }, opts.idempotencyKey);
  }

  private assertAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("amount must be a positive number");
    }
  }

  private async write(
    path: "debit" | "credit" | "hold/place" | "hold/capture" | "hold/release",
    body: Record<string, unknown>,
    idempotencyKey?: string,
    maxRetries = 3,
  ): Promise<any> {
    // Debit and credit are money movements and must be idempotent (guide A5).
    // Hold operations accept a key but it is optional.
    if ((path === "debit" || path === "credit") && !idempotencyKey) {
      throw new BadRequestException(
        "X-Idempotency-Key is required for wallet writes",
      );
    }
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let res: Response;
      try {
        res = await this.fetchWithTimeout(`${this.base}/${path}`, {
          method: "POST",
          headers: this.headers(body, idempotencyKey) as any,
          body: JSON.stringify(body),
        });
      } catch (e) {
        lastError = e;
        if (attempt === maxRetries) throw e;
        await this.sleep(2 ** attempt * 500);
        continue;
      }
      if (res.ok) return res.json();
      const err: any = await res.json().catch(() => ({}));
      const rawError = err?.error;
      const code =
        (typeof rawError === "string" ? rawError : rawError?.code) ||
        err?.code ||
        `HTTP_${res.status}`;
      const message =
        err?.message ||
        (typeof rawError === "object" ? rawError?.message : undefined) ||
        "Wallet operation failed";

      // Only INSUFFICIENT_BALANCE is a top-up condition (guide A6). Keep the
      // remaining 422s (daily/monthly/single-txn limits) as 422 with their own
      // code so the caller can show the real reason.
      if (code === "INSUFFICIENT_BALANCE" || res.status === 402) {
        throw new McomWalletError(
          "WALLET_INSUFFICIENT_FUNDS",
          message || "Top up your MCOM Wallet to continue.",
          402,
          this.topUpUrl(),
        );
      }
      if (TRANSIENT_STATUSES.has(res.status)) {
        lastError = new McomWalletError(code, message, res.status);
        if (attempt === maxRetries) throw lastError;
        // Same key on every retry per guide (1-2s for 409, backoff otherwise)
        await this.sleep(res.status === 409 ? 1500 : 2 ** attempt * 1000);
        continue;
      }
      if (res.status === 401) {
        this.logger.error(`Central wallet auth failed — check MCOM_HMAC_SECRET rotation`);
      }
      throw new McomWalletError(code, message, res.status);
    }
    throw lastError ?? new McomWalletError("INTERNAL_ERROR", "Wallet write failed", 500);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** Map central wallet failures to the HTTP shape controllers expect. */
  toHttpException(e: unknown): never {
    if (e instanceof McomWalletError) {
      throw new HttpException(
        {
          error: e.code,
          message: e.message,
          ...(e.topUpUrl ? { topUpUrl: e.topUpUrl } : {}),
        },
        e.httpStatus,
      );
    }
    throw e as Error;
  }
}
