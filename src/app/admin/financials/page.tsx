'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle, Landmark, TrendingUp, ChevronLeft, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react';
import {
  mockEscrows,
  mockPayoutRequests,
  mockFinancialAnalytics,
  Escrow,
  PayoutRequest,
} from '@/lib/mock-data/financials';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditPlanModal } from '@/components/admin/financials/AddEditPlanModal';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { useGetTiers, useDeleteTier, useGetPaymentHistory, useGetPointPackages, useDeletePointPackage } from '@/services/financials';
import { PaymentHistoryItem, PointPackage } from '@/services/financials/types';
import { Tier } from '@/services/financials/types';
import { AddEditPointPackageModal } from '@/components/admin/financials/AddEditPointPackageModal';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentHistorySearchParams } from '@/services/financials/types';

export default function FinancialsPage() {
  const [paymentFilters, setPaymentFilters] = useState<PaymentHistorySearchParams>({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    payment_provider: 'all',
    user_type: '',
    purchase_type: 'all',
    min_amount: undefined,
    max_amount: undefined,
  });

  const debouncedSearch = useDebounce(paymentFilters.search, 500);

  // Combine filters with debounced search for the hook
  const effectiveFilters = {
    ...paymentFilters,
    search: debouncedSearch,
    // Convert 'all' to undefined for API
    status: paymentFilters.status === 'all' ? undefined : paymentFilters.status,
    payment_provider: paymentFilters.payment_provider === 'all' ? undefined : paymentFilters.payment_provider,
    purchase_type: paymentFilters.purchase_type === 'all' ? undefined : paymentFilters.purchase_type,
  };

  const { data: paymentHistoryData, isLoading: isLoadingPayments, error: paymentsError } = useGetPaymentHistory(effectiveFilters);

  const paymentHistory = paymentHistoryData?.data || [];
  const totalPaymentPages = paymentHistoryData?.totalPages || 1;

  const [escrows, setEscrows] = useState<Escrow[]>(mockEscrows);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(mockPayoutRequests);

  const { data: plans, isLoading: isLoadingPlans, error: plansError } = useGetTiers();
  const deleteTierMutation = useDeleteTier();

  const { data: pointPackages, isLoading: isLoadingPointPackages, error: pointPackagesError } = useGetPointPackages(1, 10);
  const deletePointPackageMutation = useDeletePointPackage();

  const handleFilterChange = (key: keyof PaymentHistorySearchParams, value: any) => {
    setPaymentFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setPaymentFilters({
      page: 1,
      limit: 10,
      search: '',
      status: 'all',
      payment_provider: 'all',
      user_type: '',
      purchase_type: 'all',
      min_amount: undefined,
      max_amount: undefined,
    });
  };

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
  const [currentEditPlan, setCurrentEditPlan] = useState<Tier | undefined>(undefined);

  // State for Add/Edit Point Package Modal
  const [showAddEditPointPackageModal, setShowAddEditPointPackageModal] = useState(false);
  const [currentEditPointPackage, setCurrentEditPointPackage] = useState<PointPackage | undefined>(undefined);

  const handleAddEditPlan = (plan?: Tier) => {
    setCurrentEditPlan(plan);
    setShowAddEditPlanModal(true);
  };

  const handleSavePlan = (savedPlan: Tier) => {
    setShowAddEditPlanModal(false);
    handleShowFeedback(
      currentEditPlan ? "Plan Updated" : "Plan Added",
      `Subscription Plan "${savedPlan.name}" has been successfully ${currentEditPlan ? 'updated' : 'added'}.`
    );
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteTierMutation.mutateAsync(planId);
      handleShowFeedback("Plan Deleted", `Subscription Plan ${planId} has been deleted.`);
    } catch (error) {
      handleShowFeedback("Error", `There was an error deleting plan ${planId}.`, 'OK');
    }
  };

  const handleAddEditPointPackage = (pkg?: PointPackage) => {
    setCurrentEditPointPackage(pkg);
    setShowAddEditPointPackageModal(true);
  };

  const handleSavePointPackage = (savedPackage: PointPackage) => {
    setShowAddEditPointPackageModal(false);
    handleShowFeedback(
      currentEditPointPackage ? "Package Updated" : "Package Added",
      `Point Package "${savedPackage.name}" has been successfully ${currentEditPointPackage ? 'updated' : 'added'}.`
    );
  };

  const handleDeletePointPackage = async (packageId: string) => {
    try {
      await deletePointPackageMutation.mutateAsync(packageId);
      handleShowFeedback("Package Deleted", `Point Package ${packageId} has been deleted.`);
    } catch (error) {
      handleShowFeedback("Error", `There was an error deleting package ${packageId}.`, 'OK');
    }
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


  // Determine the actual array of point packages to render
  const packagesToRender: PointPackage[] = Array.isArray(pointPackages)
    ? pointPackages
    : [];

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
          <TabsTrigger value="point-packages">Point Packages</TabsTrigger>
        </TabsList>

        {/* Payment History Tab */}
        <TabsContent value="payment-history">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters Section */}
              <div className="mb-6 space-y-4 rounded-lg border p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Filters</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Search */}
                  <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transaction ID, business, or email..."
                      className="pl-8"
                      value={paymentFilters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <Select
                    value={paymentFilters.status || 'all'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="succeeded">Succeeded</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Payment Provider */}
                  <Select
                    value={paymentFilters.payment_provider || 'all'}
                    onValueChange={(value) => handleFilterChange('payment_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Purchase Type */}
                  <Select
                    value={paymentFilters.purchase_type || 'all'}
                    onValueChange={(value) => handleFilterChange('purchase_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Purchase Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Purchase Types</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="extra_points">Extra Points</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* User Type */}
                  <Input
                    placeholder="User Type"
                    value={paymentFilters.user_type || ''}
                    onChange={(e) => handleFilterChange('user_type', e.target.value)}
                  />

                  {/* Min Amount */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Min:</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={paymentFilters.min_amount !== undefined ? paymentFilters.min_amount : ''}
                      onChange={(e) => handleFilterChange('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>

                  {/* Max Amount */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Max:</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={paymentFilters.max_amount !== undefined ? paymentFilters.max_amount : ''}
                      onChange={(e) => handleFilterChange('max_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>

                  {/* Clear Filters */}
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Payment Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPayments && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">Loading payment history...</TableCell>
                    </TableRow>
                  )}

                  {paymentsError && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-red-500">Error loading payment history.</TableCell>
                    </TableRow>
                  )}

                  {!isLoadingPayments && !paymentsError && paymentHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No transactions found.</TableCell>
                    </TableRow>
                  )}

                  {paymentHistory.map((txn: PaymentHistoryItem) => (
                    <TableRow key={txn.id}>
                      <TableCell>{txn.transactionId}</TableCell>
                      <TableCell>{txn.membership?.tier?.name ?? txn.userId}</TableCell>
                      <TableCell>{txn.paymentProvider}</TableCell>
                      <TableCell>£{parseFloat(txn.amount).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(txn.status)}>{txn.status}</Badge></TableCell>
                      <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', (paymentFilters.page || 1) - 1)}
                  disabled={(paymentFilters.page || 1) === 1 || isLoadingPayments}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {paymentFilters.page || 1} of {totalPaymentPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', (paymentFilters.page || 1) + 1)}
                  disabled={(paymentFilters.page || 1) === totalPaymentPages || isLoadingPayments}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

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
              {isLoadingPlans && <p>Loading plans...</p>}
              {plansError && <p>Error loading plans.</p>}
              {plans?.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {plan.name}
                    </CardTitle>
                    <div className="text-3xl font-bold">£{plan.monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
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

        {/* Point Packages Tab */}
        <TabsContent value="point-packages">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Point Packages</CardTitle>
                <Button onClick={() => handleAddEditPointPackage()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Package</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tiers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPointPackages ? (
                    <TableRow>
                      <TableCell colSpan={6}>Loading packages...</TableCell>
                    </TableRow>
                  ) : pointPackagesError ? (
                    <TableRow>
                      <TableCell colSpan={6}>Error loading packages.</TableCell>
                    </TableRow>
                  ) : packagesToRender.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No packages found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    packagesToRender.map((pkg: PointPackage) => (
                      <TableRow key={pkg.id}>
                        <TableCell>{pkg.name}</TableCell>
                        <TableCell>{pkg.points}</TableCell>
                        <TableCell>£{parseFloat(pkg.price).toFixed(2)}</TableCell>
                        <TableCell>{pkg.tiers.map((t: Tier) => t.name).join(', ') || 'All'}</TableCell>
                        <TableCell><Badge variant={pkg.isActive ? 'default' : 'secondary'}>{pkg.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleAddEditPointPackage(pkg)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePointPackage(pkg.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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

      <AddEditPointPackageModal
        isOpen={showAddEditPointPackageModal}
        onClose={() => setShowAddEditPointPackageModal(false)}
        initialData={currentEditPointPackage}
        onSave={handleSavePointPackage}
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