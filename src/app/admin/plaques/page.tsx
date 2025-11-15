'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPlaquesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/plaques/list');
  }, [router]);

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <h1 className="text-3xl font-bold text-gray-900">Plaque Management</h1>
      <p className="text-gray-600 mt-1">Redirecting to Plaque List...</p>
    </div>
  );
}
