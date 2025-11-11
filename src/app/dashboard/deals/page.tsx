import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DealsTable from '@/components/dashboard/deals/DealsTable';
import { mockDeals } from '@/lib/mock-data/deals';

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manage Deals</h1>
        <Link href="/dashboard/deals/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Deal
          </Button>
        </Link>
      </div>
      <DealsTable deals={mockDeals} />
    </div>
  );
}
