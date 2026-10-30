import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IsNull, LessThanOrEqual, Not, Repository } from "typeorm";
import { nanoid } from "nanoid";
import { Reward } from "../rewards/entities/reward.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { RewardType } from "../rewards/enums/reward-type.enum";
import { RewardIssuance } from "../partner-rewards/entities/reward-issuance.entity";
import { RewardIssuanceStatus } from "../partner-rewards/enums/partner-reward.enums";
import { MallIntegrationService } from "../mall-integration/mall-integration.service";
import type { MallInstrumentScope } from "../mall-integration/mall-integration.service";
import { CentralIntegrationService } from "../central-integration/central-integration.service";
import { RewardFulfilmentOutbox } from "./entities/reward-fulfilment-outbox.entity";
import {
  FulfilmentErrorCode,
  FulfilmentFundingSource,
  FulfilmentKind,
  FulfilmentOperation,
  FulfilmentOutboxStatus,
  FulfilmentProvider,
  FulfilmentStatus,
  RewardFulfilmentConfig,
} from "./reward-fulfilment.enums";

const CODE_PREFIX = "MCOM";
const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 60 * 60_000;

export class FulfilmentProviderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "FulfilmentProviderError";
  }
}

interface Attachment {
  provider: FulfilmentProvider;
  kind: FulfilmentKind;
  config: RewardFulfilmentConfig;
  templateId?: string | null;
  businessId?: string | null;
  businessMcomUserId?: string | null;
  businessName?: string | null;
  fundingSource: FulfilmentFundingSource;
  /** True when this is inferred from pre-fulfilment Mall columns. */
  legacy?: boolean;
}

/**
 * Orchestrates provider fulfilment for a reward issuance.
 *
 * The issuance ledger stays the source of truth; this service only decides how
 * to deliver the reward (Mall instrument, Central entitlement, Central coupon)
 * and records the provider outcome.
 */
@Injectable()
export class RewardFulfilmentService {
  private readonly logger = new Logger(RewardFulfilmentService.name);

  constructor(
    @InjectRepository(RewardIssuance)
    private readonly issuanceRepository: Repository<RewardIssuance>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(BusinessReward)
    private readonly businessRewardRepository: Repository<BusinessReward>,
    @InjectRepository(RewardFulfilmentOutbox)
    private readonly outboxRepository: Repository<RewardFulfilmentOutbox>,
    private readonly mall: MallIntegrationService,
    private readonly central: CentralIntegrationService,
    private readonly config: ConfigService,
  ) {}

  // ─── Public API ────────────────────────────────────────────────────────────

