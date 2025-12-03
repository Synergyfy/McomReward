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
            // Assuming PayPalButton handles redirection or rendering
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
      { transactionId, provider: PaymentProvider.STRIPE },
      {
        onSuccess: () => {
          toast.success('Point package purchased successfully!');
          onPurchaseSuccess();
          onClose();
          router.refresh(); // Refresh data on parent page
        },
        onError: (error) => {
          console.error('Failed to confirm Stripe purchase:', error);
          toast.error('Failed to confirm purchase. Please contact support.');
        },
      }
    );
  };

  const handlePayPalPaymentSuccess = (details: PayPalVerifyResponse, transactionId: string) => {
    // PayPalButton already handles capture and can return details.
    // If capture is done externally or needs another verification step:
    if (!pointPackage) return;

    confirmPurchase(
      { transactionId, provider: PaymentProvider.PAYPAL },
      {
        onSuccess: () => {
          toast.success('Point package purchased successfully!');
          onPurchaseSuccess();
          onClose();
          router.refresh(); // Refresh data on parent page
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
    setPayPalOrderId(null); // Allow retrying
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Points: {pointPackage?.name}</DialogTitle>
          <DialogDescription>
            {pointPackage ? `Get ${pointPackage.points} points for £${pointPackage.price}.` : 'Select a package to purchase.'}
          </DialogDescription>
        </DialogHeader>

        {!pointPackage ? (
          <p className="text-center text-gray-500">No package selected.</p>
        ) : (
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <RadioGroup
              value={selectedProvider}
              onValueChange={(value: PaymentProvider) => {
                setSelectedProvider(value);
                setClientSecret(null); // Reset client secret if provider changes
                setPayPalOrderId(null); // Reset PayPal order ID
              }}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="stripe"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="stripe" value={PaymentProvider.STRIPE} className="sr-only" />
                <span className="mb-3 text-2xl">💳</span>
                <span>Stripe (Card)</span>
              </Label>
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="paypal" value={PaymentProvider.PAYPAL} className="sr-only" />
                <span className="mb-3 text-2xl">🅿️</span>
                <span>PayPal</span>
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
                tier_id={pointPackage.id} // Re-using tier_id for packageId, assuming backend handles this.
                plan_type="quarterly" // This is a placeholder, as it's not a subscription
                coupon_code="" // No coupon for point packages currently
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