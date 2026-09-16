'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FeedbackDialog from '@/components/FeedbackDialog';
import { CheckCircle } from 'lucide-react';
import { useCreateSale } from '@/services/plaque-sales/hook';
import { useGetAdminQrPlaques } from '@/services/qr-plaques/hook';
import { useAdminBusinesses } from '@/services/admin/hook';

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

  const { data: plaquesData } = useGetAdminQrPlaques({ page: 1, limit: 100 });
  const { data: businessesData } = useAdminBusinesses(1, 100);
  const { mutate: createSale, isPending: isSelling } = useCreateSale();

  const plaques = (Array.isArray(plaquesData) ? plaquesData : (plaquesData as any)?.data ?? []);
  const availablePlaques = plaques.filter((plaque: any) => plaque.status !== 'SOLD');
  const businesses = businessesData?.data ?? [];

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

    const plaque = availablePlaques.find((p: any) => p.id === selectedPlaqueId);
    const seller = businesses.find(s => s.id === selectedSellerId);
    const buyer = businesses.find(b => b.id === selectedBuyerId);

    if (!plaque || !seller || !buyer) {
      setFeedbackDialogProps({
        title: 'Invalid Selection',
        description: 'Selected plaque, seller, or buyer not found.',
        actionText: 'OK',
      });
      setShowFeedbackDialog(true);
      return;
    }

    createSale(
      {
        plaqueId: plaque.id,
        sellerId: seller.id,
        sellerName: seller.name,
        buyerId: buyer.id,
        buyerName: buyer.name,
        salePrice: Number(salePrice),
        commissionPercentage: Number(commissionPercentage),
      },
      {
        onSuccess: (sale) => {
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
          router.push(`/admin/sales/confirmation/${sale.id}`);
        },
        onError: (error: any) => {
          setFeedbackDialogProps({
            title: 'Sale Failed',
            description: error?.response?.data?.message || 'Failed to record the sale. Please try again.',
            actionText: 'OK',
          });
          setShowFeedbackDialog(true);
        },
      }
    );
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sell Plaque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Choose the plaque that is being sold from the available plaques.</p>
            <Label htmlFor="plaque">Select Plaque</Label>
            <Select onValueChange={setSelectedPlaqueId} value={selectedPlaqueId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plaque" />
              </SelectTrigger>
              <SelectContent>
                {availablePlaques.map((plaque: any) => (
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
                {businesses.map(seller => (
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
                {businesses.map(buyer => (
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

          <Button onClick={handleSellPlaque} className="w-full" disabled={isSelling}>
            {isSelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isSelling ? 'Recording Sale...' : 'Confirm Sale'}
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