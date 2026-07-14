'use client';

import React from 'react';
import { useGetBusinessProfile } from '@/services/business/hook';
import { Loader2 } from 'lucide-react';
import SuperBusinessView from '@/components/dashboard/matching-points/SuperBusinessView';
import RegularBusinessView from '@/components/dashboard/matching-points/RegularBusinessView';

export default function MatchingPointsPage() {
  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Super Business View
  if (profile?.isSuperBusiness) {
    return <SuperBusinessView />;
  }

  // Regular Business View
  return <RegularBusinessView />;
}
