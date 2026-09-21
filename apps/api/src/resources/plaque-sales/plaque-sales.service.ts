import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  PlaqueSale,
  PayoutStatus,
  SaleStatus,
} from "./entities/plaque-sale.entity";
import {
  QrPlaque,
  QrPlaqueStatus,
} from "../qr-plaques/entities/qr-plaque.entity";
import {
  CreatePlaqueSaleDto,
  UpdatePayoutStatusDto,
  FilterPlaqueSaleDto,
} from "./dto/plaque-sale.dto";

@Injectable()
export class PlaqueSalesService {
  constructor(
    @InjectRepository(PlaqueSale)
    private readonly saleRepository: Repository<PlaqueSale>,
    @InjectRepository(QrPlaque)
    private readonly plaqueRepository: Repository<QrPlaque>,
  ) {}

  async create(createDto: CreatePlaqueSaleDto) {
    const plaque = await this.plaqueRepository.findOne({
      where: { id: createDto.plaqueId },
    });
    if (!plaque) {
      throw new NotFoundException(
        `Plaque with ID ${createDto.plaqueId} not found`,
      );
    }

    const commissionAmount =
      createDto.salePrice * (createDto.commissionPercentage / 100);

    const sale = this.saleRepository.create({
      plaqueId: createDto.plaqueId,
      plaqueName: plaque.name,
      sellerId: createDto.sellerId,
      sellerName: createDto.sellerName,
      buyerId: createDto.buyerId,
      buyerName: createDto.buyerName,
      salePrice: createDto.salePrice,
      commissionPercentage: createDto.commissionPercentage,
      commissionAmount,
      payoutStatus: PayoutStatus.PENDING,
      status: SaleStatus.COMPLETED,
    });

    const savedSale = await this.saleRepository.save(sale);

    // Transfer the plaque to the buyer
    plaque.assignedBusiness = { id: createDto.buyerId } as any;
    plaque.status = QrPlaqueStatus.ASSIGNED;
    await this.plaqueRepository.save(plaque);

    return savedSale;
  }

  async findAll(filterDto: FilterPlaqueSaleDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sellerId,
      buyerId,
      payoutStatus,
      status,
    } = filterDto;
    const queryBuilder = this.saleRepository.createQueryBuilder("sale");

    if (search) {
      queryBuilder.andWhere(
        "(sale.plaque_name ILIKE :search OR sale.seller_name ILIKE :search OR sale.buyer_name ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (sellerId) {
      queryBuilder.andWhere("sale.seller_id = :sellerId", { sellerId });
    }
    if (buyerId) {
      queryBuilder.andWhere("sale.buyer_id = :buyerId", { buyerId });
    }
    if (payoutStatus) {
      queryBuilder.andWhere("sale.payout_status = :payoutStatus", {
        payoutStatus,
      });
    }
    if (status) {
      queryBuilder.andWhere("sale.status = :status", { status });
    }

    queryBuilder.orderBy("sale.sale_date", "DESC");

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      next: page < totalPages ? Number(page) + 1 : null,
      previous: page > 1 ? Number(page) - 1 : null,
    };
  }

  async findOne(id: string) {
    const sale = await this.saleRepository.findOne({ where: { id } });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  async updatePayoutStatus(id: string, updateDto: UpdatePayoutStatusDto) {
    const sale = await this.findOne(id);
    sale.payoutStatus = updateDto.payoutStatus;
    return this.saleRepository.save(sale);
  }

  async getAnalytics() {
    const sales = await this.saleRepository.find({
      where: { status: SaleStatus.COMPLETED },
    });

    const totalCommissionEarned = sales.reduce(
      (sum, sale) => sum + Number(sale.commissionAmount || 0),
      0,
    );
    const pendingPayouts = sales
      .filter((sale) => sale.payoutStatus === PayoutStatus.PENDING)
      .reduce((sum, sale) => sum + Number(sale.commissionAmount || 0), 0);

    return {
      totalPlaquesSold: sales.length,
      totalCommissionEarned,
      pendingPayouts,
    };
  }
}
