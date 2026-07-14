'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import MallRewardsContent from '@/components/customer/mall-rewards/MallRewardsContent';
import { useAdminParticipantMallRewards } from '@/services/admin/hook';

export default function AdminMallRewardsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [page, setPage] = useState(1);
  const limit = 12;

  // Use the admin hook instead of the participant hook
  const { data, isLoading, isError, refetch } = useAdminParticipantMallRewards(id, page, limit);

  return (
    <MallRewardsContent
      data={data}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      page={page}
      setPage={setPage}
      limit={limit}
    />
  );
}
