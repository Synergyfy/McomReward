'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pointBalance = 1250;

const transactionHistory = [
  {
    id: '1',
    action: 'Earned Points',
    details: 'Purchase at Mcom Store',
    points: '+',
    date: '2025-10-28',
  },
  {
    id: '2',
    action: 'Redeemed Reward',
    details: 'Free Coffee',
    points: '-',
    date: '2025-10-25',
  },
  {
    id: '3',
    action: 'Earned Points',
    details: 'Completed a survey',
    points: '+',
    date: '2025-10-22',
  },
  {
    id: '4',
    action: 'Earned Points',
    details: 'Referred a friend',
    points: '+',
    date: '2025-10-19',
  },
];

export default function MyPointsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            My Points
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            View your current point balance and transaction history.
          </p>
        </div>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="balance">
            <Card>
              <CardHeader>
                <CardTitle>Your Current Balance</CardTitle>
                <CardDescription>
                  This is the total number of points you have available to spend.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-6xl font-bold text-orange-600">{pointBalance}</p>
                <p className="text-2xl text-gray-600">Points</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  A record of your points earned and spent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionHistory.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.action}</TableCell>
                        <TableCell>{transaction.details}</TableCell>
                        <TableCell className={`text-right font-bold ${transaction.points.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points}
                        </TableCell>
                        <TableCell className="text-right">{transaction.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
