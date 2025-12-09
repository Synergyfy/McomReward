import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { TierResponse, Subscription, BillingHistory, BusinessSubscriptionResponse } from './types';

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
const getMySubscription = async (businessId?: string): Promise<Subscription> => {
    const { data } = await api.get<Subscription>('/membership/my-membership', { params: { businessId } });
    return data;
};

export const useGetMySubscription = (businessId?: string) => {
    return useQuery({
        queryKey: [SUBSCRIPTION_QUERY_KEY, businessId],
        queryFn: () => getMySubscription(businessId),
    });
};

// Get Billing History
const getBillingHistory = async (businessId?: string): Promise<BillingHistory[]> => {
    const { data } = await api.get<BillingHistory[]>('/membership/my-payment-history', { params: { businessId } });
    return data;
};

export const useGetBillingHistory = (businessId?: string) => {
    return useQuery({
        queryKey: [BILLING_HISTORY_QUERY_KEY, businessId],
        queryFn: () => getBillingHistory(businessId),
    });
};

// Get Business Subscription
const getBusinessSubscription = async (): Promise<BusinessSubscriptionResponse> => {
    const { data } = await api.get<BusinessSubscriptionResponse>('/business/subscription');
    return data;
};

export const useGetBusinessSubscription = () => {
    return useQuery({
        queryKey: ['businessSubscription'],
        queryFn: getBusinessSubscription,
    });
};
