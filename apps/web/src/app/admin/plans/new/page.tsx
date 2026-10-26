'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlanForm } from '@/components/admin/plans/PlanForm';
import { useCreatePlan } from '@/services/admin/plans';

export default function CreatePlanWizardPage() {
  const router = useRouter();
  const { mutateAsync: createPlan, isPending } = useCreatePlan();

  return (
    <PlanForm
      mode="create"
      isSubmitting={isPending}
      onSubmit={async (payload) => {
        const plan = await createPlan(payload);
        toast.success(`Plan "${plan?.name ?? payload.name}" and its 3 variants were created.`);
        router.push('/admin/plans');
      }}
    />
  );
}
