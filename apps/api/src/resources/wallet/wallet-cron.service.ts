import { Injectable, Logger, Optional } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, In, MoreThan, QueryRunner } from "typeorm";
import { BusinessWallet } from "./entities/business-wallet.entity";
import {
  WalletTransaction,
  TransactionType,
} from "./entities/wallet-transaction.entity";
import {
  PlanSubscription,
  PlanSubscriptionStatus,
} from "../plans/entities/plan-subscription.entity";
import {
  AccessPassSubscription,
  AccessPassSubscriptionStatus,
} from "../access-passes/entities/access-pass-subscription.entity";
import { McomWalletPartnerService } from "./mcom-wallet-partner.service";

const CHUNK_SIZE = 100;

@Injectable()
export class WalletCronService {
  private readonly logger = new Logger(WalletCronService.name);

  constructor(
    @InjectRepository(BusinessWallet)
    private readonly walletRepository: Repository<BusinessWallet>,
    @InjectRepository(PlanSubscription)
    private readonly planSubscriptionRepository: Repository<PlanSubscription>,
    @InjectRepository(AccessPassSubscription)
    private readonly accessPassRepository: Repository<AccessPassSubscription>,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly centralWallet?: McomWalletPartnerService,
  ) {}

  private monthKey(date = new Date()): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  private planBudgetFor(
    subscription: PlanSubscription | null,
  ): number | undefined {
    return (
      subscription?.planVariant?.configuration?.quotas?.monthlyRewardBudget ??
      (subscription?.planVariant?.tierLevel as any)?.configuration?.quotas
        ?.monthlyRewardBudget
    );
  }

  private passBudgetFor(
    accessPass: AccessPassSubscription | null,
  ): number | undefined {
    return accessPass?.configuration?.quotas?.monthlyRewardBudget;
  }

