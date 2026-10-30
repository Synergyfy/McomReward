import { MallIntegrationService } from "./mall-integration.service";

const makeConfig = (overrides: Record<string, string> = {}) => {
  const values: Record<string, string> = {
    MALL_API_URL: "https://api.mall.mcom.com",
    MALL_API_KEY: "legacy-key",
    SSO_SECRET: "legacy-sso",
    MCOM_MALL_CLIENT_ID: "mcom-mall",
    ...overrides,
  };
  return { get: jest.fn((key: string) => values[key]) } as any;
};

describe("MallIntegrationService (partner mesh client)", () => {
  let mesh: any;
  let service: MallIntegrationService;

  beforeEach(() => {
    mesh = { callPeerByClientId: jest.fn().mockResolvedValue({ ok: true }) };
    service = new MallIntegrationService(
      {} as any,
      makeConfig(),
      {} as any,
      mesh,
    );
  });

  it("materialises a voucher via /partner/instruments with mall:write and a shared code", async () => {
    mesh.callPeerByClientId.mockResolvedValue({
      type: "voucher",
      id: "v-1",
      code: "MCOM-ABC",
    });

    const result = await service.createVoucher({
      amount: 25,
      recipientEmail: "jane@example.com",
      businessName: "Acme Ltd",
      code: "MCOM-ABC",
    });

    expect(result).toEqual({ type: "voucher", id: "v-1", code: "MCOM-ABC" });
    expect(mesh.callPeerByClientId).toHaveBeenCalledWith(
      "mcom-mall",
      "/api/v1/partner/instruments/vouchers",
      expect.objectContaining({
        method: "POST",
        data: expect.objectContaining({ amount: 25, code: "MCOM-ABC" }),
      }),
      "mall:write",
    );
  });

  it("resolves the mall business catalogue with mall:read", async () => {
    await service.getBusiness({ mcomUserId: "central-1" });

    const [clientId, path, , scope] = mesh.callPeerByClientId.mock.calls[0];
    expect(clientId).toBe("mcom-mall");
    expect(path).toContain("/api/v1/partner/catalog/business?");
    expect(path).toContain("mcomUserId=central-1");
    expect(scope).toBe("mall:read");
  });

  it("surfaces a 500 when the mall instrument call fails", async () => {
    mesh.callPeerByClientId.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      service.createGiftCard({
        amount: 10,
        recipientEmail: "jane@example.com",
        businessName: "Acme Ltd",
      }),
    ).rejects.toBeDefined();
  });
});

describe("MallIntegrationService deep-link base URL", () => {
  const build = (values: Record<string, string | undefined>) =>
    new MallIntegrationService(
      {} as any,
      {
        get: <T = string>(key: string) => values[key] as T | undefined,
      } as any,
      {} as any,
      {} as any,
    );

  it("prefers MALL_WEB_URL", () => {
    const service = build({
      MALL_WEB_URL: "http://localhost:3003/",
      MALL_APP_URL: "http://localhost:9999",
      NODE_ENV: "development",
    });
    expect(service.getMallFrontendUrl()).toBe("http://localhost:3003");
  });

  it("falls back through MALL_FRONTEND_URL and MALL_APP_URL", () => {
    expect(
      build({
        MALL_FRONTEND_URL: "https://mall-frontend.example",
        MALL_APP_URL: "http://localhost:9999",
      }).getMallFrontendUrl(),
    ).toBe("https://mall-frontend.example");

    expect(
      build({ MALL_APP_URL: "http://localhost:3003" }).getMallFrontendUrl(),
    ).toBe("http://localhost:3003");
  });

  it("never falls back to the Central host outside production", () => {
    const service = build({
      NODE_ENV: "development",
      MCOM_CENTRAL_WEB_URL: "http://localhost:3000",
    });
    expect(() => service.getMallFrontendUrl()).toThrow(/MALL_WEB_URL/);
  });
});
