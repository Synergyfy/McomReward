'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users/business');
  }, [router]);

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      <p className="text-gray-600 mt-1">Redirecting to Business Owners...</p>
    </div>
  );
}
