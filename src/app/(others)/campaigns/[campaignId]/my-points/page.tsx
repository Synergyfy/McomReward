'use client';

import React, { useState, useEffect, use } from 'react';
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
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import { useRouter } from 'next/navigation';
import { useGetParticipantBalance, useCheckCampaignJoinStatus, useGetParticipantHistory } from '@/services/customer-campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';



interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default function MyPointsPage({ params }: PageProps) {
  const { campaignId } = use(params);
  const { isCampaignJoined } = useCampaignMembership();
  const { data: joinStatus, isLoading: isStatusLoading } = useCheckCampaignJoinStatus(campaignId);
  const { data: balance } = useGetParticipantBalance(campaignId);
  const { data: historyData } = useGetParticipantHistory(campaignId);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();

  const isMember = !!joinStatus?.isJoined;
  const isAuthenticated = !!Cookies.get('access');

  const pointBalance = balance?.balance || 0;

  useEffect(() => {
    if (!isMember) {
      setIsAuthDialogOpen(true);
    }
  }, [isMember]);

  const handleLogin = () => {
    router.push(`/login?campaignId=${campaignId}&redirect=/campaigns/${campaignId}/my-points`);
  };

  const handleSignUp = () => {
    router.push(`/signup?campaignId=${campaignId}&type=customer`);
  };

  const handleDialogClose = (open: boolean) => {
    setIsAuthDialogOpen(open);
    if (!open && !isMember) {
      router.push(`/campaigns/${campaignId}`);
    }
  };

  if (isStatusLoading) {
    return <LoadingSpinner />;
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">View Your Points</h2>
          <p className="text-lg text-gray-600 mb-8">
            Please log in or create an account to view your points balance and transaction history for this campaign.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} className="px-8 py-6 text-lg bg-orange-600 hover:bg-orange-700">
              Log In
            </Button>
            <Button onClick={handleSignUp} variant="outline" className="px-8 py-6 text-lg border-gray-300">
              Sign Up
            </Button>
          </div>
        </div>

        <Dialog open={isAuthDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Points & History</DialogTitle>
              <DialogDescription className="text-base">
                Login or sign up to see your points and activity.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-6">
              <Button onClick={handleLogin} className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700">
                Log In
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              <Button onClick={handleSignUp} variant="outline" className="w-full py-6 text-lg border-gray-300">
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
                    {historyData?.data?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.type === 'EARN' ? 'Earned Points' : 'Redeemed Reward'}
                        </TableCell>
                        <TableCell>
                          {transaction.description || (transaction.type === 'EARN' ? transaction.business?.name : transaction.reward?.title)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'EARN' ? '+' : '-'}{transaction.points}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!historyData?.data || historyData.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          No transaction history found.
                        </TableCell>
                      </TableRow>
                    )}
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
