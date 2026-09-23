import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Admin } from "../entities/admin.entity";
import { Business } from "../../business/entities/business.entity";
import { BusinessService } from "../../business/services/business.service";
import { StaffService } from "../../staff/services/staff.service";
import { PointHistory } from "../../participant-campaign-balance/entities/point-history.entity";
import { CreateAdminDto } from "../dto/create-admin.dto";
import { CreateSuperBusinessDto } from "../dto/create-super-business.dto";
import { HashService } from "../../../common/hash/hash.service";
import { Campaign } from "../../campaign/entities/campaign.entity";
import { CampaignService } from "../../campaign/campaign.service";
import { ParticipantService } from "../../participant/participant.service";
import { UpdateBusinessDto } from "../../business/dto/update-business.dto";
import { UpdateStaffDto } from "../../staff/dto/update-staff.dto";
import { UpdateCampaignDto } from "../../campaign/dto/update-campaign.dto";
import { Role } from "../../../common/role.enum";
import { PaginationResult } from "../../../common/interfaces/pagination-result.interface";
import { Staff } from "../../staff/entities/staff.entity";
import { Reward } from "../../rewards/entities/reward.entity";
import { Participant } from "../../participant/entities/participant.entity";
import { PlanSubscription } from "../../plans/entities/plan-subscription.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    private readonly businessService: BusinessService,
    private readonly staffService: StaffService,
    private readonly campaignService: CampaignService,
    private readonly participantService: ParticipantService,
    private readonly hashService: HashService,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @InjectRepository(PlanSubscription)
    private readonly planSubscriptionRepository: Repository<PlanSubscription>,
  ) {}

  async createSuperBusiness(createSuperBusinessDto: CreateSuperBusinessDto) {
    return this.businessService.create(createSuperBusinessDto, true);
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existingAdmin = await this.findByEmail(createAdminDto.email);
    if (existingAdmin) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await this.hashService.hashPassword(
      createAdminDto.password,
    );
    const { confirmPassword, ...adminData } = createAdminDto;
    const admin = this.adminRepository.create({
      ...adminData,
      password: hashedPassword,
    });
    return this.adminRepository.save(admin);
  }

  async findByEmail(email: string): Promise<Admin | undefined> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async globalSearch(query: string) {
    const term = `%${query}%`;
    const [businesses, participants, staffs, rewards, campaigns] =
      await Promise.all([
        this.businessRepository.find({
          where: [{ name: ILike(term) }, { email: ILike(term) }],
          select: [
            "id",
            "name",
            "email",
            "profile_image",
            "uniqueCode",
            "role",
          ],
          take: 10,
        }),
        this.participantRepository.find({
          where: [{ name: ILike(term) }, { email: ILike(term) }],
          select: ["id", "name", "email", "uniqueCode", "role"],
          take: 10,
        }),
        this.staffRepository.find({
          where: [{ name: ILike(term) }, { email: ILike(term) }],
          select: ["id", "name", "email", "avatar", "role"],
          take: 10,
        }),
        this.rewardRepository.find({
          where: [{ title: ILike(term) }, { description: ILike(term) }],
          select: [
            "id",
            "title",
            "description",
            "image",
            "value",
            "max_points",
          ],
          take: 10,
        }),
        this.campaignRepository.find({
          where: [{ name: ILike(term) }, { campaign_message: ILike(term) }],
          select: [
            "id",
            "name",
            "campaign_message",
            "banner_url",
            "uniqueCode",
          ],
          take: 10,
        }),
      ]);

    return [
      ...businesses.map((b) => ({ ...b, tag: "business" })),
      ...participants.map((p) => ({ ...p, tag: "participant" })),
      ...staffs.map((s) => ({ ...s, tag: "staff" })),
      ...rewards.map((r) => ({ ...r, tag: "reward" })),
      ...campaigns.map((c) => ({ ...c, tag: "campaign" })),
    ];
  }

  async getBusinesses(
    page: number,
    limit: number,
  ): Promise<PaginationResult<Business>> {
    const result = await this.businessService.findAll(page, limit);
    const enrichedBusinesses = await this.enrichBusinessRecords(result.data);
    return {
      ...result,
      data: enrichedBusinesses,
    };
  }

  async getSuperBusinesses(
    page: number,
    limit: number,
  ): Promise<PaginationResult<Business>> {
    const result = await this.businessService.findAllSuperBusinesses(
      page,
      limit,
    );
    const enrichedBusinesses = await this.enrichBusinessRecords(result.data);
    return {
      ...result,
      data: enrichedBusinesses,
    };
  }

  private async enrichBusinessRecords(
    businesses: Business[],
  ): Promise<Business[]> {
    if (businesses.length === 0) return businesses;
    const businessIds = businesses.map((b) => b.id);

    // Batch 1: latest subscription per business (single query with DISTINCT ON)
    const latestSubs = await this.planSubscriptionRepository.query(
      `SELECT DISTINCT ON (sub.business_id) sub.id AS "subId"
       FROM plan_subscriptions sub
       WHERE sub.business_id = ANY($1)
       ORDER BY sub.business_id, sub.created_at DESC`,
      [businessIds],
    );
    const subIds: string[] = (latestSubs ?? []).map((r: any) => r.subId).filter(Boolean);

    const subMap = new Map<string, any>();
    if (subIds.length > 0) {
      const subs = await this.planSubscriptionRepository
        .createQueryBuilder("sub")
        .leftJoinAndSelect("sub.planVariant", "variant")
        .leftJoinAndSelect("variant.plan", "plan")
        .leftJoinAndSelect("variant.tierLevel", "tier")
        .leftJoin("sub.business", "business")
        .addSelect("business.id")
        .where("sub.id IN (:...subIds)", { subIds })
        .getMany();
      for (const s of subs) {
        const bid = (s as any).business?.id;
        if (bid) subMap.set(bid, s);
      }
    }

    // Batch 2: points used this month for all businesses in one GROUP BY
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const usageRows = await this.pointHistoryRepository
      .createQueryBuilder("ph")
      .select("ph.business_id", "businessId")
      .addSelect("SUM(ph.points)", "total")
      .where("ph.business_id IN (:...businessIds)", { businessIds })
      .andWhere("ph.created_at >= :startOfMonth", { startOfMonth })
      .andWhere("ph.type IN (:...types)", { types: ["EARN"] })
      .groupBy("ph.business_id")
      .getRawMany<{ businessId: string; total: string }>();
    const usageMap = new Map<string, number>(
      (usageRows ?? []).map((r) => [r.businessId, Number(r.total) || 0]),
    );

    return businesses.map((business) => {
      const subscription = subMap.get(business.id);
      if (subscription) {
        business.subscriptions = [subscription];
      }

      let remainingPointBalance = 0;
      const tierConfig = (subscription?.planVariant?.tierLevel as any)?.configuration;
      if (tierConfig) {
        const monthlyPointsAllowance = tierConfig.quotas?.monthlyPointsAllowance;
        if (monthlyPointsAllowance === -1) {
          remainingPointBalance = -1;
        } else if (typeof monthlyPointsAllowance === "number") {
          const used = usageMap.get(business.id) ?? 0;
          remainingPointBalance = Math.max(0, monthlyPointsAllowance - used);
        }
      }
      business.remainingPointBalance = remainingPointBalance;

      if (business.sector) {
        (business as any).sector = (business.sector as any).name ?? business.sector;
      }
      const tierName =
        subscription?.planVariant?.tierLevel?.name ||
        subscription?.planVariant?.plan?.name ||
        null;
      (business as any).tier = tierName;
      return business;
    });
  }

  private async enrichBusinessRecord(business: Business): Promise<Business> {
    const [enriched] = await this.enrichBusinessRecords([business]);
    return enriched;
  }

  async getStaffs(businessId: string, page: number, limit: number) {
    return this.staffService.findAll(businessId, page, limit);
  }

  // Business Management
  async getBusiness(id: string) {
    return this.businessService.findById(id, [
      "sector",
      "category",
      "subCategory",
    ]);
  }

  async updateBusiness(id: string, updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id, updateBusinessDto);
  }

  async disableBusiness(id: string) {
    const business = await this.businessService.findById(id);
    if (!business) throw new NotFoundException("Business not found");
    return this.businessService.update(id, {
      isDisabled: !business.isDisabled,
    });
  }

  // Staff Management
  async getStaff(id: string) {
    return this.staffService.findOne(id);
  }

  async updateStaff(id: string, updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  async disableStaff(id: string) {
    const staff = await this.staffService.findOne(id);
    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }
    staff.isDisabled = !staff.isDisabled;
    return this.staffService.update(id, { isDisabled: staff.isDisabled });
  }

  async getStaffActivities(staffId: string, page: number, limit: number) {
    return this.staffService.getActivities(staffId, page, limit);
  }

  // Campaign Management
  async getBusinessCampaigns(businessId: string, page: number, limit: number) {
    return this.campaignService.findAllByBusiness(businessId, { page, limit });
  }

  async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto) {
    // Admin can update any campaign
    const admin = { role: Role.Admin } as any;
    return this.campaignService.update(id, updateCampaignDto, admin);
  }

  async disableCampaign(id: string) {
    const admin = { role: Role.Admin } as any;
    return this.campaignService.toggleCampaignStatus(id, admin);
  }

  // Participant Management
  async getBusinessParticipants(
    businessId: string,
    page: number,
    limit: number,
  ) {
    return this.businessService.findAllParticipants(businessId, page, limit);
  }
}
