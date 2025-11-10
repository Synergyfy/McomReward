'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import { Deal } from '@/lib/mock-data/deals';
import { Eye, CheckCircle, Percent } from 'lucide-react';

interface DealStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
}

export default function DealStatsModal({ isOpen, onClose, deal }: DealStatsModalProps) {
  if (!deal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Statistics for: {deal.title}</DialogTitle>
          <DialogDescription>
            An overview of how your deal is performing.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Views" value={deal.stats.views.toLocaleString()} icon={<Eye className="text-blue-500" />} />
          <StatCard title="Total Claims" value={deal.stats.claims.toLocaleString()} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title="Conversion Rate" value={`${deal.stats.conversionRate}%`} icon={<Percent className="text-purple-500" />} />
        </div>
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Daily Claims (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deal.stats.dailyClaims}>
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="claims" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
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
