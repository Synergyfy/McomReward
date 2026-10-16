import { Injectable, Logger, Optional } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { BusinessWallet } from "./entities/business-wallet.entity";
import {
  WalletTransaction,
  TransactionType,
} from "./entities/wallet-transaction.entity";
import {
  PlanSubscription,
  PlanSubscriptionStatus,
} from "../plans/entities/plan-subscription.entity";
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
    private readonly dataSource: DataSource,
    @Optional()
    private readonly centralWallet?: McomWalletPartnerService,
  ) {}

  private monthKey(date = new Date()): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  private monthlyBudgetFor(subscription: PlanSubscription): number {
    return (
      subscription.planVariant?.configuration?.quotas?.monthlyRewardBudget ||
      (subscription.planVariant?.tierLevel as any)?.configuration?.quotas
        ?.monthlyRewardBudget ||
      0
    );
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
          const monthlyBudget = this.monthlyBudgetFor(subscription);
          const idempotencyKey = `rewards-monthly-${month}-${businessId}`.slice(0, 255);

          // Central path: reconcile to target via credit/debit (idempotent per month).
          if (this.centralWallet?.isConfigured() && (subscription.business as any)?.mcomUserId) {
            try {
              const centralUserId = (subscription.business as any).mcomUserId as string;
              const bal = await this.centralWallet.getBalance(centralUserId);
              const delta = Number(monthlyBudget) - Number(bal.balance ?? 0);
              if (delta > 0) {
                await this.centralWallet.credit(centralUserId, delta, {
                  category: "ADMIN_CREDIT",
                  description: `Monthly Reset ${month}: Set to ${monthlyBudget}`,
                  reference: `monthly-reset-${month}`,
                  metadata: { businessId },
                  idempotencyKey,
                });
              } else if (delta < 0) {
                await this.centralWallet.debit(centralUserId, Math.abs(delta), {
                  category: "SERVICE_FEE",
                  description: `Monthly Reset ${month}: Set to ${monthlyBudget}`,
                  reference: `monthly-reset-${month}`,
                  metadata: { businessId },
                  idempotencyKey,
                });
              }
              count++;
            } catch (e: any) {
              this.logger.error(`Central monthly reset failed for ${businessId}: ${e?.message}`);
              skipped++;
            }
            continue;
          }

          // Local fallback path (central disabled or business not yet mapped).
          const wallet = await queryRunner.manager.findOne(BusinessWallet, {
            where: { business: { id: businessId } },
          });
          if (!wallet) {
            skipped++;
            continue;
          }
          const marker = `Monthly Reset ${month}: Set to ${monthlyBudget}`;
          // Idempotency: skip if this month's reset marker already recorded for wallet.
          const dup = await queryRunner.manager
            .createQueryBuilder(WalletTransaction, "t")
            .where("t.reference = :marker", { marker })
            .andWhere("t.walletId = :walletId", { walletId: wallet.id })
            .getOne();
          if (dup) {
            skipped++;
            continue;
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
          count++;
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

    this.logger.log(
      `Completed monthly reset (${month}) for ${count} wallets, skipped ${skipped}.`,
    );
  }
}
