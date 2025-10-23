import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Staff, CreateStaffDto, UpdateStaffDto } from './types';

const STAFF_QUERY_KEY = 'staff';

// Create Staff
const createStaff = async (staffData: CreateStaffDto): Promise<Staff> => {
  const { data } = await api.post<Staff>('/staff', staffData);
  return data;
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    },
  });
};

// Get All Staff
const getAllStaff = async (): Promise<Staff[]> => {
  const { data } = await api.get<Staff[]>('/staff');
  return data;
};

export const useGetAllStaff = () => {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY],
    queryFn: getAllStaff,
  });
};

// Get Staff by ID
const getStaffById = async (id: string): Promise<Staff> => {
  const { data } = await api.get<Staff>(`/staff/${id}`);
  return data;
};

export const useGetStaffById = (id: string) => {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY, id],
    queryFn: () => getStaffById(id),
    enabled: !!id,
  });
};

// Update Staff
const updateStaff = async ({ id, ...updateData }: { id: string } & UpdateStaffDto): Promise<Staff> => {
  const { data } = await api.patch<Staff>(`/staff/${id}`, updateData);
  return data;
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStaff,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
      queryClient.setQueryData([STAFF_QUERY_KEY, data.id], data);
    },
  });
};

// Delete Staff
const deleteStaff = async (id: string): Promise<void> => {
  await api.delete(`/staff/${id}`);
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    },
  });
};
