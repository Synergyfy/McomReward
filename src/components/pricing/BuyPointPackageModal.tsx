'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PointPackage, PaymentProvider, PayPalVerifyResponse } from '@/services/payment/types';
import { useBuyPointPackage, useConfirmPointPackagePurchase } from '@/services/payment/hook';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/stripe-provider';
import StripePaymentForm from '@/components/stripe-payment-form';
import PayPalButton from '@/components/paypal-button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BuyPointPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointPackage: PointPackage | null;
  onPurchaseSuccess: () => void;
}

const BuyPointPackageModal: React.FC<BuyPointPackageModalProps> = ({
  isOpen,
  onClose,
  pointPackage,
  onPurchaseSuccess,
}) => {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(PaymentProvider.STRIPE);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payPalOrderId, setPayPalOrderId] = useState<string | null>(null);

  const { mutate: buyPackage, isPending: isInitiatingBuy } = useBuyPointPackage();
  const { mutate: confirmPurchase, isPending: isConfirmingPurchase } = useConfirmPointPackagePurchase();

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSelectedProvider(PaymentProvider.STRIPE);
      setClientSecret(null);
      setPayPalOrderId(null);
    }
  }, [isOpen]);

  const handleBuyPackage = () => {
    if (!pointPackage) return;

    buyPackage(
      { packageId: pointPackage.id, provider: selectedProvider },
      {
        onSuccess: (data) => {
          if (selectedProvider === PaymentProvider.STRIPE && data.clientSecret) {
            setClientSecret(data.clientSecret);
            toast.info('Stripe payment initiated. Please complete the payment details.');
          } else if (selectedProvider === PaymentProvider.PAYPAL && data.orderId) {
            setPayPalOrderId(data.orderId);
            toast.info('PayPal order created. Redirecting to PayPal or rendering button...');
          } else {
            toast.error('Failed to initiate payment. No client secret or order ID received.');
          }
        },
        onError: (error) => {
          console.error('Failed to initiate buy package:', error);
          toast.error('Failed to initiate payment. Please try again.');
        },
      }
    );
  };

  const handleStripePaymentSuccess = (transactionId: string) => {
    if (!pointPackage) return;

    confirmPurchase(
      { transaction_id: transactionId, provider: PaymentProvider.STRIPE },
      {
        onSuccess: () => {
          toast.success('Point package purchased successfully!');
          onPurchaseSuccess();
          onClose();
          router.refresh();
        },
        onError: (error) => {
          console.error('Failed to confirm Stripe purchase:', error);
          toast.error('Failed to confirm purchase. Please contact support.');
        },
      }
    );
  };

  const handlePayPalPaymentSuccess = (details: PayPalVerifyResponse, transactionId: string) => {
    if (!pointPackage) return;

    confirmPurchase(
      { transaction_id: transactionId, provider: PaymentProvider.PAYPAL },
      {
        onSuccess: () => {
          toast.success('Point package purchased successfully!');
          onPurchaseSuccess();
          onClose();
          router.refresh();
        },
        onError: (error) => {
          console.error('Failed to confirm PayPal purchase:', error);
          toast.error('Failed to confirm purchase. Please contact support.');
        },
      }
    );
  };

  const handlePayPalPaymentError = (error: Error) => {
    console.error('PayPal payment error:', error);
    toast.error('PayPal payment failed or was cancelled.');
    setPayPalOrderId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Purchase Points: {pointPackage?.name}</DialogTitle>
          <DialogDescription>
            {pointPackage ? `Get ${pointPackage.points} points for £${pointPackage.price}.` : 'Select a package to purchase.'}
          </DialogDescription>
        </DialogHeader>

        {!pointPackage ? (
          <p className="text-center text-gray-500">No package selected.</p>
        ) : (
          <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh] pr-2">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <RadioGroup
              value={selectedProvider}
              onValueChange={(value: PaymentProvider) => {
                setSelectedProvider(value);
                setClientSecret(null);
                setPayPalOrderId(null);
              }}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="stripe"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <RadioGroupItem id="stripe" value={PaymentProvider.STRIPE} className="sr-only" />
                <svg className="mb-3 h-8 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF" />
                </svg>
                <span className="text-sm font-medium">Stripe</span>
              </Label>
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <RadioGroupItem id="paypal" value={PaymentProvider.PAYPAL} className="sr-only" />
                <svg className="mb-3 h-8 w-auto" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.237 2.8H4.437c-.5 0-.93.36-1.01.86L.327 25.36c-.06.36.22.68.59.68h4.29c.5 0 .93-.36 1.01-.86l.93-5.89c.08-.5.51-.86 1.01-.86h2.33c4.85 0 7.65-2.35 8.38-7.01.33-2.04.01-3.64-.95-4.76-1.05-1.23-2.91-1.88-5.38-1.88zm.85 6.88c-.4 2.62-2.4 2.62-4.33 2.62h-1.1l.77-4.88c.05-.3.29-.52.6-.52h.51c1.32 0 2.57 0 3.21.75.39.45.49 1.12.34 2.03zM35.637 9.6h-4.32c-.31 0-.56.23-.6.52l-.15.98-.24-.35c-.75-1.09-2.42-1.45-4.09-1.45-3.82 0-7.09 2.9-7.73 6.97-.33 2.03.14 3.98 1.28 5.35 1.05 1.26 2.54 1.78 4.32 1.78 3.05 0 4.75-1.96 4.75-1.96l-.16.97c-.06.36.22.68.59.68h3.89c.5 0 .93-.36 1.01-.86l1.9-12.04c.06-.36-.22-.68-.59-.68zm-6.03 6.85c-.34 2-.96 3.34-2.96 3.34-.76 0-1.37-.24-1.76-.7-.39-.46-.54-1.11-.42-1.83.32-1.99 1.97-3.36 2.94-3.36.74 0 1.35.25 1.75.72.41.48.57 1.15.45 1.83z" fill="#139AD6" />
                  <path d="M55.337 9.6h-4.35c-.34 0-.66.17-.85.45l-4.89 7.2-2.07-6.92c-.13-.43-.52-.73-.98-.73h-4.27c-.41 0-.7.4-.57.79l3.9 11.45-3.67 5.17c-.28.39 0 .93.48.93h4.34c.34 0 .65-.16.84-.44l11.81-17.05c.27-.39-.01-.92-.49-.92z" fill="#263B80" />
                  <path d="M67.737 2.8h-7.8c-.5 0-.93.36-1.01.86l-3.1 19.7c-.06.36.22.68.59.68h4.55c.35 0 .65-.25.7-.6l.88-5.56c.08-.5.51-.86 1.01-.86h2.33c4.85 0 7.65-2.35 8.38-7.01.33-2.04.01-3.64-.95-4.76-1.05-1.23-2.91-1.88-5.38-1.88zm.85 6.88c-.4 2.62-2.4 2.62-4.33 2.62h-1.1l.77-4.88c.05-.3.29-.52.6-.52h.51c1.32 0 2.57 0 3.21.75.39.45.49 1.12.34 2.03zM91.137 9.6h-4.32c-.31 0-.56.23-.6.52l-.15.98-.24-.35c-.75-1.09-2.42-1.45-4.09-1.45-3.82 0-7.09 2.9-7.73 6.97-.33 2.03.14 3.98 1.28 5.35 1.05 1.26 2.54 1.78 4.32 1.78 3.05 0 4.75-1.96 4.75-1.96l-.16.97c-.06.36.22.68.59.68h3.89c.5 0 .93-.36 1.01-.86l1.9-12.04c.06-.36-.22-.68-.59-.68zm-6.03 6.85c-.34 2-.96 3.34-2.96 3.34-.76 0-1.37-.24-1.76-.7-.39-.46-.54-1.11-.42-1.83.32-1.99 1.97-3.36 2.94-3.36.74 0 1.35.25 1.75.72.41.48.57 1.15.45 1.83z" fill="#139AD6" />
                  <path d="M95.337 3.15l-3.14 20c-.06.36.22.68.59.68h3.77c.5 0 .93-.36 1.01-.86l3.1-19.7c.06-.36-.22-.68-.59-.68h-4.15c-.31 0-.56.23-.6.52z" fill="#263B80" />
                </svg>
                <span className="text-sm font-medium">PayPal</span>
              </Label>
            </RadioGroup>

            {isInitiatingBuy && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initiating payment...
              </div>
            )}

            {selectedProvider === PaymentProvider.STRIPE && !clientSecret && !isInitiatingBuy && (
              <Button onClick={handleBuyPackage} className="w-full">
                Proceed with Stripe
              </Button>
            )}

            {selectedProvider === PaymentProvider.STRIPE && clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm onSuccess={handleStripePaymentSuccess} />
              </Elements>
            )}

            {selectedProvider === PaymentProvider.PAYPAL && !payPalOrderId && !isInitiatingBuy && (
              <Button onClick={handleBuyPackage} className="w-full">
                Proceed with PayPal
              </Button>
            )}

            {selectedProvider === PaymentProvider.PAYPAL && payPalOrderId && (
              <PayPalButton
                tier_id={pointPackage.id}
                plan_type="quarterly"
                coupon_code=""
                onPaymentSuccess={handlePayPalPaymentSuccess}
                onPaymentError={handlePayPalPaymentError}
              />
            )}

            {isConfirmingPurchase && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming purchase...
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isInitiatingBuy || isConfirmingPurchase}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyPointPackageModal;