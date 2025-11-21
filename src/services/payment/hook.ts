import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api';
import { Tier, SubscribeDto, SubscriptionResponse } from './types';

const PAYMENT_QUERY_KEY = 'payment';

const getTiers = async (): Promise<Tier[]> => {
    const { data } = await api.get<Tier[]>('/tier');
    return data;
};

export const useGetTiers = () => {
    return useQuery({
        queryKey: [PAYMENT_QUERY_KEY, 'tiers'],
        queryFn: getTiers,
    });
};

const subscribe = async (payload: SubscribeDto): Promise<SubscriptionResponse> => {
    const { data } = await api.post<SubscriptionResponse>('/payment/subscribe', payload);
    return data;
};

export const useSubscribe = () => {
    return useMutation({
        mutationFn: subscribe,
    });
};
