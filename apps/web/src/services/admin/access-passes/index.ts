import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api";

export interface AccessPassConfiguration {
  quotas?: Record<string, number>;
  featureFlags?: Record<string, boolean>;
  disabledNavIds?: string[];
  [key: string]: any;
}

export interface AccessPassPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  configuration: AccessPassConfiguration;
  isActive: boolean;
  purchaseEnabled: boolean;
  codeRedemptionEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  codeCount?: number;
  subscriberCount?: number;
  activeSubscriberCount?: number;
}

export interface AccessPassBusinessSummary {
  id: string;
  name: string;
  email: string;
  profile_image?: string | null;
}

export interface AccessPassCode {
  id: string;
  code: string;
  planId: string;
  plan?: AccessPassPlan;
  assignedEmail?: string | null;
  assignedBusinessId?: string | null;
  assignedBusiness?: AccessPassBusinessSummary | null;
  restrictToAssignedUser: boolean;
  status: "active" | "exhausted" | "revoked" | "expired";
  maxUses: number;
  timesUsed: number;
  expiresAt?: string | null;
  note?: string | null;
  lastUsedAt?: string | null;
  emailSentAt?: string | null;
  createdAt?: string;
  emailQueued?: boolean;
}

export interface AccessPassSubscription {
  id: string;
  businessId: string;
  business?: AccessPassBusinessSummary;
  planId: string;
  plan?: AccessPassPlan;
  codeId?: string | null;
  code?: AccessPassCode | null;
  source: "purchase" | "code" | "admin";
  status: "active" | "expired" | "revoked";
  startsAt: string;
  expiresAt: string;
  planName: string;
  durationDays: number;
  features: string[];
  configuration: AccessPassConfiguration;
  price: number;
  currency: string;
  transactionId?: string | null;
  paymentProvider?: string | null;
  revokedAt?: string | null;
  revokedReason?: string | null;
  createdAt?: string;
}

export interface MyAccessPass {
  hasAccess: boolean;
  subscription: AccessPassSubscription | null;
  planName: string | null;
  expiresAt: string | null;
  startsAt?: string | null;
  daysRemaining: number;
  features: string[];
  configuration: AccessPassConfiguration | null;
  source: string | null;
  status: string;
}

export interface PaginatedAccessPasses<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAccessPassPlanPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  durationDays: number;
  features: string[];
  configuration?: AccessPassConfiguration;
  isActive?: boolean;
  purchaseEnabled?: boolean;
  codeRedemptionEnabled?: boolean;
}

export interface UpdateAccessPassPlanPayload extends Partial<CreateAccessPassPlanPayload> {
  updateExistingSubscribers?: boolean;
  recalculateExpiry?: boolean;
}

export interface CreateAccessPassCodePayload {
  planId: string;
  email?: string;
  restrictToAssignedUser?: boolean;
  expiresAt?: string;
  maxUses?: number;
  note?: string;
  sendEmail?: boolean;
}

export interface InitiateAccessPassPurchasePayload {
  planId: string;
  provider: "stripe" | "paypal" | "wallet";
  checkoutId?: string;
}

export interface ConfirmAccessPassPurchasePayload {
  planId?: string;
  checkoutId?: string;
  chargeId?: string;
  paymentIntentId?: string;
  orderId?: string;
}

const KEY = "access-passes";

export const getPublicAccessPassPlans = async (): Promise<AccessPassPlan[]> => {
  const { data } = await api.get<AccessPassPlan[]>("/access-passes/plans");
  return data;
};

export const useGetAccessPassPlans = () =>
  useQuery({
    queryKey: [KEY, "plans"],
    queryFn: getPublicAccessPassPlans,
  });

export const getAdminAccessPassPlans = async (): Promise<AccessPassPlan[]> => {
  const { data } = await api.get<AccessPassPlan[]>(
    "/access-passes/admin/plans",
  );
  return data;
};

export const useGetAdminAccessPassPlans = () =>
  useQuery({
    queryKey: [KEY, "admin", "plans"],
    queryFn: getAdminAccessPassPlans,
  });

export const getAdminAccessPassPlan = async (
  id: string,
): Promise<AccessPassPlan> => {
  const { data } = await api.get<AccessPassPlan>(
    `/access-passes/admin/plans/${id}`,
  );
  return data;
};

export const useGetAdminAccessPassPlan = (id?: string) =>
  useQuery({
    queryKey: [KEY, "admin", "plans", id],
    queryFn: () => getAdminAccessPassPlan(id as string),
    enabled: Boolean(id),
  });

