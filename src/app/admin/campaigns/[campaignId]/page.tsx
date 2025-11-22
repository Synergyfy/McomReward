'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/Loading';

export default function CampaignRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { campaignId } = params;

  useEffect(() => {
    if (campaignId) {
      router.replace(`/admin/campaigns/${campaignId}/overview`);
    }
  }, [router, campaignId]);

  return <LoadingSpinner />;
}
