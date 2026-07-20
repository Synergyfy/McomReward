import { Test, TestingModule } from "@nestjs/testing";
import { SsoService } from "./sso.service";
import { McomCentralService } from "./mcom-central.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/user.service";
import { MembershipService } from "../membership/membership.service";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Participant } from "../participant/entities/participant.entity";
import { UnauthorizedException } from "@nestjs/common";
import { Role } from "../../common/role.enum";

describe("SsoService", () => {
  let service: SsoService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockMcomCentralService = {
    exchangeCodeForToken: jest.fn(),
  };

  const mockMembershipService = {
    syncFromCentralPackage: jest.fn(),
  };

  const mockBusinessRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockParticipantRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        LOYALTY_FRONTEND_URL: "http://localhost:3005",
        SSO_SECRET: "test-secret",
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SsoService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: McomCentralService, useValue: mockMcomCentralService },
        { provide: MembershipService, useValue: mockMembershipService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Business), useValue: mockBusinessRepository },
        { provide: getRepositoryToken(Participant), useValue: mockParticipantRepository },
      ],
    }).compile();

    service = module.get<SsoService>(SsoService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("exchangeCode", () => {
    it("should throw UnauthorizedException if no user data from MCOM Central", async () => {
      mockMcomCentralService.exchangeCodeForToken.mockResolvedValue({});

      await expect(
        service.exchangeCode("code-123")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should provision new business user and return tokens", async () => {
      const centralUser = {
        email: "new-business@test.com",
        name: "Test Business",
        role: "owner",
      };

      mockMcomCentralService.exchangeCodeForToken.mockResolvedValue({
        user: centralUser,
      });

      mockUserService.findOne.mockResolvedValue(null);

      const savedBusiness = {
        id: "business-id-1",
        email: centralUser.email,
        name: centralUser.name,
        role: Role.Business,
      };

      mockBusinessRepository.create.mockReturnValue(savedBusiness);
      mockBusinessRepository.save.mockResolvedValue(savedBusiness);

      mockJwtService.sign.mockImplementation((payload, opts) => {
        return `token-${opts?.expiresIn}`;
      });

      const result = await service.exchangeCode("code-123");

      expect(result.accessToken).toBe("token-1h");
      expect(result.refreshToken).toBe("token-7d");
      expect(result.userId).toBe("business-id-1");
      expect(result.name).toBe("Test Business");
      expect(result.role).toBe(Role.Business);
      expect(mockBusinessRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: centralUser.email,
          name: centralUser.name,
          role: Role.Business,
          isEmailVerified: true,
        })
      );
    });

    it("should provision new participant user", async () => {
      const centralUser = {
        email: "new-customer@test.com",
        name: "Test Customer",
        role: "customer",
      };

      mockMcomCentralService.exchangeCodeForToken.mockResolvedValue({
        user: centralUser,
      });

      mockUserService.findOne.mockResolvedValue(null);

      const savedParticipant = {
        id: "participant-id-1",
        email: centralUser.email,
        name: centralUser.name,
        role: Role.Participant,
      };

      mockParticipantRepository.create.mockReturnValue(savedParticipant);
      mockParticipantRepository.save.mockResolvedValue(savedParticipant);

      mockJwtService.sign.mockImplementation((payload, opts) => {
        return `token-${opts?.expiresIn}`;
      });

      const result = await service.exchangeCode("code-123");

      expect(result.userId).toBe("participant-id-1");
      expect(result.role).toBe(Role.Participant);
      expect(mockParticipantRepository.create).toHaveBeenCalled();
    });

    it("should update existing user name if changed", async () => {
      const centralUser = {
        email: "existing@test.com",
        name: "Updated Name",
        role: "customer",
      };

      mockMcomCentralService.exchangeCodeForToken.mockResolvedValue({
        user: centralUser,
      });

      const existingParticipant = Object.create(Participant.prototype, {
        id: { value: "existing-id", writable: true },
        email: { value: "existing@test.com", writable: true },
        name: { value: "Old Name", writable: true },
        role: { value: Role.Participant, writable: true },
      });

      mockUserService.findOne.mockResolvedValue(existingParticipant);
      mockParticipantRepository.save.mockResolvedValue(existingParticipant);

      mockJwtService.sign.mockImplementation((payload, opts) => {
        return `token-${opts?.expiresIn}`;
      });

      const result = await service.exchangeCode("code-123");

      expect(result.name).toBe("Updated Name");
      expect(mockParticipantRepository.save).toHaveBeenCalled();
    });
  });

  describe("loginWithSsoToken", () => {
    it("should throw UnauthorizedException for invalid token", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(
        service.loginWithSsoToken("invalid-token")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for wrong issuer", async () => {
      mockJwtService.verify.mockReturnValue({
        email: "test@test.com",
        name: "Test",
        role: "customer",
        iss: "wrong-issuer",
        aud: "mcom-mall",
      });

      await expect(
        service.loginWithSsoToken("token")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for wrong audience", async () => {
      mockJwtService.verify.mockReturnValue({
        email: "test@test.com",
        name: "Test",
        role: "customer",
        iss: "mcom-loyalty",
        aud: "wrong-audience",
      });

      await expect(
        service.loginWithSsoToken("token")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should login existing user with valid SSO token", async () => {
      const ssoPayload = {
        email: "existing@test.com",
        name: "Existing User",
        role: "customer",
        iss: "mcom-loyalty",
        aud: "mcom-mall",
      };

      mockJwtService.verify.mockReturnValue(ssoPayload);

      const existingUser = {
        id: "user-id-1",
        email: "existing@test.com",
        name: "Existing User",
        role: Role.Participant,
      };

      mockUserService.findOne.mockResolvedValue(existingUser);

      mockJwtService.sign.mockImplementation((payload, opts) => {
        return `token-${opts?.expiresIn}`;
      });

      const result = await service.loginWithSsoToken("valid-token");

      expect(result.accessToken).toBe("token-1h");
      expect(result.refreshToken).toBe("token-7d");
      expect(result.user.name).toBe("Existing User");
      expect(result.user.role).toBe(Role.Participant);
    });

    it("should accept mcom-central as issuer", async () => {
      const ssoPayload = {
        email: "central@test.com",
        name: "Central User",
        role: "customer",
        iss: "mcom-central",
        aud: "mcom-mall",
      };

      mockJwtService.verify.mockReturnValue(ssoPayload);

      const existingUser = {
        id: "user-id-2",
        email: "central@test.com",
        name: "Central User",
        role: Role.Participant,
      };

      mockUserService.findOne.mockResolvedValue(existingUser);

      mockJwtService.sign.mockImplementation((payload, opts) => {
        return `token-${opts?.expiresIn}`;
      });

      const result = await service.loginWithSsoToken("valid-token");

      expect(result.user.name).toBe("Central User");
    });

    it("should accept mcom-ecosystem as audience", async () => {
      const ssoPayload = {
        email: "eco@test.com",
        name: "Eco User",
        role: "customer",
        iss: "mcom-loyalty",
        aud: "mcom-ecosystem",
      };

      mockJwtService.verify.mockReturnValue(ssoPayload);

      const existingUser = {
        id: "user-id-3",
        email: "eco@test.com",
        name: "Eco User",
        role: Role.Participant,
      };

      mockUserService.findOne.mockResolvedValue(existingUser);

      mockJwtService.sign.mockImplementation((payload, opts) => {
        return `token-${opts?.expiresIn}`;
      });

      const result = await service.loginWithSsoToken("valid-token");

      expect(result.user.name).toBe("Eco User");
    });
  });
});
