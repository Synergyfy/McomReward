import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Brackets,
  DataSource,
  LessThan,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { nanoid } from "nanoid";
import { Reward } from "../../rewards/entities/reward.entity";
import { BusinessReward } from "../../rewards/entities/business-reward.entity";
import { RewardType } from "../../rewards/enums/reward-type.enum";
import { RewardStatus } from "../../rewards/enums/reward-status.enum";
import { RewardSource } from "../../rewards/enums/reward-source.enum";
import {
  MallInstrument,
  MallIntegrationService,
} from "../../mall-integration/mall-integration.service";
import { RewardIssuance } from "../entities/reward-issuance.entity";
import {
  PartnerRewardEvent,
  RewardIssuanceStatus,
} from "../enums/partner-reward.enums";
import { IssueRewardDto } from "../dto/issue-reward.dto";
import { IssueBusinessRewardDto } from "../dto/issue-business-reward.dto";
import { GiftRewardDto } from "../dto/gift-reward.dto";
import { ListIssuancesDto } from "../dto/list-issuances.dto";
import {
  CommitIssuanceDto,
  ReleaseIssuanceDto,
  ReserveIssuanceDto,
} from "../dto/reserve-issuance.dto";
import {
  RedeemIssuanceDto,
  RevokeIssuanceDto,
} from "../dto/redeem-issuance.dto";
import { RecipientResolverService } from "./recipient-resolver.service";
import { PartnerPointsGateway } from "./partner-points-gateway.service";
import { PartnerEventNotifier } from "./partner-event-notifier.service";
import {
  BusinessEntitlementSnapshot,
  PartnerEntitlementService,
} from "./partner-entitlement.service";
import { ServiceCallerContext } from "../../service-mesh/interfaces/authenticated-service-request.interface";

const CODE_PREFIX = "MCOM";

/** Normalised fulfilment inputs — decoupled from the catalogue source. */
interface FulfilmentContext {
  rewardType: string;
  value: number;
  maxPoints?: number;
  title: string;
  description?: string;
  /** Underlying catalogue reward (for points ledger attribution), if any. */
  reward: Reward | null;
}

/** Everything needed to persist an issuance, once source-specific rules ran. */
interface PersistIssuanceParams {
  callerClientId: string;
  idempotencyKey: string;
  recipientEmail: string;
  dto: IssueRewardDto | IssueBusinessRewardDto | GiftRewardDto;
  resolved: { userId: string; userType: string; name?: string } | null;
  quantity: number;
  expiresAt: Date | null;
  reward: Reward | null;
  businessRewardId: string | null;
  businessRewardSnapshot?: Record<string, any> | null;
  fulfilment: FulfilmentContext;
  businessMeta: { mcomUserId: string | null; email: string | null };
  entitlement?: BusinessEntitlementSnapshot | null;
  /** Set for platform-sponsored gifts (no business sponsor). */
  sponsor?: Record<string, any> | null;
  /** Mall discount targeting, copied into `metadata.mallTargets`. */
  mallTargets?: Record<string, any> | null;
}

/**
 * Provider-side reward issuance engine. Owns the full partner lifecycle:
 * issue → (redeem | expire | revoke), with idempotency and mesh peer events.
 *
 * Rewards can be issued either from the global MCOM catalogue (`Reward`) or
 * directly from a reward a business owns (`BusinessReward`).
 */
@Injectable()
export class RewardIssuanceService {
  private readonly logger = new Logger(RewardIssuanceService.name);

  constructor(
    @InjectRepository(RewardIssuance)
    private readonly issuanceRepository: Repository<RewardIssuance>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(BusinessReward)
    private readonly businessRewardRepository: Repository<BusinessReward>,
    private readonly recipientResolver: RecipientResolverService,
    private readonly pointsGateway: PartnerPointsGateway,
    private readonly mallIntegration: MallIntegrationService,
    private readonly partnerEntitlement: PartnerEntitlementService,
    private readonly notifier: PartnerEventNotifier,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Issue from the global MCOM catalogue. The `business` in the body is the
   * sponsor whose entitlement is checked.
   */
  async issue(
    callerClientId: string,
    rewardId: string,
    dto: IssueRewardDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    this.assertCanIssueTo(caller, dto.recipient);

    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });
    if (!reward) {
      throw new NotFoundException(`Reward ${rewardId} not found`);
    }
    if (reward.disabled) {
      throw new BadRequestException("Reward is disabled and cannot be issued");
    }
    if (reward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException(
        `Reward is not active (status: ${reward.status})`,
      );
    }

    const idempotencyKey =
      dto.idempotencyKey || `partner-${callerClientId}-${nanoid(24)}`;

    const existing = await this.findIdempotent(callerClientId, idempotencyKey);
    if (existing) {
      return this.toDto(existing);
    }

    // The sponsoring business must be entitled (subscription, trial, or MCOM
    // Rewards included in its MCOM membership). Idempotent replays skip this.
    const entitlement = await this.partnerEntitlement.assertBusinessEntitled(
      dto.business,
    );

    const { recipientEmail, resolved, quantity } =
      await this.resolveRecipient(dto);

    if (
      reward.reward_type === RewardType.POINT_OFFER &&
      resolved?.userType !== "Participant"
    ) {
      throw new BadRequestException(
        "Point-offer rewards require a recipient resolvable to a participant account",
      );
    }

    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : reward.expiry_datetime || null;

    await this.assertStockAvailable(reward, quantity);

