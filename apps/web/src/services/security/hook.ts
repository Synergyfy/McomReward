import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  Permission,
  Role,
  AuditLog,
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  GetAuditLogsParams,
  PaginatedAuditLogsResponse,
} from './types';

const SECURITY_QUERY_KEY = 'adminSecurity';

const mapRole = (item: any): Role => ({
  id: item.id,
  name: item.name,
  description: item.description,
  permissions: (item.permissions ?? []).map((p: any) => p.id ?? p),
});

const mapAuditLog = (item: any): AuditLog => ({
  id: item.id,
  userId: item.user_id ?? item.userId,
  userName: item.user_name ?? item.userName,
  action: item.action,
  details: item.details,
  createdAt: item.created_at ?? item.createdAt ?? '',
});

// --- Permissions ---

export const useGetPermissions = () => {
  return useQuery({
    queryKey: [SECURITY_QUERY_KEY, 'permissions'],
    queryFn: async () => {
      const { data } = await api.get<Permission[]>('/admin/permissions');
      return data ?? [];
    },
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePermissionDto) => {
      const { data } = await api.post<Permission>('/admin/permissions', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECURITY_QUERY_KEY, 'permissions'] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePermissionDto & { id: string }) => {
      const { data } = await api.patch<Permission>(`/admin/permissions/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECURITY_QUERY_KEY, 'permissions'] });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/permissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECURITY_QUERY_KEY, 'permissions'] });
    },
  });
};

// --- Roles ---

export const useGetRoles = () => {
  return useQuery({
    queryKey: [SECURITY_QUERY_KEY, 'roles'],
    queryFn: async () => {
      const { data } = await api.get<Role[]>('/admin/roles');
      return (data ?? []).map(mapRole);
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoleDto) => {
      const { data } = await api.post<Role>('/admin/roles', payload);
      return mapRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECURITY_QUERY_KEY, 'roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRoleDto & { id: string }) => {
      const { data } = await api.patch<Role>(`/admin/roles/${id}`, payload);
      return mapRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECURITY_QUERY_KEY, 'roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECURITY_QUERY_KEY, 'roles'] });
    },
  });
};

// --- Audit Logs ---

export const useGetAuditLogs = (params: GetAuditLogsParams) => {
  return useQuery({
    queryKey: [SECURITY_QUERY_KEY, 'auditLogs', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedAuditLogsResponse>('/admin/audit-logs', { params });
      return { ...data, data: (data.data ?? []).map(mapAuditLog) };
    },
  });
};