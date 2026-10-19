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
});
