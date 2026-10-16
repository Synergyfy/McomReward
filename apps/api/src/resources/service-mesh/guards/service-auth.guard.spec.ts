import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { ServiceAuthGuard } from "./service-auth.guard";

const makeContext = (headers: Record<string, any>): any => {
  const req: any = { headers };
  const ctx: any = {
    switchToHttp: () => ({ getRequest: () => req }),
    _req: req,
  };
  return ctx;
};

describe("ServiceAuthGuard", () => {
  let jwks: any;
  let mesh: any;
  let config: any;
  let guard: ServiceAuthGuard;

  beforeEach(() => {
    jwks = { verifyServiceToken: jest.fn() };
    mesh = { findService: jest.fn().mockResolvedValue(null) };
    config = {
      get: jest.fn(
        (key: string) =>
          ({
            MCOM_CLIENT_ID: "mcom-rewards",
            MCOM_ALLOWED_CALLERS: "fundordonate",
          })[key],
      ),
    };
    guard = new ServiceAuthGuard(jwks, mesh, config);
  });

  it("throws 401 when the Bearer token is missing", async () => {
    await expect(guard.canActivate(makeContext({}))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("throws 401 when token verification fails", async () => {
    jwks.verifyServiceToken.mockRejectedValue(new Error("bad signature"));
    await expect(
      guard.canActivate(makeContext({ authorization: "Bearer abc" })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("throws 403 for a caller outside allowedCallers", async () => {
    jwks.verifyServiceToken.mockResolvedValue({
      sub: "evil-app",
      typ: "service",
      scope: "rewards:read",
    });
    await expect(
      guard.canActivate(makeContext({ authorization: "Bearer abc" })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("attaches caller context for a permitted service token", async () => {
    jwks.verifyServiceToken.mockResolvedValue({
      sub: "fundordonate",
      typ: "service",
      scope: "rewards:read rewards:issue",
    });
    const ctx = makeContext({ authorization: "Bearer abc" });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(ctx._req.serviceCaller.callerAppId).toBe("fundordonate");
    expect(ctx._req.serviceCaller.scopes).toEqual([
      "rewards:read",
      "rewards:issue",
    ]);
    expect(ctx._req.serviceCaller.isDelegated).toBe(false);
    expect(jwks.verifyServiceToken).toHaveBeenCalledWith("abc", "mcom-rewards");
  });

  it("resolves a delegated caller from the act.sub claim", async () => {
    jwks.verifyServiceToken.mockResolvedValue({
      sub: "user-1",
      typ: "delegated",
      act: { sub: "fundordonate" },
      scope: "rewards:read",
    });
    const ctx = makeContext({ authorization: "Bearer abc" });

    await guard.canActivate(ctx);
    expect(ctx._req.serviceCaller.callerAppId).toBe("fundordonate");
    expect(ctx._req.serviceCaller.isDelegated).toBe(true);
    expect(ctx._req.serviceCaller.userId).toBe("user-1");
  });

  it("falls back to the registry when MCOM_ALLOWED_CALLERS is unset", async () => {
    config.get = jest.fn((key: string) =>
      key === "MCOM_CLIENT_ID" ? "mcom-rewards" : undefined,
    );
    mesh.findService.mockResolvedValue({ allowedCallers: ["fundordonate"] });
    jwks.verifyServiceToken.mockResolvedValue({
      sub: "fundordonate",
      typ: "service",
    });

    await expect(
      guard.canActivate(makeContext({ authorization: "Bearer abc" })),
    ).resolves.toBe(true);
    expect(mesh.findService).toHaveBeenCalledWith("mcom-rewards");
  });
});
