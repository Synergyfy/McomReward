'use client';

import { FormEvent, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TrialStripeFormProps {
    onSuccess: (paymentMethodId: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4",
            },
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a",
        },
    },
};

const TrialStripeForm = ({ onSuccess }: TrialStripeFormProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setErrorMessage("Card details not found.");
            return;
        }

        setIsLoading(true);
        setErrorMessage(undefined);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setErrorMessage(error.message);
                setIsLoading(false);
            } else if (paymentMethod) {
                onSuccess(paymentMethod.id);
                // Don't stop loading here as the parent will trigger the API call
            }
        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="p-4 border rounded-md bg-white">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                className="mt-6 w-full px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Processing...' : 'Start Free Trial'}
            </button>

            {errorMessage && <div className="mt-3 text-red-500 text-sm">{errorMessage}</div>}
            <p className="text-xs text-gray-500 mt-3 text-center">
                Your card will not be charged today. It will be used for verification and future billing.
            </p>
        </form>
    );
};

export default TrialStripeForm;
