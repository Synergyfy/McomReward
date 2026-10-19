import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsService } from "./analytics.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Campaign } from "../campaign/entities/campaign.entity";
import { BusinessCampaign } from "../campaign/entities/business-campaign.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { Participant } from "../participant/entities/participant.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { PartnerIssuanceMetricsService } from "../partner-rewards/services/partner-issuance-metrics.service";

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  const campaignRepository = { find: jest.fn().mockResolvedValue([]) };
  const businessCampaignRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const businessRewardRepository = { find: jest.fn().mockResolvedValue([]) };
  const pointHistoryRepository = { createQueryBuilder: jest.fn() };
  const partnerIssuance = {
    getSummary: jest.fn().mockResolvedValue({
      count: 0,
      points: 0,
      recipientKeys: [],
      byDate: [],
    }),
    businessRewardIdsFor: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Campaign), useValue: campaignRepository },
        {
          provide: getRepositoryToken(BusinessCampaign),
          useValue: businessCampaignRepository,
        },
        {
          provide: getRepositoryToken(PointHistory),
          useValue: pointHistoryRepository,
        },
        { provide: getRepositoryToken(Participant), useValue: {} },
        {
          provide: getRepositoryToken(BusinessReward),
          useValue: businessRewardRepository,
        },
        {
          provide: PartnerIssuanceMetricsService,
          useValue: partnerIssuance,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("folds partner-issued grants into the general analytics", async () => {
    businessCampaignRepository.find.mockResolvedValue([]);
    partnerIssuance.getSummary.mockResolvedValue({
      count: 2,
      points: 30,
      recipientKeys: ["recipient-a", "recipient-b"],
      byDate: [],
    });

    const result = await service.getGeneralAnalytics({ id: "biz-1" } as any);

    expect(result.totalRewardsRedeemed).toBe(2);
    expect(result.totalPointsRedeemed).toBe(30);
    // Recipients of partner grants count as customers.
    expect(result.totalCustomers).toBe(2);
  });

  it("includes partner grants in the chart even without campaigns", async () => {
    businessCampaignRepository.find.mockResolvedValue([]);
    partnerIssuance.getSummary.mockResolvedValue({
      count: 1,
      points: 15,
      recipientKeys: ["recipient-a"],
      byDate: [{ date: "2026-10-16", count: 1, points: 15 }],
    });

    const result = await service.getChartAnalytics({ id: "biz-1" } as any, "30d");

    expect(result.data).toEqual([
      { date: "2026-10-16", pointsEarned: 0, pointsRedeemed: 15 },
    ]);
    // Partner grants are scoped to the period window.
    expect(partnerIssuance.getSummary).toHaveBeenCalledWith(
      expect.objectContaining({ businessId: "biz-1", from: expect.any(Date) }),
    );
  });
});
