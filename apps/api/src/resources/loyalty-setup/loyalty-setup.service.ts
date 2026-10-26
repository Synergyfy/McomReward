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

const DEFAULT_BUILT_IN_TIER_CONFIG = {
  enabled: false,
  tiers: [
    { name: "Bronze", requirementType: "points", requirementValue: 0, benefits: ["Earn 1x points", "Birthday reward"] },
    { name: "Silver", requirementType: "points", requirementValue: 500, benefits: ["Earn 1.5x points", "Early access to offers"] },
    { name: "Gold", requirementType: "points", requirementValue: 1500, benefits: ["Earn 2x points", "VIP offers", "Free delivery"] },
    { name: "Platinum", requirementType: "points", requirementValue: 5000, benefits: ["Earn 3x points", "Personal manager", "Exclusive events"] },
  ],
};

const normalize = (template: LoyaltySetupTemplate) => {
  const rewards = (template.rewards || []).map(
    (r: Record<string, unknown>) => ({
      id: r.id || r.key,
      ...r,
    }),
  );
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
    tierConfig: template.tierConfig || null,
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
        this.templateRepository.create({
          ...t,
          tierConfig: t.tierConfig || DEFAULT_BUILT_IN_TIER_CONFIG,
          isBuiltIn: true,
        }),
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

  async getAvailableTemplates() {
    // The admin page lists both built-in starter templates and templates
    // created by admins. Businesses should be offered that same managed set.
    return this.getTemplates();
  }

  async createTemplate(dto: CreateLoyaltySetupTemplateDto) {
    const template = this.templateRepository.create({
      ...dto,
      benefits: dto.benefits || [],
      campaigns: dto.campaigns || [],
      tierConfig: dto.tierConfig || null,
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
      tierConfig: dto.tierConfig ?? template.tierConfig,
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