  private findActivePass(
    businessId: string,
  ): Promise<AccessPassSubscription | null> {
    return this.accessPassRepository.findOne({
      where: {
        businessId,
        status: AccessPassSubscriptionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
      order: { expiresAt: "DESC" },
    });
  }

  /**
   * Reset one business wallet to the monthly budget. Idempotent per month so
   * the plan and access-pass passes over the same business are safe.
   */
  private async resetBusinessWallet(
    queryRunner: QueryRunner,
    businessId: string,
    mcomUserId: string | null | undefined,
    monthlyBudget: number,
    month: string,
  ): Promise<"reset" | "skipped"> {
    const idempotencyKey = `rewards-monthly-${month}-${businessId}`.slice(
      0,
      255,
    );

    // Central path: reconcile to target via credit/debit (idempotent per month).
    if (this.centralWallet?.isConfigured() && mcomUserId) {
      try {
        const bal = await this.centralWallet.getBalance(mcomUserId);
        const delta = Number(monthlyBudget) - Number(bal.balance ?? 0);
        if (delta > 0) {
          await this.centralWallet.credit(mcomUserId, delta, {
            category: "ADMIN_CREDIT",
            description: `Monthly Reset ${month}: Set to ${monthlyBudget}`,
            reference: `monthly-reset-${month}`,
            metadata: { businessId },
            idempotencyKey,
          });
        } else if (delta < 0) {
          await this.centralWallet.debit(mcomUserId, Math.abs(delta), {
            category: "SERVICE_FEE",
            description: `Monthly Reset ${month}: Set to ${monthlyBudget}`,
            reference: `monthly-reset-${month}`,
            metadata: { businessId },
            idempotencyKey,
          });
        }
        return "reset";
      } catch (e: any) {
        this.logger.error(
          `Central monthly reset failed for ${businessId}: ${e?.message}`,
        );
        return "skipped";
      }
    }

    // Local fallback path (central disabled or business not yet mapped).
    const wallet = await queryRunner.manager.findOne(BusinessWallet, {
      where: { business: { id: businessId } },
    });
    if (!wallet) {
      return "skipped";
    }
    const marker = `Monthly Reset ${month}: Set to ${monthlyBudget}`;
    // Idempotency: skip if this month's reset marker already recorded for wallet.
    const dup = await queryRunner.manager
      .createQueryBuilder(WalletTransaction, "t")
      .where("t.reference = :marker", { marker })
      .andWhere("t.walletId = :walletId", { walletId: wallet.id })
      .getOne();
    if (dup) {
      return "skipped";
    }
    const oldBalance = Number(wallet.tier_balance);
    wallet.tier_balance = monthlyBudget;
    await queryRunner.manager.save(wallet);

    const transaction = queryRunner.manager.create(WalletTransaction, {
      wallet,
      amount: monthlyBudget - oldBalance,
      type: TransactionType.TIER_ALLOCATION,
      reference: marker,
    });
    await queryRunner.manager.save(transaction);
    return "reset";
  }

  // Run at midnight on the 1st of every month
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyAllowances() {
    const month = this.monthKey();
    this.logger.log(`Starting monthly wallet allowance reset (${month})...`);

    let count = 0;
    let skipped = 0;
    let skip = 0;

    // Chunked pagination: never holds all subscriptions + never holds N connections.
    for (;;) {
      const chunk = await this.planSubscriptionRepository.find({
        where: { status: PlanSubscriptionStatus.ACTIVE },
        relations: ["business", "planVariant", "planVariant.tierLevel"],
        take: CHUNK_SIZE,
        skip,
      });
      if (chunk.length === 0) break;
      skip += chunk.length;

      // One transaction per chunk for local mirror rows (not per row).
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        for (const subscription of chunk) {
          if (!subscription.business) {
            skipped++;
            continue;
          }
          const businessId = subscription.business.id;
          const planBudget = this.planBudgetFor(subscription);
          // An access pass fills in the budget when the plan does not define one.
          const accessPass =
            planBudget === undefined
              ? await this.findActivePass(businessId)
              : null;
          const monthlyBudget =
            planBudget ?? this.passBudgetFor(accessPass) ?? 0;

          const outcome = await this.resetBusinessWallet(
            queryRunner,
            businessId,
            (subscription.business as any)?.mcomUserId,
            monthlyBudget,
            month,
          );
          if (outcome === "reset") count++;
          else skipped++;
        }
        await queryRunner.commitTransaction();
      } catch (e) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Monthly reset chunk failed (skip=${skip})`, e as any);
      } finally {
        await queryRunner.release();
      }

      if (chunk.length < CHUNK_SIZE) break;
    }

    // Access passes are standalone entitlements: businesses with no active plan
    // subscription still receive the monthly budget configured on their pass.
    let passSkip = 0;
    for (;;) {
      const chunk = await this.accessPassRepository.find({
        where: {
          status: AccessPassSubscriptionStatus.ACTIVE,
          expiresAt: MoreThan(new Date()),
        },
        relations: ["business"],
        order: { expiresAt: "DESC" },
        take: CHUNK_SIZE,
        skip: passSkip,
      });
      if (chunk.length === 0) break;
      passSkip += chunk.length;

      const businessIds = [
        ...new Set(chunk.map((pass) => pass.businessId).filter(Boolean)),
      ];
      const planCovered = new Set(
        (
          await this.planSubscriptionRepository.find({
            where: {
              business: { id: In(businessIds) },
              status: PlanSubscriptionStatus.ACTIVE,
            },
            relations: ["business"],
          })
        )
          .map((subscription) => subscription.business?.id)
          .filter(Boolean) as string[],
      );

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const seen = new Set<string>();
        for (const pass of chunk) {
          if (
            !pass.business ||
            planCovered.has(pass.businessId) ||
            seen.has(pass.businessId)
          ) {
            skipped++;
            continue;
          }
          seen.add(pass.businessId);
          const monthlyBudget = this.passBudgetFor(pass) ?? 0;

          const outcome = await this.resetBusinessWallet(
            queryRunner,
            pass.businessId,
            (pass.business as any)?.mcomUserId,
            monthlyBudget,
            month,
          );
          if (outcome === "reset") count++;
          else skipped++;
        }
        await queryRunner.commitTransaction();
      } catch (e) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Monthly reset (access pass) chunk failed (skip=${passSkip})`,
          e as any,
        );
      } finally {
        await queryRunner.release();
      }

      if (chunk.length < CHUNK_SIZE) break;
    }

    this.logger.log(
      `Completed monthly reset (${month}) for ${count} wallets, skipped ${skipped}.`,
    );
  }
}
