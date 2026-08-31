import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  NotificationTemplate,
  Announcement,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  NotificationAdminListResponse,
  GetAdminTemplatesParams,
  GetAdminAnnouncementsParams,
} from './admin-types';

const ADMIN_TEMPLATES_QUERY_KEY = 'adminNotificationTemplates';
const ADMIN_ANNOUNCEMENTS_QUERY_KEY = 'adminAnnouncements';

const mapTemplate = (item: any): NotificationTemplate => ({
  id: item.id,
  name: item.name,
  type: item.type,
  subject: item.subject,
  body: item.body,
  targetAudience: item.target_audience ?? item.targetAudience ?? '',
  status: item.status,
  createdAt: new Date(item.created_at ?? item.createdAt ?? new Date()),
  updatedAt: new Date(item.updated_at ?? item.updatedAt ?? new Date()),
});

const mapAnnouncement = (item: any): Announcement => ({
  id: item.id,
  title: item.title,
  content: item.content,
  targetAudience: item.target_audience ?? item.targetAudience ?? '',
  startDate: new Date(item.start_date ?? item.startDate ?? new Date()),
  endDate: new Date(item.end_date ?? item.endDate ?? new Date()),
  status: item.status,
  createdAt: new Date(item.created_at ?? item.createdAt ?? new Date()),
  updatedAt: new Date(item.updated_at ?? item.updatedAt ?? new Date()),
});

// --- Notification Templates ---

export const useGetAdminNotificationTemplates = (params: GetAdminTemplatesParams) => {
  return useQuery({
    queryKey: [ADMIN_TEMPLATES_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<NotificationAdminListResponse<NotificationTemplate>>('/admin/notification-templates', { params });
      return { ...data, data: (data.data ?? []).map(mapTemplate) };
    },
  });
};

export const useCreateAdminNotificationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateNotificationTemplateDto) => {
      const { data } = await api.post<NotificationTemplate>('/admin/notification-templates', payload);
      return mapTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_TEMPLATES_QUERY_KEY] });
    },
  });
};

export const useUpdateAdminNotificationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateNotificationTemplateDto & { id: string }) => {
      const { data } = await api.patch<NotificationTemplate>(`/admin/notification-templates/${id}`, payload);
      return mapTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_TEMPLATES_QUERY_KEY] });
    },
  });
};

export const useDeleteAdminNotificationTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/notification-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_TEMPLATES_QUERY_KEY] });
    },
  });
};

// --- Announcements ---

export const useGetAdminAnnouncements = (params: GetAdminAnnouncementsParams) => {
  return useQuery({
    queryKey: [ADMIN_ANNOUNCEMENTS_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<NotificationAdminListResponse<Announcement>>('/admin/announcements', { params });
      return { ...data, data: (data.data ?? []).map(mapAnnouncement) };
    },
  });
};

export const useCreateAdminAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAnnouncementDto) => {
      const { data } = await api.post<Announcement>('/admin/announcements', payload);
      return mapAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ANNOUNCEMENTS_QUERY_KEY] });
    },
  });
};

export const useUpdateAdminAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateAnnouncementDto & { id: string }) => {
      const { data } = await api.patch<Announcement>(`/admin/announcements/${id}`, payload);
      return mapAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ANNOUNCEMENTS_QUERY_KEY] });
    },
  });
};

export const useDeleteAdminAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ANNOUNCEMENTS_QUERY_KEY] });
    },
  });
};