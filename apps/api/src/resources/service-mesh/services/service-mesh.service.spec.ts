import axios from "axios";
import { ServiceMeshService } from "./service-mesh.service";

jest.mock("axios");

const mockedAxios = axios as unknown as jest.Mock & {
  post: jest.Mock;
  get: jest.Mock;
};

const makeConfig = (overrides: Record<string, string> = {}) => {
  const values: Record<string, string> = {
    MCOM_SOLUTIONS_URL: "https://auth.mcomsolutions.com",
    MCOM_CLIENT_ID: "mcom-rewards",
    MCOM_CLIENT_SECRET: "cs_live_test",
    MCOM_SERVICE_SCOPES: "rewards:read rewards:issue",
    ...overrides,
  };
  return { get: jest.fn((key: string) => values[key]) } as any;
};

describe("ServiceMeshService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.mockResolvedValue({ data: { ok: true } });
  });

  it("mints a service token and caches it until expiry", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "tok-1", expires_in: 300 },
    });
    const service = new ServiceMeshService(makeConfig());

    const first = await service.getServiceToken("fundordonate");
    const second = await service.getServiceToken("fundordonate");

    expect(first).toBe("tok-1");
    expect(second).toBe("tok-1");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    const [url, body, options] = mockedAxios.post.mock.calls[0];
    expect(url).toBe(
      "https://auth.mcomsolutions.com/api/v1/auth/service-token",
    );
    expect(body).toMatchObject({
      grant_type: "client_credentials",
      audience: "fundordonate",
    });
    expect(options.headers.Authorization).toMatch(/^Basic /);
  });

  it("calls the peer DIRECTLY with a Bearer token and X-Caller-Id header", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "tok-2", expires_in: 300 },
    });
    mockedAxios.mockResolvedValue({ data: { rewards: [] } });
    const service = new ServiceMeshService(makeConfig());

    const result = await service.callPeer(
      "https://api.fundordonate.mcom.com/",
      "fundordonate",
      "/api/v1/partner/events",
      { method: "POST", data: { event: "reward.issued" } },
      "rewards:issue",
    );

    expect(result).toEqual({ rewards: [] });
    const call = mockedAxios.mock.calls[0][0];
    expect(call.url).toBe(
      "https://api.fundordonate.mcom.com/api/v1/partner/events",
    );
    expect(call.method).toBe("POST");
    expect(call.headers.Authorization).toBe("Bearer tok-2");
    expect(call.headers["X-Caller-Id"]).toBe("mcom-rewards");
    // The doc mandates no shared/webhook secret on app-to-app calls.
    expect(call.headers["x-mcom-signature"]).toBeUndefined();

    // Scope was forwarded to token minting.
    expect(mockedAxios.post.mock.calls[0][1]).toMatchObject({
      scope: "rewards:issue",
    });
  });

  it("resolves a peer's base URL from the registry before calling it", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { access_token: "tok-3", expires_in: 300 },
    });
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          clientId: "fundordonate",
          baseUrl: "https://api.fundordonate.mcom.com",
        },
      ],
    });
    mockedAxios.mockResolvedValue({ data: { ok: true } });
    const service = new ServiceMeshService(makeConfig());

    await service.callPeerByClientId("fundordonate", "/api/v1/partner/events", {
      method: "POST",
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://auth.mcomsolutions.com/api/v1/ecosystem/services",
      expect.any(Object),
    );
    const call = mockedAxios.mock.calls[0][0];
    expect(call.url).toBe(
      "https://api.fundordonate.mcom.com/api/v1/partner/events",
    );
  });
});
