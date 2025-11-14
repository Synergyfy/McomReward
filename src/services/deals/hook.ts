import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CreateDealDto } from './types';

const DEALS_QUERY_KEY = 'deals';

const createDeal = async (dealData: CreateDealDto): Promise<string> => {
  const { data } = await api.post<string>('/deals', dealData);
  return data;
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALS_QUERY_KEY] });
    },
  });
};
