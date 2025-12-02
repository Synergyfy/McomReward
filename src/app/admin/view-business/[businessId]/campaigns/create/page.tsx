'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;

  useEffect(() => {
    toast.error('Creating campaigns is not allowed in admin impersonation mode.');
    router.replace(`/admin/view-business/${businessId}/campaigns/list`);
  }, [router, businessId]);

  return null; // This page will redirect immediately
}