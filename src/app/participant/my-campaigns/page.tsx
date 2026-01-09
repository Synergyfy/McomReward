'use client';

import React, { useState } from 'react';
import { useGetMyCampaigns } from '@/services/customer-campaigns/hook';
import MyCampaignsContent from '@/components/customer/campaigns/MyCampaignsContent';

export default function MyCampaignsPage() {
  const [page] = useState(1);
  const [limit] = useState(10);
  const { data: campaignsData, isLoading } = useGetMyCampaigns(page, limit);

  return <MyCampaignsContent data={campaignsData} isLoading={isLoading} />;
}
