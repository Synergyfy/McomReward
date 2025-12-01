import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Staff, CreateStaffDto, UpdateStaffDto, PaginatedStaffResponse } from './types';
import { LoginResponse } from '@/services/auth/types';

const STAFF_QUERY_KEY = 'staff';

// Create Staff
const createStaff = async (staffData: CreateStaffDto, businessId?: string): Promise<Staff> => {
  const { data } = await api.post<Staff>('/staff', staffData, { params: { businessId } });
  return data;
};


interface StaffLoginDto {
    email: string;
    password: string;
};

// Staff login
const staffSignIn = async (loginData: StaffLoginDto): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', loginData);
  return data;
};



export const useStaffLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffSignIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    },
  });
};


export const useCreateStaff = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffData: CreateStaffDto) => createStaff(staffData, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY, 'all', businessId] });
    },
  });
};

// Get All Staff
const getAllStaff = async (businessId?: string): Promise<PaginatedStaffResponse> => {
  const { data } = await api.get<PaginatedStaffResponse>('/staff', { params: { businessId } });
  return data;
};

export const useGetAllStaff = (businessId?: string) => {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY, 'all', businessId],
    queryFn: () => getAllStaff(businessId),
    select: (data) => data.data,
  });
};

// Get Staff by ID
const getStaffById = async (id: string, businessId?: string): Promise<Staff> => {
  const { data } = await api.get<Staff>(`/staff/${id}`, { params: { businessId } });
  return data;
};

export const useGetStaffById = (id: string, businessId?: string) => {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY, id, businessId],
    queryFn: () => getStaffById(id, businessId),
    enabled: !!id,
  });
};

// Update Staff
const updateStaff = async ({ id, businessId, ...updateData }: { id: string, businessId?: string } & UpdateStaffDto): Promise<Staff> => {
  const { data } = await api.patch<Staff>(`/staff/${id}`, updateData, { params: { businessId } });
  return data;
};

export const useUpdateStaff = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }: UpdateStaffDto & { id: string }) => updateStaff({ id, businessId, ...updateData }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY, 'all', businessId] });
      queryClient.setQueryData([STAFF_QUERY_KEY, data.id, businessId], data);
    },
  });
};

// Delete Staff
const deleteStaff = async (id: string, businessId?: string): Promise<void> => {
  await api.delete(`/staff/${id}`, { params: { businessId } });
};

export const useDeleteStaff = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id, businessId), // Pass businessId to the mutation function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY, 'all', businessId] });
    },
  });
};
