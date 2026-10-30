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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Gift,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  HandCoins,
  Store,
  ExternalLink,
  ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useClaimPartnerReward,
  useGetMyPartnerRewards,
  useGetPartnerRewardMallTargets,
} from '@/services/partner-rewards/hook';
import {
  PartnerMallTargets,
  PartnerReward,
  PartnerRewardStatus,
} from '@/services/partner-rewards/types';
import { mallIntegrationService } from '@/services/mall-integration';

const STATUS_STYLES: Record<PartnerRewardStatus, string> = {
  ISSUED: 'bg-orange-100 text-orange-700',
  RESERVED: 'bg-blue-100 text-blue-700',
  REDEEMED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  REVOKED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
};

const getMallTargets = (reward: PartnerReward): PartnerMallTargets | null => {
  const targets = (reward.metadata as any)?.mallTargets as
    | PartnerMallTargets
    | undefined;
  if (!targets || !targets.discountValue || !targets.discountType) return null;
  return targets;
};

const formatDiscount = (targets: PartnerMallTargets) =>
  targets.discountType === 'percentage'
    ? `${targets.discountValue}% off`
    : `£${Number(targets.discountValue).toFixed(2)} off`;

const formatValue = (reward: PartnerReward) => {
  if (reward.pointsAwarded) return `${reward.pointsAwarded} pts`;
  if (reward.value) return `${reward.value}`;
  return reward.rewardType ?? '—';
};

interface PartnerRewardsViewProps {
  /** Where the back arrow navigates to (participant or business dashboard). */
  backHref: string;
}

export default function PartnerRewardsView({
  backHref,
}: PartnerRewardsViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | PartnerRewardStatus>('ALL');

  const { data, isLoading, isError } = useGetMyPartnerRewards({
    page: 1,
    limit: 100,
  });
  const claimReward = useClaimPartnerReward();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [targetsRewardId, setTargetsRewardId] = useState<string | null>(null);
  const {
    data: targetDetails,
    isLoading: targetsLoading,
    isError: targetsError,
  } = useGetPartnerRewardMallTargets(targetsRewardId);

  const handleGoToMall = async () => {
    try {
      setIsRedirecting(true);
      const { redirectUrl } = await mallIntegrationService.getSsoUrl();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('SSO Error:', error);
      toast.error('Failed to connect to MCOM Mall');
    } finally {
      setIsRedirecting(false);
    }
  };

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
            onClick={() => router.push(backHref)}
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
        {(['ALL', 'ISSUED', 'RESERVED', 'REDEEMED', 'EXPIRED'] as const).map((tab) => (
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
        {filtered.map((reward) => {
          const mallTargets = getMallTargets(reward);
          const rewardCode = reward.fulfilmentCode || reward.code;
          return (
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

              {rewardCode && (
                <div className="space-y-2 rounded-lg bg-green-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-green-800">
                      {rewardCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(rewardCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {reward.deepLink && (
                    <a
                      href={reward.deepLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Use this reward
                    </a>
                  )}
                </div>
              )}

              {reward.fulfilmentStatus === 'PENDING_IDENTITY' && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  We could not link this reward to your MCOM account yet. Please
                  contact support so we can deliver it.
                </p>
              )}

              {reward.status === 'ISSUED' && !mallTargets && !rewardCode && (
                <Button
                  onClick={() => handleClaim(reward)}
                  disabled={claimReward.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <HandCoins className="w-4 h-4 mr-2" />
                  {claimReward.isPending ? 'Claiming…' : 'Claim reward'}
                </Button>
              )}

              {mallTargets && reward.status === 'ISSUED' && (
                <div className="space-y-3 rounded-lg border border-orange-100 bg-orange-50/60 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                    <Store className="w-4 h-4" />
                    <span>
                      {formatDiscount(mallTargets)}
                      {mallTargets.scope === 'ALL'
                        ? ' at this business in MCOM Mall'
                        : ' on selected items in MCOM Mall'}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700/80">
                    This discount is applied automatically at MCOM Mall checkout.
                  </p>
                  {mallTargets.scope === 'SPECIFIC' && (
                    <Button
                      variant="outline"
                      className="w-full border-orange-200 bg-white text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                      onClick={() => setTargetsRewardId(reward.id)}
                    >
                      <ListChecks className="w-4 h-4 mr-2" />
                      See selected items
                    </Button>
                  )}
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handleGoToMall}
                    disabled={isRedirecting}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Shop in MCOM Mall
                  </Button>
                </div>
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
          );
        })}
      </div>

      <Dialog
        open={!!targetsRewardId}
        onOpenChange={(open) => {
          if (!open) setTargetsRewardId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Selected items</DialogTitle>
            <DialogDescription>
              This discount applies only to the following items in MCOM Mall.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
            {targetsLoading && (
              <p className="py-6 text-center text-sm text-gray-500">
                Loading selected items…
              </p>
            )}

            {targetsError && (
              <p className="py-6 text-center text-sm text-red-600">
                Could not load the selected items. The discount will still be
                applied automatically at checkout.
              </p>
            )}

            {!targetsLoading && !targetsError && targetDetails && (
              <>
                {targetDetails.business?.name && (
                  <p className="text-sm text-gray-500">
                    {targetDetails.business.name}
                  </p>
                )}

                {targetDetails.products.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Products
                    </h4>
                    {targetDetails.products.map((product) => {
                      const price = product.salePrice ?? product.price;
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <span className="text-sm font-medium text-gray-800">
                            {product.title}
                          </span>
                          {price != null && (
                            <span className="shrink-0 text-sm text-gray-500">
                              £{Number(price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {targetDetails.services.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Services
                    </h4>
                    {targetDetails.services.map((service) => {
                      const price = service.fixedPrice ?? service.basePrice;
                      return (
                        <div
                          key={service.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <span className="text-sm font-medium text-gray-800">
                            {service.name}
                          </span>
                          {price != null && (
                            <span className="shrink-0 text-sm text-gray-500">
                              {service.fixedPrice == null ? 'from ' : ''}£{Number(price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {targetDetails.products.length === 0 &&
                  targetDetails.services.length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-500">
                      The selected item names aren’t available right now, but
                      the discount will still be applied automatically at
                      checkout.
                    </p>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
