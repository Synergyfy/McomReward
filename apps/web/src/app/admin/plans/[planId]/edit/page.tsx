'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PlanForm } from '@/components/admin/plans/PlanForm';
import { useGetAdminPlan, useUpdatePlan } from '@/services/admin/plans';

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();
  const planId = params?.planId;

  const { data: plan, isLoading, error } = useGetAdminPlan(planId);
  const { mutateAsync: updatePlan, isPending } = useUpdatePlan();

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading plan...</span>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Link
          href="/admin/plans"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to plans
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold">Unable to load this plan</p>
            <p className="text-xs mt-1">
              The plan may have been deleted or the API is unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlanForm
      key={plan.id}
      mode="edit"
      initialPlan={plan}
      isSubmitting={isPending}
      onSubmit={async (payload) => {
        await updatePlan({ id: plan.id, payload });
        toast.success(`Plan "${payload.name}" updated successfully.`);
        router.push('/admin/plans');
      }}
    />
  );
}
