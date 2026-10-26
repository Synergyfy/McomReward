'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  ShieldCheck,
  Zap,
  Loader2,
  RefreshCw,
  Target,
  Award,
  Clock,
  ExternalLink,
  Eye,
  ListTodo,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlanCard from '@/components/business/subscription/PlanCard';
import PaymentModal from '@/components/business/subscription/PaymentModal';
import {
  McomPlan,
  useGetPurchasablePlans,
  useGetMyPackage,
  useSetAutoRenew,
} from '@/services/mcom-packages';
import { toast } from 'sonner';
import { enableLocalBusinessPreview } from '@/lib/local-business-preview';


export default function SubscriptionDashboardPage() {
  const [durationTab, setDurationTab] = useState<'STANDARD' | 'PRO' | 'PRO_PLUS'>('STANDARD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(McomPlan & { selectedVariantId?: string }) | null>(null);

  // LOCAL-FIRST: active plan comes from the Rewards DB via
  // GET /mcom/packages/my-package. MCOM Solutions Central is never
  // consulted for reads — purchase confirm + webhook write locally.
  const { data: plans, isLoading: isLoadingPlans, refetch: refetchPlans } = useGetPurchasablePlans();
  const { data: myPackage, isLoading: isLoadingMyPackage, refetch: refetchMyPackage } = useGetMyPackage();
  const { mutate: setAutoRenew, isPending: isUpdatingAutoRenew } = useSetAutoRenew();

  const handleChoosePlan = (plan: McomPlan, variant?: any) => {
    setSelectedPlan({
      ...plan,
      selectedVariantId: variant?.id,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = () => {
    handleCloseModal();
    refetchPlans();
    refetchMyPackage();
    toast.success('Subscription updated successfully!');
  };

  // Local membership truth (planVariant → plan/tierLevel, legacy tier fallback)
  const membership = myPackage?.membership;
  const currentPlanName =
    myPackage?.planName ||
    membership?.planVariant?.plan?.name ||
    membership?.tier?.name ||
    myPackage?.membershipTier ||
    'Free';
  const currentLevel = (
    myPackage?.membershipLevel ||
    membership?.planVariant?.tierLevel?.name ||
    'STANDARD'
  ).toUpperCase();

  const isExpired =
    myPackage?.isExpired ||
    membership?.status === 'expired' ||
    (membership?.expiresAt ? new Date(membership.expiresAt) < new Date() : false) ||
    (myPackage?.expiresAt ? new Date(myPackage.expiresAt) < new Date() : false);

  const isTrial = myPackage?.isTrial || membership?.isTrial || false;
  const isMembershipBundle =
    myPackage?.source === 'membership' ||
    myPackage?.accessType === 'PAID_MEMBERSHIP';
  const isTrialProgramme =
    myPackage?.accessType === 'TRIAL_PROGRAMME' || isTrial;
  // A Central access-pass bundle (or a locally bought pass) is the current
  // entitlement when no plan subscription backs the account.
  const accessPass = myPackage?.accessPass;
  const isAccessPass =
    myPackage?.accessType === 'ACCESS_PASS' ||
    (accessPass?.hasAccess === true && !isMembershipBundle && !isTrialProgramme);
  const trialTasks = myPackage?.trialTasks || [];
  const upgradeUrl =
    myPackage?.upgradeUrl || 'http://localhost:3010/dashboard/memberships';

  const expiresAtFormatted = React.useMemo(() => {
    const rawDate = membership?.expiresAt || myPackage?.expiresAt;
    if (!rawDate) return null;
    try {
      return new Date(rawDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [membership, myPackage]);

  const currentTierName = currentPlanName;
  // `planName` now includes the variant (e.g. "Gold Pro"), so don't repeat the
  // tier badge next to it and compare plan cards against the plan family.
  const levelSuffixPattern =
    currentLevel === 'PRO_PLUS'
      ? /pro\s*\+$/i
      : currentLevel === 'PRO'
        ? /\bpro$/i
        : /standard$/i;
  const nameIncludesLevel = levelSuffixPattern.test(currentTierName.trim());
  const currentPlanFamily = currentTierName
    .replace(/\s+(pro\s*\+|pro_plus|pro|standard)$/i, '')
    .trim();

  const mypackageBillingLabel = myPackage?.billingMethod
    ? ` via ${
        myPackage.billingMethod === 'wallet'
          ? 'MCOM Wallet'
          : myPackage.billingMethod === 'paypal'
            ? 'PayPal'
            : 'card'
      }`
    : '';

  /** A card is "current" only when plan AND billed variant match the local membership. */
  const isPlanCurrent = (plan: McomPlan) => {
    if (isExpired) return false;
    if ((currentPlanFamily || '').toLowerCase() !== (plan?.name || '').toLowerCase()) return false;
    return currentLevel === durationTab.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Subscription & Plan Management
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
              Manage your active plan, upgrade quotas, and process billing seamlessly in-app.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {myPackage?.planName && myPackage?.planName !== 'Free' && !isExpired && (
              <Button
                variant={myPackage?.autoRenew ? 'ghost' : 'default'}
                size="sm"
                disabled={isUpdatingAutoRenew}
                onClick={() =>
                  setAutoRenew(!myPackage?.autoRenew, {
                    onSuccess: () => {
                      refetchMyPackage();
                      toast.success(
                        myPackage?.autoRenew
                          ? 'Automatic renewal cancelled. Access remains until the period ends.'
                          : 'Automatic renewal resumed.',
                      );
                    },
                    onError: () =>
                      toast.error('Could not update automatic renewal.'),
                  })
                }
                className="gap-2"
              >
                {isUpdatingAutoRenew ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>
                  {myPackage?.autoRenew ? 'Cancel auto-renew' : 'Resume auto-renew'}
                </span>
              </Button>
            )}
            {process.env.NODE_ENV !== 'production' && (
              <div className="max-w-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (enableLocalBusinessPreview()) window.location.assign('/dashboard');
                  }}
                  className="gap-2 border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100"
                >
                  <Eye size={14} />
                  <span>Open local dashboard preview</span>
                </Button>
                <p className="mt-1 text-xs text-amber-800">UI preview only; no payment or entitlement is recorded.</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await api.get('/sso/entitlement');
                } catch {}
                refetchPlans();
                refetchMyPackage();
                toast.info('Refreshed subscription and entitlement status');
              }}
              className="gap-2 self-start sm:self-auto"
            >
              <RefreshCw size={14} />
              <span>Refresh Status</span>
            </Button>
          </div>
        </div>

        {/* Access pass short-term alternative */}
        <div className="bg-white border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <KeyRound size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Prefer short-term access?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Buy a one-off access pass or redeem a gift code — no recurring billing.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/access-pass"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-xs font-bold hover:bg-orange-100 whitespace-nowrap"
          >
            <KeyRound size={14} />
            View access passes
          </Link>
        </div>

        {/* Current Subscription Status Card */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-800 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Current Plan
                  </span>
                  {isExpired ? (
                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>Expired</span>
                    </span>
                  ) : isMembershipBundle ? (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>MCOM Membership Bundle</span>
                    </span>
                  ) : isAccessPass ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <KeyRound size={12} />
                      <span>Access Pass</span>
                    </span>
                  ) : isTrialProgramme ? (
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={12} />
                      <span>£1 Verified Trial</span>
                    </span>
                  ) : currentTierName === 'Free' ? (
                    <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Free Plan
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Active Subscription</span>
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black">
                  {currentTierName}
                  {currentTierName !== 'Free' && !isAccessPass && !nameIncludesLevel && (
                    <span className="text-orange-400 text-xl font-bold"> · {currentLevel}</span>
                  )}
                </h2>
                <p className="text-gray-300 text-xs max-w-xl">
                  {isExpired
                    ? 'Your subscription period has ended. Upgrade or renew to restore campaign creation, digital stamps, and customer analytics.'
                    : isMembershipBundle
                    ? `Included in your MCOM Central ${myPackage?.membershipTier || 'Global'} Membership. Quotas and renewals are automatically managed.`
                    : isAccessPass
                    ? `Your ${accessPass?.planName || 'access pass'} unlocks the full dashboard${expiresAtFormatted ? ` until ${expiresAtFormatted}` : ''}.`
                    : isTrialProgramme
                    ? 'You are active on a task-gated onboarding trial. Complete your required tasks to unlock ongoing ecosystem benefits.'
                    : currentTierName === 'Free'
                    ? 'You are on the free tier. Upgrade to unlock multiple campaigns, CRM tools, and point allowances.'
                    : 'Your business is fully unlocked with active ecosystem quotas and features.'}
                </p>
                {!isExpired && !isMembershipBundle && !isTrialProgramme && myPackage?.autoRenew && (
                  <p className="text-[11px] text-gray-400">
                    Auto-renews{mypackageBillingLabel} · Next charge{' '}
                    {myPackage?.nextBillingAt
                      ? new Date(myPackage.nextBillingAt).toLocaleDateString('en-GB')
                      : expiresAtFormatted || 'at period end'}
                  </p>
                )}
                {myPackage?.membershipStatus === 'past_due' && (
                  <p className="text-[11px] text-amber-300">
                    Renewal failed. Update your MCOM Wallet balance to keep access.
                  </p>
                )}
              </div>

              {expiresAtFormatted && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-lg text-orange-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      {isExpired ? 'Expired On' : isAccessPass ? 'Pass Expires' : isTrialProgramme ? 'Trial Ends' : 'Next Renewal'}
                    </p>
                    <p className="text-sm font-bold text-white">{expiresAtFormatted}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isMembershipBundle && (
            <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-t border-amber-500/20 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-amber-400 flex-shrink-0" size={18} />
                <span>
                  Plan <strong>{currentTierName}</strong> is bundled with your <strong>MCOM {myPackage?.membershipTier || 'Central'} Membership</strong>.
                </span>
              </div>
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap self-end sm:self-auto shadow-sm"
              >
                <span>Manage on MCOM Central</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {isAccessPass && (
            <div className="bg-emerald-50 border-t border-emerald-100 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <KeyRound className="text-emerald-600 flex-shrink-0" size={18} />
                <span>
                  Your <strong>{accessPass?.planName || 'Access Pass'}</strong> is active
                  {expiresAtFormatted ? ` until ${expiresAtFormatted}` : ''}.
                  {typeof accessPass?.daysRemaining === 'number' && accessPass.daysRemaining > 0
                    ? ` ${accessPass.daysRemaining} day${accessPass.daysRemaining === 1 ? '' : 's'} left.`
                    : ''}
                </span>
              </div>
              <Link
                href="/dashboard/access-pass"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap self-end sm:self-auto shadow-sm"
              >
                <span>View access pass</span>
                <KeyRound size={12} />
              </Link>
            </div>
          )}

          {isTrialProgramme && (
            <div className="bg-indigo-950/60 border-t border-indigo-500/25 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-indigo-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Clock className="text-indigo-400 flex-shrink-0" size={18} />
                <span>
                  Task-Gated Trial Active. Complete your required onboarding missions below to earn points and qualify for full activation.
                </span>
              </div>
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap self-end sm:self-auto shadow-sm"
              >
                <span>Upgrade to Full Plan</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-3.5 flex items-center gap-3 text-red-800 text-sm">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
              <span>
                <strong>Action Required:</strong> Choose a plan below to renew your access immediately with Card, PayPal, or MCOM Wallet.
              </span>
            </div>
          )}
        </Card>

        {/* Task-Gated Trial Onboarding Missions */}
        {isTrialProgramme && trialTasks.length > 0 && (
          <Card id="tasks" className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-b border-indigo-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      MCOM Task Engine
                    </span>
                    <span className="text-xs font-semibold text-indigo-700">
                      Required Onboarding Missions
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black text-gray-900">
                    Trial Progress & Reward Tasks
                  </CardTitle>
                  <p className="text-xs text-gray-600">
                    Complete these tasks assigned from MCOM Central during your trial to earn reward points and maintain your platform quotas.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto bg-white/90 backdrop-blur-sm border border-indigo-200/80 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-900 shadow-sm">
                  <ListTodo size={16} className="text-indigo-600" />
                  <span>
                    {trialTasks.filter(t => t.status === 'COMPLETED').length} / {trialTasks.length} Completed
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trialTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/50"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-gray-900">
                          {task.title}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md whitespace-nowrap ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : task.status === 'IN_PROGRESS'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60 font-medium">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span>Deadline: {task.deadlineDays}d</span>
                      </span>
                      <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                        +{task.rewardPoints} Pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Plan Upgrade Selector Section */}
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Available Subscription Plans
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Select the plan that fits your business scale. Change or cancel anytime.
            </p>

            {/* Duration Selector */}
            <div className="mt-4 w-full max-w-md mx-auto grid grid-cols-3 p-1.5 rounded-2xl bg-white shadow-sm border border-gray-200 gap-1">
              <button
                onClick={() => setDurationTab('STANDARD')}
                className={`py-2 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                  durationTab === 'STANDARD'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>Standard</span>
                <span className="text-[10px] font-medium opacity-80">(90d)</span>
              </button>
              <button
                onClick={() => setDurationTab('PRO')}
                className={`py-2 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                  durationTab === 'PRO'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Pro</span>
                  <span className="text-[10px] font-medium opacity-80">(180d)</span>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  durationTab === 'PRO' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  -15%
                </span>
              </button>
              <button
                onClick={() => setDurationTab('PRO_PLUS')}
                className={`py-2 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                  durationTab === 'PRO_PLUS'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Pro+</span>
                  <span className="text-[10px] font-medium opacity-80">(1yr)</span>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  durationTab === 'PRO_PLUS' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                }`}>
                  -25%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          {isLoadingPlans ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="text-sm font-medium">Loading ecosystem plans...</span>
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 max-w-md mx-auto p-6">
              <Zap className="h-10 w-10 text-orange-500 mx-auto mb-2" />
              <p className="font-bold text-gray-800">No Plans Configured</p>
              <p className="text-xs text-gray-500 mt-1">
                Please check back in a few minutes or contact support.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  durationTab={durationTab}
                  isCurrent={isPlanCurrent(plan)}
                  onChoosePlan={handleChoosePlan}
                />
              ))}
            </div>
          )}
        </div>

        {/* Security & Payment Methods Guarantee Footer */}
        <div className="pt-8 border-t border-gray-200 text-center space-y-3">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-green-600" />
              <span>Instant Entitlement Activation</span>
            </span>
            <span>•</span>
            <span>Supports Stripe Card, PayPal, and MCOM Centralized Wallet</span>
            <span>•</span>
            <span>Cancel or Switch Tiers Anytime</span>
          </div>
        </div>
      </div>

      {/* In-App Payment Checkout Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        initialBillingCycle={durationTab}
        onConfirm={handlePaymentSuccess}
      />
    </div>
  );
}
