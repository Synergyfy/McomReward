import React from 'react';
import DealCard from '@/components/deals/DealCard';
import { dealsData } from '@/lib/mock-data/deals';

export default function DealsPage() {
  const activeDeals = dealsData.filter(deal => deal.status === 'Active' || deal.status === 'Scheduled');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Find Your Next Deal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeDeals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
