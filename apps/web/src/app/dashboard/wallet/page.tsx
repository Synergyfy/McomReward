'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetWallet, useInitiateWalletTopup, useVerifyWalletTopup } from '@/services/wallet/hook';
import { useGetCashbackBalance } from '@/services/cashback/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { Loader2, CreditCard, Wallet, History, Coins, Stamp, Star, Ticket, Eye, Gift } from 'lucide-react';
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
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
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

function CustomerPreviewTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">This is how your reward programme appears to customers.</p>

      <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-3xl font-bold text-orange-600">1,250</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Coins className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <Progress value={42} className="h-2" />
          <p className="text-xs text-gray-400 mt-1">42% towards next reward (3,000 points)</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Stamp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900">Stamp Card</span>
            </div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < 3 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {i < 3 ? "✓" : "○"}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">3/5 stamps — buy 5 get 1 free</p>
          </CardContent>
        </Card>
        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900">Vouchers</span>
            </div>
            <p className="text-lg font-bold text-orange-600">2</p>
            <p className="text-xs text-gray-500">Free dessert • £5 off</p>
          </CardContent>
        </Card>
        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900">Gift Cards</span>
            </div>
            <p className="text-lg font-bold text-orange-600">£25.00</p>
            <p className="text-xs text-gray-500">1 active gift card</p>
          </CardContent>
        </Card>
        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900">Matching Pts</span>
            </div>
            <p className="text-lg font-bold text-orange-600">500</p>
            <p className="text-xs text-gray-500">Matching points available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { desc: "Purchase at restaurant", points: "+50", type: "earn" },
            { desc: "Free dessert redeemed", points: "-200", type: "redeem" },
            { desc: "Referral bonus", points: "+100", type: "earn" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-600">{t.desc}</span>
              <span className={`text-sm font-semibold ${t.type === "earn" ? "text-green-600" : "text-red-600"}`}>{t.points}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function WalletPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'customer' ? 'customer' : 'business';
  const [activeTab, setActiveTab] = useState(defaultTab);
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Wallet & Credits</h1>
        <p className="text-muted-foreground">Manage your wallet balance and preview how customers see their rewards.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="business" className="gap-2"><Wallet className="w-4 h-4" />Business Wallet</TabsTrigger>
          <TabsTrigger value="customer" className="gap-2"><Eye className="w-4 h-4" />Customer Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
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

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-lg shadow-green-100/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-black uppercase text-green-800">Credits Pool</CardTitle>
                  <Coins className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  {isCashbackLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-3xl font-black text-slate-900">£{Number(cashback?.availableCashback ?? 0).toFixed(2)}</div>
                  )}
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    Total circulating value
                  </p>
                </CardContent>
              </Card>
            </div>

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
        </TabsContent>

        <TabsContent value="customer">
          <CustomerPreviewTab />
        </TabsContent>
      </Tabs>

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

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <WalletPageContent />
    </Suspense>
  );
}
