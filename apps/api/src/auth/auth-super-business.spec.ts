import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { HashService } from "../common/hash/hash.service";
import { OtpService } from "../resources/otp/otp.service";
import { MailService } from "../mail/mail.service";
import { BusinessService } from "../resources/business/services/business.service";
import { PartnerService } from "../resources/partner/partner.service";
import { ParticipantProgressionService } from "../resources/participant-progression/participant-progression.service";
import { PlanSubscription } from "../resources/plans/entities/plan-subscription.entity";
import { Business } from "../resources/business/entities/business.entity";
import { Staff } from "../resources/staff/entities/staff.entity";
import { Participant } from "../resources/participant/entities/participant.entity";
import { Network } from "../resources/network/entities/network.entity";
import { Role } from "../common/role.enum";

describe("AuthService Super Business login", () => {
  let service: AuthService;

  const mockUserService = { findOne: jest.fn(), save: jest.fn() };
  const mockHashService = { comparePassword: jest.fn() };
  const mockJwtService = { sign: jest.fn() };
  const mockOtpService = {
    create: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const mockMailService = { sendOtp: jest.fn(), sendMail: jest.fn() };
  const mockBusinessService = { findById: jest.fn() };
  const mockPartnerService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };
  const mockProgressionService = {
    handleLoginStreak: jest.fn(),
    triggerAction: jest.fn(),
  };
  const mockConfigService = { get: jest.fn() };

  const mockPlanSubscriptionRepository = { findOne: jest.fn() };
  const mockBusinessRepository = { findOne: jest.fn() };
  const mockStaffRepository = { findOne: jest.fn() };
  const mockParticipantRepository = { findOne: jest.fn() };
  const mockNetworkRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: MailService, useValue: mockMailService },
        { provide: BusinessService, useValue: mockBusinessService },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: ParticipantProgressionService, useValue: mockProgressionService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(PlanSubscription),
          useValue: mockPlanSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        { provide: getRepositoryToken(Staff), useValue: mockStaffRepository },
        {
          provide: getRepositoryToken(Participant),
          useValue: mockParticipantRepository,
        },
        { provide: getRepositoryToken(Network), useValue: mockNetworkRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockJwtService.sign.mockReturnValue("signed-token");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("adds Super Business claims and bypasses subscription lookup", async () => {
      mockBusinessService.findById.mockResolvedValue({
        sector: {},
        isSuperBusiness: true,
      });

      const result = await service.login({
        id: "biz-1",
        name: "Acme Group",
        email: "ops@acme.com",
        role: Role.Business,
        isEmailVerified: true,
      });

      expect(mockPlanSubscriptionRepository.findOne).not.toHaveBeenCalled();
      expect(result.user.isSuperBusiness).toBe(true);

      const signedPayload = mockJwtService.sign.mock.calls[0][0];
      expect(signedPayload.isSuperBusiness).toBe(true);
      expect(signedPayload.hasActiveSubscription).toBe(true);
      expect(signedPayload.businessId).toBe("biz-1");
    });
  });
});
