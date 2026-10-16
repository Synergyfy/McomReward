'use client';

import React from 'react';
import { ScanLine, PoundSterling, Users, Eye, Pencil, Trash2, MoreVertical, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useGetPartnerNetwork } from '@/services/partner-network/hook';

const StatCard = ({ title, value, icon: Icon, details }: { title: string, value: string | number, icon: React.ElementType, details?: string }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {details && <p className="text-xs text-gray-400">{details}</p>}
        </div>
        <div className="bg-orange-100 text-orange-500 p-3 rounded-full">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

export default function PartnerNetworkPage() {
    const { data, isLoading, isError } = useGetPartnerNetwork();
    const overview = data?.groupOverview;
    const partners = data?.partners ?? [];

    if (isLoading) {
        return <p className="p-4 text-sm text-gray-500">Loading partner network…</p>;
    }
    if (isError || !overview) {
        return <p className="p-4 text-sm text-red-600">Could not load partner network. Please try again.</p>;
    }

    return (
        <div className="space-y-8">
            {/* Group Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Group Name" value={overview.name} icon={Users} />
                <StatCard title="Total Members" value={overview.members} icon={Users} />
                <StatCard title="Total Scans" value={overview.totalScans.toLocaleString()} icon={ScanLine} />
                <StatCard title="Revenue Split" value={overview.revenueSplit || '—'} icon={PoundSterling} />
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Partner
                </Button>
            </div>

            {/* Partner List */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                        <tr>
                            <th className="p-4">Business Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Commission %</th>
                            <th className="p-4">Scans</th>
                            <th className="p-4">Redemptions</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.length === 0 ? (
                            <tr><td className="p-4 text-sm text-gray-500" colSpan={8}>No partners yet. Invite your first partner to grow your network.</td></tr>
                        ) : partners.map((partner) => (
                            <tr key={partner.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{partner.name}</td>
                                <td className="p-4">{partner.role}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        partner.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        partner.status === 'Invited' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {partner.status}
                                    </span>
                                </td>
                                <td className="p-4">{partner.joined ? new Date(partner.joined).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-4">{partner.commission}%</td>
                                <td className="p-4">{partner.scans.toLocaleString()}</td>
                                <td className="p-4">{partner.redemptions.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Plaques ({partner.plaques})</DropdownMenuItem>
                                            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit Commission</DropdownMenuItem>
                                            <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Remove from Group</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
