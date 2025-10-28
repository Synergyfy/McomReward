import React from 'react';
import { dealsData } from '@/lib/mock-data/deals';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface DealDetailPageProps {
  params: { dealId: string };
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  const deal = dealsData.find(d => d.id === params.dealId);

  if (!deal) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <Badge variant="outline" className="w-fit mb-2">{deal.businessName}</Badge>
          <CardTitle className="text-3xl">{deal.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl text-gray-700">{deal.description}</p>
          
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold">Value</h3>
              <p className="text-2xl font-bold text-orange-600">{deal.value}</p>
            </div>
            <div>
              <h3 className="font-semibold">Validity</h3>
              <p>From {new Date(deal.startDate).toLocaleDateString()} to {new Date(deal.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{deal.terms}</p>
            </div>
          </div>

          <Button size="lg" className="w-full">Claim Deal</Button>
        </CardContent>
      </Card>
    </div>
  );
}