    return this.persistIssuance({
      callerClientId,
      idempotencyKey,
      recipientEmail,
      dto,
      resolved,
      quantity,
      expiresAt,
      reward,
      businessRewardId: null,
      fulfilment: {
        rewardType: reward.reward_type,
        value: Number(reward.value) || 0,
        maxPoints: Number(reward.max_points) || 0,
        title: reward.title,
        description: reward.description,
        reward,
      },
      businessMeta: {
        mcomUserId: dto.business?.mcomUserId ?? null,
        email: dto.business?.email ?? null,
      },
      entitlement,
    });
  }

  /**
   * Issue a reward that a business owns (`BusinessReward`). The owning business
   * is derived from the business reward and its entitlement is checked; the
   * business reward's own stock is consumed.
   */
  async issueBusinessReward(
    callerClientId: string,
    businessRewardId: string,
    dto: IssueBusinessRewardDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    this.assertCanIssueTo(caller, dto.recipient);

    const businessReward = await this.businessRewardRepository.findOne({
      where: { id: businessRewardId },
      relations: ["business", "reward"],
    });
    if (!businessReward) {
      throw new NotFoundException(
        `Business reward ${businessRewardId} not found`,
      );
    }
    if (!businessReward.business) {
      throw new BadRequestException("Business reward has no owning business");
    }
    if (businessReward.disabled) {
      throw new BadRequestException("Reward is disabled and cannot be issued");
    }
    if (businessReward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException(
        `Reward is not active (status: ${businessReward.status})`,
      );
    }

    const idempotencyKey =
      dto.idempotencyKey || `partner-${callerClientId}-${nanoid(24)}`;

    const existing = await this.findIdempotent(callerClientId, idempotencyKey);
    if (existing) {
      return this.toDto(existing);
    }

    const entitlement = await this.partnerEntitlement.assertBusinessEntitled({
      mcomUserId: businessReward.business.mcomUserId,
      email: businessReward.business.email,
    });

    const { recipientEmail, resolved, quantity } =
      await this.resolveRecipient(dto);

    if (
      businessReward.reward_type === RewardType.POINT_OFFER &&
      resolved?.userType !== "Participant"
    ) {
      throw new BadRequestException(
        "Point-offer rewards require a recipient resolvable to a participant account",
      );
    }

    await this.reserveBusinessRewardStock(businessReward, quantity);

    const catalogueReward = businessReward.reward ?? null;
    const value =
      Number(catalogueReward?.value) > 0
        ? Number(catalogueReward!.value)
        : Number(businessReward.mall_reward_value) || 0;

    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : businessReward.expiry_datetime ||
        catalogueReward?.expiry_datetime ||
        null;

    return this.persistIssuance({
      callerClientId,
      idempotencyKey,
      recipientEmail,
      dto,
      resolved,
      quantity,
      expiresAt,
      reward: catalogueReward,
      businessRewardId: businessReward.id,
      businessRewardSnapshot: {
        id: businessReward.id,
        title: businessReward.title,
        description: businessReward.description,
        image: businessReward.image,
      },
      fulfilment: {
        rewardType: businessReward.reward_type,
        value,
        maxPoints:
          Number(catalogueReward?.max_points) ||
          Number(businessReward.points_required) ||
          0,
        title: businessReward.title,
        description: businessReward.description,
        reward: catalogueReward,
      },
      businessMeta: {
        mcomUserId: businessReward.business.mcomUserId ?? null,
        email: businessReward.business.email ?? null,
      },
      entitlement,
      mallTargets: this.buildMallTargets(
        businessReward,
        businessReward.business.mcomUserId ?? null,
      ),
    });
  }

  /**
   * Platform-sponsored gift. An ecosystem **admin** grants an MCOM-admin
   * catalogue reward directly to an MCOM user, on the platform's behalf.
   *
   * Differences from {@link issue}:
   *  - No sponsoring `business` in the body, and no business entitlement check.
   *  - Only `MCOM_VAULT` (admin-created) catalogue rewards may be gifted.
   *  - The recipient MUST resolve to a local MCOM account, so gifted rewards
   *    (including point offers) land in a real account.
   *
   * Callers are authorised separately at the transport layer via the dedicated
   * `rewards:gift` scope.
   */
  async gift(
    callerClientId: string,
    rewardId: string,
    dto: GiftRewardDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    this.assertCanIssueTo(caller, dto.recipient);

    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });
    if (!reward) {
      throw new NotFoundException(`Reward ${rewardId} not found`);
    }
    if (reward.reward_source !== RewardSource.MCOM_VAULT) {
      throw new BadRequestException(
        "Only platform (MCOM) catalogue rewards can be gifted via this endpoint",
      );
    }
    if (reward.disabled) {
      throw new BadRequestException("Reward is disabled and cannot be issued");
    }
    if (reward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException(
        `Reward is not active (status: ${reward.status})`,
      );
    }

    const idempotencyKey =
      dto.idempotencyKey || `partner-${callerClientId}-${nanoid(24)}`;

    const existing = await this.findIdempotent(callerClientId, idempotencyKey);
    if (existing) {
      return this.toDto(existing);
    }

    const { recipientEmail, resolved, quantity } =
      await this.resolveRecipient(dto);

    if (resolved?.userType !== "Participant") {
      throw new BadRequestException(
        "Gifted rewards require the recipient to resolve to an MCOM participant account",
      );
    }

    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : reward.expiry_datetime || null;

    await this.assertStockAvailable(reward, quantity);

    return this.persistIssuance({
      callerClientId,
      idempotencyKey,
      recipientEmail,
      dto,
      resolved,
      quantity,
      expiresAt,
      reward,
      businessRewardId: null,
      fulfilment: {
        rewardType: reward.reward_type,
        value: Number(reward.value) || 0,
        maxPoints: Number(reward.max_points) || 0,
        title: reward.title,
        description: reward.description,
        reward,
      },
      businessMeta: {
        mcomUserId: dto.recipient.mcomUserId ?? null,
        email: null,
      },
      entitlement: null,
      sponsor: {
        type: "platform",
        app: callerClientId,
        role: "admin",
      },
    });
  }

  async findOne(
    callerClientId: string,
    id: string,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    return this.toDto(await this.getReadable(callerClientId, id, caller));
  }

  async list(
    callerClientId: string,
    query: ListIssuancesDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    return this.listIssuances(callerClientId, query, caller);
  }

  /**
   * Self-service listing for a delegated (user-bound) call. Requires the token
   * to carry a user identity and only ever returns that user's own issuances.
   */
  async listMine(
    callerClientId: string,
    caller: ServiceCallerContext,
    query: ListIssuancesDto,
  ): Promise<any> {
    if (!caller?.isDelegated || (!caller.userId && !caller.email)) {
      throw new ForbiddenException(
        "Forbidden: a delegated (user-bound) service token is required to list your own rewards",
      );
    }
    return this.listIssuances(callerClientId, query, caller);
  }

  /**
   * Resolve the Mall products/services a discount issuance targets. The
   * issuance only snapshots ids at issue time; names are looked up live in the
   * Mall catalogue so the participant can see what the discount applies to.
   */
  async getMallTargetDetailsForUser(
    user: { id: string; email?: string },
    id: string,
  ): Promise<any> {
    const issuance = await this.getOwnedByUser(user, id);
    const targets = issuance.metadata?.mallTargets;

    if (!targets) {
      throw new BadRequestException(
        "This reward has no mall discount targeting",
      );
    }

    const productIds: string[] = Array.isArray(targets.productIds)
      ? targets.productIds
      : [];
    const serviceIds: string[] = Array.isArray(targets.serviceIds)
      ? targets.serviceIds
      : [];

    const base = {
      scope: targets.scope ?? "ALL",
      discountType: targets.discountType ?? null,
      discountValue: targets.discountValue ?? null,
      maxDiscount: targets.maxDiscount ?? null,
      minSpend: targets.minSpend ?? null,
      productIds,
      serviceIds,
      business: null as Record<string, any> | null,
      products: [] as Record<string, any>[],
      services: [] as Record<string, any>[],
    };

    if (
      base.scope !== "SPECIFIC" ||
      (!productIds.length && !serviceIds.length) ||
      !targets.businessMcomUserId
    ) {
      return base;
    }

    try {
      const catalog = await this.mallIntegration.getBusiness({
        mcomUserId: targets.businessMcomUserId,
      });

      return {
        ...base,
        business: catalog.business ?? null,
        products: (catalog.products ?? []).filter((product) =>
          productIds.includes(product.id),
        ),
        services: (catalog.services ?? []).filter((service) =>
          serviceIds.includes(service.id),
        ),
      };
    } catch (err) {
      // The discount still applies at checkout even if the catalogue is
      // temporarily unavailable; return the ids so the UI can fall back.
      this.logger.warn(
        `Failed to resolve mall targets for issuance ${issuance.id}: ${(err as Error).message}`,
      );
      return base;
    }
  }

  /**
   * First-party listing for a logged-in MCOM Rewards participant: every reward
   * any ecosystem partner has issued to them, regardless of issuer.
   *
   * Revoked rewards are hidden — once a partner revokes an unused reward it
   * disappears from the participant's dashboard entirely.
   */
  async listForUser(
    user: { id: string; email?: string },
    query: ListIssuancesDto,
  ): Promise<any> {
    const { page = 1, limit = 20, externalRef, status } = query;

    const qb = this.issuanceRepository
      .createQueryBuilder("issuance")
      .leftJoinAndSelect("issuance.reward", "reward")
      .where("issuance.status != :revoked", {
        revoked: RewardIssuanceStatus.REVOKED,
      });

    if (externalRef) {
      qb.andWhere("issuance.external_ref = :externalRef", { externalRef });
    }
    if (status && status !== RewardIssuanceStatus.REVOKED) {
      qb.andWhere("issuance.status = :status", { status });
    }

    this.applyRecipientIdentity(
      qb,
      await this.recipientResolver.resolveIdentity({
        userId: user.id,
        email: user.email,
      }),
    );

    qb.orderBy("issuance.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((issuance) => this.toDto(issuance)),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Shared issuer-scoped listing. App-level callers may filter by recipient;
   * delegated callers are additionally restricted to their own identity.
   */
  private async listIssuances(
    callerClientId: string,
    query: ListIssuancesDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    const {
      page = 1,
      limit = 20,
      externalRef,
      status,
      recipientEmail,
      recipientMcomUserId,
      recipientUserId,
    } = query;

    // A permitted peer (app-level token) may list by recipient across issuers:
    // mall is usually not the issuer of campaign/business rewards. Delegated
    // (user-bound) tokens keep the strict issuer + identity scope.
    const isPeerRecipientQuery =
      !caller?.isDelegated &&
      Boolean(recipientEmail || recipientMcomUserId || recipientUserId);

    const qb = this.issuanceRepository
      .createQueryBuilder("issuance")
      .leftJoinAndSelect("issuance.reward", "reward");

    if (!isPeerRecipientQuery) {
      qb.where("issuance.issuer_client_id = :callerClientId", {
        callerClientId,
      });
    }

    if (externalRef) {
      qb.andWhere("issuance.external_ref = :externalRef", { externalRef });
    }
    if (status) {
      qb.andWhere("issuance.status = :status", { status });
    }

    // App-level (client_credentials) callers may query by recipient identity.
    if (!caller?.isDelegated) {
      if (recipientEmail) {
        qb.andWhere("LOWER(issuance.recipient_email) = :recipientEmail", {
          recipientEmail: recipientEmail.toLowerCase().trim(),
        });
      }
      if (recipientMcomUserId) {
        qb.andWhere("issuance.recipient_mcom_user_id = :recipientMcomUserId", {
          recipientMcomUserId,
        });
      }
      if (recipientUserId) {
        qb.andWhere("issuance.recipient_user_id = :recipientUserId", {
          recipientUserId,
        });
      }
    }

    // User-bound (delegated) callers may only ever see their own issuances, and
    // never revoked ones — from the recipient's perspective a revoked reward
    // disappears. App-level callers keep the full audit trail.
    if (caller?.isDelegated) {
      qb.andWhere("issuance.status != :revoked", {
        revoked: RewardIssuanceStatus.REVOKED,
      });
      this.applyRecipientIdentity(qb, {
        email: caller.email,
        userId: caller.userId,
        mcomUserId: caller.userId,
      });
    }

    qb.orderBy("issuance.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((issuance) => this.toDto(issuance)),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async redeem(
    callerClientId: string,
    id: string,
    dto: RedeemIssuanceDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    // A permitted peer (e.g. mall) may redeem an issuance it did not issue.
    // Peer legitimacy is enforced by ServiceAuthGuard's allowedCallers check.
    const issuance = await this.getReadable(callerClientId, id, caller);
    await this.applyRedemption(issuance, dto);

    await this.notifier.notify(
      issuance.issuer_client_id,
      PartnerRewardEvent.REDEEMED,
      this.toDto(issuance),
    );

    return this.toDto(issuance);
  }

  // ─── Reservation lifecycle (reserve → commit/release) ───────────────────────

  /**
   * Temporarily lock an issuance to a checkout attempt so it cannot be
   * double-spent. Idempotent on `(issuanceId, orderRef)`; runs under a row lock
   * (`SELECT … FOR UPDATE`) to prevent reserve races.
   */
  async reserve(
    callerClientId: string,
    id: string,
    dto: ReserveIssuanceDto,
  ): Promise<any> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RewardIssuance);
      const issuance = await repo.findOne({
        where: { id },
        relations: ["reward"],
        lock: { mode: "pessimistic_write" },
      });
      if (!issuance) {
        throw new NotFoundException(`Issuance ${id} not found`);
      }

      // Idempotent replay for the same order.
      if (
        issuance.status === RewardIssuanceStatus.RESERVED &&
        issuance.reservation_ref === dto.orderRef
      ) {
        return this.toDto(issuance);
      }

      if (issuance.status !== RewardIssuanceStatus.ISSUED) {
        throw new BadRequestException(
          `Cannot reserve an issuance in status ${issuance.status}`,
        );
      }

      if (issuance.expires_at && new Date(issuance.expires_at) < new Date()) {
        issuance.status = RewardIssuanceStatus.EXPIRED;
        await repo.save(issuance);
        throw new BadRequestException("Issuance has expired");
      }

      issuance.status = RewardIssuanceStatus.RESERVED;
      issuance.reserved_at = new Date();
      issuance.reservation_ref = dto.orderRef;
      issuance.metadata = {
        ...(issuance.metadata || {}),
        mallOrderRef: dto.orderRef,
        mallReservation: dto.metadata ?? null,
        reservedBy: callerClientId,
      };
      await repo.save(issuance);
      return this.toDto(issuance);
    });
  }

  /**
   * Finalise a reservation after successful payment (RESERVED → REDEEMED).
   * Idempotent; also accepts a commit straight from ISSUED (legacy mall builds).
   */
  async commit(
    callerClientId: string,
    id: string,
    dto: CommitIssuanceDto,
  ): Promise<any> {
    const result = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RewardIssuance);
      const issuance = await repo.findOne({
        where: { id },
        relations: ["reward"],
        lock: { mode: "pessimistic_write" },
      });
      if (!issuance) {
        throw new NotFoundException(`Issuance ${id} not found`);
      }

      // Idempotent: an already-redeemed issuance is a no-op.
      if (issuance.status === RewardIssuanceStatus.REDEEMED) {
        return { alreadyCommitted: true, dto: this.toDto(issuance) };
      }
      if (
        issuance.status !== RewardIssuanceStatus.RESERVED &&
        issuance.status !== RewardIssuanceStatus.ISSUED
      ) {
        throw new BadRequestException(
          `Cannot commit an issuance in status ${issuance.status}`,
        );
      }

      // An issuance that expired while reserved must not be committed.
      if (issuance.expires_at && new Date(issuance.expires_at) < new Date()) {
        issuance.status = RewardIssuanceStatus.EXPIRED;
        await repo.save(issuance);
        throw new BadRequestException("Issuance has expired");
      }

      issuance.status = RewardIssuanceStatus.REDEEMED;
      issuance.redeemed_at = new Date();
      issuance.committed_at = new Date();
      issuance.metadata = {
        ...(issuance.metadata || {}),
        mallOrderRef: dto.orderRef ?? issuance.reservation_ref ?? null,
        commitNote: dto.note ?? null,
      };
      await repo.save(issuance);
      return { alreadyCommitted: false, dto: this.toDto(issuance) };
    });

    if (!result.alreadyCommitted) {
      // Emit `reward.redeemed` to the caller (mall updates its mirror).
      await this.notifier.notify(
        callerClientId,
        PartnerRewardEvent.REDEEMED,
        result.dto,
      );
    }

    return result.dto;
  }

  /**
   * Undo a reservation when payment fails / the checkout is abandoned
   * (RESERVED → ISSUED). Idempotent; never releases a REDEEMED issuance.
   */
  async release(
    callerClientId: string,
    id: string,
    dto: ReleaseIssuanceDto,
  ): Promise<any> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RewardIssuance);
      const issuance = await repo.findOne({
        where: { id },
        relations: ["reward"],
        lock: { mode: "pessimistic_write" },
      });
      if (!issuance) {
        throw new NotFoundException(`Issuance ${id} not found`);
      }

      // Idempotent: releasing an un-reserved issuance is a no-op.
      if (issuance.status === RewardIssuanceStatus.ISSUED) {
        return this.toDto(issuance);
      }
      if (issuance.status !== RewardIssuanceStatus.RESERVED) {
        throw new BadRequestException(
          `Cannot release an issuance in status ${issuance.status}`,
        );
      }

      issuance.status = RewardIssuanceStatus.ISSUED;
      issuance.reserved_at = null;
      issuance.reservation_ref = null;
      issuance.metadata = {
        ...(issuance.metadata || {}),
        releaseReason: dto.reason ?? null,
        releasedBy: callerClientId,
      };
      await repo.save(issuance);
      return this.toDto(issuance);
    });
  }

  /**
   * Backstop sweeper: release reservations older than `olderThanMs`. Mall
   * already releases stale reservations at 30 min; this catches missed
   * releases. Returns the number released.
   */
  async releaseStaleReservations(olderThanMs = 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs);
    const stale = await this.issuanceRepository.find({
      where: {
        status: RewardIssuanceStatus.RESERVED,
        reserved_at: LessThan(cutoff),
      },
      take: 200,
    });

    for (const issuance of stale) {
      issuance.status = RewardIssuanceStatus.ISSUED;
      issuance.reserved_at = null;
      issuance.reservation_ref = null;
      issuance.metadata = {
        ...(issuance.metadata || {}),
        releaseReason: "stale_reservation_sweep",
      };
      await this.issuanceRepository.save(issuance);
    }

    return stale.length;
  }

  /**
   * First-party claim: a logged-in MCOM Rewards participant redeems a reward a
   * partner issued to them — without FundOrDonate in the request path. The
   * issuer is still notified afterwards over the mesh.
   */
  async claimForUser(
    user: { id: string; email?: string },
    id: string,
    dto: RedeemIssuanceDto,
  ): Promise<any> {
    const issuance = await this.getOwnedByUser(user, id);
    await this.applyRedemption(issuance, dto);

    await this.notifier.notify(
      issuance.issuer_client_id,
      PartnerRewardEvent.REDEEMED,
      this.toDto(issuance),
    );

    return this.toDto(issuance);
  }

  /** Shared issue→redeemed transition, used by both redeem entry points. */
  private async applyRedemption(
    issuance: RewardIssuance,
    dto: RedeemIssuanceDto,
  ): Promise<void> {
    if (issuance.status !== RewardIssuanceStatus.ISSUED) {
      throw new BadRequestException(
        `Cannot redeem an issuance in status ${issuance.status}`,
      );
    }

    if (issuance.expires_at && new Date(issuance.expires_at) < new Date()) {
      issuance.status = RewardIssuanceStatus.EXPIRED;
      await this.issuanceRepository.save(issuance);
      throw new BadRequestException("Issuance has expired");
    }

    if (dto.code && issuance.code && dto.code !== issuance.code) {
      throw new BadRequestException("Invalid redemption code");
    }

    issuance.status = RewardIssuanceStatus.REDEEMED;
    issuance.redeemed_at = new Date();
    if (dto.note) {
      issuance.metadata = {
        ...(issuance.metadata || {}),
        redeemNote: dto.note,
      };
    }
    await this.issuanceRepository.save(issuance);
  }

  async revoke(
    callerClientId: string,
    id: string,
    dto: RevokeIssuanceDto,
    caller?: ServiceCallerContext,
  ): Promise<any> {
    const issuance = await this.getOwned(callerClientId, id, caller);

    // Idempotent: revoking an already-revoked issuance is a no-op.
    if (issuance.status === RewardIssuanceStatus.REVOKED) {
      return this.toDto(issuance);
    }

    // A reward can only be revoked while the recipient has NOT used it. Once it
    // is redeemed (code consumed / benefit taken) it is no longer revocable.
    if (issuance.status === RewardIssuanceStatus.REDEEMED) {
      throw new BadRequestException(
        "Cannot revoke a reward the recipient has already used",
      );
    }
    if (issuance.status !== RewardIssuanceStatus.ISSUED) {
      throw new BadRequestException(
        `Cannot revoke an issuance in status ${issuance.status}`,
      );
    }

    // Point rewards are credited to the participant at issue time, so the
    // benefit has effectively already been delivered — they are not revocable.
    if (issuance.reward_type === RewardType.POINT_OFFER) {
      throw new BadRequestException(
        "Cannot revoke a point reward: points have already been credited",
      );
    }

    issuance.status = RewardIssuanceStatus.REVOKED;
    issuance.revoked_at = new Date();
    issuance.metadata = {
      ...(issuance.metadata || {}),
      revokeReason: dto.reason || null,
      revokedBy: caller?.callerAppId ?? callerClientId,
    };
    await this.issuanceRepository.save(issuance);

    // A revoked business-gift frees its unit back to the business reward.
    await this.releaseBusinessRewardStock(issuance);

    await this.notifier.notify(
      issuance.issuer_client_id,
      PartnerRewardEvent.REVOKED,
      this.toDto(issuance),
    );

    return this.toDto(issuance);
  }

  /** Cron sweep: expire due issuances and notify the partner. */
  async expireDue(limit = 100): Promise<number> {
    const due = await this.issuanceRepository
      .createQueryBuilder("issuance")
      .where("issuance.status = :status", {
        status: RewardIssuanceStatus.ISSUED,
      })
      .andWhere("issuance.expires_at IS NOT NULL")
      .andWhere("issuance.expires_at <= :now", { now: new Date() })
      .take(limit)
      .getMany();

    for (const issuance of due) {
      issuance.status = RewardIssuanceStatus.EXPIRED;
      await this.issuanceRepository.save(issuance);

      // An expired business gift frees its unit back to the business reward.
      await this.releaseBusinessRewardStock(issuance);

      await this.notifier.notify(
        issuance.issuer_client_id,
        PartnerRewardEvent.EXPIRED,
        this.toDto(issuance),
      );
    }

    return due.length;
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  /** Persist, fulfil and announce a fully-validated issuance. */
  private async persistIssuance(params: PersistIssuanceParams): Promise<any> {
    const {
      callerClientId,
      dto,
      resolved,
      quantity,
      expiresAt,
      reward,
      businessRewardId,
      businessRewardSnapshot,
      fulfilment,
      businessMeta,
      entitlement,
      sponsor,
      mallTargets,
    } = params;

    const issuance = this.issuanceRepository.create({
      reward,
      business_reward_id: businessRewardId,
      issuer_client_id: callerClientId,
      external_ref: dto.externalRef || null,
      idempotency_key: params.idempotencyKey,
      recipient_email: params.recipientEmail,
      recipient_mcom_user_id: dto.recipient.mcomUserId || null,
      recipient_user_id: resolved?.userId || null,
      recipient_user_type: resolved?.userType || null,
      recipient_name: dto.recipient.name || resolved?.name || null,
      recipient_resolved: Boolean(resolved),
      status: RewardIssuanceStatus.ISSUED,
      reward_type: fulfilment.rewardType,
      value: fulfilment.value,
      quantity,
      expires_at: expiresAt,
      metadata: {
        ...(dto.metadata || {}),
        business: businessMeta,
        ...(entitlement ? { entitlement } : {}),
        ...(sponsor ? { sponsor } : {}),
        ...(mallTargets ? { mallTargets } : {}),
        ...(businessRewardSnapshot
          ? { businessReward: businessRewardSnapshot }
          : {}),
      },
    });

    const saved = await this.issuanceRepository.save(issuance);

    try {
      await this.fulfil(saved, fulfilment, resolved);
    } catch (err) {
      this.logger.error(
        `Fulfilment failed for issuance ${saved.id}: ${(err as Error).message}`,
      );
      saved.status = RewardIssuanceStatus.FAILED;
      saved.metadata = {
        ...(saved.metadata || {}),
        fulfilmentError: (err as Error).message,
      };
      await this.issuanceRepository.save(saved);
    }

    await this.notifier.notify(
      callerClientId,
      PartnerRewardEvent.ISSUED,
      this.toDto(saved),
    );

    return this.toDto(saved);
  }

  private async findIdempotent(
    callerClientId: string,
    idempotencyKey: string,
  ): Promise<RewardIssuance | null> {
    return this.issuanceRepository.findOne({
      where: {
        issuer_client_id: callerClientId,
        idempotency_key: idempotencyKey,
      },
      relations: ["reward"],
    });
  }

  private async resolveRecipient(
    dto: IssueRewardDto | IssueBusinessRewardDto,
  ): Promise<{
    recipientEmail: string;
    resolved: {
      userId: string;
      userType: string;
      email: string;
      name?: string;
    } | null;
    quantity: number;
  }> {
    const recipientEmail = dto.recipient.email.toLowerCase().trim();
    const resolved = await this.recipientResolver.resolve({
      email: recipientEmail,
      mcomUserId: dto.recipient.mcomUserId,
    });
    const quantity = Math.max(1, Math.trunc(Number(dto.quantity) || 1));
    return { recipientEmail, resolved, quantity };
  }

  /**
   * Match issuances to a recipient identity. Fail-closed: when no identity is
   * supplied the query matches nothing (`1 = 0`) rather than everything.
   */
  private applyRecipientIdentity(
    qb: SelectQueryBuilder<RewardIssuance>,
    identity: { email?: string; userId?: string; mcomUserId?: string },
  ): void {
    const email = identity.email?.toLowerCase().trim();
    const userId = identity.userId;
    const mcomUserId = identity.mcomUserId;

    qb.andWhere(
      new Brackets((sub) => {
        let hasClause = false;
        const add = (sql: string, params: Record<string, any>) => {
          if (hasClause) {
            sub.orWhere(sql, params);
          } else {
            sub.where(sql, params);
            hasClause = true;
          }
        };

        if (email) add("LOWER(issuance.recipient_email) = :email", { email });
        if (mcomUserId) {
          add("issuance.recipient_mcom_user_id = :mcomUserId", { mcomUserId });
        }
        if (userId) add("issuance.recipient_user_id = :userId", { userId });

        if (!hasClause) {
          sub.where("1 = 0");
        }
      }),
    );
  }

  private async getOwned(
    callerClientId: string,
    id: string,
    caller?: ServiceCallerContext,
  ): Promise<RewardIssuance> {
    const issuance = await this.issuanceRepository.findOne({
      where: { id, issuer_client_id: callerClientId },
      relations: ["reward"],
    });
    if (!issuance) {
      throw new NotFoundException(`Issuance ${id} not found`);
    }
    this.assertUserScope(issuance, caller);
    return issuance;
  }

  /**
   * Load an issuance a caller is allowed to act on. App-level
   * (client_credentials) peers — already gated by `allowedCallers` — may read
   * any issuance (mall is usually not the issuer). Delegated (user-bound) tokens
   * keep the strict issuer + end-user scope.
   */
  private async getReadable(
    callerClientId: string,
    id: string,
    caller?: ServiceCallerContext,
  ): Promise<RewardIssuance> {
    if (caller?.isDelegated) {
      return this.getOwned(callerClientId, id, caller);
    }

    const issuance = await this.issuanceRepository.findOne({
      where: { id },
      relations: ["reward"],
    });
    if (!issuance) {
      throw new NotFoundException(`Issuance ${id} not found`);
    }
    return issuance;
  }

  /**
   * Load an issuance for a first-party (logged-in) user, failing closed with a
   * 404 when it does not belong to them — never leaks another user's reward.
   */
  private async getOwnedByUser(
    user: { id: string; email?: string },
    id: string,
  ): Promise<RewardIssuance> {
    const issuance = await this.issuanceRepository.findOne({
      where: { id },
      relations: ["reward"],
    });

    // Match against every identifier the partner could have stored: the local
    // id, the central MCOM user id, and the email. A reward earned on a peer
    // (e.g. FundOrDonate) is usually stored against the central user id.
    const identity = await this.recipientResolver.resolveIdentity({
      userId: user.id,
      email: user.email,
    });
    const email = identity.email ?? user.email?.toLowerCase();
    const matches =
      !!issuance &&
      ((!!email && issuance.recipient_email?.toLowerCase() === email) ||
        (!!identity.userId && issuance.recipient_user_id === identity.userId) ||
        (!!identity.mcomUserId &&
          issuance.recipient_mcom_user_id === identity.mcomUserId) ||
        issuance.recipient_user_id === user.id ||
        issuance.recipient_mcom_user_id === user.id);

    if (!issuance || !matches) {
      throw new NotFoundException(`Issuance ${id} not found`);
    }
    return issuance;
  }

  /**
   * Enforce end-user isolation. A delegated (user-bound) token may only access
   * issuances belonging to that user. App-level (client_credentials) callers
   * are the trust boundary and may access any issuance they created.
   *
   * Fail-closed: mismatches return 404 (not 403) so we don't leak the existence
   * of another user's reward.
   */
  private assertUserScope(
    issuance: RewardIssuance,
    caller?: ServiceCallerContext,
  ): void {
    if (!caller?.isDelegated) {
      return;
    }

    const email = caller.email?.toLowerCase();
    const matches =
      (!!email && issuance.recipient_email?.toLowerCase() === email) ||
      (!!caller.userId &&
        (issuance.recipient_mcom_user_id === caller.userId ||
          issuance.recipient_user_id === caller.userId));

    if (!matches) {
      throw new NotFoundException(`Issuance ${issuance.id} not found`);
    }
  }

  /**
   * A delegated (user-bound) token may only ever issue a reward to its own
   * user. App-level (client_credentials) callers are trusted to choose any
   * recipient. Fail-closed when a delegated token carries no usable identity.
   */
  private assertCanIssueTo(
    caller: ServiceCallerContext | undefined,
    recipient: IssueRewardDto["recipient"],
  ): void {
    if (!caller?.isDelegated) {
      return;
    }

    const callerEmail = caller.email?.toLowerCase();
    const recipientEmail = recipient?.email?.toLowerCase();
    const matches =
      (!!callerEmail && recipientEmail === callerEmail) ||
      (!!caller.userId &&
        !!recipient?.mcomUserId &&
        recipient.mcomUserId === caller.userId);

    if (!matches) {
      throw new ForbiddenException(
        "Forbidden: a delegated token may only issue a reward to its own user",
      );
    }
  }

  /**
   * Enforce the catalogue reward's maximum unit cap.
   *
   * A reward with `quantity === 0` is unlimited (`0` is the admin console's
   * "Unlimited" sentinel). Otherwise `quantity` is a hard ceiling on the total
   * number of units that may EVER be issued for the reward: every issuance
   * counts regardless of status (issued, redeemed, revoked, expired, failed).
   * Revoking or expiring a unit does NOT return capacity.
   */
  private async assertStockAvailable(
    reward: Reward,
    amount: number,
  ): Promise<void> {
    const maxUnits = Number(reward.quantity) || 0;
    if (maxUnits <= 0) {
      return; // unlimited / untracked
    }

    const raw = await this.issuanceRepository
      .createQueryBuilder("issuance")
      .select("COALESCE(SUM(issuance.quantity), 0)", "consumed")
      .where("issuance.reward_id = :rewardId", { rewardId: reward.id })
      .getRawOne<{ consumed: string }>();

    const consumed = Number(raw?.consumed) || 0;
    if (consumed + amount > maxUnits) {
      throw new BadRequestException(
        `Reward is out of stock: maximum ${maxUnits} unit(s), ${consumed} already issued`,
      );
    }
  }

  /**
   * Consume stock from a business's owned reward. Uses the live
   * `remaining_quantity` counter atomically; falls back to a count of units
   * already issued for this business reward when only the configured `quantity`
   * is present. A null/0 counter with no configured quantity = unlimited.
   */
  private async reserveBusinessRewardStock(
    businessReward: BusinessReward,
    amount: number,
  ): Promise<void> {
    if (
      businessReward.remaining_quantity !== null &&
      businessReward.remaining_quantity !== undefined
    ) {
      const result = await this.businessRewardRepository
        .createQueryBuilder()
        .update(BusinessReward)
        .set({ remaining_quantity: () => "remaining_quantity - :amt" })
        .where("id = :id", { id: businessReward.id })
        .andWhere("remaining_quantity >= :amt")
        .setParameter("amt", amount)
        .execute();

      if (!result.affected) {
        throw new BadRequestException("Reward is out of stock");
      }
      return;
    }

    const maxUnits = Number(businessReward.quantity) || 0;
    if (maxUnits <= 0) {
      return; // unlimited / untracked
    }

    const raw = await this.issuanceRepository
      .createQueryBuilder("issuance")
      .select("COALESCE(SUM(issuance.quantity), 0)", "consumed")
      .where("issuance.business_reward_id = :businessRewardId", {
        businessRewardId: businessReward.id,
      })
      .andWhere("issuance.status NOT IN (:...freed)", {
        freed: [RewardIssuanceStatus.REVOKED, RewardIssuanceStatus.EXPIRED],
      })
      .getRawOne<{ consumed: string }>();

    const consumed = Number(raw?.consumed) || 0;
    if (consumed + amount > maxUnits) {
      throw new BadRequestException(
        `Reward is out of stock: maximum ${maxUnits} unit(s), ${consumed} already issued`,
      );
    }
  }

  /**
   * Return a unit to a business reward when an unused issuance is revoked or
   * expires. Only applies to quantity-tracked business rewards; catalogue
   * rewards keep their hard "total ever issued" cap.
   */
  private async releaseBusinessRewardStock(
    issuance: RewardIssuance,
  ): Promise<void> {
    if (!issuance.business_reward_id) {
      return;
    }

    const amount = Math.max(1, Math.trunc(Number(issuance.quantity) || 1));

    try {
      const businessReward = await this.businessRewardRepository.findOne({
        where: { id: issuance.business_reward_id },
      });
      if (
        !businessReward ||
        businessReward.remaining_quantity === null ||
        businessReward.remaining_quantity === undefined
      ) {
        return;
      }

      await this.businessRewardRepository
        .createQueryBuilder()
        .update(BusinessReward)
        .set({ remaining_quantity: () => "remaining_quantity + :amt" })
        .where("id = :id", { id: businessReward.id })
        .setParameter("amt", amount)
        .execute();
    } catch (err) {
      // Never fail the revoke because restoring stock failed.
      this.logger.warn(
        `Failed to release business reward stock for issuance ${issuance.id}: ${(err as Error).message}`,
      );
    }
  }

  private async fulfil(
    issuance: RewardIssuance,
    ctx: FulfilmentContext,
    resolved: { userId: string; userType: string } | null,
  ): Promise<void> {
    switch (ctx.rewardType) {
      case RewardType.POINT_OFFER: {
        const points =
          Number(ctx.value) > 0
            ? Number(ctx.value)
            : Number(ctx.maxPoints) || 0;
        const result = await this.pointsGateway.awardPoints({
          participantId: resolved!.userId,
          points,
          actionKey: `partner-issuance-${issuance.id}`,
          description: `Partner reward: ${ctx.title}`,
          reward: ctx.reward,
        });
        issuance.points_awarded = result.points;
        await this.issuanceRepository.save(issuance);
        return;
      }

      case RewardType.VOUCHER:
      case RewardType.GIFT_CARD:
      case RewardType.COUPON: {
        issuance.code = `${CODE_PREFIX}-${nanoid(10).toUpperCase()}`;

        try {
          // Pass the rewards-generated code so both apps show one code; store
          // the mall instrument id as the mall reference (handbook §13).
          const mallPayload = {
            amount: Number(ctx.value) || 0,
            recipientEmail: issuance.recipient_email,
            recipientName: issuance.recipient_name,
            message: ctx.description,
            businessName: "MCOM Rewards",
            code: issuance.code,
            expiresAt: issuance.expires_at
              ? new Date(issuance.expires_at).toISOString()
              : undefined,
          };
          let mallResponse: MallInstrument;
          if (ctx.rewardType === RewardType.GIFT_CARD) {
            mallResponse =
              await this.mallIntegration.createGiftCard(mallPayload);
          } else if (ctx.rewardType === RewardType.COUPON) {
            mallResponse = await this.mallIntegration.createCoupon(mallPayload);
          } else {
            mallResponse =
              await this.mallIntegration.createVoucher(mallPayload);
          }
          // Keep the shared code the mall actually persisted (idempotent on it).
          if (mallResponse?.code) {
            issuance.code = mallResponse.code;
          }
          issuance.mall_reference =
            mallResponse?.id ?? this.extractMallReference(mallResponse);
        } catch (err) {
          this.logger.warn(
            `Mall delivery skipped for issuance ${issuance.id}: ${(err as Error).message}`,
          );
        }

        await this.issuanceRepository.save(issuance);
        return;
      }

      case RewardType.PHYSICAL_PRODUCT:
      default: {
        // Physical rewards are fulfilled operationally — record + notify only.
        issuance.metadata = {
          ...(issuance.metadata || {}),
          fulfilment: {
            status: "PENDING",
            ...(issuance.metadata?.fulfilment || {}),
          },
        };
        await this.issuanceRepository.save(issuance);
        return;
      }
    }
  }

  private extractMallReference(response: any): string | null {
    if (!response) return null;
    if (typeof response === "string") return response;
    const candidate =
      response.id ?? response.code ?? response.reference ?? response.data?.id;
    return candidate ? String(candidate) : null;
  }

  /**
   * Build the `metadata.mallTargets` block from a business reward's targeting
   * columns. Returns null unless the reward carries a valid discount config —
   * mall evaluates (and re-validates) this server-side.
   */
  private buildMallTargets(
    businessReward: BusinessReward,
    businessMcomUserId: string | null,
  ): Record<string, any> | null {
    const discountType = businessReward.mall_discount_type;
    const discountValue = Number(businessReward.mall_discount_value) || 0;

    if (
      !discountType ||
      (discountType !== "percentage" && discountType !== "fixed") ||
      discountValue <= 0
    ) {
      return null;
    }

    const targets: Record<string, any> = {
      scope: businessReward.mall_target_scope ?? "ALL",
      discountType,
      discountValue,
    };

    if (businessMcomUserId) {
      targets.businessMcomUserId = businessMcomUserId;
    }
    if (businessReward.mall_target_product_ids?.length) {
      targets.productIds = businessReward.mall_target_product_ids;
    }
    if (businessReward.mall_target_service_ids?.length) {
      targets.serviceIds = businessReward.mall_target_service_ids;
    }
    if (businessReward.mall_max_discount !== null && businessReward.mall_max_discount !== undefined) {
      targets.maxDiscount = Number(businessReward.mall_max_discount);
    }
    if (businessReward.mall_min_spend !== null && businessReward.mall_min_spend !== undefined) {
      targets.minSpend = Number(businessReward.mall_min_spend);
    }

    return targets;
  }

  private toDto(issuance: RewardIssuance): Record<string, any> {
    return {
      id: issuance.id,
      rewardId: issuance.reward?.id ?? null,
      businessRewardId: issuance.business_reward_id ?? null,
      rewardTitle:
        issuance.reward?.title ??
        issuance.metadata?.businessReward?.title ??
        null,
      issuerClientId: issuance.issuer_client_id,
      externalRef: issuance.external_ref,
      idempotencyKey: issuance.idempotency_key,
      recipient: {
        email: issuance.recipient_email,
        mcomUserId: issuance.recipient_mcom_user_id,
        userId: issuance.recipient_user_id,
        userType: issuance.recipient_user_type,
        name: issuance.recipient_name,
        resolved: issuance.recipient_resolved,
      },
      code: issuance.code,
      status: issuance.status,
      rewardType: issuance.reward_type,
      value: Number(issuance.value),
      pointsAwarded: issuance.points_awarded,
      mallReference: issuance.mall_reference,
      quantity: issuance.quantity,
      expiresAt: issuance.expires_at,
      redeemedAt: issuance.redeemed_at,
      revokedAt: issuance.revoked_at,
      reservationRef: issuance.reservation_ref ?? null,
      reservedAt: issuance.reserved_at ?? null,
      committedAt: issuance.committed_at ?? null,
      metadata: issuance.metadata,
      createdAt: issuance.created_at,
      updatedAt: issuance.updated_at,
    };
  }
}
