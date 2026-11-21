import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Optional,
  HttpException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { BusinessWallet } from "./entities/business-wallet.entity";
import {
  WalletTransaction,
  TransactionType,
} from "./entities/wallet-transaction.entity";
import { Business } from "../business/entities/business.entity";
import {
  CentralHold,
  CentralReceipt,
  CentralTransaction,
  McomWalletPartnerService,
} from "./mcom-wallet-partner.service";

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(BusinessWallet)
    private walletRepository: Repository<BusinessWallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private dataSource: DataSource,
    @Optional() private readonly centralWallet?: McomWalletPartnerService,
  ) {}

  async createWallet(business: Business): Promise<BusinessWallet> {
    const wallet = this.walletRepository.create({
      business,
      tier_balance: 0,
      topup_balance: 0,
    });
    return this.walletRepository.save(wallet);
  }

  async getWallet(businessId: string): Promise<BusinessWallet> {
    const wallet = await this.walletRepository.findOne({
      where: { business: { id: businessId } },
      relations: ["transactions", "business"],
    });

    let result: BusinessWallet;
    if (!wallet) {
      // Lazy creation for existing businesses
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });
      if (!business) {
        throw new NotFoundException("Business not found");
      }
      result = await this.createWallet(business);
    } else {
      result = wallet;
    }

    // Enrich with central source-of-truth balance (best-effort, cached upstream).
    // Local balances are only a mirror — never present them as the central
    // balance when central is configured but unavailable.
    const centralConfigured = this.centralWallet?.isConfigured() ?? false;
    (result as any).centralConfigured = centralConfigured;

    if (centralConfigured) {
      (result as any).topUpUrl = this.centralWallet!.topUpUrl();
      try {
        const business =
          (result.business as Business | undefined) ??
          (await this.businessRepository.findOne({ where: { id: businessId } }));

        if (!business?.mcomUserId) {
          (result as any).centralLinked = false;
          (result as any).centralError =
            "This business is not linked to an MCOM account. Sign in with MCOM SSO to link it.";
        } else {
          (result as any).centralLinked = true;
          const central = await this.centralWallet!.getBalance(
            business.mcomUserId,
          );
          (result as any).centralBalance = central.balance;
          (result as any).centralAvailableBalance = central.availableBalance;
          (result as any).centralStatus = central.status;
          (result as any).centralCurrency = central.currency ?? "MCOM";
        }
      } catch (e: any) {
        (result as any).centralError =
          e?.message || "Unable to load the MCOM Central wallet balance.";
        this.logger.warn(
          `Central balance enrichment failed for business ${businessId}: ${e?.message}`,
        );
      }
    }

    return result;
  }

  private async resolveCentralUserId(businessId: string): Promise<string> {
    if (!this.centralWallet?.isConfigured()) {
      throw new HttpException(
        {
          error: "MCOM_WALLET_DISABLED",
          message: "MCOM Wallet is not configured for this platform.",
        },
        503,
      );
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business?.mcomUserId) {
      throw new BadRequestException({
        code: "ACCOUNT_NOT_LINKED",
        message:
          "This business is not linked to an MCOM account. Sign in with MCOM SSO to link it.",
      });
    }
    return business.mcomUserId;
  }

  /**
   * Transactions originated by this platform for the linked MCOM user
   * (guide A5). Central is the source of truth; the local mirror is only a
   * fallback for legacy wallets that predate SSO linking.
   */
  async getCentralTransactions(
    businessId: string,
  ): Promise<CentralTransaction[]> {
    if (this.centralWallet?.isConfigured()) {
      try {
        const mcomUserId = await this.resolveCentralUserId(businessId);
        return await this.centralWallet.getTransactions(mcomUserId);
      } catch (error: any) {
        if (error?.status === 400 || error?.status === 403) throw error;
        this.logger.warn(
          `Central transactions unavailable for business ${businessId}: ${error?.message}`,
        );
      }
    }

    const wallet = await this.getWallet(businessId);
    return (wallet.transactions || []).map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      reference: transaction.reference,
      description: transaction.reference,
      processedAt: transaction.created_at?.toISOString?.(),
    }));
  }

  async placeHold(
    businessId: string,
    amount: number,
    opts: {
      description?: string;
      reference?: string;
      metadata?: Record<string, unknown>;
      idempotencyKey?: string;
    } = {},
  ): Promise<CentralHold> {
    const mcomUserId = await this.resolveCentralUserId(businessId);
    return this.centralWallet!.placeHold(mcomUserId, amount, opts);
  }

  async captureHold(
    businessId: string,
    holdId: string,
    opts: { idempotencyKey?: string } = {},
  ): Promise<CentralReceipt> {
    await this.resolveCentralUserId(businessId);
    return this.centralWallet!.captureHold(holdId, opts);
  }

  async releaseHold(
    businessId: string,
    holdId: string,
    opts: { idempotencyKey?: string } = {},
  ): Promise<CentralHold> {
    await this.resolveCentralUserId(businessId);
    return this.centralWallet!.releaseHold(holdId, opts);
  }

  async addTierAllocation(businessId: string, amount: number) {
    const wallet = await this.getWallet(businessId);

    // Using a transaction to ensure integrity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reset logic or Accumulate? Prompt implies "set amount allocated", usually resets monthly.
      // But let's assume accumulate for now or simple add.
      // User said "admin is setting amount... allocated... so they can spend".
      // Usually tier allowances reset. I will just ADD for now, assuming the caller handles the "Reset" logic if needed.

      wallet.tier_balance = Number(wallet.tier_balance) + Number(amount);
      await queryRunner.manager.save(wallet);

      const transaction = this.transactionRepository.create({
        wallet,
        amount,
        type: TransactionType.TIER_ALLOCATION,
        reference: `Monthly Allocation`,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return wallet;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async topUpWallet(
    businessId: string,
    amount: number,
    paymentReference: string,
  ) {
    const wallet = await this.getWallet(businessId);

    wallet.topup_balance = Number(wallet.topup_balance) + Number(amount);
    await this.walletRepository.save(wallet);

    const transaction = this.transactionRepository.create({
      wallet,
      amount,
      type: TransactionType.TOPUP,
      reference: paymentReference,
    });
    return this.transactionRepository.save(transaction);
  }

  private centralIdempotencyKey(
    businessId: string,
    reference: string,
    provided?: string,
  ): string {
    if (provided) return provided.slice(0, 255);
    const slug = `${businessId}-${reference}`.replace(/[^A-Za-z0-9-_]/g, "-").slice(0, 200);
    return `rewards-spend-${slug}-${Date.now()}`;
  }

  /**
   * Deducts funds for a reward. Prioritizes Tier Balance, then Topup Balance.
   * Central MCOM Wallet is the source of truth when configured; local ledger
   * is debited as a mirror only after central debit succeeds.
   */
  async spend(
    businessId: string,
    amount: number,
    reference: string,
    opts?: { idempotencyKey?: string; category?: string },
  ): Promise<boolean> {
    // Central-first path (no behavior change when disabled/unmapped).
    if (this.centralWallet?.isConfigured()) {
      try {
        const business = await this.businessRepository.findOne({
          where: { id: businessId },
        });
        const centralUserId = business?.mcomUserId;
        if (centralUserId) {
          const receipt = await this.centralWallet.debit(
            centralUserId,
            Number(amount),
            {
              category: opts?.category ?? "PURCHASE",
              description: reference,
              reference,
              metadata: { businessId },
              idempotencyKey: this.centralIdempotencyKey(
                businessId,
                reference,
                opts?.idempotencyKey,
              ),
            },
          );
          await this.mirrorCentralDebit(businessId, amount, reference, receipt.transactionId);
          return true;
        }
      } catch (e: any) {
        // A typed central-wallet failure (insufficient funds, frozen wallet,
        // limits) is authoritative: surface it and do NOT silently spend from
        // the local mirror. Only transport/unmapped-account errors fall back.
        if (e?.name === "McomWalletError") {
          this.centralWallet!.toHttpException(e);
        }
        this.logger.warn(
          `Central debit failed, falling back to local ledger: ${e?.message}`,
        );
      }
    }

    const wallet = await this.getWallet(businessId);
    const cost = Number(amount);

    if (Number(wallet.tier_balance) + Number(wallet.topup_balance) < cost) {
      throw new BadRequestException(
        "Insufficient funds to create this reward.",
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let remainingCost = cost;
      let tierDeduction = 0;
      let topupDeduction = 0;

      // 1. Try Tier Balance
      if (Number(wallet.tier_balance) > 0) {
        const tierAvailable = Number(wallet.tier_balance);
        if (tierAvailable >= remainingCost) {
          tierDeduction = remainingCost;
          wallet.tier_balance = tierAvailable - remainingCost;
          remainingCost = 0;
        } else {
          tierDeduction = tierAvailable;
          wallet.tier_balance = 0;
          remainingCost = remainingCost - tierAvailable;
        }
      }

      // 2. Try Topup Balance
      if (remainingCost > 0) {
        const topupAvailable = Number(wallet.topup_balance);
        // We already checked total funds, so this should be safe
        topupDeduction = remainingCost;
        wallet.topup_balance = topupAvailable - remainingCost;
      }

      await queryRunner.manager.save(wallet);

      // Record Transactions
      if (tierDeduction > 0) {
        const t1 = this.transactionRepository.create({
          wallet,
          amount: -tierDeduction,
          type: TransactionType.SPEND_TIER,
          reference,
        });
        await queryRunner.manager.save(t1);
      }

      if (topupDeduction > 0) {
        const t2 = this.transactionRepository.create({
          wallet,
          amount: -topupDeduction,
          type: TransactionType.SPEND_TOPUP,
          reference,
        });
        await queryRunner.manager.save(t2);
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mirror a successful central debit into the local ledger.
   * Best-effort and idempotent by central transaction id: if the mirror
   * already exists we skip, so central retries never double-count locally.
   */
  private async mirrorCentralDebit(
    businessId: string,
    amount: number,
    reference: string,
    centralTransactionId: string,
  ): Promise<void> {
    try {
      const wallet = await this.getWallet(businessId);
      const tag = `central:${centralTransactionId}`;
      const existing = await this.transactionRepository
        .createQueryBuilder("t")
        .where("t.reference LIKE :tag", { tag: `${tag}%` })
        .getOne();
      if (existing) return;
      let remaining = Number(amount);
      const topupAvail = Number(wallet.topup_balance);
      const topupTake = Math.min(topupAvail, remaining);
      wallet.topup_balance = topupAvail - topupTake;
      remaining -= topupTake;
      if (remaining > 0) {
        wallet.tier_balance = Number(wallet.tier_balance) - remaining;
      }
      await this.walletRepository.save(wallet);
      const mirror = this.transactionRepository.create({
        wallet,
        amount: -Number(amount),
        type: TransactionType.SPEND_TOPUP,
        reference: `${tag} ${reference}`.slice(0, 255),
      });
      await this.transactionRepository.save(mirror);
    } catch (e: any) {
      // Mirror failures must not fail the already-committed central debit.
      this.logger.error(`Central debit mirror failed for ${businessId}: ${e?.message}`);
    }
  }
}
