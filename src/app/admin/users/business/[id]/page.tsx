'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useAdminBusinessById,
} from '@/services/admin/hook';
import { AdminBusinessDetails } from '@/services/admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

import BusinessSidebar from '@/components/dashboard/sidebar/index';
import BusinessHeader from '@/components/dashboard/header';

import { StatCard } from '@/components/ui/StatCard';
import { Subscription } from '@/services/tiers/types';

interface BusinessProfileType {
  id: string;
  name: string;
  email: string;
  role?: string;
  // tier is not directly in AdminBusinessDetails, so we'll handle it separately
}

interface MonthlyBalanceType {
  remaining?: number;
  monthlyLimit?: number;
  used?: number;
}

interface Campaign {
  name: string;
  status: string;
  totalParticipants: number;
}

interface Reward {
  name: string;
  pointsRequired: number;
  totalRedeemed: number;
  // Assuming totalRedeemed is a number here for consistency
}

function ImpersonationDataTable<T>({ title, data, columns }: { title: string, data: T[], columns: { key: keyof T, label: string }[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-500">No data available.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => <th key={col.key as string} className="px-4 py-2">{col.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="border-b">
                                {columns.map(col => <td key={col.key as string} className="px-4 py-2">{String(item[col.key]) ?? 'N/A'}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default function AdminBusinessImpersonationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin-specific hook to fetch business details
  const { data: businessDetails, isLoading: isDetailsLoading, error: detailsError } = useAdminBusinessById(id);

  // Data for campaigns and rewards are currently null as dedicated hooks don't exist
  const campaignsData = null; 
  const rewardsData = null;
  const monthlyBalanceData = null; // No direct hook for this yet
  const subscriptionData = null; // No direct hook for this yet

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isLoading = isDetailsLoading;
  const isError = detailsError;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading Business Dashboard...</p>
      </div>
    );
  }

  if (isError || !businessDetails) {
      return (
          <div className="p-8">
              <div className="text-red-500 mb-4">Error loading business data or business user not found.</div>
              <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Business List
              </Button>
          </div>
      );
  }
  
  const impersonatedProfile: BusinessProfileType = {
      id: businessDetails.id,
      name: businessDetails.name,
      email: businessDetails.email,
      role: businessDetails.role || 'business',
  };

  const impersonatedSubscription: Partial<Subscription> = {
      tier: { name: 'N/A' } as any // AdminBusinessDetails does not directly contain a 'tier' property
  };

  const impersonatedMonthlyBalance: MonthlyBalanceType = {
      remaining: businessDetails.remainingPointBalance,
      monthlyLimit: undefined,
      used: businessDetails.total_points_redeemed,
  };


  const campaigns: Campaign[] = [];
  const rewards: Reward[] = [];
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-100">
        <div className="relative min-h-screen md:flex">

            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar}></div>
            )}

            <BusinessSidebar
                isOpen={isSidebarOpen}
                profile={impersonatedProfile}
                isLoading={isLoading}
            />

            <div className="flex-1 md:ml-64 transition-all duration-300">

                <BusinessHeader
                    onMenuClick={toggleSidebar}
                    profile={impersonatedProfile}
                    subscription={impersonatedSubscription}
                    monthlyBalance={impersonatedMonthlyBalance}
                    isLoading={isLoading}
                />

                <main className="p-4 sm:p-6 md:p-10">
                    <div className="mb-6 flex items-center justify-between p-4 rounded-lg bg-yellow-100 border border-yellow-300">
                         <div>
                            <h3 className="font-bold text-yellow-800">Impersonation Mode</h3>
                            <p className="text-sm text-yellow-700">You are viewing the dashboard as <span className="font-semibold">{businessDetails.name}</span>.</p>
                         </div>
                         <Button variant="outline" onClick={() => router.push('/admin/users/business')} className="bg-white hover:bg-gray-50 border-yellow-400 text-yellow-800">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Exit User View
                         </Button>
                    </div>

                    <div className="space-y-8">
                        {/* Business Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard title="Business Name" value={businessDetails.name ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Role" value={businessDetails.role ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Is Disabled" value={businessDetails.isDisabled ? 'Yes' : 'No'} isLoading={isLoading} />
                                    <StatCard title="Member Since" value={new Date(businessDetails.created_at).toLocaleDateString() ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Unique Code" value={businessDetails.uniqueCode ?? 'N/A'} isLoading={isLoading} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard title="Email" value={businessDetails.email ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Phone" value={businessDetails.phone ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Website" value={businessDetails.website ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Address" value={businessDetails.address ?? 'N/A'} isLoading={isLoading} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Classification */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Classification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard title="Sector" value={businessDetails.sector?.name ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="Category" value={businessDetails.category?.name ?? 'N/A'} isLoading={isLoading} />
                                    <StatCard title="SubCategory" value={businessDetails.subCategory?.name ?? 'N/A'} isLoading={isLoading} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Points & Financials */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Points & Financials</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard title="Points Balance" value={businessDetails.remainingPointBalance?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Total Points Earned" value={businessDetails.total_points_earned?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Total Points Redeemed" value={businessDetails.total_points_redeemed?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Extra Points" value={businessDetails.extraPoints?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Reputation Points" value={businessDetails.reputation_points?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Stripe Customer ID" value={businessDetails.stripe_customer_id ?? 'N/A'} isLoading={isLoading} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Campaigns & Rewards (still N/A for now without dedicated hooks) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaigns & Rewards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard title="Campaigns Created" value={'N/A'} isLoading={isLoading} />
                                    <StatCard title="Rewards Attached" value={businessDetails.total_points_redeemed?.toString() ?? '0'} isLoading={isLoading} /> {/* Re-using as proxy */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Referral Program */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Referral Program</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard title="Referral Capacity" value={businessDetails.referralCapacity?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Referral Points" value={businessDetails.referralPoints?.toString() ?? '0'} isLoading={isLoading} />
                                    <StatCard title="Affiliate Code" value={businessDetails.affiliateCode ?? 'N/A'} isLoading={isLoading} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media (If needed, can be another Card) */}
                        {businessDetails.socialMedia && Object.keys(businessDetails.socialMedia).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Social Media</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(businessDetails.socialMedia).map(([platform, url]) => (
                                            <StatCard key={platform} title={platform} value={url} isLoading={isLoading} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* Remaining data tables */}
                        <ImpersonationDataTable
                            title="Recent Campaigns"
                            data={campaigns}
                            columns={[
                                { key: 'name', label: 'Name' },
                                { key: 'status', label: 'Status' },
                                { key: 'totalParticipants', label: 'Participants' }
                            ]}
                        />

                        <ImpersonationDataTable
                            title="Recent Rewards"
                            data={rewards}
                            columns={[
                                { key: 'name', label: 'Name' },
                                { key: 'pointsRequired', label: 'Points' },
                                { key: 'totalRedeemed', label: 'Redeemed' }
                            ]}
                        />
                    </div>
                </main>
            </div>
        </div>
    </div>
  );
}