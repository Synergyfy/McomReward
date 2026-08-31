import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { MyReferral } from './types';

const getMyReferrals = async (): Promise<MyReferral[]> => {
  const { data } = await api.get<MyReferral[]>('/referrals/my-referrals');
  return data;
};

export const useGetMyReferrals = () => {
  return useQuery({
    queryKey: ['myReferrals'],
    queryFn: getMyReferrals,
  });
};