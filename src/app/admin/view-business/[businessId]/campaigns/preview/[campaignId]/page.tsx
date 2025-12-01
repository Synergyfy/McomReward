
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CampaignPreviewRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { businessId, campaignId } = params; // Extract businessId

  useEffect(() => {
    router.replace(`/admin/view-business/${businessId}/campaigns/preview/${campaignId}/overview`);
  }, [router, businessId, campaignId]);

  return null;
}
