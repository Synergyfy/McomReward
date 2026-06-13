"use client";

import React, { useState } from "react";
import { useGetParticipantMallRewardHistory } from "@/services/business-reward/hooks";
import MallRewardsContent from "@/components/customer/mall-rewards/MallRewardsContent";

export default function ParticipantMallRewardsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError, refetch } = useGetParticipantMallRewardHistory(page, limit);

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
