import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ServiceScopesGuard } from "./service-scopes.guard";
import { REQUIRED_SERVICE_SCOPES_KEY } from "../decorators/require-service-scopes.decorator";

const makeContext = (serviceCaller?: any): any => {
  const req: any = { serviceCaller };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
};

describe("ServiceScopesGuard", () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  let guard: ServiceScopesGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new ServiceScopesGuard(reflector);
  });

  it("allows when no scopes are required", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it("allows when the granted scopes satisfy the requirement", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      "rewards:issue",
    ]);
    expect(
      guard.canActivate(
        makeContext({ scopes: ["rewards:read", "rewards:issue"] }),
      ),
    ).toBe(true);
  });

  it("rejects when a required scope is missing", () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      "rewards:issue",
    ]);
    expect(() =>
      guard.canActivate(makeContext({ scopes: ["rewards:read"] })),
    ).toThrow(ForbiddenException);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      REQUIRED_SERVICE_SCOPES_KEY,
      expect.any(Array),
    );
  });
});
