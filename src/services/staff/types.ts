export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  pin: string;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  pin?: string;
}
