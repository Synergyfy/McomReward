import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import {
  McomWalletError,
  McomWalletPartnerService,
} from "./mcom-wallet-partner.service";

const HMAC_SECRET = "hm_test_secret";

const config = (values: Record<string, string | undefined>): ConfigService =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

const signEmpty = (secret = HMAC_SECRET) =>
  "sha256=" +
  crypto.createHmac("sha256", secret).update("").digest("hex");

describe("McomWalletPartnerService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("is configured by default when an HMAC secret exists", () => {
    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_CLIENT_ID: "mcom-rewards",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    expect(service.isConfigured()).toBe(true);
  });

  it("can be disabled explicitly with MCOM_WALLET_ENABLED=false", () => {
    const service = new McomWalletPartnerService(
      config({
        MCOM_HMAC_SECRET: HMAC_SECRET,
        MCOM_WALLET_ENABLED: "false",
      }),
    );

    expect(service.isConfigured()).toBe(false);
  });

  it("is not configured without an HMAC secret", () => {
    const service = new McomWalletPartnerService(
      config({ MCOM_WALLET_ENABLED: "true" }),
    );

    expect(service.isConfigured()).toBe(false);
  });

  it("uses the central web URL (not the API host) for top-up", () => {
    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_CENTRAL_WEB_URL: "http://localhost:3000/",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    expect(service.topUpUrl()).toBe("http://localhost:3000/dashboard/wallet");
  });

  it("signs GET requests with the empty string and returns the balance", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        balance: 250,
        availableBalance: 250,
        status: "ACTIVE",
        currency: "MCOM",
      }),
    } as Response);

    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_CLIENT_ID: "mcom-rewards",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    const balance = await service.getBalance("user-1");

    expect(balance.balance).toBe(250);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3010/api/v1/wallet/partner/balance/user-1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Mcom-Client-ID": "mcom-rewards",
          "X-Mcom-Signature": signEmpty(),
        }),
      }),
    );
  });

  it("throws a typed error when the central balance request fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "invalid signature",
    } as Response);

    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    await expect(service.getBalance("user-1")).rejects.toBeInstanceOf(
      McomWalletError,
    );
  });

  it("keeps the idempotency key in the header, not the debit body", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, transactionId: "tx_1" }),
    } as Response);

    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    await service.debit("user-1", 12.5, {
      category: "PURCHASE",
      description: "Reward spend",
      reference: "reward-1",
      idempotencyKey: "key-1",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3010/api/v1/wallet/partner/debit");
    expect((init as RequestInit).headers).toMatchObject({
      "X-Idempotency-Key": "key-1",
    });

    const body = JSON.parse(String((init as RequestInit).body));
    expect(body).toMatchObject({
      userId: "user-1",
      amount: 12.5,
      category: "PURCHASE",
      reference: "reward-1",
    });
    expect(body).not.toHaveProperty("idempotencyKey");
  });

  it("keeps non-balance 422 errors as 422", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        error: "DAILY_LIMIT_EXCEEDED",
        message: "Daily limit",
      }),
    } as Response);

    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    await expect(
      service.debit("user-1", 10, {
        category: "PURCHASE",
        description: "Reward spend",
        idempotencyKey: "key-1",
      }),
    ).rejects.toMatchObject({
      code: "DAILY_LIMIT_EXCEEDED",
      httpStatus: 422,
    });
  });

  it("places, captures and releases wallet holds", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, holdId: "hold_1" }),
      } as Response);

    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    await service.placeHold("user-1", 25, {
      description: "Reserve for order",
      idempotencyKey: "hold-key-1",
    });
    await service.captureHold("hold_1");
    await service.releaseHold("hold_1");

    const [placeUrl, placeInit] = fetchMock.mock.calls[0];
    const [captureUrl, captureInit] = fetchMock.mock.calls[1];
    const [releaseUrl, releaseInit] = fetchMock.mock.calls[2];

    expect(placeUrl).toBe(
      "http://localhost:3010/api/v1/wallet/partner/hold/place",
    );
    expect((placeInit as RequestInit).headers).toMatchObject({
      "X-Idempotency-Key": "hold-key-1",
    });
    expect(captureUrl).toBe(
      "http://localhost:3010/api/v1/wallet/partner/hold/capture",
    );
    expect(captureInit.body).toBe(JSON.stringify({ holdId: "hold_1" }));
    expect(releaseUrl).toBe(
      "http://localhost:3010/api/v1/wallet/partner/hold/release",
    );
    expect(releaseInit.body).toBe(JSON.stringify({ holdId: "hold_1" }));
  });

  it("looks up a transaction by idempotency key", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ transactionId: "tx_1" }),
    } as Response);

    const service = new McomWalletPartnerService(
      config({
        MCOM_SOLUTIONS_URL: "http://localhost:3010",
        MCOM_HMAC_SECRET: HMAC_SECRET,
      }),
    );

    await service.getTransaction("key-1", "idempotencyKey");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3010/api/v1/wallet/partner/transaction/key-1?by=idempotencyKey",
    );
  });
});