  async fulfil(idOrIssuance: string | RewardIssuance): Promise<RewardIssuance> {
    const issuance = await this.loadIssuance(idOrIssuance);

    if (
      issuance.fulfilment_status === FulfilmentStatus.DELIVERED &&
      (issuance.fulfilment_code || issuance.fulfilment_ref)
    ) {
      return issuance;
    }

    const attachment = await this.resolveAttachment(issuance);
    issuance.fulfilment_provider = attachment.provider;
    issuance.fulfilment_kind = attachment.kind;

    if (
      !attachment.provider ||
      attachment.provider === FulfilmentProvider.NONE ||
      attachment.kind === FulfilmentKind.MALL_DISCOUNT
    ) {
      issuance.fulfilment_status = FulfilmentStatus.NOT_REQUIRED;
      await this.issuanceRepository.save(issuance);
      return issuance;
    }

    if (
      attachment.kind !== FulfilmentKind.CENTRAL_MEMBERSHIP &&
      !issuance.code
    ) {
      issuance.code = this.generateCode();
    }
    if (attachment.kind === FulfilmentKind.CENTRAL_MEMBERSHIP) {
      // Memberships are entitlement grants, not codes.
      issuance.code = null;
    }

    // Provider-backed fulfilment starts PENDING. The column default is
    // NOT_REQUIRED (legacy rows), so without this the success branch below
    // would skip marking the issuance DELIVERED.
    issuance.fulfilment_status = FulfilmentStatus.PENDING;

    try {
      let delivered = true;
      switch (attachment.kind) {
        case FulfilmentKind.MALL_GIFT_CARD:
        case FulfilmentKind.MALL_VOUCHER:
        case FulfilmentKind.MALL_COUPON:
          await this.fulfilMall(issuance, attachment);
          break;
        case FulfilmentKind.CENTRAL_MEMBERSHIP:
          await this.fulfilMembership(issuance, attachment);
          break;
        case FulfilmentKind.CENTRAL_ACCESS_PASS:
          await this.fulfilAccessPass(issuance, attachment);
          break;
        case FulfilmentKind.CENTRAL_COUPON:
          await this.fulfilCentralCoupon(issuance, attachment);
          break;
        default:
          delivered = false;
          issuance.fulfilment_status = FulfilmentStatus.NOT_REQUIRED;
          break;
      }

      if (delivered) {
        issuance.fulfilment_status = FulfilmentStatus.DELIVERED;
        issuance.fulfilled_at = new Date();
        issuance.fulfilment_error = null;
      }
    } catch (err) {
      issuance.fulfilment_status = this.errorStatus(err);
      issuance.fulfilment_error = this.errorMessage(err);
      issuance.fulfilment_attempts = (issuance.fulfilment_attempts || 0) + 1;
      this.logger.warn(
        `Fulfilment failed for issuance ${issuance.id} (${attachment.kind}): ${issuance.fulfilment_error}`,
      );
      await this.issuanceRepository.save(issuance);
      await this.enqueue(issuance.id, FulfilmentOperation.FULFIL);
      return issuance;
    }

    await this.issuanceRepository.save(issuance);
    return issuance;
  }

  async retry(issuanceId: string): Promise<RewardIssuance> {
    const issuance = await this.loadIssuance(issuanceId);
    if (issuance.status === RewardIssuanceStatus.REVOKED) {
      throw new BadRequestException("Cannot retry a revoked issuance");
    }
    issuance.fulfilment_status = FulfilmentStatus.PENDING;
    issuance.fulfilment_error = null;
    await this.issuanceRepository.save(issuance);
    return this.fulfil(issuance);
  }

  async revoke(issuanceId: string, reason?: string): Promise<RewardIssuance> {
    const issuance = await this.loadIssuance(issuanceId);
    const attachment = await this.resolveAttachment(issuance);

    try {
      if (attachment.provider === FulfilmentProvider.MALL) {
        if (issuance.fulfilment_code) {
          await this.mall.revokeInstrument(
            this.mallKind(attachment.kind),
            issuance.fulfilment_code,
            reason,
          );
        }
      } else if (attachment.provider === FulfilmentProvider.CENTRAL) {
        if (
          attachment.kind === FulfilmentKind.CENTRAL_MEMBERSHIP ||
          attachment.kind === FulfilmentKind.CENTRAL_ACCESS_PASS
        ) {
          if (issuance.fulfilment_ref) {
            await this.central.revokeGrant(issuance.fulfilment_ref);
          }
        } else if (
          attachment.kind === FulfilmentKind.CENTRAL_COUPON &&
          issuance.fulfilment_code
        ) {
          await this.central.revokeCoupon(issuance.fulfilment_code);
        }
      }

      issuance.status = RewardIssuanceStatus.REVOKED;
      issuance.revoked_at = new Date();
      issuance.fulfilment_status = FulfilmentStatus.REVOKED;
      issuance.fulfilment_error = reason || null;
      await this.issuanceRepository.save(issuance);
      return issuance;
    } catch (err) {
      issuance.fulfilment_error = this.errorMessage(err);
      issuance.fulfilment_attempts = (issuance.fulfilment_attempts || 0) + 1;
      await this.issuanceRepository.save(issuance);
      await this.enqueue(issuance.id, FulfilmentOperation.REVOKE);
      throw err;
    }
  }

