import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, ILike, Like, Repository } from "typeorm";
import { randomInt, randomUUID } from "crypto";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  AccessPassPlan,
  AccessPassConfiguration,
} from "./entities/access-pass-plan.entity";
import {
  AccessPassCode,
  AccessPassCodeStatus,
} from "./entities/access-pass-code.entity";
import {
  AccessPassSource,
  AccessPassSubscription,
  AccessPassSubscriptionStatus,
} from "./entities/access-pass-subscription.entity";
import { Business } from "../business/entities/business.entity";
import { PaymentProvider } from "../payment-history/entities/payment-history.entity";
import {
  PaymentCheckout,
  PaymentCheckoutMethod,
  PaymentCheckoutPurpose,
  PaymentCheckoutStatus,
} from "../payment/entities/payment-checkout.entity";
import { PaymentCheckoutService } from "../payment/payment-checkout.service";
import { PaymentFulfillmentService } from "../payment/payment-fulfillment.service";
import {
  McomPaymentsService,
  McomChargeResponse,
} from "../payment/mcom-payments.service";
import { McomWalletPartnerService } from "../wallet/mcom-wallet-partner.service";
import { toMinorUnits } from "../../common/utils/money.util";
import { EmailQueueService } from "../../mail/email-queue.service";
import type { PlatformEntitlement } from "../sso/interfaces/entitlement.interface";
import { CreateAccessPassPlanDto } from "./dto/create-access-pass-plan.dto";
import { UpdateAccessPassPlanDto } from "./dto/update-access-pass-plan.dto";
import { CreateAccessPassCodeDto } from "./dto/create-access-pass-code.dto";
import { UpdateAccessPassCodeDto } from "./dto/update-access-pass-code.dto";
import { InitiateAccessPassPurchaseDto } from "./dto/initiate-access-pass-purchase.dto";
import { ConfirmAccessPassPurchaseDto } from "./dto/confirm-access-pass-purchase.dto";
import {
  ListAccessPassCodesDto,
  ListAccessPassSubscriptionsDto,
} from "./dto/list-access-passes.dto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const block = () =>
    Array.from(
      { length: 4 },
      () => CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)],
    ).join("");
  return `MCOM-${block()}-${block()}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

@Injectable()
export class AccessPassService implements OnModuleInit {
  private readonly logger = new Logger(AccessPassService.name);

  constructor(
    @InjectRepository(AccessPassPlan)
    private readonly planRepository: Repository<AccessPassPlan>,
    @InjectRepository(AccessPassCode)
    private readonly codeRepository: Repository<AccessPassCode>,
    @InjectRepository(AccessPassSubscription)
    private readonly subscriptionRepository: Repository<AccessPassSubscription>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly dataSource: DataSource,
    private readonly checkoutService: PaymentCheckoutService,
    private readonly fulfillmentService: PaymentFulfillmentService,
    private readonly mcomPayments: McomPaymentsService,
    private readonly centralWallet: McomWalletPartnerService,
    private readonly emailQueue: EmailQueueService,
  ) {}

  onModuleInit(): void {
    this.fulfillmentService.register(
      PaymentCheckoutPurpose.ACCESS_PASS,
      async (checkout) => {
        await this.activateFromCheckout(checkout);
      },
    );
  }

  /* ------------------------------------------------------------------ */
  /* Plan CRUD                                                           */
  /* ------------------------------------------------------------------ */

  async listPublicPlans(): Promise<AccessPassPlan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { created_at: "DESC" },
    });
  }

  async listAdminPlans(): Promise<
    Array<
      AccessPassPlan & {
        codeCount: number;
        subscriberCount: number;
        activeSubscriberCount: number;
      }
    >
  > {
    const plans = await this.planRepository.find({
      order: { created_at: "DESC" },
    });

    return Promise.all(
      plans.map(async (plan) => ({
        ...plan,
        codeCount: await this.codeRepository.count({
          where: { planId: plan.id },
        }),
        subscriberCount: await this.subscriptionRepository.count({
          where: { planId: plan.id },
        }),
        activeSubscriberCount: await this.subscriptionRepository.count({
          where: {
            planId: plan.id,
            status: AccessPassSubscriptionStatus.ACTIVE,
          },
        }),
      })),
    );
  }

  async findPlan(id: string): Promise<AccessPassPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Access pass plan ${id} not found`);
    }
    return plan;
  }

  /**
   * Prices are stored as non-negative decimals. The DTO validates this for
   * HTTP callers; this guard also protects internal/service-to-service calls
   * (and updates that bypass the create DTO).
   */
  private assertValidPrice(price: number | undefined | null): void {
    if (price === undefined) return;
    if (
      price === null ||
      typeof price !== "number" ||
      !Number.isFinite(price)
    ) {
      throw new BadRequestException("Price must be a valid number");
    }
    if (price < 0) {
      throw new BadRequestException("Price cannot be negative");
    }
  }

  async createPlan(dto: CreateAccessPassPlanDto): Promise<AccessPassPlan> {
    this.assertValidPrice(dto.price);
    const slug = dto.slug.trim().toLowerCase();
    const existing = await this.planRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(
        `An access pass with slug "${slug}" already exists`,
      );
    }

    const plan = this.planRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() || null,
      price: dto.price,
      currency: (dto.currency || "GBP").toUpperCase(),
      durationDays: dto.durationDays,
      features: (dto.features || []).map((f) => f.trim()).filter(Boolean),
      configuration: this.normalizeConfiguration(dto.configuration),
      isActive: dto.isActive !== false,
      purchaseEnabled: dto.purchaseEnabled !== false,
      codeRedemptionEnabled: dto.codeRedemptionEnabled !== false,
    });

    return this.planRepository.save(plan);
  }

  async updatePlan(
    id: string,
    dto: UpdateAccessPassPlanDto,
  ): Promise<AccessPassPlan> {
    const plan = await this.findPlan(id);
    const { updateExistingSubscribers, recalculateExpiry, ...changes } = dto;

    if (changes.price !== undefined) {
      this.assertValidPrice(changes.price);
    }

    if (changes.slug && changes.slug.trim().toLowerCase() !== plan.slug) {
      const slug = changes.slug.trim().toLowerCase();
      const existing = await this.planRepository.findOne({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `An access pass with slug "${slug}" already exists`,
        );
      }
      plan.slug = slug;
    }

    if (changes.name !== undefined) plan.name = changes.name.trim();
    if (changes.description !== undefined) {
      plan.description = changes.description?.trim() || null;
    }
    if (changes.price !== undefined) plan.price = changes.price;
    if (changes.currency !== undefined) {
      plan.currency = (changes.currency || "GBP").toUpperCase();
    }
    if (changes.durationDays !== undefined) {
      plan.durationDays = changes.durationDays;
    }
    if (changes.features !== undefined) {
      plan.features = changes.features.map((f) => f.trim()).filter(Boolean);
    }
    if (changes.configuration !== undefined) {
      plan.configuration = this.normalizeConfiguration(changes.configuration);
    }
    if (changes.isActive !== undefined) plan.isActive = changes.isActive;
    if (changes.purchaseEnabled !== undefined) {
      plan.purchaseEnabled = changes.purchaseEnabled;
    }
    if (changes.codeRedemptionEnabled !== undefined) {
      plan.codeRedemptionEnabled = changes.codeRedemptionEnabled;
    }

    await this.planRepository.save(plan);

    if (updateExistingSubscribers) {
      const subscriptions = await this.subscriptionRepository.find({
        where: { planId: plan.id },
      });

      for (const subscription of subscriptions) {
        subscription.planName = plan.name;
        subscription.durationDays = plan.durationDays;
        subscription.features = plan.features;
        subscription.configuration = plan.configuration;
        subscription.price = plan.price;
        subscription.currency = plan.currency;

        if (
          recalculateExpiry &&
          subscription.status === AccessPassSubscriptionStatus.ACTIVE
        ) {
          subscription.expiresAt = addDays(
            new Date(subscription.startsAt),
            plan.durationDays,
          );
        }
      }

      if (subscriptions.length > 0) {
        await this.subscriptionRepository.save(subscriptions);
      }
    }

    return this.findPlan(id);
  }

  async removePlan(id: string): Promise<{ message: string }> {
    const plan = await this.findPlan(id);
    plan.isActive = false;
    plan.purchaseEnabled = false;
    plan.codeRedemptionEnabled = false;
    await this.planRepository.save(plan);
    return {
      message:
        "Access pass deactivated. Existing subscribers keep access until expiry.",
    };
  }

  /* ------------------------------------------------------------------ */
  /* Code management                                                     */
  /* ------------------------------------------------------------------ */

  async generateCode(
    adminId: string,
    dto: CreateAccessPassCodeDto,
  ): Promise<AccessPassCode & { emailQueued: boolean }> {
    const plan = await this.findPlan(dto.planId);
    if (!plan.isActive) {
      throw new BadRequestException(
        "Cannot generate codes for an inactive plan",
      );
    }

    const email = dto.email?.trim().toLowerCase() || null;
    const assignedBusiness = email
      ? await this.businessRepository.findOne({ where: { email } })
      : null;

    const restrictToAssignedUser = email
      ? (dto.restrictToAssignedUser ?? true)
      : false;

    let codeValue = generateCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const exists = await this.codeRepository.findOne({
        where: { code: codeValue },
      });
      if (!exists) break;
      codeValue = generateCode();
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException("Invalid code expiry date");
    }
    if (expiresAt && expiresAt <= new Date()) {
      throw new BadRequestException("Code expiry must be in the future");
    }

    const code = await this.codeRepository.save(
      this.codeRepository.create({
        code: codeValue,
        planId: plan.id,
        assignedEmail: email,
        assignedBusinessId: assignedBusiness?.id || null,
        restrictToAssignedUser,
        status: AccessPassCodeStatus.ACTIVE,
        maxUses: dto.maxUses || 1,
        timesUsed: 0,
        expiresAt,
        note: dto.note?.trim() || null,
        createdByAdminId: adminId,
        lastUsedAt: null,
        emailSentAt: null,
      }),
    );

    let emailQueued = false;
    if (email && dto.sendEmail !== false) {
      await this.queueCodeEmail(code, plan, email);
      code.emailSentAt = new Date();
      await this.codeRepository.save(code);
      emailQueued = true;
    }

    return { ...code, emailQueued };
  }

  async listCodes(dto: ListAccessPassCodesDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const qb = this.codeRepository
      .createQueryBuilder("code")
      .leftJoinAndSelect("code.plan", "plan")
      .leftJoinAndSelect("code.assignedBusiness", "assignedBusiness")
      .orderBy("code.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (dto.planId)
      qb.andWhere("code.plan_id = :planId", { planId: dto.planId });
    if (dto.status)
      qb.andWhere("code.status = :status", { status: dto.status });
    if (dto.search) {
      qb.andWhere(
        "(code.code ILIKE :term OR code.assigned_email ILIKE :term OR assignedBusiness.email ILIKE :term OR assignedBusiness.name ILIKE :term)",
        { term: `%${dto.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCode(
    id: string,
    dto: UpdateAccessPassCodeDto,
  ): Promise<AccessPassCode> {
    const code = await this.findCode(id);
    if (dto.status !== undefined) code.status = dto.status;
    if (dto.restrictToAssignedUser !== undefined) {
      if (dto.restrictToAssignedUser && !code.assignedEmail) {
        throw new BadRequestException(
          "Assign the code to an email before restricting it",
        );
      }
      code.restrictToAssignedUser = dto.restrictToAssignedUser;
    }
    if (dto.expiresAt !== undefined) {
      code.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    if (dto.note !== undefined) code.note = dto.note?.trim() || null;
    return this.codeRepository.save(code);
  }

  async revokeCode(id: string): Promise<{ message: string }> {
    const code = await this.findCode(id);
    code.status = AccessPassCodeStatus.REVOKED;
    await this.codeRepository.save(code);
    return { message: "Code revoked" };
  }

  async resendCodeEmail(id: string): Promise<{ message: string }> {
    const code = await this.codeRepository.findOne({
      where: { id },
      relations: ["plan"],
    });
    if (!code) throw new NotFoundException(`Access pass code ${id} not found`);
    if (!code.assignedEmail) {
      throw new BadRequestException(
        "This code has no assigned email. Copy the code and share it manually.",
      );
    }
    if (!code.plan) throw new NotFoundException("Access pass plan not found");

    await this.queueCodeEmail(code, code.plan, code.assignedEmail);
    code.emailSentAt = new Date();
    await this.codeRepository.save(code);
    return { message: `Code emailed to ${code.assignedEmail}` };
  }

  private async findCode(id: string): Promise<AccessPassCode> {
    const code = await this.codeRepository.findOne({
      where: { id },
      relations: ["plan"],
    });
    if (!code) throw new NotFoundException(`Access pass code ${id} not found`);
    return code;
  }

  private async queueCodeEmail(
    code: AccessPassCode,
    plan: AccessPassPlan,
    to: string,
  ): Promise<void> {
    await this.emailQueue.enqueue({
      to,
      subject: `Your MCOM Rewards Access Pass code — ${plan.name}`,
      html: this.buildCodeEmailHtml(code, plan, to),
      text: this.buildCodeEmailText(code, plan, to),
      metadata: {
        type: "access-pass-code",
        accessPassCodeId: code.id,
        accessPassPlanId: plan.id,
      },
    });
  }

  private buildCodeEmailHtml(
    code: AccessPassCode,
    plan: AccessPassPlan,
    to: string,
  ): string {
    const expiryText = code.expiresAt
      ? new Date(code.expiresAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "No expiry";
    const usageText = code.restrictToAssignedUser
      ? `This code is locked to <strong>${code.assignedEmail || to}</strong>. Only that account can redeem it.`
      : code.assignedEmail
        ? `This code was sent to <strong>${code.assignedEmail}</strong>, but it is <strong>transferable</strong> — you may give it to anyone you like.`
        : "This code is transferable — you may give it to anyone you like.";

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
        <div style="text-align:center;margin-bottom:28px;">
          <h2 style="color:#ea580c;margin:0;font-size:28px;font-weight:700;">You've received an Access Pass</h2>
          <p style="color:#666;margin-top:10px;font-size:16px;">${plan.name} · ${plan.durationDays} days of dashboard access</p>
        </div>
        <div style="color:#333;font-size:16px;line-height:1.6;">
          <p>Hello,</p>
          <p>An MCOM administrator has gifted you an <strong>Access Pass</strong>. Redeem the code below from your business dashboard to unlock the plan.</p>
          <div style="text-align:center;margin:32px 0;">
            <span style="display:inline-block;background:#ea580c;color:#fff;font-size:26px;font-weight:bold;padding:16px 30px;border-radius:8px;letter-spacing:3px;font-family:monospace;">${code.code}</span>
          </div>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:0 0 6px 0;"><strong>Plan:</strong> ${plan.name}</p>
            <p style="margin:0 0 6px 0;"><strong>Access duration:</strong> ${plan.durationDays} days</p>
            <p style="margin:0;"><strong>Code expires:</strong> ${expiryText}</p>
          </div>
          <p>${usageText}</p>
          ${code.note ? `<p style="background:#f9fafb;border-radius:8px;padding:12px 16px;color:#555;"><strong>Note from the admin:</strong> ${code.note}</p>` : ""}
          <p>To redeem: sign in, open <strong>Dashboard → Access Pass</strong>, enter the code and click “Redeem code”. Access begins immediately and runs for ${plan.durationDays} days.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
          <p style="font-size:14px;color:#888;text-align:center;">Best regards,<br><strong>The Mcom Loyalty Team</strong></p>
        </div>
      </div>
    `;
  }

  private buildCodeEmailText(
    code: AccessPassCode,
    plan: AccessPassPlan,
    to: string,
  ): string {
    return [
      "You have received an MCOM Rewards Access Pass.",
      "",
      `Plan: ${plan.name}`,
      `Duration: ${plan.durationDays} days`,
      `Code: ${code.code}`,
      `Expires: ${code.expiresAt ? new Date(code.expiresAt).toISOString() : "No expiry"}`,
      "",
      code.restrictToAssignedUser
        ? `This code can only be redeemed by ${code.assignedEmail || to}.`
        : "This code is transferable and may be shared.",
      code.note ? `Admin note: ${code.note}` : "",
      "",
      "Redeem it from Dashboard -> Access Pass.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  /* ------------------------------------------------------------------ */
  /* Subscribers                                                         */
  /* ------------------------------------------------------------------ */

  async listSubscriptions(dto: ListAccessPassSubscriptionsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const qb = this.subscriptionRepository
      .createQueryBuilder("sub")
      .leftJoinAndSelect("sub.business", "business")
      .leftJoinAndSelect("sub.plan", "plan")
      .leftJoinAndSelect("sub.code", "code")
      .orderBy("sub.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (dto.planId)
      qb.andWhere("sub.plan_id = :planId", { planId: dto.planId });
    if (dto.status) qb.andWhere("sub.status = :status", { status: dto.status });
    if (dto.search) {
      qb.andWhere(
        "(business.name ILIKE :term OR business.email ILIKE :term OR sub.plan_name ILIKE :term)",
        { term: `%${dto.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async revokeSubscription(
    id: string,
    reason: string,
    adminId: string,
  ): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ["business", "plan"],
    });
    if (!subscription) {
      throw new NotFoundException(`Access pass subscription ${id} not found`);
    }
    if (subscription.status === AccessPassSubscriptionStatus.REVOKED) {
      throw new BadRequestException("This access pass is already revoked");
    }

    subscription.status = AccessPassSubscriptionStatus.REVOKED;
    subscription.revokedAt = new Date();
    subscription.revokedReason = reason.trim();
    subscription.revokedByAdminId = adminId;
    await this.subscriptionRepository.save(subscription);

    if (subscription.business?.email) {
      await this.emailQueue.enqueue({
        to: subscription.business.email,
        subject: "Your MCOM Rewards Access Pass has been revoked",
        html: this.buildRevocationEmailHtml(
          subscription.planName,
          reason,
          subscription.revokedAt,
        ),
        text: `Your ${subscription.planName} Access Pass has been revoked.\n\nReason: ${reason}`,
        metadata: {
          type: "access-pass-revoked",
          accessPassSubscriptionId: subscription.id,
        },
      });
    }

    return { message: "Access pass revoked. The business has been emailed." };
  }

  private buildRevocationEmailHtml(
    planName: string,
    reason: string,
    revokedAt: Date,
  ): string {
    return `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;padding:40px;background:#fff;border-radius:12px;border:1px solid #f0f0f0;">
        <div style="text-align:center;margin-bottom:28px;">
          <h2 style="color:#dc2626;margin:0;font-size:26px;">Access Pass revoked</h2>
          <p style="color:#666;margin-top:10px;">${planName}</p>
        </div>
        <div style="color:#333;font-size:16px;line-height:1.6;">
          <p>Hello,</p>
          <p>Your <strong>${planName}</strong> Access Pass was revoked on ${revokedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:22px 0;">
            <p style="margin:0 0 6px 0;color:#991b1b;"><strong>Reason provided:</strong></p>
            <p style="margin:0;color:#7f1d1d;">${reason}</p>
          </div>
          <p>If you believe this was a mistake, please contact MCOM support and our team will review your account.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
          <p style="font-size:14px;color:#888;text-align:center;">Best regards,<br><strong>The Mcom Loyalty Team</strong></p>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Business-facing access                                              */
  /* ------------------------------------------------------------------ */

  async findActiveForBusiness(
    businessId: string,
  ): Promise<AccessPassSubscription | null> {
    const now = new Date();
    return this.subscriptionRepository
      .createQueryBuilder("sub")
      .leftJoinAndSelect("sub.plan", "plan")
      .leftJoinAndSelect("sub.code", "code")
      .where("sub.business_id = :businessId", { businessId })
      .andWhere("sub.status = :status", {
        status: AccessPassSubscriptionStatus.ACTIVE,
      })
      .andWhere("sub.expires_at > :now", { now })
      .orderBy("sub.expires_at", "DESC")
      .getOne();
  }

  async getMyAccessPass(businessId: string) {
    const subscription = await this.findActiveForBusiness(businessId);
    if (!subscription) {
      return {
        hasAccess: false,
        subscription: null,
        planName: null,
        expiresAt: null,
        daysRemaining: 0,
        features: [],
        configuration: null,
        source: null,
        status: "none",
      };
    }

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(subscription.expiresAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    return {
      hasAccess: true,
      subscription,
      planName: subscription.planName,
      expiresAt: subscription.expiresAt,
      startsAt: subscription.startsAt,
      daysRemaining,
      features: subscription.features || [],
      configuration: subscription.configuration || {},
      source: subscription.source,
      status: subscription.status,
    };
  }

  /**
   * Provision local access from a MCOM Central `PlatformEntitlement`.
   *
   * Only `DIRECT_PACKAGE` entitlements map to a local access pass. Any other
   * access type (membership, trial, none) revokes previously central-granted
   * passes while leaving locally purchased passes untouched.
   */
  async syncFromEntitlement(
    businessId: string,
    entitlement: PlatformEntitlement,
  ): Promise<AccessPassSubscription | null> {
    const access = entitlement?.access;
    const planData = entitlement?.plan;

    const isDirectPass =
      access?.hasAccess === true &&
      access?.accessType === "DIRECT_PACKAGE" &&
      planData?.source === "direct";

    const centralPasses = await this.subscriptionRepository.find({
      where: { businessId, transactionId: Like("CENTRAL-%") },
      order: { expiresAt: "DESC" },
    });

    if (!isDirectPass || !planData) {
      await this.expireCentralPasses(centralPasses);
      return null;
    }

    const localPlan = await this.resolveEntitlementPlan(planData);
    const transactionId = `CENTRAL-ENTITLEMENT-DIRECT_PACKAGE-${planData.planId}`;

    const existing =
      centralPasses.find((pass) => pass.transactionId === transactionId) ??
      null;

    const expiresAt = this.resolveEntitlementExpiry(
      planData,
      localPlan,
      existing,
    );
    if (!expiresAt) {
      this.logger.warn(
        `Central access pass "${planData.planId}" for business ${businessId} is expired; nothing provisioned`,
      );
      await this.expireCentralPasses(centralPasses);
      return null;
    }

    const configuration = this.mergeEntitlementConfiguration(
      localPlan.configuration,
      planData,
    );

    const values: Partial<AccessPassSubscription> = {
      businessId,
      planId: localPlan.id,
      codeId: null,
      source: AccessPassSource.PURCHASE,
      status: AccessPassSubscriptionStatus.ACTIVE,
      startsAt: existing?.startsAt ?? new Date(),
      expiresAt,
      planName: localPlan.name,
      durationDays: localPlan.durationDays,
      features: planData.features?.length
        ? planData.features
        : localPlan.features,
      configuration,
      price: localPlan.price,
      currency: localPlan.currency,
      transactionId,
      paymentProvider: null,
      grantedByAdminId: null,
      revokedAt: null,
      revokedReason: null,
      revokedByAdminId: null,
    };

    const saved = existing
      ? await this.subscriptionRepository.save(Object.assign(existing, values))
      : await this.subscriptionRepository.save(
          this.subscriptionRepository.create(values),
        );

    await this.expireCentralPasses(
      centralPasses.filter((pass) => pass.id !== saved.id),
    );

    this.logger.log(
      `Provisioned central access pass "${localPlan.name}" for business ${businessId} until ${expiresAt.toISOString()}`,
    );

    return saved;
  }

  private async expireCentralPasses(
    passes: AccessPassSubscription[],
  ): Promise<void> {
    const active = passes.filter(
      (pass) => pass.status === AccessPassSubscriptionStatus.ACTIVE,
    );
    if (active.length === 0) return;

    for (const pass of active) {
      pass.status = AccessPassSubscriptionStatus.EXPIRED;
    }
    await this.subscriptionRepository.save(active);
  }

  private async resolveEntitlementPlan(
    planData: NonNullable<PlatformEntitlement["plan"]>,
  ): Promise<AccessPassPlan> {
    const planId = planData.planId?.trim();
    if (planId) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          planId,
        );
      const byIdentifier = await this.planRepository.findOne({
        where: isUuid ? [{ id: planId }, { slug: planId }] : { slug: planId },
      });
      if (byIdentifier) return byIdentifier;
    }

    if (planData.planName) {
      const byName = await this.planRepository.findOne({
        where: { name: ILike(planData.planName.trim()) },
      });
      if (byName) return byName;
    }

    return this.createCentralFallbackPlan(planData);
  }

  /**
   * Central only ever grants passes it created from our published catalogue.
   * If the local plan was renamed/removed we still honour the paid access with
   * a hidden snapshot plan instead of locking the business out.
   */
  private async createCentralFallbackPlan(
    planData: NonNullable<PlatformEntitlement["plan"]>,
  ): Promise<AccessPassPlan> {
    const slug =
      `central-${planData.planId || planData.planName || "pass"}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80) || `central-${randomUUID()}`;

    const existing = await this.planRepository.findOne({ where: { slug } });
    if (existing) return existing;

    const durationDays = this.resolveEntitlementDuration(planData) ?? 30;
    const configuration = this.mergeEntitlementConfiguration(
      undefined,
      planData,
    );

    this.logger.warn(
      `Access pass "${planData.planId}" (${planData.planName}) was not found in the local catalogue; creating a hidden plan snapshot`,
    );

    return this.planRepository.save(
      this.planRepository.create({
        name: planData.planName || "Central Access Pass",
        slug,
        description: "Provisioned from a MCOM Central access pass bundle",
        price: 0,
        currency: "GBP",
        durationDays,
        features: planData.features || [],
        configuration,
        isActive: false,
        purchaseEnabled: false,
        codeRedemptionEnabled: false,
      }),
    );
  }

  private resolveEntitlementExpiry(
    planData: NonNullable<PlatformEntitlement["plan"]>,
    localPlan: AccessPassPlan,
    existing?: AccessPassSubscription | null,
  ): Date | null {
    if (planData.expiresAt) {
      const parsed = new Date(planData.expiresAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed > new Date() ? parsed : null;
      }
    }
    // Central normally sends an expiry for passes. Without one, keep the
    // existing expiry instead of sliding it forward on every login.
    if (existing?.expiresAt && new Date(existing.expiresAt) > new Date()) {
      return new Date(existing.expiresAt);
    }
    return addDays(new Date(), Math.max(1, localPlan.durationDays || 30));
  }

  private resolveEntitlementDuration(
    planData: NonNullable<PlatformEntitlement["plan"]>,
  ): number | null {
    if (!planData.expiresAt) return null;
    const expires = new Date(planData.expiresAt);
    if (Number.isNaN(expires.getTime())) return null;
    return Math.max(
      1,
      Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
  }

  private mergeEntitlementConfiguration(
    base: AccessPassConfiguration | null | undefined,
    planData: NonNullable<PlatformEntitlement["plan"]>,
  ): AccessPassConfiguration {
    const quotas: Record<string, number> = { ...(base?.quotas || {}) };
    const featureFlags: Record<string, boolean> = {
      ...(base?.featureFlags || {}),
    };

    // Central sends limits in `quotas` and/or `limits`; numeric values are
    // quotas, booleans are feature flags.
    for (const source of [planData.quotas, planData.limits]) {
      if (!source || typeof source !== "object") continue;
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === "number") quotas[key] = value;
        else if (typeof value === "boolean") featureFlags[key] = value;
      }
    }

    return this.normalizeConfiguration({
      quotas,
      featureFlags,
      disabledNavIds: base?.disabledNavIds,
    });
  }

  async redeemCode(
    businessId: string,
    rawCode: string,
  ): Promise<AccessPassSubscription> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException("Business profile not found");

    const codeValue = rawCode.trim().toUpperCase();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const code = await queryRunner.manager
        .getRepository(AccessPassCode)
        .createQueryBuilder("code")
        .where("code.code = :codeValue", { codeValue })
        .setLock("pessimistic_write")
        .getOne();

      if (!code) {
        throw new NotFoundException("That access pass code was not found");
      }

      const plan = await queryRunner.manager
        .getRepository(AccessPassPlan)
        .findOne({ where: { id: code.planId } });
      if (!plan) {
        throw new NotFoundException("The access pass plan could not be found");
      }
      code.plan = plan;
      if (code.status !== AccessPassCodeStatus.ACTIVE) {
        throw new BadRequestException(
          code.status === AccessPassCodeStatus.EXPIRED
            ? "This access pass code has expired"
            : code.status === AccessPassCodeStatus.EXHAUSTED
              ? "This access pass code has already been used"
              : "This access pass code has been revoked",
        );
      }
      if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
        throw new BadRequestException("This access pass code has expired");
      }
      if (code.timesUsed >= code.maxUses) {
        throw new BadRequestException(
          "This access pass code has already been used",
        );
      }

      if (!plan || !plan.isActive || !plan.codeRedemptionEnabled) {
        throw new BadRequestException(
          "This access pass is not currently available for code redemption",
        );
      }

      if (code.restrictToAssignedUser) {
        const matchesEmail =
          code.assignedEmail &&
          business.email.toLowerCase() === code.assignedEmail.toLowerCase();
        const matchesBusiness =
          code.assignedBusinessId && code.assignedBusinessId === business.id;
        if (!matchesEmail && !matchesBusiness) {
          throw new ForbiddenException(
            "This access pass code is restricted to a different account",
          );
        }
      }

      const subscription = await this.grantPass(queryRunner.manager, {
        businessId,
        plan,
        source: AccessPassSource.CODE,
        codeId: code.id,
        transactionId: null,
        paymentProvider: null,
      });

      code.timesUsed += 1;
      code.lastUsedAt = new Date();
      if (code.timesUsed >= code.maxUses) {
        code.status = AccessPassCodeStatus.EXHAUSTED;
      }
      await queryRunner.manager.save(code);

      await queryRunner.commitTransaction();
      return subscription;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async grantPass(
    manager: EntityManager,
    input: {
      businessId: string;
      plan: AccessPassPlan;
      source: AccessPassSource;
      codeId: string | null;
      transactionId: string | null;
      paymentProvider: PaymentProvider | null;
    },
  ): Promise<AccessPassSubscription> {
    const now = new Date();
    const repository = manager.getRepository(AccessPassSubscription);

    const existing = await repository.findOne({
      where: {
        businessId: input.businessId,
        planId: input.plan.id,
        status: AccessPassSubscriptionStatus.ACTIVE,
      },
      order: { expiresAt: "DESC" },
    });

    if (existing) {
      const base =
        new Date(existing.expiresAt) > now ? new Date(existing.expiresAt) : now;
      existing.expiresAt = addDays(base, input.plan.durationDays);
      existing.planName = input.plan.name;
      existing.durationDays = input.plan.durationDays;
      existing.features = input.plan.features;
      existing.configuration = input.plan.configuration;
      existing.price = input.plan.price;
      existing.currency = input.plan.currency;
      existing.source = input.source;
      existing.codeId = input.codeId;
      existing.transactionId = input.transactionId;
      existing.paymentProvider = input.paymentProvider;
      existing.revokedAt = null;
      existing.revokedReason = null;
      existing.revokedByAdminId = null;
      return repository.save(existing);
    }

    return repository.save(
      repository.create({
        businessId: input.businessId,
        planId: input.plan.id,
        codeId: input.codeId,
        source: input.source,
        status: AccessPassSubscriptionStatus.ACTIVE,
        startsAt: now,
        expiresAt: addDays(now, input.plan.durationDays),
        planName: input.plan.name,
        durationDays: input.plan.durationDays,
        features: input.plan.features,
        configuration: input.plan.configuration,
        price: input.plan.price,
        currency: input.plan.currency,
        transactionId: input.transactionId,
        paymentProvider: input.paymentProvider,
        grantedByAdminId: null,
        revokedAt: null,
        revokedReason: null,
        revokedByAdminId: null,
      }),
    );
  }

  /* ------------------------------------------------------------------ */
  /* Purchases                                                           */
  /* ------------------------------------------------------------------ */

  async initiatePurchase(
    businessId: string,
    dto: InitiateAccessPassPurchaseDto,
  ) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException("Business profile not found");

    const plan = await this.findPlan(dto.planId);
    if (!plan.isActive || !plan.purchaseEnabled) {
      throw new BadRequestException(
        "This access pass is not currently available for purchase",
      );
    }

    const method = this.mapMethod(dto.provider);
    const checkoutId = dto.checkoutId?.trim() || randomUUID();
    const amountMinor = toMinorUnits(plan.price);

    // MCOM Pay only accepts positive minor-unit amounts, so a £0.00 pass can
    // never be charged — the hub rejects it with "Validation failed". Fulfil
    // free passes locally instead of trying to create a zero-value charge.
    if (amountMinor === "0") {
      return this.completeFreePurchase(business, plan, checkoutId, method);
    }

    if (method === PaymentCheckoutMethod.WALLET && !business.mcomUserId) {
      throw new BadRequestException({
        code: "ACCOUNT_NOT_LINKED",
        message:
          "Your business profile is not linked to an MCOM account. Please log in via SSO.",
      });
    }

    const idempotencyKey =
      `mcom-rewards-access-pass-${business.id}-${checkoutId}-${method}`.slice(
        0,
        255,
      );
    const reference =
      `access-pass-${business.id}-${plan.id}-${checkoutId}`.slice(0, 255);
    const metadata = {
      platform: "mcom-rewards",
      businessId: business.id,
      accessPassPlanId: plan.id,
      accessPassPlanName: plan.name,
      durationDays: plan.durationDays,
    };

    const checkout = await this.checkoutService.getOrCreate({
      businessId: business.id,
      purpose: PaymentCheckoutPurpose.ACCESS_PASS,
      purposeRef: plan.id,
      amountMinor,
      currency: plan.currency || "GBP",
      method,
      idempotencyKey,
      reference,
      metadata,
    });

    let response: McomChargeResponse;
    try {
      response = await this.mcomPayments.createCharge({
        amountMinor,
        currency: plan.currency || "GBP",
        method,
        reference,
        description: `Access pass: ${plan.name} (${plan.durationDays} days)`,
        mcomUserId:
          method === PaymentCheckoutMethod.WALLET
            ? business.mcomUserId
            : undefined,
        externalCustomerId: business.id,
        metadata: { ...metadata, checkoutId: checkout.id },
        idempotencyKey,
      });
    } catch (error) {
      await this.checkoutService.markFailed(
        checkout,
        (error as Error)?.message,
      );
      this.mcomPayments.toHttpException(error);
    }

    const updated = await this.checkoutService.attachCharge(checkout, response);

    return {
      success: true,
      checkoutId: updated.id,
      chargeId: response.charge.id,
      method,
      amountMinor: response.charge.amountMinor || amountMinor,
      currency: response.charge.currency || plan.currency || "GBP",
      status: response.charge.status,
      clientSecret: response.clientSecret,
      approvalUrl: response.approvalUrl,
      ...(method === PaymentCheckoutMethod.WALLET
        ? { topUpUrl: this.centralWallet.topUpUrl() }
        : {}),
    };
  }

  /**
   * Activate a £0.00 access pass without going through MCOM Pay. The local
   * checkout is marked paid immediately so the standard fulfilment path grants
   * the subscription and the flow stays idempotent on retries.
   */
  private async completeFreePurchase(
    business: Business,
    plan: AccessPassPlan,
    checkoutId: string,
    method: PaymentCheckoutMethod,
  ) {
    const idempotencyKey =
      `mcom-rewards-access-pass-${business.id}-${checkoutId}-${method}-free`.slice(
        0,
        255,
      );
    const reference =
      `access-pass-${business.id}-${plan.id}-${checkoutId}`.slice(0, 255);

    const checkout = await this.checkoutService.getOrCreate({
      businessId: business.id,
      purpose: PaymentCheckoutPurpose.ACCESS_PASS,
      purposeRef: plan.id,
      amountMinor: "0",
      currency: plan.currency || "GBP",
      method,
      idempotencyKey,
      reference,
      metadata: {
        platform: "mcom-rewards",
        businessId: business.id,
        accessPassPlanId: plan.id,
        accessPassPlanName: plan.name,
        durationDays: plan.durationDays,
        free: true,
      },
    });

    if (checkout.status !== PaymentCheckoutStatus.PAID) {
      await this.checkoutService.markPaid(checkout);
    }

    const subscription = await this.activateFromCheckout(checkout);

    return {
      success: true,
      free: true,
      checkoutId: checkout.id,
      chargeId: null,
      method,
      amountMinor: "0",
      currency: checkout.currency || plan.currency || "GBP",
      status: "paid" as const,
      accessPass: subscription,
    };
  }

  async confirmPurchase(businessId: string, dto: ConfirmAccessPassPurchaseDto) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException("Business profile not found");

    let checkout: PaymentCheckout | null = null;
    if (dto.checkoutId) {
      checkout = await this.checkoutService.findById(dto.checkoutId);
    } else if (dto.chargeId) {
      checkout = await this.checkoutService.findByChargeId(dto.chargeId);
    } else if (dto.paymentIntentId || dto.orderId) {
      checkout = await this.checkoutService.findByProviderRef(
        dto.paymentIntentId || dto.orderId || "",
      );
    } else if (dto.planId) {
      checkout = await this.checkoutService.findLatestPending(
        businessId,
        PaymentCheckoutPurpose.ACCESS_PASS,
        dto.planId,
      );
    }

    if (!checkout) {
      throw new NotFoundException(
        "Checkout not found. Please start the purchase again.",
      );
    }
    if (checkout.purpose !== PaymentCheckoutPurpose.ACCESS_PASS) {
      throw new BadRequestException(
        "This checkout is not an access pass purchase",
      );
    }
    if (checkout.businessId && checkout.businessId !== businessId) {
      throw new BadRequestException(
        "This checkout belongs to another business",
      );
    }

    if (checkout.status !== PaymentCheckoutStatus.PAID) {
      if (!checkout.chargeId) {
        throw new BadRequestException(
          "This checkout has no MCOM Pay charge. Please start the payment again.",
        );
      }

      try {
        const response = await this.mcomPayments.confirmCharge(
          checkout.chargeId,
          {
            ...(dto.paymentIntentId
              ? { paymentIntentId: dto.paymentIntentId }
              : {}),
            ...(dto.orderId ? { orderId: dto.orderId } : {}),
          },
        );

        if (response.charge.status !== "paid") {
          throw new BadRequestException(
            `Payment is not complete (status: ${response.charge.status})`,
          );
        }
        if (
          response.charge.amountMinor &&
          response.charge.amountMinor !== checkout.amountMinor
        ) {
          throw new BadRequestException(
            "Paid amount does not match the checkout amount",
          );
        }

        await this.checkoutService.attachCharge(checkout, response);
        await this.checkoutService.markPaid(checkout, response.charge);
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        this.mcomPayments.toHttpException(error);
      }
    }

    const subscription = await this.activateFromCheckout(checkout);

    return {
      success: true,
      accessPass: subscription,
      payment: {
        checkoutId: checkout.id,
        chargeId: checkout.chargeId,
        amountMinor: checkout.amountMinor,
        currency: checkout.currency,
        method: checkout.method,
        status: checkout.status,
      },
    };
  }

  private async activateFromCheckout(
    checkout: PaymentCheckout,
  ): Promise<AccessPassSubscription> {
    if (checkout.status !== PaymentCheckoutStatus.PAID) {
      throw new BadRequestException("The payment has not been completed yet");
    }
    const businessId = checkout.businessId;
    if (!businessId) {
      throw new BadRequestException("Checkout is missing a business");
    }
    const planId = checkout.purposeRef;
    if (!planId) {
      throw new BadRequestException("Checkout is missing the access pass");
    }

    const plan = await this.findPlan(planId);
    const provider = this.mapProvider(checkout.method);

    if (checkout.fulfilledAt) {
      const existing = await this.subscriptionRepository.findOne({
        where: { businessId, planId },
        order: { created_at: "DESC" },
      });
      if (existing) return existing;
    }

    const subscription = await this.grantPass(this.dataSource.manager, {
      businessId,
      plan,
      source: AccessPassSource.PURCHASE,
      codeId: null,
      transactionId: checkout.chargeId || checkout.id,
      paymentProvider: provider,
    });

    await this.checkoutService.markFulfilled(checkout);
    this.logger.log(
      `Granted access pass "${plan.name}" to business ${businessId} via ${checkout.method}`,
    );
    return subscription;
  }

  private mapMethod(provider: string): PaymentCheckoutMethod {
    switch ((provider || "").toLowerCase()) {
      case "wallet":
      case "mcom_wallet":
        return PaymentCheckoutMethod.WALLET;
      case "paypal":
        return PaymentCheckoutMethod.PAYPAL;
      case "stripe":
      default:
        return PaymentCheckoutMethod.STRIPE;
    }
  }

  private mapProvider(method: PaymentCheckoutMethod): PaymentProvider {
    if (method === PaymentCheckoutMethod.WALLET) {
      return PaymentProvider.MCOM_WALLET;
    }
    if (method === PaymentCheckoutMethod.PAYPAL) {
      return PaymentProvider.PAYPAL;
    }
    return PaymentProvider.STRIPE;
  }

  /* ------------------------------------------------------------------ */
  /* Maintenance & schema                                                */
  /* ------------------------------------------------------------------ */

  @Cron(CronExpression.EVERY_HOUR, { name: "access-pass-expiry" })
  async expireStale(): Promise<void> {
    try {
      const now = new Date();
      await this.subscriptionRepository
        .createQueryBuilder()
        .update(AccessPassSubscription)
        .set({ status: AccessPassSubscriptionStatus.EXPIRED })
        .where("status = :status", {
          status: AccessPassSubscriptionStatus.ACTIVE,
        })
        .andWhere("expires_at <= :now", { now })
        .execute();

      await this.codeRepository
        .createQueryBuilder()
        .update(AccessPassCode)
        .set({ status: AccessPassCodeStatus.EXPIRED })
        .where("status = :status", { status: AccessPassCodeStatus.ACTIVE })
        .andWhere("expires_at IS NOT NULL")
        .andWhere("expires_at <= :now", { now })
        .execute();
    } catch (error) {
      this.logger.warn(
        `Access pass expiry sweep skipped: ${(error as Error)?.message}`,
      );
    }
  }

  private normalizeConfiguration(
    configuration?: AccessPassConfiguration | null,
  ): AccessPassConfiguration {
    return {
      quotas: { ...(configuration?.quotas || {}) },
      featureFlags: { ...(configuration?.featureFlags || {}) },
      ...(configuration?.disabledNavIds
        ? { disabledNavIds: configuration.disabledNavIds }
        : {}),
    };
  }

  getSchema() {
    return {
      quotas: [
        {
          key: "maxActiveCampaigns",
          label: "Max Active Campaigns",
          type: "number",
          unlimited: true,
        },
        {
          key: "maxActiveRewards",
          label: "Max Active Rewards",
          type: "number",
          unlimited: true,
        },
        {
          key: "maxRewardsPerCampaign",
          label: "Max Rewards Per Campaign",
          type: "number",
          unlimited: true,
        },
        {
          key: "monthlyPointsAllowance",
          label: "Monthly Points Allowance",
          type: "number",
        },
        {
          key: "monthlyStampsAllowance",
          label: "Monthly Stamps Allowance",
          type: "number",
        },
        { key: "maxTeamMembers", label: "Max Team Members", type: "number" },
        {
          key: "maxGiftCardTemplates",
          label: "Max Gift Card Templates",
          type: "number",
        },
        {
          key: "maxCouponTemplates",
          label: "Max Coupon Templates",
          type: "number",
        },
      ],
      featureFlags: [
        {
          key: "canCreateCampaignFromScratch",
          label: "Create Campaign From Scratch",
          type: "boolean",
        },
        {
          key: "canEditAdminTemplates",
          label: "Edit Admin Templates",
          type: "boolean",
        },
        {
          key: "hasAccessToAdvancedAnalytics",
          label: "Advanced Analytics Dashboard",
          type: "boolean",
        },
        {
          key: "hasAccessToCRM",
          label: "Customer CRM Access",
          type: "boolean",
        },
        { key: "canUpdateReward", label: "Update Reward", type: "boolean" },
        {
          key: "priorityInSearch",
          label: "Priority Placement in Search",
          type: "boolean",
        },
      ],
    };
  }
}
