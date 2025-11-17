'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSaleRecords, SaleRecord } from '@/lib/mock-data/sales';
import { mockBusinessUsers } from '@/lib/mock-data/users';
import { PoundSterling, CheckCircle, XCircle, Search, Filter, Eye } from 'lucide-react';
import FeedbackDialog from '@/components/FeedbackDialog';
import { format } from 'date-fns';

export default function SalesDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const [filterBuyer, setFilterBuyer] = useState('');
  const [filterPayoutStatus, setFilterPayoutStatus] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{ title: string; description: React.ReactNode; actionText: string }>({
    title: '',
    description: '',
    actionText: 'OK',
  });
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);

  const sellers = mockBusinessUsers; // Assuming business users can be sellers
  const buyers = mockBusinessUsers; // Assuming business users can be buyers

  const filteredSales = useMemo(() => {
    let filtered = mockSaleRecords;

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.plaqueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.plaqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeller && filterSeller !== 'all') {
      filtered = filtered.filter(sale => sale.sellerId === filterSeller);
    }

    if (filterBuyer && filterBuyer !== 'all') {
      filtered = filtered.filter(sale => sale.buyerId === filterBuyer);
    }

    if (filterPayoutStatus && filterPayoutStatus !== 'all') {
      filtered = filtered.filter(sale => sale.payoutStatus === filterPayoutStatus);
    }

    return filtered;
  }, [searchTerm, filterSeller, filterBuyer, filterPayoutStatus]);

  const totalPlaquesSold = filteredSales.length;
  const totalCommissionEarned = filteredSales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
  const pendingPayouts = filteredSales.filter(sale => sale.payoutStatus === 'Pending').reduce((sum, sale) => sum + sale.commissionAmount, 0);

  const handleMarkAsPaid = (saleId: string) => {
    const saleIndex = mockSaleRecords.findIndex(sale => sale.id === saleId);
    if (saleIndex !== -1) {
      mockSaleRecords[saleIndex].payoutStatus = 'Paid';
      setFeedbackDialogProps({
        title: 'Payout Marked as Paid',
        description: (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" />
            <span>Sale {saleId} payout has been marked as paid.</span>
          </div>
        ),
        actionText: 'OK',
      });
      setShowFeedbackDialog(true);
      // Force re-render to update the table and summaries
      setSearchTerm(prev => prev + ' '); // Small trick to force re-memoization
      setSearchTerm(prev => prev.trim());
    }
  };

  const handleViewDetails = (sale: SaleRecord) => {
    setViewingSale(sale);
    setFeedbackDialogProps({
      title: `Sale Details: ${sale.plaqueName}`,
      description: (
        <div className="space-y-2 text-sm">
          <p><strong>Sale ID:</strong> {sale.id}</p>
          <p><strong>Plaque:</strong> {sale.plaqueName} ({sale.plaqueId})</p>
          <p><strong>Seller:</strong> {sale.sellerName} ({sale.sellerId})</p>
          <p><strong>Buyer:</strong> {sale.buyerName} ({sale.buyerId})</p>
          <p><strong>Sale Date:</strong> {format(new Date(sale.saleDate), 'PPP p')}</p>
          <p><strong>Sale Price:</strong> £{sale.salePrice.toFixed(2)}</p>
          <p><strong>Commission:</strong> £{sale.commissionAmount.toFixed(2)}</p>
          <p><strong>Payout Status:</strong> {sale.payoutStatus}</p>
          <p><strong>Sale Status:</strong> {sale.status}</p>
        </div>
      ),
      actionText: 'Close',
    });
    setShowFeedbackDialog(true);
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plaques Sold</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaquesSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCommissionEarned.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{pendingPayouts.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">All Sales Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select onValueChange={setFilterSeller} value={filterSeller}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Seller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                {sellers.map(seller => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterBuyer} value={filterBuyer}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Buyer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buyers</SelectItem>
                {buyers.map(buyer => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterPayoutStatus} value={filterPayoutStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Payout Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterSeller('');
              setFilterBuyer('');
              setFilterPayoutStatus('');
            }}>
              Reset Filters
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plaque Name</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Payout Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.plaqueName}</TableCell>
                      <TableCell>{sale.sellerName}</TableCell>
                      <TableCell>{sale.buyerName}</TableCell>
                      <TableCell>{format(new Date(sale.saleDate), 'PPP')}</TableCell>
                      <TableCell>£{sale.salePrice.toFixed(2)}</TableCell>
                      <TableCell>£{sale.commissionAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.payoutStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                          sale.payoutStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.payoutStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(sale)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          {sale.payoutStatus === 'Pending' && (
                            <Button variant="secondary" size="sm" onClick={() => handleMarkAsPaid(sale.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No sales records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}
