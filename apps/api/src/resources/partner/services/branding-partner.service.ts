import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  BrandingPartner,
  BrandingPartnerStatus,
} from "../entities/branding-partner.entity";
import {
  CreateBrandingPartnerDto,
  UpdateBrandingPartnerDto,
  FilterBrandingPartnerDto,
} from "../dto/branding-partner.dto";

@Injectable()
export class BrandingPartnerService {
  constructor(
    @InjectRepository(BrandingPartner)
    private readonly partnerRepository: Repository<BrandingPartner>,
  ) {}

  async create(createDto: CreateBrandingPartnerDto) {
    const existing = await this.partnerRepository.findOne({
      where: { subdomain: createDto.subdomain },
    });
    if (existing) {
      throw new ConflictException("Subdomain already in use");
    }
    const partner = this.partnerRepository.create(
      this.mapDtoToEntity(createDto),
    );
    return this.partnerRepository.save(partner);
  }

  async findAll(filterDto: FilterBrandingPartnerDto) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
    } = filterDto;
    const queryBuilder = this.partnerRepository.createQueryBuilder("partner");

    if (search) {
      queryBuilder.andWhere(
        "(partner.name ILIKE :search OR partner.subdomain ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (type) {
      queryBuilder.andWhere("partner.type = :type", { type });
    }
    if (status) {
      queryBuilder.andWhere("partner.status = :status", { status });
    }

    queryBuilder.orderBy("partner.created_at", "DESC");

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
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }
    return partner;
  }

  async update(id: string, updateDto: UpdateBrandingPartnerDto) {
    const partner = await this.findOne(id);
    if (updateDto.subdomain && updateDto.subdomain !== partner.subdomain) {
      const existing = await this.partnerRepository.findOne({
        where: { subdomain: updateDto.subdomain },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException("Subdomain already in use");
      }
    }
    Object.assign(partner, this.mapDtoToEntity(updateDto));
    return this.partnerRepository.save(partner);
  }

  async updateStatus(id: string, status: BrandingPartnerStatus) {
    const partner = await this.findOne(id);
    partner.status = status;
    return this.partnerRepository.save(partner);
  }

  async remove(id: string) {
    const partner = await this.findOne(id);
    await this.partnerRepository.remove(partner);
  }

  private mapDtoToEntity(dto: CreateBrandingPartnerDto | UpdateBrandingPartnerDto): Partial<BrandingPartner> {
    return {
      name: dto.name,
      type: dto.type,
      status: dto.status,
      branding_logo: dto.brandingPermissions?.logo,
      branding_colors: dto.brandingPermissions?.colors,
      branding_text_lock: dto.brandingPermissions?.textLock,
      subdomain: dto.subdomain,
      domain_routing: dto.domainRouting,
      revenue_sharing: dto.revenueSharing,
      performance_total_users: dto.performanceMetrics?.totalUsers,
      performance_total_rewards_claimed:
        dto.performanceMetrics?.totalRewardsClaimed,
      performance_revenue_generated:
        dto.performanceMetrics?.revenueGenerated,
    };
  }
}