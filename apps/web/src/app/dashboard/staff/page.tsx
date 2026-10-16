"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetAllStaff, useDeleteStaff } from '@/services/staff/hook';
import { Pencil, Trash2, Plus, Users, Search, Mail, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const AllStaffPage = () => {
  const router = useRouter();
  const { data: staff, isLoading, isError, error } = useGetAllStaff();
  const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    if (!searchTerm.trim()) return staff;
    const q = searchTerm.toLowerCase();
    return staff.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [staff, searchTerm]);

  const handleDelete = (id: string, name?: string) => {
    deleteStaff(id, {
      onSuccess: () => {
        toast.success(`Staff member ${name || ''} deleted successfully`);
        setStaffToDelete(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || 'Error deleting staff');
        setStaffToDelete(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 p-6 text-center">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Failed to load staff</h2>
          <p className="text-sm text-gray-500 mt-1">{error?.message || 'An error occurred'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 shrink-0">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Staff</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                Manage team members, roles, and branch permissions.
              </p>
            </div>
          </div>
          <Link href="/dashboard/staff/add" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 h-10 text-sm font-semibold rounded-xl">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-11 bg-white shadow-sm border-gray-200 rounded-xl text-sm"
          />
        </div>

        {/* Empty State */}
        {filteredStaff.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-2xl bg-white p-8 text-center max-w-md mx-auto">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No staff members found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              {searchTerm ? 'No results matched your search term.' : 'Add your first staff member to get started.'}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/staff/add">
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Add Staff Member
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <>
            {/* Mobile View: Clean Touch Cards (block md:hidden) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredStaff.map((s) => (
                <Card key={s.id} className="border-0 shadow-sm rounded-xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {s.avatar ? (
                        <Image
                          src={s.avatar}
                          alt={s.name || 'Staff avatar'}
                          width={44}
                          height={44}
                          className="rounded-full object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold text-base shrink-0">
                          {s.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="truncate">{s.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/dashboard/staff/edit/${s.id}`)}
                        className="h-8 w-8 text-orange-600 border-orange-200 hover:bg-orange-50 rounded-lg"
                        title="Edit Staff"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isDeleting && staffToDelete === s.id}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${s.name}?`)) {
                            setStaffToDelete(s.id);
                            handleDelete(s.id, s.name);
                          }
                        }}
                        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                        title="Delete Staff"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop View: Styled Responsive Table (hidden md:block) */}
            <div className="hidden md:block bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <Image
                              src={s.avatar}
                              alt={s.name || 'Staff avatar'}
                              width={40}
                              height={40}
                              className="rounded-full object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm">
                              {s.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                          )}
                          <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {s.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/staff/edit/${s.id}`)}
                            className="h-8 w-8 text-orange-600 border-orange-200 hover:bg-orange-50 rounded-lg"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={isDeleting && staffToDelete === s.id}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${s.name}?`)) {
                                setStaffToDelete(s.id);
                                handleDelete(s.id, s.name);
                              }
                            }}
                            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllStaffPage;
