import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Escrow, EscrowStatus } from "./entities/escrow.entity";
import { PayoutRequest, PayoutStatus } from "./entities/payout-request.entity";
import {
  PaymentHistory,
  PaymentStatus,
  PurchaseType,
} from "../payment-history/entities/payment-history.entity";
import {
  CreateEscrowDto,
  CreatePayoutRequestDto,
  FilterEscrowDto,
  FilterPayoutRequestDto,
} from "./dto/financial.dto";

@Injectable()
export class FinancialAdminService {
  constructor(
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRepository: Repository<PayoutRequest>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
  ) {}

  // --- Escrows ---

  async createEscrow(createDto: CreateEscrowDto) {
    const escrow = this.escrowRepository.create({
      ...createDto,
      status: EscrowStatus.HELD,
    });
    return this.escrowRepository.save(escrow);
  }

  async findEscrows(filterDto: FilterEscrowDto) {
    const { page = 1, limit = 10 } = filterDto;
    const [data, total] = await this.escrowRepository.findAndCount({
      order: { created_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateEscrowStatus(id: string, status: EscrowStatus) {
    const escrow = await this.escrowRepository.findOne({ where: { id } });
    if (!escrow) {
      throw new NotFoundException(`Escrow with ID ${id} not found`);
    }
    escrow.status = status;
    escrow.releasedAt = new Date();
    return this.escrowRepository.save(escrow);
  }

  // --- Payout Requests ---

  async createPayoutRequest(createDto: CreatePayoutRequestDto) {
    const payout = this.payoutRepository.create({
      ...createDto,
      status: PayoutStatus.PENDING,
    });
    return this.payoutRepository.save(payout);
  }

  async findPayoutRequests(filterDto: FilterPayoutRequestDto) {
    const { page = 1, limit = 10 } = filterDto;
    const [data, total] = await this.payoutRepository.findAndCount({
      order: { created_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async updatePayoutStatus(id: string, status: PayoutStatus) {
    const payout = await this.payoutRepository.findOne({ where: { id } });
    if (!payout) {
      throw new NotFoundException(`Payout request with ID ${id} not found`);
    }
    payout.status = status;
    payout.processedAt = new Date();
    return this.payoutRepository.save(payout);
  }

  // --- Analytics ---

  async getAnalytics() {
    const payments = await this.paymentHistoryRepository.find({
      where: { status: PaymentStatus.SUCCEEDED },
    });

    const revenueOverTime = this.buildMonthlyRevenue(payments);

    const totalSubscriptions = payments
      .filter((p) => p.purchaseType === PurchaseType.MEMBERSHIP)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const payouts = await this.payoutRepository.find();
    const totalPayouts = payouts.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );

    return {
      revenueOverTime,
      payoutsVsSubscriptions: [
        { name: "Total Payouts", value: totalPayouts },
        { name: "Total Subscriptions", value: totalSubscriptions },
      ],
    };
  }

  private buildMonthlyRevenue(payments: PaymentHistory[]) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const byMonth: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      byMonth[`${d.getFullYear()}-${d.getMonth()}`] = 0;
    }
    payments.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in byMonth) {
        byMonth[key] += Number(p.amount || 0);
      }
    });
    return Object.keys(byMonth)
      .sort()
      .map((key) => {
        const [year, monthIdx] = key.split("-").map(Number);
        return {
          month: monthNames[monthIdx],
          revenue: Math.round(byMonth[key]),
        };
      });
  }
}
