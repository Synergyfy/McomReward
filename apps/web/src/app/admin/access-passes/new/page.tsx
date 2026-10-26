"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateAccessPassPlan } from "@/services/admin/access-passes";
import { AccessPassPlanForm } from "@/components/admin/access-passes/AccessPassPlanForm";

export default function CreateAccessPassPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateAccessPassPlan();

  return (
    <AccessPassPlanForm
      mode="create"
      isSubmitting={isPending}
      onSubmit={async (payload) => {
        const plan = await mutateAsync(payload as any);
        toast.success(
          `Access pass "${plan?.name ?? (payload as any).name}" created successfully.`,
        );
        router.push("/admin/access-passes");
      }}
    />
  );
}
