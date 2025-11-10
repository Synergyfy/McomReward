'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, CheckCircle, XCircle, Landmark, TrendingUp, Banknote, Star } from 'lucide-react';
import {
  mockTransactions,
  mockEscrows,
  mockSubscriptionPlans,
  mockPayoutRequests,
  mockFinancialAnalytics,
  Transaction,
  Escrow,
  SubscriptionPlan,
  PayoutRequest,
} from '@/lib/mock-data/financials';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditPlanModal } from '@/components/admin/financials/AddEditPlanModal'; // Will create this
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

export default function FinancialsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [escrows, setEscrows] = useState<Escrow[]>(mockEscrows);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(mockPayoutRequests);

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{
    title: string;
    description: React.ReactNode;
    actionText: string;
  }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  // State for Add/Edit Plan Modal
  const [showAddEditPlanModal, setShowAddEditPlanModal] = useState(false);
  const [currentEditPlan, setCurrentEditPlan] = useState<SubscriptionPlan | undefined>(undefined);

  const handleAddEditPlan = (plan?: SubscriptionPlan) => {
    setCurrentEditPlan(plan);
    setShowAddEditPlanModal(true);
  };

  const handleSavePlan = (savedPlan: SubscriptionPlan) => {
    setShowAddEditPlanModal(false);
    setTimeout(() => {
      if (savedPlan.id.startsWith('new-')) {
        setPlans(prev => [...prev, { ...savedPlan, id: `plan-${Date.now()}` }]);
        handleShowFeedback("Plan Added", `Subscription Plan "${savedPlan.name}" has been added.`);
      } else {
        setPlans(prev => prev.map(plan => (plan.id === savedPlan.id ? savedPlan : plan)));
        handleShowFeedback("Plan Updated", `Subscription Plan "${savedPlan.name}" has been updated.`);
      }
    }, 300);
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId));
    handleShowFeedback("Plan Deleted", `Subscription Plan ${planId} has been deleted.`);
  };

  const handleEscrowAction = (escrowId: string, action: 'released' | 'refunded') => {
    setEscrows(prev => prev.map(escrow => (escrow.id === escrowId ? { ...escrow, status: action, releasedAt: new Date() } : escrow)));
    handleShowFeedback("Escrow Updated", `Escrow ${escrowId} has been ${action}.`);
  };

  const handlePayoutAction = (payoutId: string, action: 'approved' | 'rejected') => {
    setPayouts(prev => prev.map(payout => (payout.id === payoutId ? { ...payout, status: action, processedAt: new Date() } : payout)));
    handleShowFeedback("Payout Request Updated", `Payout request ${payoutId} has been ${action}.`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'released':
        return 'default';
      case 'pending':
      case 'held':
        return 'secondary';
      case 'failed':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Landmark className="h-8 w-8" /> Financials
        </h1>
        <p className="text-muted-foreground">Manage payment history, escrow, subscriptions, and payouts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Financial Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockFinancialAnalytics.revenueOverTime}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#ea580c" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Payouts vs. Subscriptions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockFinancialAnalytics.payoutsVsSubscriptions}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#fb923c" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payment-history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="escrow-management">Escrow Management</TabsTrigger>
          <TabsTrigger value="subscription-plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payout-requests">Payout Requests</TabsTrigger>
        </TabsList>

        {/* Payment History Tab */}
        <TabsContent value="payment-history">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{txn.id}</TableCell>
                      <TableCell>{txn.businessName}</TableCell>
                      <TableCell>{txn.type}</TableCell>
                      <TableCell>£{txn.amount.toFixed(2)}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(txn.status)}>{txn.status}</Badge></TableCell>
                      <TableCell>{txn.date.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escrow Management Tab */}
        <TabsContent value="escrow-management">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escrows.map((escrow) => (
                    <TableRow key={escrow.id}>
                      <TableCell>{escrow.campaignName}</TableCell>
                      <TableCell>{escrow.businessName}</TableCell>
                      <TableCell>£{escrow.amount.toFixed(2)}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(escrow.status)}>{escrow.status}</Badge></TableCell>
                      <TableCell>{escrow.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {escrow.status === 'held' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleEscrowAction(escrow.id, 'released')}>Release</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleEscrowAction(escrow.id, 'refunded')}>Refund</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Plans Tab */}
        <TabsContent value="subscription-plans">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Subscription Plans</CardTitle>
                <Button onClick={() => handleAddEditPlan()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Plan</Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className={plan.isPopular ? 'border-orange-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {plan.name}
                      {plan.isPopular && <Badge><Star className="mr-1 h-3 w-3" /> Popular</Badge>}
                    </CardTitle>
                    <div className="text-3xl font-bold">£{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1" onClick={() => handleAddEditPlan(plan)}>Edit</Button>
                      <Button className="flex-1" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Requests Tab */}
        <TabsContent value="payout-requests">
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.businessName}</TableCell>
                      <TableCell>£{payout.amount.toFixed(2)}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(payout.status)}>{payout.status}</Badge></TableCell>
                      <TableCell>{payout.requestedAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {payout.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handlePayoutAction(payout.id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handlePayoutAction(payout.id, 'rejected')}>Reject</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddEditPlanModal
        isOpen={showAddEditPlanModal}
        onClose={() => setShowAddEditPlanModal(false)}
        initialData={currentEditPlan}
        onSave={handleSavePlan}
        onShowFeedback={handleShowFeedback}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}
