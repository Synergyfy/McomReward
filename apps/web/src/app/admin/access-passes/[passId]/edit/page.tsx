"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminAccessPassPlan,
  useUpdateAccessPassPlan,
} from "@/services/admin/access-passes";
import { AccessPassPlanForm } from "@/components/admin/access-passes/AccessPassPlanForm";

export default function EditAccessPassPage() {
  const params = useParams<{ passId: string }>();
  const router = useRouter();
  const planId = params?.passId;

  const { data: plan, isLoading, isError } = useGetAdminAccessPassPlan(planId);
  const { mutateAsync, isPending } = useUpdateAccessPassPlan();

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
        <span className="text-sm">Loading access pass…</span>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="p-5 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-700">
          This access pass could not be loaded. It may have been removed.
        </div>
      </div>
    );
  }

  return (
    <AccessPassPlanForm
      mode="edit"
      initialPlan={plan}
      isSubmitting={isPending}
      onSubmit={async (payload) => {
        await mutateAsync({ id: plan.id, payload: payload as any });
        toast.success(
          (payload as any).updateExistingSubscribers
            ? "Access pass updated for new and existing subscribers."
            : "Access pass updated. Existing subscribers keep their current snapshot.",
        );
        router.push("/admin/access-passes");
      }}
    />
  );
}
