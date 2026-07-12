"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SectorTemplate, LoyaltySetupProgress, SaveSetupRequest, RewardCustomization } from "./types";

function detectSectorKey(sectorName: string | undefined | null): string {
  if (!sectorName) return "retail";
  const lower = sectorName.toLowerCase();
  if (lower.includes("restaurant") || lower.includes("food") || lower.includes("bar") || lower.includes("dining") || lower.includes("hospitality")) return "restaurant";
  if (lower.includes("cafe") || lower.includes("coffee") || lower.includes("bakery")) return "cafe";
  if (lower.includes("retail") || lower.includes("clothing") || lower.includes("shop") || lower.includes("store") || lower.includes("fashion") || lower.includes("electronics") || lower.includes("supermarket") || lower.includes("grocery")) return "retail";
  if (lower.includes("salon") || lower.includes("beauty") || lower.includes("barber") || lower.includes("spa") || lower.includes("nail") || lower.includes("hair") || lower.includes("aesthetic") || lower.includes("wellness")) return "salon";
  if (lower.includes("service") || lower.includes("consult") || lower.includes("agency") || lower.includes("professional") || lower.includes("legal") || lower.includes("accounting") || lower.includes("real estate") || lower.includes("fitness") || lower.includes("gym") || lower.includes("photography") || lower.includes("cleaning") || lower.includes("repair")) return "service";
  return "retail";
}

function sectorDisplayName(sectorKey: string): string {
  const map: Record<string, string> = {
    restaurant: "Restaurant & Hospitality",
    cafe: "Café & Coffee Shop",
    retail: "Retail Business",
    salon: "Salon & Beauty",
    service: "Service Business",
  };
  return map[sectorKey] || "Business";
}

// ─── SECTOR TEMPLATES ─────────────────────────────────────────────────────

