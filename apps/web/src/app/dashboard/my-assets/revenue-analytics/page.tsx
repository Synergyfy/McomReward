'use client';

import React from 'react';
import { PoundSterling, Users, Clock, CircleDollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

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

const revenueData = {
    overview: {
        plaqueSales: 4500,
        offerRedemptions: 1250,
        commissions: 850,
        pendingPayouts: 2300,
    },
    earningsChart: [
        { name: 'Jan', earnings: 1200 },
        { name: 'Feb', earnings: 1800 },
        { name: 'Mar', earnings: 1500 },
        { name: 'Apr', earnings: 2100 },
        { name: 'May', earnings: 1900 },
        { name: 'Jun', earnings: 2300 },
    ],
    transactions: [
        { id: 'txn-001', date: '2025-10-28', type: 'Plaque Sale', amount: 25.00, status: 'Completed' },
        { id: 'txn-002', date: '2025-10-27', type: 'Offer Redemption', amount: 5.50, status: 'Completed' },
        { id: 'txn-003', date: '2025-10-26', type: 'Commission', amount: 2.50, status: 'Completed' },
        { id: 'txn-004', date: '2025-10-25', type: 'Payout', amount: -500.00, status: 'Pending' },
        { id: 'txn-005', date: '2025-10-24', type: 'Plaque Sale', amount: 25.00, status: 'Completed' },
    ]
};

export default function RevenueAnalyticsPage() {
    return (
        <div className="space-y-8">
            {/* Earnings Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Plaque Sales" value={`£${revenueData.overview.plaqueSales.toLocaleString()}`} icon={PoundSterling} />
                <StatCard title="Offer Redemptions" value={`£${revenueData.overview.offerRedemptions.toLocaleString()}`} icon={CircleDollarSign} />
                <StatCard title="Commissions Earned" value={`£${revenueData.overview.commissions.toLocaleString()}`} icon={Users} />
                <StatCard title="Pending Payouts" value={`£${revenueData.overview.pendingPayouts.toLocaleString()}`} icon={Clock} />
            </div>

            {/* Payout Action */}
            <div className="flex justify-end">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Request Payout
                </Button>
            </div>

            {/* Earnings Graph */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData.earningsChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `£${value}`} />
                        <Legend />
                        <Bar dataKey="earnings" fill="#fb923c" name="Monthly Earnings" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Transaction List */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold p-4">Transaction History</h3>
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenueData.transactions.map((txn) => (
                            <tr key={txn.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{new Date(txn.date).toLocaleDateString()}</td>
                                <td className="p-4">{txn.type}</td>
                                <td className={`p-4 font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {txn.amount > 0 ? `+£${txn.amount.toFixed(2)}` : `-£${Math.abs(txn.amount).toFixed(2)}`}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        txn.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {txn.status}
                                    </span>
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
