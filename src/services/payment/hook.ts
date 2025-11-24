import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api';
import {
    Tier,
    StripeInitiateRequest,
    StripeInitiateResponse,
    StripeVerifyRequest,
    StripeVerifyResponse,
    PayPalInitiateRequest,
    PayPalInitiateResponse,
    PayPalVerifyRequest,
    PayPalVerifyResponse
} from './types';

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

// Stripe Payment Hooks
const initiateStripePayment = async (payload: StripeInitiateRequest): Promise<StripeInitiateResponse> => {
    const { data } = await api.post<StripeInitiateResponse>('/payment/stripe/initiate', payload);
    return data;
};

export const useStripeInitiate = () => {
    return useMutation({
        mutationFn: initiateStripePayment,
    });
};

const verifyStripePayment = async (payload: StripeVerifyRequest): Promise<StripeVerifyResponse> => {
    const { data } = await api.post<StripeVerifyResponse>('/payment/stripe/verify', payload);
    return data;
};

export const useStripeVerify = () => {
    return useMutation({
        mutationFn: verifyStripePayment,
    });
};

// PayPal Payment Hooks
const initiatePayPalPayment = async (payload: PayPalInitiateRequest): Promise<PayPalInitiateResponse> => {
    const { data } = await api.post<PayPalInitiateResponse>('/payment/paypal/initiate', payload);
    return data;
};

export const usePayPalInitiate = () => {
    return useMutation({
        mutationFn: initiatePayPalPayment,
    });
};

const verifyPayPalPayment = async (payload: PayPalVerifyRequest): Promise<PayPalVerifyResponse> => {
    const { data } = await api.post<PayPalVerifyResponse>('/payment/paypal/verify', payload);
    return data;
};

export const usePayPalVerify = () => {
    return useMutation({
        mutationFn: verifyPayPalPayment,
    });
};
