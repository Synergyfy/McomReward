import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoyaltySetupTemplate } from "./entities/loyalty-setup-template.entity";
import {
  CreateLoyaltySetupTemplateDto,
  UpdateLoyaltySetupTemplateDto,
} from "./dto/loyalty-setup-template.dto";
import { BUILT_IN_TEMPLATES } from "./built-in-templates";

const normalize = (template: LoyaltySetupTemplate) => {
  const rewards = (template.rewards || []).map((r: Record<string, unknown>) => ({
    id: r.id || r.key,
    ...r,
  }));
  const campaigns = (template.campaigns || []).map(
    (c: Record<string, unknown>) => ({
      id: c.id || c.key,
      ...c,
    }),
  );
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    sectorKey: template.sectorKey,
    benefits: template.benefits || [],
    rewards,
    campaigns,
    isBuiltIn: template.isBuiltIn,
  };
};

@Injectable()
export class LoyaltySetupService {
  constructor(
    @InjectRepository(LoyaltySetupTemplate)
    private readonly templateRepository: Repository<LoyaltySetupTemplate>,
  ) {}

  async seedBuiltIns(): Promise<void> {
    const count = await this.templateRepository.count();
    if (count > 0) {
      return;
    }
    await this.templateRepository.save(
      BUILT_IN_TEMPLATES.map((t) =>
        this.templateRepository.create({ ...t, isBuiltIn: true }),
      ),
    );
  }

  async getTemplates() {
    await this.seedBuiltIns();
    const templates = await this.templateRepository.find({
      order: { created_at: "DESC" },
    });
    return templates.map(normalize);
  }

  async createTemplate(dto: CreateLoyaltySetupTemplateDto) {
    const template = this.templateRepository.create({
      ...dto,
      benefits: dto.benefits || [],
      campaigns: dto.campaigns || [],
      isBuiltIn: false,
    });
    const saved = await this.templateRepository.save(template);
    return normalize(saved);
  }

  async updateTemplate(id: string, dto: UpdateLoyaltySetupTemplateDto) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Reward template not found");
    }
    Object.assign(template, dto, {
      benefits: dto.benefits || template.benefits,
      campaigns: dto.campaigns || template.campaigns,
    });
    const saved = await this.templateRepository.save(template);
    return normalize(saved);
  }

  async deleteTemplate(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException("Reward template not found");
    }
    if (template.isBuiltIn) {
      throw new BadRequestException("Built-in templates cannot be deleted");
    }
    await this.templateRepository.softDelete(id);
    return { success: true };
  }
}