import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MembershipService } from "./membership.service";
import { Membership } from "./entities/membership.entity";
import { PaymentHistory } from "../payment-history/entities/payment-history.entity";
import { Tier } from "../tier/entities/tier.entity";
import { PaymentService } from "../payment/payment.service";
import { McomCentralService } from "../sso/mcom-central.service";
import { ConfigService } from "@nestjs/config";

describe("MembershipService", () => {
  let service: MembershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: getRepositoryToken(Membership),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(PaymentHistory),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Tier),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: PaymentService,
          useValue: {},
        },
        {
          provide: McomCentralService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(15000),
          },
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
