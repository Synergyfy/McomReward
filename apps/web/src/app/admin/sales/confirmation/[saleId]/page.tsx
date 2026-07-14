'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Printer, Mail, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { mockSaleRecords, SaleRecord } from '@/lib/mock-data/sales';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SaleConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.saleId as string;
  const [saleRecord, setSaleRecord] = useState<SaleRecord | null>(null);

  useEffect(() => {
    if (saleId) {
      const foundSale = mockSaleRecords.find(sale => sale.id === saleId);
      setSaleRecord(foundSale || null);
    }
  }, [saleId]);

  if (!saleRecord) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-500">Sale Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <CardDescription>
              The sale record with ID "{saleId}" could not be found. It might have been canceled or never existed.
            </CardDescription>
            <Button onClick={() => router.push('/admin/sales/dashboard')}>
              Go to Sales Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-green-700">Sale Confirmed!</CardTitle>
          <CardDescription>
            Plaque "{saleRecord.plaqueName}" has been successfully sold and transferred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <div>
              <p className="font-semibold">Sale ID:</p>
              <p>{saleRecord.id}</p>
            </div>
            <div>
              <p className="font-semibold">Plaque Name:</p>
              <p>{saleRecord.plaqueName}</p>
            </div>
            <div>
              <p className="font-semibold">Seller:</p>
              <p>{saleRecord.sellerName}</p>
            </div>
            <div>
              <p className="font-semibold">Buyer:</p>
              <p>{saleRecord.buyerName}</p>
            </div>
            <div>
              <p className="font-semibold">Sale Date:</p>
              <p>{format(new Date(saleRecord.saleDate), 'PPP p')}</p>
            </div>
            <div>
              <p className="font-semibold">Sale Price:</p>
              <p>${saleRecord.salePrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-semibold">Commission Earned:</p>
              <p>${saleRecord.commissionAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-semibold">Payout Status:</p>
              <p>{saleRecord.payoutStatus}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button variant="outline" className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" /> Print Confirmation
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" /> Email Confirmation
            </Button>
            <Link href="/admin/sales/dashboard" passHref>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Go to Sales Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
