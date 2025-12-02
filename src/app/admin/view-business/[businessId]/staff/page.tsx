"use client";
import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGetAllStaff, useDeleteStaff } from '@/services/staff/hook';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

const AllStaffPage = () => {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;

  const { data: staff, isLoading, isError, error } = useGetAllStaff(businessId);
  const { mutate: deleteStaff } = useDeleteStaff(businessId);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      deleteStaff(id, {
        onSuccess: () => {
          alert('Staff member deleted successfully');
        },
        onError: (error) => {
          alert(`Error deleting staff: ${error.message}`);
        }
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching staff: {error.message}</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Staff</h1>
        <Link href={`/admin/view-business/${businessId}/staff/add`}>
          <p className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
            Add Staff
          </p>
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff?.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.avatar ? (
                    <Image
                      src={s.avatar}
                      alt={s.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.email}</td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-4">
                  <button
                    onClick={() => router.push(`/admin/view-business/${businessId}/staff/edit/${s.id}`)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllStaffPage;
