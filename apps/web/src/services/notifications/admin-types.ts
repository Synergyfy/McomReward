export type TemplateType = 'email' | 'push' | 'in-app';
export type TemplateStatus = 'draft' | 'active' | 'archived';
export type AnnouncementStatus = 'draft' | 'active' | 'scheduled' | 'expired';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string;
  body: string;
  targetAudience: string;
  status: TemplateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  startDate: Date;
  endDate: Date;
  status: AnnouncementStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationTemplateDto {
  name: string;
  type: TemplateType;
  subject: string;
  body: string;
  targetAudience: string;
  status?: TemplateStatus;
}

export type UpdateNotificationTemplateDto = Partial<CreateNotificationTemplateDto>;

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  targetAudience: string;
  startDate?: string;
  endDate?: string;
  status?: AnnouncementStatus;
}

export type UpdateAnnouncementDto = Partial<CreateAnnouncementDto>;

export interface NotificationAdminListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAdminTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: TemplateType;
  status?: TemplateStatus;
}

export interface GetAdminAnnouncementsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AnnouncementStatus;
}