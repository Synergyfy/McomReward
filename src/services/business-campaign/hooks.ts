"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BusinessCampaign,
  DetailedCampaignAnalytics,
  PaginatedCampaignAnalyticsResponse,
  PaginatedCampaignsResponse,
  PaginationDto,
} from "./types";
import api from "../api";

// GET /business/campaigns/claimable
export const useGetClaimableCampaigns = (params: PaginationDto = {}) => {
  return useQuery<PaginatedCampaignsResponse, Error>({
    queryKey: ["claimable-campaigns", params],
    queryFn: async () => {
      const { data } = await api.get("/business/campaigns/claimable", {
        params,
      });
      return data;
    },
  });
};

// POST /business/campaigns/:campaignId/claim
export const useClaimCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<BusinessCampaign, Error, string>({
    mutationFn: async (campaignId) => {
      const { data } = await api.post(
        `/business/campaigns/${campaignId}/claim`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claimable-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["my-claimed-campaigns"] });
    },
  });
};

// GET /business/campaigns/my-created-campaigns
export const useGetMyCreatedCampaigns = (params: PaginationDto = {}) => {
  return useQuery<PaginatedCampaignsResponse, Error>({
    queryKey: ["my-created-campaigns", params],
    queryFn: async () => {
      const { data } = await api.get("/business/campaigns/my-created-campaigns", {
        params,
      });
      return data;
    },
  });
};

// GET /business/campaigns/my-claimed-campaigns
export const useGetMyClaimedCampaigns = (params: PaginationDto = {}) => {
  return useQuery<PaginatedCampaignsResponse, Error>({
    queryKey: ["my-claimed-campaigns", params],
    queryFn: async () => {
      const { data } = await api.get("/business/campaigns/my-claimed-campaigns", {
        params,
      });
      return data;
    },
  });
};

// GET /business/campaigns/analytics
export const useGetCampaignAnalytics = (params: PaginationDto = {}) => {
  return useQuery<PaginatedCampaignAnalyticsResponse, Error>({
    queryKey: ["campaign-analytics", params],
    queryFn: async () => {
      const { data } = await api.get("/business/campaigns/analytics", {
        params,
      });
      return data;
    },
  });
};

// GET /business/campaigns/:campaignId/analytics/detailed
export const useGetDetailedCampaignAnalytics = (campaignId: string) => {
  return useQuery<DetailedCampaignAnalytics, Error>({
    queryKey: ["detailed-campaign-analytics", campaignId],
    queryFn: async () => {
      const { data } = await api.get(
        `/business/campaigns/${campaignId}/analytics/detailed`
      );
      return data;
    },
    enabled: !!campaignId, // Only run the query if campaignId is not null or undefined
  });
};
