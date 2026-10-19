import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RewardIssuance } from "../entities/reward-issuance.entity";
import { BusinessReward } from "../../rewards/entities/business-reward.entity";
import { RewardIssuanceStatus } from "../enums/partner-reward.enums";
import {
  PartnerIssuanceMetricsService,
  LIVE_ISSUANCE_STATUSES,
} from "./partner-issuance-metrics.service";

const buildQb = (result: {
  many?: any[];
  rawMany?: any[];
  rawOne?: any;
}) => {
  const qb: any = {};
  qb.where = jest.fn(() => qb);
  qb.andWhere = jest.fn(() => qb);
  qb.select = jest.fn(() => qb);
  qb.addSelect = jest.fn(() => qb);
  qb.groupBy = jest.fn(() => qb);
  qb.getMany = jest.fn().mockResolvedValue(result.many ?? []);
  qb.getRawMany = jest.fn().mockResolvedValue(result.rawMany ?? []);
  qb.getRawOne = jest.fn().mockResolvedValue(result.rawOne ?? {});
  return qb;
};

describe("PartnerIssuanceMetricsService", () => {
  let service: PartnerIssuanceMetricsService;
  const issuanceRepo = { createQueryBuilder: jest.fn() };
  const businessRewardRepo = { find: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerIssuanceMetricsService,
        {
          provide: getRepositoryToken(RewardIssuance),
          useValue: issuanceRepo,
        },
        {
          provide: getRepositoryToken(BusinessReward),
          useValue: businessRewardRepo,
        },
      ],
    }).compile();

    service = module.get(PartnerIssuanceMetricsService);
  });

  it("counts only live issuance statuses", () => {
    expect(LIVE_ISSUANCE_STATUSES).toEqual([
      RewardIssuanceStatus.ISSUED,
      RewardIssuanceStatus.RESERVED,
      RewardIssuanceStatus.REDEEMED,
    ]);
  });

  it("returns an empty summary when there are no business rewards", async () => {
    const summary = await service.getSummary({ businessRewardIds: [] });
    expect(summary).toEqual({
      count: 0,
      points: 0,
      recipientKeys: [],
      byDate: [],
    });
    expect(issuanceRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("aggregates live grants by count, points, recipient and day", async () => {
    const qb = buildQb({
      many: [
        {
          id: "i1",
          recipient_email: "A@Example.com",
          recipient_user_id: null,
          recipient_mcom_user_id: "m1",
          points_awarded: 10,
          created_at: new Date("2026-10-16T00:00:00Z"),
        },
        {
          id: "i2",
          recipient_email: "a@example.com",
          recipient_user_id: null,
          recipient_mcom_user_id: null,
          points_awarded: null,
          created_at: new Date("2026-10-16T06:00:00Z"),
        },
        {
          id: "i3",
          recipient_email: "b@example.com",
          recipient_user_id: null,
          recipient_mcom_user_id: "m2",
          points_awarded: 5,
          created_at: new Date("2026-10-17T00:00:00Z"),
        },
      ],
    });
    issuanceRepo.createQueryBuilder.mockReturnValue(qb);

    const summary = await service.getSummary({
      businessRewardIds: ["br1"],
    });

    expect(summary.count).toBe(3);
    expect(summary.points).toBe(15);
    expect(summary.recipientKeys.sort()).toEqual(
      ["a@example.com", "m1", "m2"].sort(),
    );
    expect(summary.byDate).toEqual([
      { date: "2026-10-16", count: 2, points: 10 },
      { date: "2026-10-17", count: 1, points: 5 },
    ]);
    // Status filter is always applied.
    expect(qb.andWhere).toHaveBeenCalledWith(
      "issuance.status IN (:...statuses)",
      { statuses: LIVE_ISSUANCE_STATUSES },
    );
  });

  it("resolves a business's reward ids", async () => {
    businessRewardRepo.find.mockResolvedValue([{ id: "br1" }, { id: "br2" }]);
    const ids = await service.businessRewardIdsFor("biz-1");
    expect(ids).toEqual(["br1", "br2"]);
  });

  it("maps per-reward counts and points", async () => {
    const qb = buildQb({
      rawMany: [
        { businessRewardId: "br1", count: "2", points: "30" },
        { businessRewardId: "br2", count: "1", points: "0" },
      ],
    });
    issuanceRepo.createQueryBuilder.mockReturnValue(qb);

    const map = await service.getCountsByBusinessReward(["br1", "br2"]);
    expect(map.get("br1")).toEqual({ count: 2, points: 30 });
    expect(map.get("br2")).toEqual({ count: 1, points: 0 });
  });

  it("maps per-reward value", async () => {
    const qb = buildQb({
      rawMany: [{ businessRewardId: "br1", count: "1", value: "20.00" }],
    });
    issuanceRepo.createQueryBuilder.mockReturnValue(qb);

    const map = await service.getValueByBusinessReward(["br1"]);
    expect(map.get("br1")).toEqual({ count: 1, value: 20 });
  });

  it("returns platform-wide totals", async () => {
    const qb = buildQb({ rawOne: { count: "7", points: "42" } });
    issuanceRepo.createQueryBuilder.mockReturnValue(qb);

    const summary = await service.getGlobalSummary();
    expect(summary).toEqual({ count: 7, points: 42 });
  });
});
