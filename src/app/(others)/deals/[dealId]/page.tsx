'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notFound, useParams } from 'next/navigation';
import { useGetDeal } from '@/services/deals/hook';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.dealId as string;

  const { data: deal, isLoading, isError } = useGetDeal(dealId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !deal) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        {deal.imageUrl && (
          <div className="relative h-64 w-full">
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          </div>
        )}
        <CardHeader>
          {deal.business && (
            <Badge variant="outline" className="w-fit mb-2">
              {deal.business.name}
            </Badge>
          )}
          <CardTitle className="text-3xl">{deal.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl text-gray-700">{deal.description}</p>

          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold">Value</h3>
              <p className="text-2xl font-bold text-orange-600">£{deal.value}</p>
            </div>
            <div>
              <h3 className="font-semibold">Validity</h3>
              <p>
                From {new Date(deal.startDate).toLocaleDateString()} to{' '}
                {new Date(deal.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {deal.termsAndConditions}
              </p>
            </div>
          </div>

          <Button size="lg" className="w-full">
            Claim Deal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
