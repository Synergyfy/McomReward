import { Test, TestingModule } from "@nestjs/testing";
import { SsoController } from "./sso.controller";
import { SsoService } from "./sso.service";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";

describe("SsoController", () => {
  let controller: SsoController;

  const mockSsoService = {
    loginWithSsoToken: jest.fn(),
    exchangeCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SsoController],
      providers: [
        { provide: SsoService, useValue: mockSsoService },
      ],
    }).compile();

    controller = module.get<SsoController>(SsoController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("ssoLogin", () => {
    it("should return tokens on successful SSO login", async () => {
      mockSsoService.loginWithSsoToken.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { name: "Test User", role: "Business" },
      });

      const result = await controller.ssoLogin("valid-token");

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { name: "Test User", role: "Business" },
      });
    });

    it("should throw UnauthorizedException if token is missing", async () => {
      await expect(controller.ssoLogin(undefined as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw UnauthorizedException on SSO login failure", async () => {
      mockSsoService.loginWithSsoToken.mockRejectedValue(
        new UnauthorizedException("SSO failed")
      );

      await expect(controller.ssoLogin("invalid-token")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("exchangeCode", () => {
    it("should return tokens on successful code exchange", async () => {
      mockSsoService.exchangeCode.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        userId: "user-id",
        name: "Test User",
        role: "Business",
      });

      const result = await controller.exchangeCode("auth-code-123");

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        userId: "user-id",
        name: "Test User",
        role: "Business",
      });
      expect(mockSsoService.exchangeCode).toHaveBeenCalledWith("auth-code-123");
    });

    it("should throw BadRequestException if code is missing", async () => {
      await expect(controller.exchangeCode(undefined as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw UnauthorizedException on exchange failure", async () => {
      mockSsoService.exchangeCode.mockRejectedValue(
        new UnauthorizedException("Exchange failed")
      );

      await expect(controller.exchangeCode("bad-code")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
