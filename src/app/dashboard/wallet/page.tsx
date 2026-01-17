'use client';

import React, { useState } from 'react';
import { useGetWallet, useInitiateWalletTopup, useVerifyWalletTopup } from '@/services/wallet/hook';
import { useGetCashbackBalance } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, CreditCard, Wallet, History, Coins } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function StripePaymentForm({ onSuccess, onClose }: { onSuccess: (id: string) => void, onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // This might need handling if redirecting back
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
       // Unexpected state
       setErrorMessage("Payment status could not be determined.");
       setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
      <div className="flex justify-end gap-2 mt-4">
         <Button variant="outline" type="button" onClick={onClose} disabled={isProcessing}>Cancel</Button>
         <Button type="submit" disabled={!stripe || isProcessing}>
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
            Pay Now
         </Button>
      </div>
    </form>
  );
}

export default function WalletPage() {
  const { data: wallet, isLoading: isWalletLoading, refetch: refetchWallet } = useGetWallet();
  const { data: cashback, isLoading: isCashbackLoading } = useGetCashbackBalance();
  const { mutate: initiateTopup, isPending: isInitiating } = useInitiateWalletTopup();
  const { mutate: verifyTopup } = useVerifyWalletTopup();

  const [amount, setAmount] = useState<string>('10');
  const [provider, setProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);

  const handleInitiate = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    initiateTopup({ amount: numAmount, provider }, {
      onSuccess: (data) => {
        if (provider === 'stripe' && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setIsStripeDialogOpen(true);
        }
        // PayPal flow is handled by PayPalButtons createOrder
      },
      onError: (err) => {
        toast.error(`Failed to initiate top-up: ${err.message}`);
      }
    });
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    setIsStripeDialogOpen(false);
    verifyTopup({ transaction_id: paymentIntentId, provider: 'stripe' }, {
      onSuccess: (data) => {
        toast.success(`Successfully topped up £${data.amount}!`);
        setClientSecret(null);
        refetchWallet();
      },
      onError: (err) => {
        toast.error(`Verification failed: ${err.message}`);
      }
    });
  };

  // PayPal specific handlers
  const createPayPalOrder = async () => {
     const numAmount = parseFloat(amount);
     if (isNaN(numAmount) || numAmount <= 0) {
       toast.error("Invalid amount");
       throw new Error("Invalid amount");
     }

     return new Promise<string>((resolve, reject) => {
       initiateTopup({ amount: numAmount, provider: 'paypal' }, {
         onSuccess: (data) => {
           if (data.orderId) resolve(data.orderId);
           else reject("No Order ID returned");
         },
         onError: (err) => reject(err)
       });
     });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPayPalApprove = async (data: any) => {
    verifyTopup({ transaction_id: data.orderID, provider: 'paypal' }, {
      onSuccess: (res) => {
         toast.success(`Successfully topped up £${res.amount}!`);
         refetchWallet();
      },
       onError: (err) => {
        toast.error(`Verification failed: ${err.message}`);
      }
    });
  };

  if (isWalletLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Wallet & Credits</h1>
        <p className="text-muted-foreground">Manage your wallet balance to issue gift cards, vouchers, and coupons.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Balances */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">£{Number(wallet?.topupBalance || 0).toFixed(2)}</div>
               <p className="text-xs text-muted-foreground mt-1">
                 + £{Number(wallet?.tierBalance || 0).toFixed(2)} monthly allowance
               </p>
            </CardContent>
          </Card>

          {/* Cashback Card */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cashback Wallet</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isCashbackLoading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
               ) : (
                 <div className="text-2xl font-bold">£{Number(cashback?.balance || 0).toFixed(2)}</div>
               )}
               <p className="text-xs text-muted-foreground mt-1">
                 Accumulated cashback
               </p>
            </CardContent>
          </Card>
        </div>

         {/* Top Up Card */}
        <Card>
          <CardHeader>
            <CardTitle>Top Up Wallet</CardTitle>
            <CardDescription>Add funds to your wallet instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="amount">Amount (£)</Label>
               <Input
                 id="amount"
                 type="number"
                 placeholder="Enter amount"
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 min="1"
               />
             </div>

             <div className="space-y-2">
               <Label>Payment Method</Label>
               <RadioGroup value={provider} onValueChange={(v) => setProvider(v as 'stripe' | 'paypal')} className="flex gap-4">
                  <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 w-full">
                    <RadioGroupItem value="stripe" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Card (Stripe)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 w-full">
                    <RadioGroupItem value="paypal" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer flex items-center gap-2">
                       <span className="font-bold text-blue-700 italic">Pay</span><span className="font-bold text-blue-500 italic">Pal</span>
                    </Label>
                  </div>
               </RadioGroup>
             </div>

             {provider === 'stripe' ? (
               <Button className="w-full" onClick={handleInitiate} disabled={isInitiating}>
                 {isInitiating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 Proceed to Pay £{amount}
               </Button>
             ) : (
                <div className="mt-4 z-0 relative">
                   <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb", currency: "GBP" }}>
                      <PayPalButtons
                        style={{ layout: "vertical" }}
                        createOrder={createPayPalOrder}
                        onApprove={onPayPalApprove}
                        forceReRender={[amount]}
                      />
                   </PayPalScriptProvider>
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
           {wallet?.transactions && wallet.transactions.length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Date</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Reference</TableHead>
                   <TableHead className="text-right">Amount</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {wallet.transactions
                   .slice()
                   .sort((a, b) => {
                     const dateA = new Date(a.createdAt).getTime();
                     const dateB = new Date(b.createdAt).getTime();
                     return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                   })
                   .map((tx) => {
                     let dateDisplay = 'Invalid Date';
                     try {
                        const date = new Date(tx.createdAt);
                        if (!isNaN(date.getTime())) {
                            dateDisplay = format(date, 'PPP p');
                        }
                     } catch (e) { console.error(e); }

                     return (
                       <TableRow key={tx.id}>
                         <TableCell>{dateDisplay}</TableCell>
                         <TableCell className="capitalize">{tx.type.replace(/_/g, ' ').toLowerCase()}</TableCell>
                         <TableCell className="max-w-[200px] truncate" title={tx.reference}>{tx.reference}</TableCell>
                         <TableCell className={`text-right font-medium ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {Number(tx.amount) > 0 ? '+' : ''}£{Number(tx.amount).toFixed(2)}
                         </TableCell>
                       </TableRow>
                     );
                   })}
               </TableBody>
             </Table>
           ) : (
             <div className="text-center py-10 text-muted-foreground">
               No transactions found.
             </div>
           )}
        </CardContent>
      </Card>

      {/* Stripe Dialog */}
      <Dialog open={isStripeDialogOpen} onOpenChange={setIsStripeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Enter your card details to top up £{amount}.
            </DialogDescription>
          </DialogHeader>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                onSuccess={handleStripeSuccess}
                onClose={() => setIsStripeDialogOpen(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
