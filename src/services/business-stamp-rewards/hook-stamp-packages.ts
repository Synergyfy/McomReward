import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { StampPackageBalanceResponse } from './types-stamp-packages';

const QUERY_KEYS = {
    stampPackagesBalance: 'stamp-packages-balance',
};

/**
 * Get the business's total stamp balance from packages
 */
const getStampPackagesBalance = async (): Promise<StampPackageBalanceResponse> => {
    const { data } = await api.get('/stamp-packages/balance');
    return data;
};

/**
 * Hook to get business's total stamp balance
 */
export const useGetStampPackagesBalance = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.stampPackagesBalance],
        queryFn: getStampPackagesBalance,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
