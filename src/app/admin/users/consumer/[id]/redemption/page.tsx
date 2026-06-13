'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import RedemptionContent from '@/components/customer/redemption/RedemptionContent';

export default function AdminRedemptionPage() {
  const params = useParams();
  const id = params?.id as string;

  return <RedemptionContent participantId={id} isAdmin={true} />;
}