  async markRedeemed(
    issuanceId: string,
    code?: string,
  ): Promise<RewardIssuance | null> {
    const issuance = await this.issuanceRepository.findOne({
      where: { id: issuanceId },
      relations: ["reward"],
    });
    if (!issuance) return null;
    if (code && issuance.code && issuance.code !== code) {
      this.logger.warn(
        `Provider code mismatch for issuance ${issuanceId}: expected ${issuance.code}, got ${code}`,
      );
    }
    if (issuance.status !== RewardIssuanceStatus.REDEEMED) {
      issuance.status = RewardIssuanceStatus.REDEEMED;
      issuance.redeemed_at = new Date();
    }
    if (issuance.fulfilment_status !== FulfilmentStatus.NOT_REQUIRED) {
      issuance.fulfilment_status = FulfilmentStatus.DELIVERED;
    }
    await this.issuanceRepository.save(issuance);
    return issuance;
  }

  async markRevoked(
    issuanceId: string,
    reason?: string,
  ): Promise<RewardIssuance | null> {
    const issuance = await this.issuanceRepository.findOne({
      where: { id: issuanceId },
    });
    if (!issuance) return null;
    issuance.status = RewardIssuanceStatus.REVOKED;
    issuance.revoked_at = issuance.revoked_at || new Date();
    if (issuance.fulfilment_status !== FulfilmentStatus.NOT_REQUIRED) {
      issuance.fulfilment_status = FulfilmentStatus.REVOKED;
    }
    if (reason) issuance.fulfilment_error = reason;
    await this.issuanceRepository.save(issuance);
    return issuance;
  }

  async listNeedsAttention(page = 1, limit = 20): Promise<{
    data: RewardIssuance[];
    total: number;
    page: number;
    limit: number;
  }> {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const where = [
      { fulfilment_status: FulfilmentStatus.FAILED },
      { fulfilment_status: FulfilmentStatus.PENDING_IDENTITY },
      { fulfilment_status: FulfilmentStatus.PENDING_CONFLICT },
    ];
    const [data, total] = await this.issuanceRepository.findAndCount({
      where,
      relations: ["reward"],
      order: { created_at: "DESC" },
      skip,
      take,
    });
    return { data, total, page: Math.max(page, 1), limit: take };
  }

