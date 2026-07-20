import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Membership } from "./entities/membership.entity";
import { PaymentHistory } from "../payment-history/entities/payment-history.entity";
import { Tier } from "../tier/entities/tier.entity";
import { JoinTrialDto } from "./dto/join-trial.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Business } from "../business/entities/business.entity";
import { MembershipStatus, PlanType } from "./entities/membership.entity";
import { PaymentService } from "../payment/payment.service";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import { TierType } from "../tier/entities/tier-type.enum";
import { MoreThan, LessThanOrEqual, MoreThanOrEqual, LessThan } from "typeorm";
import { CentralPackage, McomCentralService } from "../sso/mcom-central.service";

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    private readonly paymentService: PaymentService,
    private readonly mcomCentralService: McomCentralService,
  ) {}

  async findOneByBusinessId(businessId: string) {
    // Prefer Standard tier if multiple exist, otherwise just one
    const memberships = await this.membershipRepository.find({
      where: { business: { id: businessId } },
      relations: ["tier", "tier.season"],
    });
    // Return standard if exists, else first one
    const standard = memberships.find(
      (m) => m.tier && m.tier.type === TierType.STANDARD,
    );
    return standard || memberships[0];
  }

  async findActiveMemberships(businessId: string) {
    return await this.membershipRepository.find({
      where: {
        business: { id: businessId },
        status: MembershipStatus.ACTIVE,
      },
      relations: ["tier", "tier.season"],
    });
  }

  async checkSeasonalOverlap(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const activeSeasonal = await this.membershipRepository.find({
      where: {
        business: { id: businessId },
        status: MembershipStatus.ACTIVE,
        tier: { type: TierType.SEASONAL },
      },
      relations: ["tier", "tier.season"],
    });

    for (const membership of activeSeasonal) {
      // Membership dates usually align with Tier dates for seasonal, but relies on what was saved
      const memStart = membership.starts_at;
      const memEnd = membership.expires_at;

      // Check Overlap: (StartA <= EndB) and (EndA >= StartB)
      if (startDate <= memEnd && endDate >= memStart) {
        return true;
      }
    }
    return false;
  }

  async getMyMembership(user: any) {
    return await this.membershipRepository.findOne({
      where: { business: { id: user.id } },
      relations: ["tier", "tier.season"],
    });
  }

  async getMyPaymentHistory(user: any) {
    return await this.paymentHistoryRepository.find({
      where: { user: { id: user.id } },
      relations: ["membership"],
    });
  }

  async updateProgressionLevel(
    id: string,
    level: "basic" | "pro" | "pro_plus",
  ) {
    await this.membershipRepository.update(id, { progression_level: level });
  }

  async remove(id: string) {
    await this.membershipRepository.softDelete(id);
  }

  async joinTrial(user: any, joinTrialDto: JoinTrialDto) {
    // Check if membership already exists
    const existingMembership = await this.membershipRepository.findOne({
      where: { business: { id: user.id } },
    });

    if (existingMembership) {
      throw new BadRequestException("Membership already exists");
    }

    const tier = await this.tierRepository.findOne({
      where: { id: joinTrialDto.tier_id },
    });
    if (!tier) {
      throw new NotFoundException("Tier not found");
    }

    const startsAt = new Date();
    const expiresAt = new Date();
    const trialDays = 30; // Default trial period
    expiresAt.setDate(startsAt.getDate() + trialDays);

    let provider = PaymentProvider.STRIPE; // Default
    let transactionId = null;

    let planType: PlanType;

    if (joinTrialDto.provider === "paypal") {
      if (tier.paypal_monthly_plan_id) planType = PlanType.MONTHLY;
      else if (tier.paypal_annual_plan_id) planType = PlanType.ANNUAL;
      else if (tier.paypal_quarterly_plan_id) planType = PlanType.QUARTERLY;
    } else {
      if (tier.stripe_monthly_price_id) planType = PlanType.MONTHLY;
      else if (tier.stripe_annual_price_id) planType = PlanType.ANNUAL;
      else if (tier.stripe_quarterly_price_id) planType = PlanType.QUARTERLY;
    }

    // Default to monthly if still not found (legacy behavior)
    if (!planType) planType = PlanType.MONTHLY;

    if (joinTrialDto.payment_token || joinTrialDto.provider === "paypal") {
      // Create a subscription with trial
      const subscribeParams: any = {
        tier_id: tier.id,
        plan_type: planType,
        provider:
          joinTrialDto.provider === "paypal"
            ? PaymentProvider.PAYPAL
            : PaymentProvider.STRIPE,
        is_trial: true,
        trial_days: trialDays,
      };

      if (joinTrialDto.payment_token)
        subscribeParams.payment_token = joinTrialDto.payment_token;
      if (joinTrialDto.return_url)
        subscribeParams.return_url = joinTrialDto.return_url;
      if (joinTrialDto.cancel_url)
        subscribeParams.cancel_url = joinTrialDto.cancel_url;

      const subscribeResult = await this.paymentService.subscribe(
        subscribeParams,
        user,
      );

      if (subscribeResult.subscriptionId) {
        transactionId = subscribeResult.subscriptionId;
      }

      // If approvalUrl is present (PayPal), we return it.
      // The membership is created as ACTIVE trial, but for PayPal it might remain pending until user approves?
      // For now, consistent with requirements, we persist it.

      if (joinTrialDto.provider === "paypal") provider = PaymentProvider.PAYPAL;

      const membership = this.membershipRepository.create({
        business: { id: user.id } as Business,
        tier,
        plan_type: planType,
        starts_at: startsAt,
        expires_at: expiresAt,
        status: MembershipStatus.ACTIVE,
        is_trial: true,
        transaction_id: transactionId,
        payment_provider: provider,
      });

      await this.membershipRepository.save(membership);

      return {
        ...membership,
        approvalUrl: (subscribeResult as any).approvalUrl,
      };
    }

    // Fallback if no payment info provided
    const membership = this.membershipRepository.create({
      business: { id: user.id } as Business,
      tier,
      plan_type: planType,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: MembershipStatus.ACTIVE,
      is_trial: true,
    });

    await this.membershipRepository.save(membership);
    return membership;
  }

  async grantAccess(businessId: string, tierId: string, durationDays: number, source: string) {
      const tier = await this.tierRepository.findOne({ where: { id: tierId } });
      if (!tier) throw new NotFoundException('Tier not found');
  
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(startsAt.getDate() + durationDays);
  
      const membership = this.membershipRepository.create({
        business: { id: businessId } as Business,
        tier,
        plan_type: PlanType.MONTHLY, // Default or generic
        starts_at: startsAt,
        expires_at: expiresAt,
        status: MembershipStatus.ACTIVE,
        is_trial: false, // It's a granted access, not a trial
        payment_provider: PaymentProvider.STRIPE, // Placeholder or add 'SYSTEM'/'VOUCHER' to enum if possible. Using Stripe/Manual for now.
        transaction_id: `VOUCHER-${source}`
      });
  
      return this.membershipRepository.save(membership);
  }

  async syncFromCentralPackage(
    businessId: string,
    centralPackage: CentralPackage
  ): Promise<Membership | null> {
    const tier = await this.tierRepository.findOne({
      where: { name: centralPackage.packageName },
    });

    if (!tier) {
      this.logger.warn(
        `No tier found for MCOM Central package: ${centralPackage.packageName}`
      );
      return null;
    }

    const expiresAt = new Date(centralPackage.expiresAt);
    const isExpired = expiresAt <= new Date();

    // Check for existing membership synced from this central subscription
    let membership = await this.membershipRepository.findOne({
      where: {
        business: { id: businessId },
        transaction_id: Like(`CENTRAL-%`),
      },
      relations: ["tier"],
    });

    if (membership) {
      // Update existing membership
      membership.tier = tier;
      membership.status = isExpired
        ? MembershipStatus.EXPIRED
        : MembershipStatus.ACTIVE;
      membership.expires_at = expiresAt;
      membership.is_trial = false;
    } else {
      // Create new membership from central package
      membership = this.membershipRepository.create({
        business: { id: businessId } as Business,
        tier,
        plan_type: this.mapPlanType(centralPackage.planName),
        starts_at: new Date(),
        expires_at: expiresAt,
        status: isExpired ? MembershipStatus.EXPIRED : MembershipStatus.ACTIVE,
        is_trial: false,
        transaction_id: `CENTRAL-${centralPackage.providerSubscriptionId}`,
        payment_provider:
          centralPackage.provider === "stripe"
            ? PaymentProvider.STRIPE
            : PaymentProvider.PAYPAL,
      });
    }

    this.logger.log(
      `Synced MCOM Central package "${centralPackage.packageName}" (status: ${membership.status}) for business ${businessId}`
    );

    return this.membershipRepository.save(membership);
  }

  private mapPlanType(planName: string): PlanType {
    const name = planName?.toLowerCase() || "";
    if (name.includes("annual") || name.includes("yearly")) {
      return PlanType.ANNUAL;
    }
    if (name.includes("quarterly")) {
      return PlanType.QUARTERLY;
    }
    return PlanType.MONTHLY;
  }

  async syncFromCentralProfile(
    businessId: string,
    email: string
  ): Promise<void> {
    try {
      const centralUser = await this.mcomCentralService.getUserMembership({ email });

      if (!centralUser?.success || !centralUser?.data?.packages) {
        this.logger.log(
          `No packages or user profile found in MCOM Central for email ${email}`
        );
        return;
      }

      const rewardsPackage = centralUser.data.packages.find(
        (p: any) =>
          (p.platformName === "MCOM Rewards" || p.platform === "MCOM Rewards") &&
          p.status === "active"
      );

      if (rewardsPackage) {
        // Sync package to local membership
        const mappedPackage: CentralPackage = {
          platform: rewardsPackage.platformName || rewardsPackage.platform || "MCOM Rewards",
          packageName: rewardsPackage.packageName,
          planName: rewardsPackage.packageName, // Assume planName is same as packageName
          status: rewardsPackage.status === "active" ? "active" : "inactive",
          limits: {},
          expiresAt: rewardsPackage.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          provider: rewardsPackage.provider || "stripe",
          providerSubscriptionId: rewardsPackage.providerSubscriptionId || "CENTRAL-PROFILE",
        };

        await this.syncFromCentralPackage(businessId, mappedPackage);
      } else {
        this.logger.log(
          `No active MCOM Rewards package found for business email ${email}`
        );
        // Revoke active central memberships if they exist but are no longer active in Central
        let existingMembership = await this.membershipRepository.findOne({
          where: {
            business: { id: businessId },
            transaction_id: Like(`CENTRAL-%`),
          },
        });
        if (existingMembership && existingMembership.status === MembershipStatus.ACTIVE) {
          existingMembership.status = MembershipStatus.EXPIRED;
          await this.membershipRepository.save(existingMembership);
          this.logger.log(
            `Revoked expired/inactive MCOM Central package for business ${businessId}`
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync subscription from MCOM Central profile for email ${email}: ${error?.message}`,
        error?.stack
      );
    }
  }

  async findTierByName(name: string): Promise<Tier | null> {
    return this.tierRepository.findOne({ where: { name } });
  }
}