const SECTOR_TEMPLATES: Record<string, SectorTemplate[]> = {
  restaurant: [
    {
      id: "tpl-restaurant",
      name: "Restaurant Rewards Pack",
      description: "Welcome reward, birthday treat, referral incentive, and a visit-based loyalty stamp card.",
      sectorKey: "restaurant",
      rewards: [
        { id: "rw-welcome", key: "welcome", name: "Welcome Reward", description: "Spend £20, receive a free dessert voucher", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🎉" },
        { id: "rw-birthday", key: "birthday", name: "Birthday Reward", description: "Free dessert on your birthday", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🎂" },
        { id: "rw-referral", key: "referral", name: "Referral Reward", description: "Refer a customer and receive £5 credit", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "👥" },
        { id: "rw-visit", key: "visit", name: "Visit Reward", description: "Buy 5 main courses, get 1 free", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 5, image: "🔄" },
      ],
      campaigns: [
        { id: "camp-new", key: "new-customer", name: "New Customer Campaign", description: "Attract first-time diners with a Welcome Reward plus a free starter on their second visit.", includedRewardKeys: ["welcome"] },
        { id: "camp-summer", key: "summer", name: "Summer Dining Campaign", description: "Promote al fresco dining with Welcome Reward and Referral Reward bundled together.", includedRewardKeys: ["welcome", "referral"] },
        { id: "camp-birthday", key: "birthday", name: "Birthday Campaign", description: "Celebrate customer birthdays with a free dessert and a Referral Reward for their guests.", includedRewardKeys: ["birthday", "referral"] },
      ],
    },
  ],
  cafe: [
    {
      id: "tpl-cafe",
      name: "Coffee Shop Rewards Pack",
      description: "Welcome pastry offer, birthday coffee, and a buy-5-get-1-free stamp card.",
      sectorKey: "cafe",
      rewards: [
        { id: "rw-welcome", key: "welcome", name: "Welcome Reward", description: "Buy any coffee, receive a free pastry", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "☕" },
        { id: "rw-birthday", key: "birthday", name: "Birthday Reward", description: "Free coffee on your birthday", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🎂" },
        { id: "rw-visit", key: "visit", name: "Visit Reward", description: "Buy 5 coffees, get 1 free", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 5, image: "🔄" },
      ],
      campaigns: [
        { id: "camp-new", key: "new-customer", name: "New Customer Campaign", description: "Welcome new customers with a free pastry on their first coffee purchase.", includedRewardKeys: ["welcome"] },
        { id: "camp-birthday", key: "birthday", name: "Birthday Campaign", description: "Offer a free coffee and pastry for birthday celebrations.", includedRewardKeys: ["birthday", "welcome"] },
      ],
    },
  ],
  retail: [
    {
      id: "tpl-retail",
      name: "Retail Rewards Pack",
      description: "Welcome discount, birthday voucher, and a referral reward — build a complete retail loyalty ecosystem.",
      sectorKey: "retail",
      rewards: [
        { id: "rw-welcome", key: "welcome", name: "Welcome Reward", description: "Spend £50, receive £5 off your next purchase", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🛍️" },
        { id: "rw-birthday", key: "birthday", name: "Birthday Reward", description: "£10 birthday voucher", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🎂" },
        { id: "rw-referral", key: "referral", name: "Referral Reward", description: "Refer a friend and both get £10 off", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "👥" },
      ],
      campaigns: [
        { id: "camp-new", key: "new-customer", name: "New Customer Campaign", description: "Attract new shoppers with £5 off their first £50 purchase.", includedRewardKeys: ["welcome"] },
        { id: "camp-seasonal", key: "seasonal", name: "Seasonal Campaign", description: "Bundle Welcome Reward and Referral Reward for seasonal promotions.", includedRewardKeys: ["welcome", "referral"] },
      ],
    },
  ],
  salon: [
    {
      id: "tpl-salon",
      name: "Salon Rewards Pack",
      description: "First-visit discount, birthday freebie, referral incentive, and a loyalty stamp card.",
      sectorKey: "salon",
      rewards: [
        { id: "rw-welcome", key: "welcome", name: "Welcome Reward", description: "20% off your first visit", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "💇" },
        { id: "rw-birthday", key: "birthday", name: "Birthday Reward", description: "Free treatment up to £30 on your birthday", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🎂" },
        { id: "rw-referral", key: "referral", name: "Referral Reward", description: "Refer a friend and get 25% off your next visit", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "👥" },
        { id: "rw-visit", key: "visit", name: "Visit Reward", description: "Every 5th visit, get 15% off", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 5, image: "🔄" },
      ],
      campaigns: [
        { id: "camp-new", key: "new-customer", name: "New Customer Campaign", description: "Welcome first-time clients with 20% off their first treatment.", includedRewardKeys: ["welcome"] },
        { id: "camp-birthday", key: "birthday", name: "Birthday Campaign", description: "Celebrate birthdays with a free treatment and referral offer for friends.", includedRewardKeys: ["birthday", "referral"] },
      ],
    },
  ],
  service: [
    {
      id: "tpl-service",
      name: "Service Business Rewards Pack",
      description: "New-client discount, birthday credit, and referral reward.",
      sectorKey: "service",
      rewards: [
        { id: "rw-welcome", key: "welcome", name: "Welcome Reward", description: "15% off your first booking", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "📋" },
        { id: "rw-birthday", key: "birthday", name: "Birthday Reward", description: "£20 credit on your birthday", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "🎂" },
        { id: "rw-referral", key: "referral", name: "Referral Reward", description: "Refer a client and get £25 credit", rewardType: "Voucher", pointsRequired: 0, stampsRequired: 0, image: "👥" },
      ],
      campaigns: [
        { id: "camp-new", key: "new-customer", name: "New Customer Campaign", description: "Attract new clients with 15% off their first booking.", includedRewardKeys: ["welcome"] },
        { id: "camp-seasonal", key: "seasonal", name: "Seasonal Campaign", description: "Seasonal promotion bundling Welcome Reward and Referral Reward.", includedRewardKeys: ["welcome", "referral"] },
      ],
    },
  ],
};

export function getTemplatesForSector(sectorKey: string): SectorTemplate[] {
  return SECTOR_TEMPLATES[sectorKey] || SECTOR_TEMPLATES["retail"] || [];
}

// ─── LOCAL STORAGE ─────────────────────────────────────────────────────────

const PROGRESS_KEY = "mcom-loyalty-setup-progress";

function defaultProgress(): LoyaltySetupProgress {
  return {
    hasSeenWelcome: false,
    hasSeenEcosystemIntro: false,
    selectedTemplateId: null,
    rewardCustomizations: {},
    campaignDescriptions: {},
    hasCompletedSetup: false,
  };
}

function getStoredProgress(): LoyaltySetupProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
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
        rewardCustomizations: data.rewardCustomizations,
        campaignDescriptions: data.campaignDescriptions,
        hasCompletedSetup: true,
      };
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
