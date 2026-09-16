export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissionIds: string[];
}

export type UpdateRoleDto = Partial<CreateRoleDto>;

export interface CreatePermissionDto {
  name: string;
  description: string;
}

export type UpdatePermissionDto = Partial<CreatePermissionDto>;

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}