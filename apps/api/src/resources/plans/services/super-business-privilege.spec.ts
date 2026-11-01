import { PlanSubscriptionService } from "./plan-subscription.service";

describe("PlanSubscriptionService super business privilege", () => {
  const businessRepository = { findOne: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue(undefined) };

  let service: PlanSubscriptionService;

  beforeEach(() => {
    businessRepository.findOne.mockReset();
    service = new PlanSubscriptionService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      businessRepository as any,
      {} as any,
      configService as any,
    );
  });

  it("reads the privilege from the database and caches it", async () => {
    businessRepository.findOne.mockResolvedValue({
      id: "biz-1",
      isSuperBusiness: true,
    });

    await expect(service.isSuperBusiness("biz-1")).resolves.toBe(true);
    await expect(service.isSuperBusiness("biz-1")).resolves.toBe(true);

    expect(businessRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it("re-reads after the cache is invalidated", async () => {
    businessRepository.findOne.mockResolvedValueOnce({
      id: "biz-1",
      isSuperBusiness: true,
    });
    await expect(service.isSuperBusiness("biz-1")).resolves.toBe(true);

    // Admin revokes the privilege; invalidation must force the next read.
    businessRepository.findOne.mockResolvedValueOnce({
      id: "biz-1",
      isSuperBusiness: false,
    });
    service.invalidateSuperBusinessCache("biz-1");

    await expect(service.isSuperBusiness("biz-1")).resolves.toBe(false);
    expect(businessRepository.findOne).toHaveBeenCalledTimes(2);
  });

  it("returns false when the business cannot be found", async () => {
    businessRepository.findOne.mockResolvedValue(null);

    await expect(service.isSuperBusiness("missing")).resolves.toBe(false);
  });
});
