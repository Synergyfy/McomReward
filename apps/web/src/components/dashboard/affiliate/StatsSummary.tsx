import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Star } from 'lucide-react';
import { AffiliateStats } from '@/services/affiliate/types';

interface StatsSummaryProps {
  stats: AffiliateStats;
}

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold">Statistics</h2>
        <StatCard 
            title="Total Invites" 
            value={stats.totalInvites} 
            icon={<Users className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
            title="Successful Referrals" 
            value={stats.totalSuccessfulReferrals} 
            icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
            title="Points Earned" 
            value={stats.totalPointsEarned.toLocaleString()} 
            icon={<Star className="h-4 w-4 text-muted-foreground" />} 
        />
    </div>
  );
}
