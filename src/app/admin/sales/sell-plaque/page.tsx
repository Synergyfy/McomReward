'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPlaques } from '@/lib/mock-data/plaques';
import { mockBusinessUsers } from '@/lib/mock-data/users';
import { mockSaleRecords, SaleRecord } from '@/lib/mock-data/sales';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import FeedbackDialog from '@/components/FeedbackDialog'; // Assuming this component exists
import { CheckCircle, XCircle } from 'lucide-react';

export default function SellPlaquePage() {
  const router = useRouter();
  const [selectedPlaqueId, setSelectedPlaqueId] = useState<string>('');
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [commissionPercentage, setCommissionPercentage] = useState<number | ''>('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{ title: string; description: React.ReactNode; actionText: string }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const availablePlaques = mockPlaques.filter(plaque => plaque.status === 'Active');
  const sellers = mockBusinessUsers; // Assuming business users can be sellers or a separate mock for sellers
  const buyers = mockBusinessUsers; // Assuming business users can be buyers

  const handleSellPlaque = () => {
    if (!selectedPlaqueId || !selectedSellerId || !selectedBuyerId || salePrice === '' || commissionPercentage === '') {
      setFeedbackDialogProps({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        actionText: 'OK',
      });
      setShowFeedbackDialog(true);
      return;
    }

    const plaque = availablePlaques.find(p => p.id === selectedPlaqueId);
    const seller = sellers.find(s => s.id === selectedSellerId);
    const buyer = buyers.find(b => b.id === selectedBuyerId);

    if (!plaque || !seller || !buyer) {
      setFeedbackDialogProps({
        title: 'Invalid Selection',
        description: 'Selected plaque, seller, or buyer not found.',
        actionText: 'OK',
      });
      setShowFeedbackDialog(true);
      return;
    }

    const newSale: SaleRecord = {
      id: uuidv4(),
      plaqueId: plaque.id,
      plaqueName: plaque.name,
      sellerId: seller.id,
      sellerName: seller.name,
      buyerId: buyer.id,
      buyerName: buyer.name,
      saleDate: new Date().toISOString(),
      salePrice: Number(salePrice),
      commissionAmount: Number(salePrice) * (Number(commissionPercentage) / 100),
      payoutStatus: 'Pending',
      status: 'Completed',
    };

    // In a real application, you would update a backend database here.
    // For mock data, we'll simulate the update.
    mockSaleRecords.push(newSale);

    // Update plaque status and transfer history (simulated)
    const plaqueIndex = mockPlaques.findIndex(p => p.id === plaque.id);
    if (plaqueIndex !== -1) {
      mockPlaques[plaqueIndex].status = 'Sold';
      mockPlaques[plaqueIndex].ownerId = buyer.id;
      mockPlaques[plaqueIndex].ownerName = buyer.name;
      mockPlaques[plaqueIndex].transferHistory.push({
        fromOwnerId: seller.id,
        fromOwnerName: seller.name,
        toOwnerId: buyer.id,
        toOwnerName: buyer.name,
        transferDate: new Date(),
      });
    }

    setFeedbackDialogProps({
      title: 'Sale Confirmed!',
      description: (
        <div className="flex items-center space-x-2">
          <CheckCircle className="text-green-500" />
          <span>Plaque "{plaque.name}" successfully sold to {buyer.name}.</span>
        </div>
      ),
      actionText: 'View Sales Dashboard',
    });
    setShowFeedbackDialog(true);
    router.push(`/admin/sales/confirmation/${newSale.id}`);
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sell Plaque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Choose the plaque that is being sold from the available active plaques.</p>
            <Label htmlFor="plaque">Select Plaque</Label>
            <Select onValueChange={setSelectedPlaqueId} value={selectedPlaqueId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plaque" />
              </SelectTrigger>
              <SelectContent>
                {availablePlaques.map(plaque => (
                  <SelectItem key={plaque.id} value={plaque.id}>
                    {plaque.name} (ID: {plaque.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Choose the business user who is selling the plaque.</p>
            <Label htmlFor="seller">Select Seller</Label>
            <Select onValueChange={setSelectedSellerId} value={selectedSellerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a seller" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map(seller => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name} (ID: {seller.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Choose the business user who is buying the plaque.</p>
            <Label htmlFor="buyer">Select Buyer</Label>
            <Select onValueChange={setSelectedBuyerId} value={selectedBuyerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map(buyer => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.name} (ID: {buyer.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Enter the agreed-upon sale price for the plaque.</p>
            <Label htmlFor="salePrice">Sale Price</Label>
            <Input
              id="salePrice"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              placeholder="Enter sale price"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Specify the commission percentage for this sale.</p>
            <Label htmlFor="commissionPercentage">Commission Percentage (%)</Label>
            <Input
              id="commissionPercentage"
              type="number"
              value={commissionPercentage}
              onChange={(e) => setCommissionPercentage(Number(e.target.value))}
              placeholder="Enter commission percentage"
            />
          </div>

          <Button onClick={handleSellPlaque} className="w-full">
            Confirm Sale
          </Button>
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
