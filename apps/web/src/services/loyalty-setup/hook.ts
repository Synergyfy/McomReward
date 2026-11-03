"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type {
  SectorTemplate, LoyaltySetupProgress, SaveSetupRequest, RewardCustomization,
  RewardEngineConfig, TierConfig,
} from "./types";

// ─── PROGRESS (backend: loyalty-setup/progress) ────────────────────────────

const PROGRESS_QUERY_KEY = ["loyaltySetupProgress"] as const;

const fetchProgress = async (): Promise<LoyaltySetupProgress> => {
  const { data } = await api.get<LoyaltySetupProgress>("/loyalty-setup/progress");
  return data;
};

export function useGetLoyaltySetupProgress() {
  return useQuery<LoyaltySetupProgress>({
    queryKey: PROGRESS_QUERY_KEY,
    queryFn: fetchProgress,
  });
}

function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation<LoyaltySetupProgress, Error, Partial<LoyaltySetupProgress>>({
    mutationFn: async (patch) => {
      const { data } = await api.patch<LoyaltySetupProgress>(
        "/loyalty-setup/progress",
        patch,
      );
      return data;
    },
    onSuccess: (progress) => {
      queryClient.setQueryData(PROGRESS_QUERY_KEY, progress);
      queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEY });
    },
  });
}

export function useSaveLoyaltySetup() {
  const queryClient = useQueryClient();
  return useMutation<LoyaltySetupProgress, Error, SaveSetupRequest>({
    mutationFn: async (data) => {
      const { data: progress } = await api.post<LoyaltySetupProgress>(
        "/loyalty-setup/progress/complete",
        data,
      );
      return progress;
    },
    onSuccess: (progress) => {
      queryClient.setQueryData(PROGRESS_QUERY_KEY, progress);
      queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["businessSetupStatus"] });
      queryClient.invalidateQueries({ queryKey: ["businessRewards"] });
      queryClient.invalidateQueries({ queryKey: ["allRewards"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useSkipLoyaltySetup() {
  const queryClient = useQueryClient();
  return useMutation<LoyaltySetupProgress, Error, void>({
    mutationFn: async () => {
      const { data } = await api.post<LoyaltySetupProgress>(
        "/loyalty-setup/progress/skip",
      );
      return data;
    },
    onSuccess: (progress) => {
      queryClient.setQueryData(PROGRESS_QUERY_KEY, progress);
      queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEY });
    },
  });
}

export function useMarkWelcomeSeen() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: () => update.mutateAsync({ hasSeenWelcome: true }),
  };
}

export function useMarkEcosystemIntroSeen() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: () => update.mutateAsync({ hasSeenEcosystemIntro: true }),
  };
}

export function useSelectTemplate() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: (templateId: string) =>
      update.mutateAsync({
        selectedTemplateId: templateId,
        selectedCampaigns: [],
        campaignDescriptions: {},
      }),
  };
}

export function useSaveRewardCustomizations() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: (customizations: Record<string, RewardCustomization>) =>
      update.mutateAsync({ rewardCustomizations: customizations }),
  };
}

export function useSaveCampaignSelections() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: (campaigns: LoyaltySetupProgress["selectedCampaigns"]) =>
      update.mutateAsync({ selectedCampaigns: campaigns }),
  };
}

export function useSaveCampaignDescriptions() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: (descriptions: Record<string, string>) =>
      update.mutateAsync({ campaignDescriptions: descriptions }),
  };
}

export function useSaveEngineConfig() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: (config: RewardEngineConfig) =>
      update.mutateAsync({ enabledEngines: config }),
  };
}

export function useSaveTierConfig() {
  const update = useUpdateProgress();
  return {
    ...update,
    mutateAsync: (config: TierConfig) => update.mutateAsync({ tierConfig: config }),
  };
}

// ─── TEMPLATE CRUD (backend: loyalty-setup/templates) ──────────────────────

const TEMPLATES_QUERY_KEY = "loyaltySetupTemplates";

const fetchTemplates = async (): Promise<SectorTemplate[]> => {
  const { data } = await api.get<SectorTemplate[]>("/loyalty-setup/templates");
  return data;
};

export function useGetLoyaltySetupTemplates() {
  return useQuery<SectorTemplate[]>({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: fetchTemplates,
  });
}

export function useGetBusinessLoyaltySetupTemplates() {
  return useQuery<SectorTemplate[]>({
    queryKey: [TEMPLATES_QUERY_KEY, "businessAvailable"],
    queryFn: async () => {
      const { data } = await api.get<SectorTemplate[]>("/loyalty-setup/templates/available");
      return data;
    },
  });
}

const createTemplate = async (payload: SectorTemplate): Promise<SectorTemplate> => {
  const { data } = await api.post<SectorTemplate>("/loyalty-setup/templates", payload);
  return data;
};

export function useCreateLoyaltySetupTemplate() {
  const queryClient = useQueryClient();
  return useMutation<SectorTemplate, Error, SectorTemplate>({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
}

const updateTemplate = async ({ id, payload }: { id: string; payload: SectorTemplate }): Promise<SectorTemplate> => {
  const { data } = await api.patch<SectorTemplate>(`/loyalty-setup/templates/${id}`, payload);
  return data;
};

export function useUpdateLoyaltySetupTemplate() {
  const queryClient = useQueryClient();
  return useMutation<SectorTemplate, Error, { id: string; payload: SectorTemplate }>({
    mutationFn: updateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
}

const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`/loyalty-setup/templates/${id}`);
};

export function useDeleteLoyaltySetupTemplate() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
}
