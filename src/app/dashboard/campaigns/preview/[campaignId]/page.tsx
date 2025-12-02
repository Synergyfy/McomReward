
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CampaignPreviewRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { campaignId } = params;

  useEffect(() => {
    router.replace(`/dashboard/campaigns/preview/${campaignId}/overview`);
  }, [router, campaignId]);

  return null;
}
