export interface Staff {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  avatar?: string;
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

export interface PaginatedStaffResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
}
