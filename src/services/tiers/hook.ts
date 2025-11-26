import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { TierResponse } from './types';

const TIERS_QUERY_KEY = 'tiers';

// Get Tiers
const getTiers = async (): Promise<TierResponse[]> => {
    const { data } = await api.get<TierResponse[]>('/tier');
    return data;
};

export const useGetTiers = () => {
    return useQuery({
        queryKey: [TIERS_QUERY_KEY],
        queryFn: getTiers,
    });
};
