'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import MyCampaignsContent from '@/components/customer/campaigns/MyCampaignsContent';
import { useAdminParticipantCampaigns } from '@/services/admin/hook';

export default function AdminMyCampaignsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [page] = useState(1);
  const [limit] = useState(10);

  const { data: campaignsData, isLoading } = useAdminParticipantCampaigns(id, page, limit);

  return <MyCampaignsContent data={campaignsData} isLoading={isLoading} />;
}
