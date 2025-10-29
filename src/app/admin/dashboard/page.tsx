'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data for recent transactions (reusing from points-log for consistency)
const mockRecentTransactions = [
  { id: '1', timestamp: '2025-10-26T10:00:00Z', description: 'Joined Summer Bonanza', type: 'earned', points: 100, customer: { name: 'Alice Johnson', email: 'alice@example.com' } },
  { id: '2', timestamp: '2025-10-25T14:30:00Z', description: 'Redeemed: Free Coffee', type: 'spent', points: 50, customer: { name: 'Bob Williams', email: 'bob@example.com' } },
  { id: '7', timestamp: '2025-10-25T11:00:00Z', description: 'Purchase at Burger Queen', type: 'purchase', points: 75, customer: { name: 'Alice Johnson', email: 'alice@example.com' } },
  { id: '3', timestamp: '2025-10-24T09:00:00Z', description: 'Joined Winter Wonderland', type: 'earned', points: 150, customer: { name: 'Charlie Brown', email: 'charlie@example.com' } },
  { id: '8', timestamp: '2025-10-23T20:00:00Z', description: 'Referral bonus', type: 'referral_bonus', points: 100, customer: { name: 'David Davis', email: 'david@example.com' } },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your platform&apos;s activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£56,789</div>
            <p className="text-xs text-green-500">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Recent Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">582</div>
            <p className="text-xs text-green-500">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Point Velocity (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-green-500">
                <ArrowUpCircle className="h-5 w-5 mr-2"/>
                <span className="text-xl font-bold">+1,250</span>
            </div>
            <div className="flex items-center text-red-500 mt-2">
                <ArrowDownCircle className="h-5 w-5 mr-2"/>
                <span className="text-xl font-bold">-350</span>
            </div>
            <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold">Recent Transactions:</h3>
                <ul className="text-xs text-muted-foreground">
                    {mockRecentTransactions.slice(0, 5).map(tx => (
                        <li key={tx.id} className="flex justify-between items-center">
                            <span>{tx.description}</span>
                            <span className={tx.type === 'spent' ? 'text-red-500' : 'text-green-500'}>
                                {tx.type === 'spent' ? '-' : '+'}{tx.points}
                            </span>
                        </li>
                    ))}
                </ul>
                <Link href="/admin/points-log" className="text-sm text-orange-600 hover:underline block mt-2">
                    View all transactions
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for more advanced charts or tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Sign-ups</CardTitle>
          </CardHeader>
          <CardContent>
            {/* You can add a table of recent users here */}
            <p className="text-sm text-muted-foreground">A table of recent user sign-ups will be displayed here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {/* You can add a chart here */}
            <p className="text-sm text-muted-foreground">A chart showing sales trends will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
