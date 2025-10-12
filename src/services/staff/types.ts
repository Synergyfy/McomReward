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
  avatar?: string;
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
}
