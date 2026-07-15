import React from 'react';
import DealForm from '@/components/dashboard/deals/DealForm';

export default function CreateDealPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create New Deal</h1>
      <DealForm />
    </div>
  );
}
