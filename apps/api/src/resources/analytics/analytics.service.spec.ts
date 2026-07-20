import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsService } from "./analytics.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Campaign } from "../campaign/entities/campaign.entity";
import { BusinessCampaign } from "../campaign/entities/business-campaign.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { Participant } from "../participant/entities/participant.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Campaign),
          useValue: {},
        },
        {
          provide: getRepositoryToken(BusinessCampaign),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PointHistory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Participant),
          useValue: {},
        },
        {
          provide: getRepositoryToken(BusinessReward),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
