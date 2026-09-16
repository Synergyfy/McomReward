import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationTemplate } from "../entities/notification-template.entity";
import { Announcement } from "../entities/announcement.entity";
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  FilterNotificationTemplateDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  FilterAnnouncementDto,
} from "../dto/notification-admin.dto";

@Injectable()
export class NotificationAdminService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  // --- Notification Templates ---

  async createTemplate(createDto: CreateNotificationTemplateDto) {
    const template = this.templateRepository.create({
      name: createDto.name,
      type: createDto.type,
      subject: createDto.subject,
      body: createDto.body,
      target_audience: createDto.targetAudience,
      status: createDto.status,
    });
    return this.templateRepository.save(template);
  }

  async findTemplates(filterDto: FilterNotificationTemplateDto) {
    const { page = 1, limit = 10, search, type, status } = filterDto;
    const queryBuilder = this.templateRepository.createQueryBuilder("template");

    if (search) {
      queryBuilder.andWhere(
        "(template.name ILIKE :search OR template.subject ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (type) {
      queryBuilder.andWhere("template.type = :type", { type });
    }
    if (status) {
      queryBuilder.andWhere("template.status = :status", { status });
    }

    queryBuilder.orderBy("template.created_at", "DESC");

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

  async findTemplate(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(
        `Notification template with ID ${id} not found`,
      );
    }
    return template;
  }

  async updateTemplate(id: string, updateDto: UpdateNotificationTemplateDto) {
    const template = await this.findTemplate(id);
    Object.assign(template, {
      name: updateDto.name,
      type: updateDto.type,
      subject: updateDto.subject,
      body: updateDto.body,
      target_audience: updateDto.targetAudience,
      status: updateDto.status,
    });
    return this.templateRepository.save(template);
  }

  async removeTemplate(id: string) {
    const template = await this.findTemplate(id);
    await this.templateRepository.remove(template);
  }

  // --- Announcements ---

  async createAnnouncement(createDto: CreateAnnouncementDto) {
    const announcement = this.announcementRepository.create({
      title: createDto.title,
      content: createDto.content,
      target_audience: createDto.targetAudience,
      start_date: createDto.startDate ? new Date(createDto.startDate) : null,
      end_date: createDto.endDate ? new Date(createDto.endDate) : null,
      status: createDto.status,
    });
    return this.announcementRepository.save(announcement);
  }

  async findAnnouncements(filterDto: FilterAnnouncementDto) {
    const { page = 1, limit = 10, search, status } = filterDto;
    const queryBuilder = this.announcementRepository.createQueryBuilder(
      "announcement",
    );

    if (search) {
      queryBuilder.andWhere(
        "(announcement.title ILIKE :search OR announcement.content ILIKE :search)",
        { search: `%${search}%` },
      );
    }
    if (status) {
      queryBuilder.andWhere("announcement.status = :status", { status });
    }

    queryBuilder.orderBy("announcement.created_at", "DESC");

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

  async findAnnouncement(id: string) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async updateAnnouncement(id: string, updateDto: UpdateAnnouncementDto) {
    const announcement = await this.findAnnouncement(id);
    Object.assign(announcement, {
      title: updateDto.title,
      content: updateDto.content,
      target_audience: updateDto.targetAudience,
      start_date: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
      end_date: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
      status: updateDto.status,
    });
    return this.announcementRepository.save(announcement);
  }

  async removeAnnouncement(id: string) {
    const announcement = await this.findAnnouncement(id);
    await this.announcementRepository.remove(announcement);
  }
}