export const createAccessPassPlan = async (
  payload: CreateAccessPassPlanPayload,
): Promise<AccessPassPlan> => {
  const { data } = await api.post<AccessPassPlan>(
    "/access-passes/admin/plans",
    payload,
  );
  return data;
};

export const useCreateAccessPassPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccessPassPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

export const updateAccessPassPlan = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateAccessPassPlanPayload;
}): Promise<AccessPassPlan> => {
  const { data } = await api.patch<AccessPassPlan>(
    `/access-passes/admin/plans/${id}`,
    payload,
  );
  return data;
};

export const useUpdateAccessPassPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAccessPassPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

export const deleteAccessPassPlan = async (id: string) => {
  const { data } = await api.delete(`/access-passes/admin/plans/${id}`);
  return data;
};

export const useDeleteAccessPassPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccessPassPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

export const getAccessPassCodes = async (params: {
  page?: number;
  limit?: number;
  planId?: string;
  status?: string;
  search?: string;
}): Promise<PaginatedAccessPasses<AccessPassCode>> => {
  const { data } = await api.get<PaginatedAccessPasses<AccessPassCode>>(
    "/access-passes/admin/codes",
    { params },
  );
  return data;
};

export const useGetAccessPassCodes = (params: {
  page?: number;
  limit?: number;
  planId?: string;
  status?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: [KEY, "admin", "codes", params],
    queryFn: () => getAccessPassCodes(params),
  });

export const createAccessPassCode = async (
  payload: CreateAccessPassCodePayload,
): Promise<AccessPassCode> => {
  const { data } = await api.post<AccessPassCode>(
    "/access-passes/admin/codes",
    payload,
  );
  return data;
};

export const useCreateAccessPassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccessPassCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

export const updateAccessPassCode = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    status?: string;
    restrictToAssignedUser?: boolean;
    expiresAt?: string | null;
    note?: string;
  };
}) => {
  const { data } = await api.patch(`/access-passes/admin/codes/${id}`, payload);
  return data;
};

export const useUpdateAccessPassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAccessPassCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const revokeAccessPassCode = async (id: string) => {
  const { data } = await api.delete(`/access-passes/admin/codes/${id}`);
  return data;
};

export const useRevokeAccessPassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeAccessPassCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const resendAccessPassCode = async (id: string) => {
  const { data } = await api.post(`/access-passes/admin/codes/${id}/resend`);
  return data;
};

export const useResendAccessPassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendAccessPassCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const getAccessPassSubscriptions = async (params: {
  page?: number;
  limit?: number;
  planId?: string;
  status?: string;
  search?: string;
}): Promise<PaginatedAccessPasses<AccessPassSubscription>> => {
  const { data } = await api.get<PaginatedAccessPasses<AccessPassSubscription>>(
    "/access-passes/admin/subscriptions",
    { params },
  );
  return data;
};

export const useGetAccessPassSubscriptions = (params: {
  page?: number;
  limit?: number;
  planId?: string;
  status?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: [KEY, "admin", "subscriptions", params],
    queryFn: () => getAccessPassSubscriptions(params),
  });

export const revokeAccessPassSubscription = async ({
  id,
  reason,
}: {
  id: string;
  reason: string;
}) => {
  const { data } = await api.post(
    `/access-passes/admin/subscriptions/${id}/revoke`,
    { reason },
  );
  return data;
};

export const useRevokeAccessPassSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeAccessPassSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const getMyAccessPass = async (): Promise<MyAccessPass> => {
  const { data } = await api.get<MyAccessPass>("/access-passes/me");
  return data;
};

export const useGetMyAccessPass = () =>
  useQuery({
    queryKey: [KEY, "me"],
    queryFn: getMyAccessPass,
    staleTime: 0,
  });

export const redeemAccessPassCode = async (code: string) => {
  const { data } = await api.post("/access-passes/redeem", { code });
  return data;
};

export const useRedeemAccessPassCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: redeemAccessPassCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["mcom-packages"] });
    },
  });
};

export const initiateAccessPassPurchase = async (
  payload: InitiateAccessPassPurchasePayload,
) => {
  const { data } = await api.post("/access-passes/purchase/initiate", payload);
  return data;
};

export const useInitiateAccessPassPurchase = () =>
  useMutation({ mutationFn: initiateAccessPassPurchase });

export const confirmAccessPassPurchase = async (
  payload: ConfirmAccessPassPurchasePayload,
) => {
  const { data } = await api.post("/access-passes/purchase/confirm", payload);
  return data;
};

export const useConfirmAccessPassPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmAccessPassPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["mcom-packages"] });
      queryClient.invalidateQueries({ queryKey: ["businessProfile"] });
    },
  });
};
