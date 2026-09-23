'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Award,
  PlusCircle,
  Search,
  Bell,
  Building,
  DollarSign,
  Megaphone,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGrowthActivityChart, useSystemOverview, useTierBreakdown, useTopBusinesses } from '@/services/analytics/hook';
import { useGetNotifications } from '@/services/notifications/hook';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { data: topBusinesses, isLoading: isLoadingTopBusinesses, error: topBusinessesError } = useTopBusinesses();
  const { data: systemOverview, isLoading: isLoadingSystemOverview, error: systemOverviewError } = useSystemOverview();
  const { data: tierBreakdown, isLoading: isLoadingTierBreakdown, error: tierBreakdownError } = useTierBreakdown();
  const { data: growthData, isLoading: isLoadingGrowthData, error: growthDataError } = useGrowthActivityChart();

  // Notification hook
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useGetNotifications({ limit: 5 });

  const [globalSearch, setGlobalSearch] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[] | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  const chartData = React.useMemo(() => {
    if (!growthData) return [];
    return growthData.labels.map((label, index) => ({
      month: label,
      newRegistrations: growthData.registrations[index],
      activityCount: growthData.activities[index],
    }));
  }, [growthData]);


  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const api = (await import('@/services/api')).default;
      const { data } = await api.get('/admin/search', { params: { q } });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadReport = () => {
    const rows: string[][] = [
      ['Metric', 'Value'],
      ['Total Businesses', String(systemOverview?.totalBusiness ?? '')],
      ['Active Campaigns', String(systemOverview?.totalCampaigns ?? '')],
      ['Total Consumers', String(systemOverview?.totalParticipants ?? '')],
      ['Total Rewards Claimed', String(systemOverview?.totalRedemptions ?? '')],
      ['Matching Points Issued', String(systemOverview?.totalMatchingPoints ?? '')],
      [],
      ['Top Business', 'Points Earned', 'Points Redeemed'],
      ...(topBusinesses ?? []).map((b) => [b.name, String(b.totalPointsEarned), String(b.totalPointsRedeemed)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <form onSubmit={handleGlobalSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business, user, or campaign..."
              className="pl-8"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </form>
          <Button onClick={handleDownloadReport}>Download Report</Button>
        </div>
      </div>
      {(isSearching || searchResults) && (
        <Card>
          <CardHeader>
            <CardTitle>Search results{searchResults ? ` (${searchResults.length})` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <p className="text-sm text-muted-foreground">Searching…</p>
            ) : !searchResults || searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No results found.</p>
            ) : (
              <div className="space-y-2">
                {searchResults.slice(0, 10).map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.name || r.title || 'Untitled'}</span>
                    <Badge variant="secondary">{r.tag || 'result'}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearchResults(null); setGlobalSearch(''); }}>
              Clear
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalBusiness}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalCampaigns}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalParticipants.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Claimed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalRedemptions.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matching Points Issued</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSystemOverview ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : systemOverviewError ? (
              <p className="text-xs text-destructive">Failed to load</p>
            ) : (
              <div className="text-2xl font-bold">{systemOverview?.totalMatchingPoints.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consumer Growth and Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingGrowthData ? (
              <div className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : growthDataError ? (
              <div className="flex items-center justify-center h-[350px]">
                <p className="text-destructive">Failed to load chart data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newRegistrations" stroke="#ea580c" name="New Registrations" />
                  <Line type="monotone" dataKey="activityCount" stroke="#64748b" strokeDasharray="3 3" name="Activity Count" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Side Cards */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link href="/admin/rewards">
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />New Reward</Button>
              </Link>
              <Link href="/admin/campaigns/list">
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />New Campaign</Button>
              </Link>
              <Link href="/admin/sectors">
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Add Sector</Button>
              </Link>
              <Link href="/admin/users/business">
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Add Business</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : notificationsError ? (
                <p className="text-xs text-destructive text-center">Failed to load notifications</p>
              ) : !notificationsData?.data.length ? (
                <p className="text-sm text-muted-foreground text-center">No new notifications</p>
              ) : (
                notificationsData.data.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <Bell className={`h-5 w-5 mt-1 ${notification.isRead ? 'text-gray-300' : 'text-blue-500'}`} />
                    <div className="flex-1">
                      <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Performing Businesses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTopBusinesses ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : topBusinessesError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-destructive">Failed to load top businesses</p>
              </div>
            ) : topBusinesses && topBusinesses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Points Issued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell>{business.totalPointsRedeemed.toLocaleString()}</TableCell>
                      <TableCell>{business.totalPointsEarned.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No businesses found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Tier Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Business Tier Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingTierBreakdown ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tierBreakdownError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-destructive">Failed to load tier breakdown</p>
              </div>
            ) : tierBreakdown && tierBreakdown.length > 0 ? (
              tierBreakdown.map((tier) => (
                <div key={tier.id} className="flex justify-between items-center">
                  <span className="font-medium capitalize">{tier.name}</span>
                  <Badge variant={tier.name.toLowerCase() === 'partner' ? 'default' : 'secondary'}>
                    {tier.businessCount}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No tier data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
