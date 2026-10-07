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
import { Loader2, CreditCard, Wallet, History, Coins, Stamp, Star, Ticket, Eye, Gift, ExternalLink, ShieldCheck, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
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
  const { data: wallet, isLoading: isWalletLoading, refetch: refetchWallet, isRefetching } = useGetWallet();
  const { data: cashback, isLoading: isCashbackLoading } = useGetCashbackBalance();
  const { mutate: initiateTopup, isPending: isInitiating } = useInitiateWalletTopup();
  const { mutate: verifyTopup } = useVerifyWalletTopup();

  const [amount, setAmount] = useState<string>('10');
  const [provider, setProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);
  const [showLegacyTopup, setShowLegacyTopup] = useState(false);

  const hasCentralWallet = wallet?.centralBalance !== undefined || wallet?.centralAvailableBalance !== undefined;
  const centralTopUpUrl = wallet?.topUpUrl || 'http://localhost:3010/dashboard/wallet';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet & Credits</h1>
          <p className="text-muted-foreground">Manage your MCOM wallet and preview how customers see their rewards.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchWallet()}
          disabled={isRefetching}
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Sync Balance
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="business" className="gap-2"><Wallet className="w-4 h-4" />Business Wallet</TabsTrigger>
          <TabsTrigger value="customer" className="gap-2"><Eye className="w-4 h-4" />Customer Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-8">
          {/* Main Balance Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Central MCOM Wallet Card */}
            <Card className="md:col-span-1 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl border-indigo-700/30 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <CardTitle className="text-sm font-semibold text-indigo-200">MCOM Central Wallet</CardTitle>
                </div>
                {hasCentralWallet && (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] px-2 py-0.5">
                    {wallet?.centralStatus || 'ACTIVE'}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-black tracking-tight text-white">
                  {hasCentralWallet
                    ? `${Number(wallet?.centralAvailableBalance ?? wallet?.centralBalance ?? 0).toFixed(2)} ${wallet?.centralCurrency || 'MCOM'}`
                    : `£${Number(wallet?.topupBalance || 0).toFixed(2)}`}
                </div>
                <p className="text-xs text-indigo-200/80 mt-1">
                  {hasCentralWallet ? (
                    <>Total Balance: {Number(wallet?.centralBalance || 0).toFixed(2)} {wallet?.centralCurrency || 'MCOM'}</>
                  ) : (
                    'Central unified balance'
                  )}
                </p>

                <div className="mt-4 pt-4 border-t border-indigo-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-indigo-300/80">Ecosystem-wide credits</span>
                  <a
                    href={centralTopUpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-colors bg-indigo-600/40 hover:bg-indigo-600/70 px-2.5 py-1 rounded-md"
                  >
                    Top Up <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Allowance Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Plan Allowance</CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">£{Number(wallet?.tierBalance || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly tier allowance for reward creation
                </p>
              </CardContent>
            </Card>

            {/* Credits Pool Card */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-black uppercase text-emerald-800">Credits Pool</CardTitle>
                <Coins className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                {isCashbackLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-3xl font-black text-slate-900">£{Number(cashback?.availableCashback ?? 0).toFixed(2)}</div>
                )}
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                  Total circulating rewards value
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Central Top Up Guidance Banner & Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-base">MCOM Central Unified Wallet</CardTitle>
                </div>
                <CardDescription>
                  Your wallet is managed centrally across MCOM Solutions platforms (Rewards, Mall, etc.).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <p>
                  Funds added to your MCOM Central Wallet are instantly usable across all registered applications with automatic distributed ledger reconciliation.
                </p>
                <div className="bg-indigo-50/80 border border-indigo-100 p-3.5 rounded-lg flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-indigo-950">
                    <span className="font-semibold">Centralized Billing:</span> Use the McomSolutions Portal to manage your payment methods, view invoices, and add funds.
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href={centralTopUpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow transition-colors"
                  >
                    Open MCOM Central Top-Up Portal
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Direct / Fallback Top-Up Option */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Direct Card / PayPal Top Up</CardTitle>
                    <CardDescription>Add funds directly to your rewards account.</CardDescription>
                  </div>
                  {!showLegacyTopup && (
                    <Button variant="ghost" size="sm" onClick={() => setShowLegacyTopup(true)} className="text-xs">
                      Show Form
                    </Button>
                  )}
                </div>
              </CardHeader>
              {showLegacyTopup ? (
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
              ) : (
                <CardContent className="py-6 text-center text-sm text-muted-foreground space-y-2">
                  <p>Central wallet top-up is recommended. If you need to make a local direct top-up via card or PayPal, click &quot;Show Form&quot; above.</p>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {wallet?.transactions && wallet.transactions.length > 0 ? (
                <div className="overflow-x-auto">
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
                            <TableCell className="max-w-[250px] truncate" title={tx.reference}>{tx.reference}</TableCell>
                            <TableCell className={`text-right font-medium ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Number(tx.amount) > 0 ? '+' : ''}£{Number(tx.amount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                </div>
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
