import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import {
  McomPaymentsError,
  McomPaymentsService,
} from "./mcom-payments.service";

const HMAC_SECRET = "hm_test_secret";

const config = (values: Record<string, string | undefined>): ConfigService =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

const ok = (body: unknown, status = 200) =>
  ({
    ok: true,
    status,
    statusText: "OK",
    json: async () => body,
  }) as unknown as Response;

const fail = (body: unknown, status: number, statusText = "Error") =>
  ({
    ok: false,
    status,
    statusText,
    json: async () => body,
  }) as unknown as Response;

describe("McomPaymentsService", () => {
  let service: McomPaymentsService;

  beforeEach(() => {
    service = new McomPaymentsService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_CLIENT_ID: "mcom-rewards",
        MCOM_HMAC_SECRET: HMAC_SECRET,
        MCOM_CENTRAL_WEB_URL: "http://localhost:3000",
        MCOM_PAY_ENABLED: "true",
      }),
    );
    (service as any).sleep = jest.fn().mockResolvedValue(undefined);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("is configured by default when an HMAC secret exists", () => {
    expect(service.isConfigured()).toBe(true);
  });

  it("can be disabled explicitly with MCOM_PAY_ENABLED=false", () => {
    const disabled = new McomPaymentsService(
      config({
        MCOM_HMAC_SECRET: HMAC_SECRET,
        MCOM_PAY_ENABLED: "false",
      }),
    );
    expect(disabled.isConfigured()).toBe(false);
  });

  it("signs the exact JSON body and sends the idempotency header", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      ok({
        charge: { id: "ch_1", status: "paid", amountMinor: "1000" },
        clientSecret: "pi_1_secret_x",
      }),
    );

    const input = {
      amountMinor: "1000",
      method: "stripe" as const,
      reference: "plan-1",
      idempotencyKey: "mcom-rewards-plan-1",
    };

    await service.createCharge(input);

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://localhost:3010/api/v1/app-payments/charges");
    expect(init.method).toBe("POST");
    expect(init.headers["X-Idempotency-Key"]).toBe("mcom-rewards-plan-1");
    expect(init.headers["X-Mcom-Client-ID"]).toBe("mcom-rewards");

    const body = JSON.parse(init.body);
    expect(body).not.toHaveProperty("idempotencyKey");
    const bodySignature =
      "sha256=" +
      crypto
        .createHmac("sha256", HMAC_SECRET)
        .update(JSON.stringify(body))
        .digest("hex");
    expect(init.headers["X-Mcom-Signature"]).toBe(bodySignature);
  });

  it("signs the empty string for GET requests", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      ok({ charge: { id: "ch_1", status: "paid" } }),
    );

    await service.getCharge("ch_1");

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const expected =
      "sha256=" +
      crypto.createHmac("sha256", HMAC_SECRET).update("").digest("hex");
    expect(init.headers["X-Mcom-Signature"]).toBe(expected);
    expect(init.body).toBeUndefined();
  });

  it("maps INSUFFICIENT_BALANCE to a 402 with a top-up URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      fail(
        { error: "INSUFFICIENT_BALANCE", message: "Not enough balance" },
        422,
      ),
    );

    await expect(
      service.createCharge({
        amountMinor: "1000",
        method: "wallet",
        reference: "plan-1",
        idempotencyKey: "key-1",
      }),
    ).rejects.toMatchObject({
      code: "WALLET_INSUFFICIENT_FUNDS",
      httpStatus: 402,
      topUpUrl: "http://localhost:3000/dashboard/wallet",
    });
  });

  it("retries transient errors with the same idempotency key", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(fail({ error: "WALLET_LOCKED" }, 409))
      .mockResolvedValueOnce(ok({ charge: { id: "ch_1", status: "pending" } }));

    await service.createCharge({
      amountMinor: "1000",
      method: "stripe",
      reference: "plan-1",
      idempotencyKey: "key-1",
    });

    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1].headers["X-Idempotency-Key"]).toBe("key-1");
    expect(calls[1][1].headers["X-Idempotency-Key"]).toBe("key-1");
  });

  it("does not retry validation errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      fail({ error: "VALIDATION_ERROR", message: "bad amount" }, 400),
    );

    await expect(
      service.createCharge({
        amountMinor: "10.5",
        method: "stripe",
        reference: "plan-1",
        idempotencyKey: "key-1",
      }),
    ).rejects.toBeInstanceOf(McomPaymentsError);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects idempotency keys with invalid characters", async () => {
    await expect(
      service.createCharge({
        amountMinor: "1000",
        method: "stripe",
        reference: "plan-1",
        idempotencyKey: "bad\nkey",
      }),
    ).rejects.toThrow("Invalid idempotency key format");
  });
});
