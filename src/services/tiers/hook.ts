import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { TierResponse, Subscription, BillingHistory } from './types';

const TIERS_QUERY_KEY = 'tiers';
const SUBSCRIPTION_QUERY_KEY = 'subscription';
const BILLING_HISTORY_QUERY_KEY = 'billingHistory';

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

// Get My Subscription
const getMySubscription = async (): Promise<Subscription> => {
    const { data } = await api.get<Subscription>('/membership/my-membership');
    return data;
};

export const useGetMySubscription = () => {
    return useQuery({
        queryKey: [SUBSCRIPTION_QUERY_KEY],
        queryFn: getMySubscription,
    });
};

// Get Billing History
const getBillingHistory = async (): Promise<BillingHistory[]> => {
    const { data } = await api.get<BillingHistory[]>('/membership/my-payment-history');
    return data;
};

export const useGetBillingHistory = () => {
    return useQuery({
        queryKey: [BILLING_HISTORY_QUERY_KEY],
        queryFn: getBillingHistory,
    });
};
