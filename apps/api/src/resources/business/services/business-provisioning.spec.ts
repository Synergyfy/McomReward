import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { Business } from "../entities/business.entity";
import { Referral } from "../../referral/entities/referral.entity";
import { HashService } from "../../../common/hash/hash.service";
import { SectorService } from "../../sector/services/sector.service";
import { CategoryService } from "../../category/category.service";
import { SubcategoryService } from "../../subcategory/subcategory.service";
import { PaymentHistoryService } from "../../payment-history/payment-history.service";
import { PointHistory } from "../../participant-campaign-balance/entities/point-history.entity";
import { SystemSettingService } from "../../system-setting/services/system-setting.service";
import { BusinessCampaign } from "../../campaign/entities/business-campaign.entity";
import { BusinessReward } from "../../rewards/entities/business-reward.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { Network } from "../../network/entities/network.entity";
import { PaymentService } from "../../payment/payment.service";
import { MatchingPointService } from "../../matching-point/services/matching-point.service";
import { ReferralService } from "../../referral/referral.service";
import { OtpService } from "../../otp/otp.service";
import { MailService } from "../../../mail/mail.service";
import { WalletService } from "../../wallet/wallet.service";
import { StampPackageService } from "../../stamp/services/stamp-package.service";
import { ProvisionService } from "../../provision/provision.service";
import { PlanSubscriptionService } from "../../plans/services/plan-subscription.service";
import { McomCentralService } from "../../sso/mcom-central.service";
import { AccessPassService } from "../../access-passes/access-pass.service";
import { CreateBusinessDto } from "../dto/create-business.dto";

describe("BusinessService provisioning", () => {
  let service: BusinessService;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  const mockHashService = {
    hashPassword: jest.fn().mockResolvedValue("hashed-password"),
  };

  const mockOtpService = {
    create: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockMailService = {
    sendOtp: jest.fn(),
  };

  const mockWalletService = {
    createWallet: jest.fn(),
  };

  const mockProvisionService = {
    findByCode: jest.fn(),
    validateAndMarkRedeemed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        { provide: getRepositoryToken(Business), useValue: mockRepo },
        { provide: getRepositoryToken(Referral), useValue: mockRepo },
        { provide: getRepositoryToken(PointHistory), useValue: mockRepo },
        { provide: getRepositoryToken(BusinessCampaign), useValue: mockRepo },
        { provide: getRepositoryToken(BusinessReward), useValue: mockRepo },
        { provide: getRepositoryToken(Staff), useValue: mockRepo },
        { provide: getRepositoryToken(Network), useValue: mockRepo },
        { provide: HashService, useValue: mockHashService },
        { provide: SectorService, useValue: mockService },
        { provide: CategoryService, useValue: mockService },
        { provide: SubcategoryService, useValue: mockService },
        { provide: PaymentHistoryService, useValue: mockService },
        { provide: SystemSettingService, useValue: mockService },
        { provide: PaymentService, useValue: mockService },
        { provide: MatchingPointService, useValue: mockService },
        { provide: ReferralService, useValue: mockService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: MailService, useValue: mockMailService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: StampPackageService, useValue: mockService },
        { provide: ProvisionService, useValue: mockProvisionService },
        { provide: PlanSubscriptionService, useValue: mockService },
        { provide: McomCentralService, useValue: mockService },
        { provide: AccessPassService, useValue: mockService },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);

    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockImplementation((data) => ({ id: "bus-1", ...data }));
    mockRepo.save.mockImplementation(async (data) => data);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const dto: CreateBusinessDto = {
      firstName: "Test",
      lastName: "Business",
      email: "test@business.com",
      password: "password",
      confirmPassword: "password",
    };

    it("keeps self-service signup behaviour: unverified + OTP", async () => {
      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isSuperBusiness: false,
          isEmailVerified: false,
          password: "hashed-password",
        }),
      );
      expect(mockOtpService.create).toHaveBeenCalledWith(
        "test@business.com",
        expect.any(String),
      );
      expect(mockMailService.sendOtp).toHaveBeenCalled();
      expect(result.isSuperBusiness).toBe(false);
      expect(result.isEmailVerified).toBe(false);
    });

    it("still validates provision codes for self-service signup", async () => {
      mockProvisionService.findByCode.mockResolvedValue(null);

      await expect(
        service.create({ ...dto, provisionCode: "INVALID-PROV" }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
