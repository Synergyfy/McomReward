"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type {
  SectorTemplate, LoyaltySetupProgress, SaveSetupRequest, RewardCustomization,
  RewardEngineConfig, TierConfig,
} from "./types";

// ─── LOCAL STORAGE ─────────────────────────────────────────────────────────

const PROGRESS_KEY = "mcom-loyalty-setup-progress";

function defaultProgress(): LoyaltySetupProgress {
  return {
    hasSeenWelcome: false,
    hasSeenEcosystemIntro: false,
    selectedTemplateId: null,
    selectedCampaigns: [],
    rewardCustomizations: {},
    campaignDescriptions: {},
    enabledEngines: null,
    tierConfig: null,
    hasCompletedSetup: false,
    hasSkippedOnboarding: false,
  };
}

function getStoredProgress(): LoyaltySetupProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultProgress(), ...parsed };
    }
  } catch { /* ignore */ }
  return defaultProgress();
}

function storeProgress(p: LoyaltySetupProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

// ─── HOOKS ─────────────────────────────────────────────────────────────────

export function useGetLoyaltySetupProgress() {
  return useQuery<LoyaltySetupProgress>({
    queryKey: ["loyaltySetupProgress"],
    queryFn: async () => getStoredProgress(),
  });
}

export function useSaveLoyaltySetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveSetupRequest) => {
      await new Promise((r) => setTimeout(r, 300));
      const progress: LoyaltySetupProgress = {
        hasSeenWelcome: data.hasSeenWelcome,
        hasSeenEcosystemIntro: data.hasSeenEcosystemIntro,
        selectedTemplateId: data.selectedTemplateId,
        selectedCampaigns: data.selectedCampaigns,
        rewardCustomizations: data.rewardCustomizations,
        campaignDescriptions: data.campaignDescriptions,
        enabledEngines: data.enabledEngines,
        tierConfig: data.tierConfig,
        hasCompletedSetup: true,
        hasSkippedOnboarding: false,
      };
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}


export function useSkipLoyaltySetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const progress = getStoredProgress();
      progress.hasSeenWelcome = true;
      progress.hasSkippedOnboarding = true;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useMarkWelcomeSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.hasSeenWelcome = true;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useMarkEcosystemIntroSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.hasSeenEcosystemIntro = true;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useSelectTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.selectedTemplateId = templateId;
      progress.selectedCampaigns = [];
      progress.campaignDescriptions = {};
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useSaveRewardCustomizations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customizations: Record<string, RewardCustomization>) => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.rewardCustomizations = customizations;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useSaveCampaignSelections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaigns: LoyaltySetupProgress["selectedCampaigns"]) => {
      const progress = getStoredProgress();
      progress.selectedCampaigns = campaigns;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useSaveCampaignDescriptions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (descriptions: Record<string, string>) => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.campaignDescriptions = descriptions;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useSaveEngineConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: RewardEngineConfig) => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.enabledEngines = config;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
}

export function useSaveTierConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: TierConfig) => {
      await new Promise((r) => setTimeout(r, 200));
      const progress = getStoredProgress();
      progress.tierConfig = config;
      storeProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySetupProgress"] });
    },
  });
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


