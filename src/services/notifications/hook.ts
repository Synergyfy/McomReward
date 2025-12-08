import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { GetNotificationsParams, GetNotificationsResponse } from './types';

// Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: GetNotificationsParams) => [...notificationKeys.lists(), params] as const,
};

// API Functions
const getNotifications = async (params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> => {
  const { data } = await api.get('/notifications', { params });
  return data;
};

const markNotificationRead = async (id: string) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

const markAllNotificationsRead = async () => {
  const { data } = await api.patch('/notifications/read-all');
  return data;
};

// Hooks
export const useGetNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
