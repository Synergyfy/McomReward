import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  PlaqueUserSummary,
  PlaqueUserPlaque,
  PlaqueActivity,
} from './types';

const PLAQUE_USER_QUERY_KEY = 'plaqueUser';

export const useGetPlaqueUserSummary = () => {
  return useQuery({
    queryKey: [PLAQUE_USER_QUERY_KEY, 'summary'],
    queryFn: async () => {
      const { data } = await api.get<PlaqueUserSummary>('/plaque-user/summary');
      return data;
    },
  });
};

export const useGetPlaqueUserPlaques = () => {
  return useQuery({
    queryKey: [PLAQUE_USER_QUERY_KEY, 'plaques'],
    queryFn: async () => {
      const { data } = await api.get<PlaqueUserPlaque[]>('/plaque-user/plaques');
      return data ?? [];
    },
  });
};

export const useGetPlaqueUserActivities = () => {
  return useQuery({
    queryKey: [PLAQUE_USER_QUERY_KEY, 'activities'],
    queryFn: async () => {
      const { data } = await api.get<PlaqueActivity[]>('/plaque-user/activities');
      return data ?? [];
    },
  });
};