  getDeepLink(issuance: RewardIssuance | Record<string, any>): string | null {
    const anyIssuance = issuance as any;
    const kind =
      anyIssuance.fulfilment_kind ?? anyIssuance.fulfilmentKind ?? null;
    if (!kind) return null;
    const code =
      anyIssuance.fulfilment_code ?? anyIssuance.fulfilmentCode ?? null;
    const metadata = anyIssuance.metadata || {};

    if (
      kind === FulfilmentKind.MALL_GIFT_CARD ||
      kind === FulfilmentKind.MALL_VOUCHER ||
      kind === FulfilmentKind.MALL_COUPON ||
      kind === FulfilmentKind.MALL_DISCOUNT
    ) {
      const businessId =
        metadata?.fulfilment?.businessId || metadata?.businessId || null;
      const base = this.mall.getMallFrontendUrl();
      if (businessId) {
        return `${base}/listings/${encodeURIComponent(businessId)}${
          code ? `?reward=${encodeURIComponent(code)}` : ""
        }`;
      }
      return `${base}/marketplace${
        code ? `?reward=${encodeURIComponent(code)}` : ""
      }`;
    }

    const centralWeb = (
      this.config.get<string>("MCOM_CENTRAL_WEB_URL") ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    if (kind === FulfilmentKind.CENTRAL_MEMBERSHIP) {
      return `${centralWeb}/dashboard/membership`;
    }
    if (kind === FulfilmentKind.CENTRAL_ACCESS_PASS) {
      return `${centralWeb}/dashboard/access`;
    }
    if (kind === FulfilmentKind.CENTRAL_COUPON) {
      return `${centralWeb}/dashboard/membership`;
    }
    return null;
  }

  // ─── Provider strategies ───────────────────────────────────────────────────

  private async fulfilMall(
    issuance: RewardIssuance,
    attachment: Attachment,
  ): Promise<void> {
    const config = attachment.config || {};
    const amount =
      Number(config.value?.amount) > 0
        ? Number(config.value!.amount)
        : Number(issuance.value) || 0;

    if (!(amount > 0)) {
      if (attachment.legacy) {
        // Legacy business rewards without a value generated a code only.
        issuance.fulfilment_status = FulfilmentStatus.NOT_REQUIRED;
        return;
      }
      throw new FulfilmentProviderError(
        FulfilmentErrorCode.UNKNOWN_PROVIDER_ERROR,
        "A positive value is required for a Mall instrument",
      );
    }

    const payload = {
      amount,
      recipientEmail: issuance.recipient_email,
      recipientName: issuance.recipient_name,
      message:
        (config.metadata?.message as string) ||
        issuance.metadata?.businessReward?.description ||
        undefined,
      businessName:
        attachment.businessName ||
        config.businessName ||
        "MCOM Rewards",
      code: issuance.code,
      expiresAt: this.resolveExpiry(issuance, config),
      issuanceId: issuance.id,
      templateId:
        config.templateRef?.id || attachment.templateId || undefined,
      businessId: config.businessId || attachment.businessId || undefined,
      scope: this.toMallScope(config.scope),
      metadata: {
        ...(config.metadata || {}),
        rewardId: issuance.reward?.id || null,
        businessRewardId: issuance.business_reward_id || null,
        fulfilmentKind: attachment.kind,
      },
    };

    let response;
    switch (attachment.kind) {
      case FulfilmentKind.MALL_GIFT_CARD:
        response = await this.mall.createGiftCard(payload);
        break;
      case FulfilmentKind.MALL_VOUCHER:
        response = await this.mall.createVoucher(payload);
        break;
      default:
        response = await this.mall.createCoupon(payload);
        break;
    }

    if (response?.code) issuance.code = response.code;
    issuance.fulfilment_ref = response?.id ? String(response.id) : null;
    issuance.fulfilment_code = response?.code || issuance.code;
    issuance.mall_reference = issuance.fulfilment_ref;
    issuance.fulfilment_payload = response || null;
    // The issuance has no monetary column for instruments; carry the face value
    // alongside the fulfilment details so downstream mirrors can render it.
    if (amount > 0) issuance.value = amount;
    issuance.metadata = {
      ...(issuance.metadata || {}),
      fulfilment: {
        provider: FulfilmentProvider.MALL,
        kind: attachment.kind,
        businessId: payload.businessId || null,
        templateId: payload.templateId || null,
        scope: payload.scope || null,
        amount,
      },
    };
  }

  private async fulfilMembership(
    issuance: RewardIssuance,
    attachment: Attachment,
  ): Promise<void> {
    const grant = attachment.config?.grant || {};
    const planId = grant.planId || attachment.config?.templateRef?.id;
    if (!planId) {
      throw new FulfilmentProviderError(
        FulfilmentErrorCode.PLAN_NOT_AVAILABLE,
        "No Central membership plan is attached to this reward",
      );
    }

    const recipientMcomUserId = await this.resolveCentralUserId(issuance);
    const result = await this.central.grantMembership({
      issuanceId: issuance.id,
      recipientMcomUserId,
      planId,
      tier: grant.tier,
      durationDays: grant.durationDays,
      extendExisting: grant.extendExisting ?? true,
      replaceExisting: grant.replaceExisting ?? false,
      note: `MCOM Rewards issuance ${issuance.id}`,
    });

    issuance.fulfilment_ref = result.grantId;
    issuance.central_reference = result.grantId;
    issuance.fulfilment_payload = result;
    issuance.metadata = {
      ...(issuance.metadata || {}),
      fulfilment: {
        provider: FulfilmentProvider.CENTRAL,
        kind: FulfilmentKind.CENTRAL_MEMBERSHIP,
        businessId: result.businessId,
        startsAt: result.startsAt,
        expiresAt: result.expiresAt,
      },
    };
  }

  private async fulfilAccessPass(
    issuance: RewardIssuance,
    attachment: Attachment,
  ): Promise<void> {
    const grant = attachment.config?.grant || {};
    const accessPlanId =
      grant.planId ||
      (grant as any).accessPlanId ||
      attachment.config?.templateRef?.id;
    if (!accessPlanId) {
      throw new FulfilmentProviderError(
        FulfilmentErrorCode.PLAN_NOT_AVAILABLE,
        "No Central access plan is attached to this reward",
      );
    }

    const recipientMcomUserId = await this.resolveCentralUserId(issuance, false);
    const result = await this.central.issueAccessPassCode({
      issuanceId: issuance.id,
      accessPlanId,
      recipientEmail: issuance.recipient_email,
      recipientMcomUserId: recipientMcomUserId || undefined,
      mode: "GIFT",
      sendEmail: false,
      note: `MCOM Rewards issuance ${issuance.id}`,
    });

    issuance.code = result.code;
    issuance.fulfilment_code = result.code;
    issuance.fulfilment_ref = result.grantId || result.code;
    issuance.central_reference = result.grantId || null;
    issuance.fulfilment_payload = result;
    issuance.metadata = {
      ...(issuance.metadata || {}),
      fulfilment: {
        provider: FulfilmentProvider.CENTRAL,
        kind: FulfilmentKind.CENTRAL_ACCESS_PASS,
        accessPlanId,
        planName: result.planName,
        durationDays: result.durationDays,
      },
    };
  }

  private async fulfilCentralCoupon(
    issuance: RewardIssuance,
    attachment: Attachment,
  ): Promise<void> {
    const coupon = attachment.config?.coupon || {};
    const discountValue = Number(
      coupon.discountValue ?? attachment.config?.value?.discountValue,
    );
    if (!(discountValue > 0)) {
      throw new FulfilmentProviderError(
        FulfilmentErrorCode.UNKNOWN_PROVIDER_ERROR,
        "A positive discount value is required for a Central coupon",
      );
    }

    const lockedToUserId = await this.resolveCentralUserId(issuance);
    const result = await this.central.createCoupon({
      issuanceId: issuance.id,
      code: issuance.code,
      description: coupon.description || issuance.reward?.description,
      discountType:
        coupon.discountType === "fixed" || coupon.discountType === "FIXED"
          ? "FIXED"
          : "PERCENTAGE",
      discountValue,
      appliesToAllMemberships: coupon.appliesToAllMemberships ?? true,
      membershipPlanIds: coupon.membershipPlanIds || [],
      appliesToAllAccess: coupon.appliesToAllAccess ?? false,
      accessPlanIds: coupon.accessPlanIds || [],
      maxUses: coupon.maxUses ?? 1,
      maxUsesPerUser: coupon.maxUsesPerUser ?? 1,
      validFrom: coupon.validFrom,
      expiresAt: coupon.expiresAt || this.resolveExpiry(issuance, attachment.config),
      lockedToUserId,
      isActive: true,
    });

    if (result?.code) issuance.code = result.code;
    issuance.fulfilment_code = result?.code || issuance.code;
    issuance.fulfilment_ref = result?.id ? String(result.id) : null;
    issuance.central_reference = result?.id ? String(result.id) : null;
    issuance.fulfilment_payload = result;
    issuance.metadata = {
      ...(issuance.metadata || {}),
      fulfilment: {
        provider: FulfilmentProvider.CENTRAL,
        kind: FulfilmentKind.CENTRAL_COUPON,
        couponId: result?.id,
        lockedToUserId,
      },
    };
  }

  // ─── Attachment resolution ─────────────────────────────────────────────────

  private async resolveAttachment(
    issuance: RewardIssuance,
  ): Promise<Attachment> {
    if (issuance.business_reward_id) {
      const businessReward = await this.businessRewardRepository.findOne({
        where: { id: issuance.business_reward_id },
        relations: ["business", "reward"],
      });
      if (businessReward) {
        return this.attachmentFromBusinessReward(businessReward);
      }
    }

    const resolvedReward = issuance.reward || null;

    if (resolvedReward) {
      return this.attachmentFromReward(resolvedReward);
    }

    return {
      provider: FulfilmentProvider.NONE,
      kind: FulfilmentKind.MALL_DISCOUNT,
      config: {},
      fundingSource: FulfilmentFundingSource.PLATFORM,
    };
  }

  private attachmentFromBusinessReward(
    businessReward: BusinessReward,
  ): Attachment {
    const legacyKind = this.legacyMallKind(businessReward);
    const legacy = !businessReward.fulfilment_provider;
    return {
      provider: (businessReward.fulfilment_provider ||
        (legacyKind ? FulfilmentProvider.MALL : FulfilmentProvider.NONE)) as FulfilmentProvider,
      kind: (businessReward.fulfilment_kind ||
        legacyKind ||
        FulfilmentKind.MALL_DISCOUNT) as FulfilmentKind,
      config: businessReward.fulfilment_config || {},
      templateId: businessReward.fulfilment_template_id,
      businessId: businessReward.fulfilment_business_ref,
      businessMcomUserId: businessReward.business?.mcomUserId || null,
      businessName: businessReward.business?.name || null,
      fundingSource:
        businessReward.fulfilment_funding_source ||
        FulfilmentFundingSource.BUSINESS_WALLET,
      legacy,
    };
  }

  private attachmentFromReward(reward: Reward): Attachment {
    const legacyKind = this.legacyMallKindForReward(reward);
    const legacy = !reward.fulfilment_provider;
    return {
      provider: (reward.fulfilment_provider ||
        (legacyKind ? FulfilmentProvider.MALL : FulfilmentProvider.NONE)) as FulfilmentProvider,
      kind: (reward.fulfilment_kind ||
        legacyKind ||
        FulfilmentKind.MALL_DISCOUNT) as FulfilmentKind,
      config: reward.fulfilment_config || {},
      templateId: reward.fulfilment_template_id,
      businessId: reward.fulfilment_business_ref,
      businessName: null,
      fundingSource:
        reward.fulfilment_funding_source || FulfilmentFundingSource.PLATFORM,
      legacy,
    };
  }

  private legacyMallKind(
    businessReward: BusinessReward,
  ): FulfilmentKind | null {
    if (
      businessReward.mall_discount_type &&
      Number(businessReward.mall_discount_value) > 0
    ) {
      return FulfilmentKind.MALL_DISCOUNT;
    }
    if (
      businessReward.mall_reward_type === "GIFT_CARD" ||
      businessReward.reward_type === RewardType.GIFT_CARD
    ) {
      return FulfilmentKind.MALL_GIFT_CARD;
    }
    if (
      businessReward.mall_reward_type === "COUPON" ||
      businessReward.reward_type === RewardType.COUPON
    ) {
      return FulfilmentKind.MALL_COUPON;
    }
    if (
      businessReward.mall_reward_type === "VOUCHER" ||
      businessReward.reward_type === RewardType.VOUCHER
    ) {
      return businessReward.is_mall_integrated ||
        Number(businessReward.mall_reward_value) > 0
        ? FulfilmentKind.MALL_VOUCHER
        : null;
    }
    return null;
  }

  private legacyMallKindForReward(reward: Reward): FulfilmentKind | null {
    switch (reward.reward_type) {
      case RewardType.GIFT_CARD:
        return FulfilmentKind.MALL_GIFT_CARD;
      case RewardType.COUPON:
        return FulfilmentKind.MALL_COUPON;
      case RewardType.VOUCHER:
        return FulfilmentKind.MALL_VOUCHER;
      default:
        return null;
    }
  }

  // ─── Identity ──────────────────────────────────────────────────────────────

  private async resolveCentralUserId(
    issuance: RewardIssuance,
    required = true,
  ): Promise<string> {
    if (issuance.recipient_mcom_user_id) {
      return issuance.recipient_mcom_user_id;
    }

    const recipient = await this.central
      .resolveRecipient({ email: issuance.recipient_email })
      .catch(() => null);

    if (recipient?.mcomUserId) {
      issuance.recipient_mcom_user_id = recipient.mcomUserId;
      await this.issuanceRepository.save(issuance);
      return recipient.mcomUserId;
    }

    if (!required) return "";
    throw new FulfilmentProviderError(
      FulfilmentErrorCode.RECIPIENT_IDENTITY_UNRESOLVED,
      "The recipient could not be resolved to an MCOM Central user",
      422,
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async loadIssuance(
    idOrIssuance: string | RewardIssuance,
  ): Promise<RewardIssuance> {
    if (typeof idOrIssuance !== "string") return idOrIssuance;
    const issuance = await this.issuanceRepository.findOne({
      where: { id: idOrIssuance },
      relations: ["reward"],
    });
    if (!issuance) {
      throw new NotFoundException(`Issuance ${idOrIssuance} not found`);
    }
    return issuance;
  }

  private generateCode(): string {
    return `${CODE_PREFIX}-${nanoid(10).toUpperCase()}`;
  }

  private resolveExpiry(
    issuance: RewardIssuance,
    config: RewardFulfilmentConfig,
  ): string | undefined {
    if (config?.validity?.expiresAt) return config.validity.expiresAt;
    if (issuance.expires_at) {
      return new Date(issuance.expires_at).toISOString();
    }
    if (config?.validity?.expiresInDays) {
      const date = new Date();
      date.setDate(date.getDate() + config.validity.expiresInDays);
      return date.toISOString();
    }
    return undefined;
  }

  private toMallScope(
    scope: RewardFulfilmentConfig["scope"],
  ): MallInstrumentScope | undefined {
    if (!scope?.mode) return undefined;
    const result: MallInstrumentScope = { mode: scope.mode };
    if (scope.listingIds?.length) result.listingIds = scope.listingIds;
    if (scope.productIds?.length) result.productIds = scope.productIds;
    if (scope.serviceIds?.length) result.serviceIds = scope.serviceIds;
    return result;
  }

  private mallKind(
    kind: FulfilmentKind,
  ): "gift_card" | "voucher" | "coupon" {
    switch (kind) {
      case FulfilmentKind.MALL_GIFT_CARD:
        return "gift_card";
      case FulfilmentKind.MALL_VOUCHER:
        return "voucher";
      default:
        return "coupon";
    }
  }

  private errorStatus(err: unknown): FulfilmentStatus {
    const response = (err as any)?.getResponse?.();
    const code =
      (err as FulfilmentProviderError)?.code ||
      (response && typeof response === "object" ? response.code : undefined);
    if (
      code === FulfilmentErrorCode.RECIPIENT_IDENTITY_UNRESOLVED ||
      code === FulfilmentErrorCode.RECIPIENT_NOT_A_BUSINESS
    ) {
      return FulfilmentStatus.PENDING_IDENTITY;
    }
    if (code === FulfilmentErrorCode.MEMBERSHIP_CONFLICT) {
      return FulfilmentStatus.PENDING_CONFLICT;
    }
    return FulfilmentStatus.FAILED;
  }

  private errorMessage(err: unknown): string {
    const response = (err as any)?.getResponse?.();
    const code =
      (err as FulfilmentProviderError)?.code ||
      (response && typeof response === "object" ? response.code : undefined);
    const message =
      (response && typeof response === "object" && response.message) ||
      (err instanceof Error ? err.message : "Fulfilment provider error");
    return code ? `${code}: ${message}` : message;
  }

  // ─── Outbox ────────────────────────────────────────────────────────────────

  async enqueue(
    issuanceId: string,
    operation: FulfilmentOperation,
  ): Promise<void> {
    const existing = await this.outboxRepository.findOne({
      where: { issuance_id: issuanceId, operation },
    });
    if (existing) {
      existing.status = FulfilmentOutboxStatus.PENDING;
      existing.next_attempt_at = new Date();
      await this.outboxRepository.save(existing);
      return;
    }
    await this.outboxRepository.save(
      this.outboxRepository.create({
        issuance_id: issuanceId,
        operation,
        status: FulfilmentOutboxStatus.PENDING,
        attempts: 0,
        max_attempts: MAX_ATTEMPTS,
        next_attempt_at: new Date(),
      }),
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processOutbox(): Promise<void> {
    const due = await this.outboxRepository.find({
      where: {
        status: Not(FulfilmentOutboxStatus.SENT),
        next_attempt_at: LessThanOrEqual(new Date()),
        deleted_at: IsNull(),
      },
      order: { next_attempt_at: "ASC" },
      take: 25,
    });

    for (const row of due) {
      if (row.status === FulfilmentOutboxStatus.PROCESSING) continue;

      row.status = FulfilmentOutboxStatus.PROCESSING;
      await this.outboxRepository.save(row);

      try {
        if (row.operation === FulfilmentOperation.REVOKE) {
          await this.revoke(row.issuance_id, row.last_error || "Reward revoked");
        } else {
          await this.fulfil(row.issuance_id);
        }

        row.status = FulfilmentOutboxStatus.SENT;
        row.last_error = null;
        await this.outboxRepository.save(row);
      } catch (err) {
        row.attempts += 1;
        row.last_error = this.errorMessage(err).slice(0, 1000);
        row.status =
          row.attempts >= row.max_attempts
            ? FulfilmentOutboxStatus.DEAD
            : FulfilmentOutboxStatus.FAILED;
        row.next_attempt_at = new Date(
          Date.now() +
            Math.min(
              MAX_BACKOFF_MS,
              BASE_BACKOFF_MS * Math.pow(2, Math.max(row.attempts - 1, 0)),
            ),
        );
        await this.outboxRepository.save(row);
      }
    }
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  async handleCentralEvent(
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    const issuanceId = data?.issuanceId || data?.externalRef;
    if (!issuanceId) {
      this.logger.warn(`Central event ${event} has no issuanceId`);
      return;
    }

    const issuance = await this.issuanceRepository.findOne({
      where: { id: issuanceId },
      relations: ["reward"],
    });
    if (!issuance) {
      this.logger.warn(
        `Central event ${event} references unknown issuance ${issuanceId}`,
      );
      return;
    }

    switch (event) {
      case "central.membership.granted":
        issuance.fulfilment_status = FulfilmentStatus.DELIVERED;
        issuance.fulfilment_ref = data.grantId || issuance.fulfilment_ref;
        issuance.central_reference = data.grantId || issuance.central_reference;
        issuance.fulfilled_at = issuance.fulfilled_at || new Date();
        issuance.fulfilment_payload = { ...(issuance.fulfilment_payload || {}), ...data };
        break;
      case "central.membership.expired":
        if (issuance.status === RewardIssuanceStatus.ISSUED) {
          issuance.status = RewardIssuanceStatus.EXPIRED;
        }
        break;
      case "central.access_pass.code_created":
        issuance.fulfilment_status = FulfilmentStatus.DELIVERED;
        if (data.code) {
          issuance.code = data.code;
          issuance.fulfilment_code = data.code;
        }
        break;
      case "central.access_pass.redeemed":
        issuance.status = RewardIssuanceStatus.REDEEMED;
        issuance.redeemed_at = issuance.redeemed_at || new Date();
        break;
      case "central.coupon.created":
        issuance.fulfilment_status = FulfilmentStatus.DELIVERED;
        if (data.code || data.couponCode) {
          issuance.code = data.code || data.couponCode;
          issuance.fulfilment_code = issuance.code;
        }
        break;
      case "central.coupon.redeemed":
        issuance.status = RewardIssuanceStatus.REDEEMED;
        issuance.redeemed_at = issuance.redeemed_at || new Date();
        break;
      case "central.coupon.expired":
        if (issuance.status === RewardIssuanceStatus.ISSUED) {
          issuance.status = RewardIssuanceStatus.EXPIRED;
        }
        break;
      case "central.coupon.revoked":
      case "central.grant.revoked":
        issuance.status = RewardIssuanceStatus.REVOKED;
        issuance.revoked_at = issuance.revoked_at || new Date();
        issuance.fulfilment_status = FulfilmentStatus.REVOKED;
        break;
      default:
        this.logger.log(`Unhandled Central partner event: ${event}`);
        return;
    }

    await this.issuanceRepository.save(issuance);
  }

  async handleProviderEvent(
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    const issuanceId = data?.id || data?.issuanceId;
    if (!issuanceId) return;

    const status = String(data?.status || "").toUpperCase();
    if (status === "REDEEMED") {
      await this.markRedeemed(issuanceId, data?.code);
    } else if (status === "REVOKED" || status === "EXPIRED") {
      await this.markRevoked(issuanceId, event);
    }
  }
}
