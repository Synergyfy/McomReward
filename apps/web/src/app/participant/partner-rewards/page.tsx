'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Gift,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  HandCoins,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useClaimPartnerReward,
  useGetMyPartnerRewards,
} from '@/services/partner-rewards/hook';
import { PartnerReward, PartnerRewardStatus } from '@/services/partner-rewards/types';

const STATUS_STYLES: Record<PartnerRewardStatus, string> = {
  ISSUED: 'bg-orange-100 text-orange-700',
  REDEEMED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  REVOKED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
};

const formatValue = (reward: PartnerReward) => {
  if (reward.pointsAwarded) return `${reward.pointsAwarded} pts`;
  if (reward.value) return `${reward.value}`;
  return reward.rewardType ?? '—';
};

export default function PartnerRewardsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | PartnerRewardStatus>('ALL');

  const { data, isLoading, isError } = useGetMyPartnerRewards({
    page: 1,
    limit: 100,
  });
  const claimReward = useClaimPartnerReward();

  const rewards = data?.data ?? [];

  const filtered = useMemo(
    () => (filter === 'ALL' ? rewards : rewards.filter((r) => r.status === filter)),
    [rewards, filter],
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Reward code copied!', {
      icon: <Sparkles className="w-4 h-4 text-[#f54900]" />,
      className: 'rounded-2xl border-gray-200 bg-white text-gray-800',
    });
  };

  const handleClaim = (reward: PartnerReward) => {
    claimReward.mutate({ id: reward.id, code: reward.code ?? undefined });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 py-4 sm:py-8 px-2 sm:px-4 bg-[#f9fafb] text-gray-800 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border-b border-gray-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/participant')}
            className="text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Partner Rewards
            </h1>
            <p className="text-sm text-gray-500">
              Rewards earned on partner platforms (e.g. FundOrDonate) and delivered to your MCOM account.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'ISSUED', 'REDEEMED', 'EXPIRED'] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab)}
            className={filter === tab ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {isLoading && (
        <p className="text-center text-gray-500 py-12">Loading your rewards…</p>
      )}

      {isError && (
        <p className="text-center text-red-600 py-12">
          Could not load your partner rewards. Please try again later.
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Gift className="w-10 h-10 text-orange-400" />
            <p className="text-gray-600 font-medium">No partner rewards yet</p>
            <p className="text-sm text-gray-400">
              Rewards you earn on partner apps will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((reward) => (
          <Card key={reward.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {reward.rewardTitle ?? 'Reward'}
                </CardTitle>
                <CardDescription>
                  From {reward.issuerClientId}
                  {reward.externalRef ? ` • ${reward.externalRef}` : ''}
                </CardDescription>
              </div>
              <Badge className={STATUS_STYLES[reward.status]}>
                {reward.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Value</span>
                <span className="font-semibold text-gray-900">
                  {formatValue(reward)}
                </span>
              </div>

              {reward.expiresAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Expires {new Date(reward.expiresAt).toLocaleDateString()}
                </div>
              )}

              {reward.status === 'REDEEMED' && reward.code && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                  <span className="font-mono text-sm text-green-800">
                    {reward.code}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(reward.code!)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {reward.status === 'ISSUED' && (
                <Button
                  onClick={() => handleClaim(reward)}
                  disabled={claimReward.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <HandCoins className="w-4 h-4 mr-2" />
                  {claimReward.isPending ? 'Claiming…' : 'Claim reward'}
                </Button>
              )}

              {reward.status === 'REDEEMED' && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Claimed
                  {reward.redeemedAt
                    ? ` on ${new Date(reward.redeemedAt).toLocaleDateString()}`
                    : ''}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
