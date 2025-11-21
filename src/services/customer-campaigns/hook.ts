import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  JoinCampaignResponse,
  PaginatedPublicCampaigns,
  PublicCampaign,
  ParticipantBalance,
  ClaimCodePayload,
  ClaimCodeResponse,
  RedeemRewardPayload,
  RedeemRewardResponse,
  ScanParticipantPayload,
  ScanParticipantResponse,
  GenerateCodePayload,
  GenerateCodeResponse,
  DualScanPayload,
  DualScanResponse
} from './types';

const PUBLIC_CAMPAIGNS_QUERY_KEY = 'publicCampaigns';
const PARTICIPANT_BALANCE_QUERY_KEY = 'participantBalance';

// Get Public Campaigns
const getPublicCampaigns = async (page: number, limit: number): Promise<PaginatedPublicCampaigns> => {
  const { data } = await api.get<PaginatedPublicCampaigns>('/campaigns', { params: { page, limit } });
  return data;
};

export const useGetPublicCampaigns = (page: number, limit: number) => {
  return useQuery({
    queryKey: [PUBLIC_CAMPAIGNS_QUERY_KEY, page, limit],
    queryFn: () => getPublicCampaigns(page, limit),
  });
};

// Get Public Campaign Details
const getPublicCampaignDetails = async (campaignId: string): Promise<PublicCampaign> => {
  const { data } = await api.get<PublicCampaign>(`/campaigns/${campaignId}`);
  return data;
};

export const useGetPublicCampaignDetails = (campaignId: string) => {
  return useQuery({
    queryKey: [PUBLIC_CAMPAIGNS_QUERY_KEY, campaignId],
    queryFn: () => getPublicCampaignDetails(campaignId),
    enabled: !!campaignId, // Only run query if campaignId is available
  });
};

// Join Campaign
const joinCampaign = async (campaignId: string): Promise<JoinCampaignResponse> => {
  const { data } = await api.post<JoinCampaignResponse>(`/campaigns/${campaignId}/join`);
  return data;
};

export const useJoinCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinCampaign,
    onSuccess: (data, campaignId) => {
      // Invalidate the specific campaign to refetch its data, which might have changed (e.g., user joined)
      queryClient.invalidateQueries({ queryKey: [PUBLIC_CAMPAIGNS_QUERY_KEY, campaignId] });
    },
  });
};

// Get Participant Balance
const getParticipantBalance = async (campaignId: string): Promise<ParticipantBalance> => {
  const { data } = await api.get<ParticipantBalance>(`/participant-campaign-balance/${campaignId}`);
  return data;
};

export const useGetParticipantBalance = (campaignId: string) => {
  return useQuery({
    queryKey: [PARTICIPANT_BALANCE_QUERY_KEY, campaignId],
    queryFn: () => getParticipantBalance(campaignId),
    enabled: !!campaignId,
  });
};

// Claim Code
const claimCode = async (payload: ClaimCodePayload): Promise<ClaimCodeResponse> => {
  const { data } = await api.post<ClaimCodeResponse>('/participant-campaign-balance/claim-code', payload);
  return data;
};

export const useClaimCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTICIPANT_BALANCE_QUERY_KEY] });
    },
  });
};

// Redeem Reward
const redeemReward = async (payload: RedeemRewardPayload): Promise<RedeemRewardResponse> => {
  const { data } = await api.post<RedeemRewardResponse>('/participant-campaign-balance/redeem-reward', payload);
  return data;
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PARTICIPANT_BALANCE_QUERY_KEY] });
    },
  });
};

// --- Staff Hooks ---

// Scan Participant (Earn/Redeem)
const scanParticipant = async (payload: ScanParticipantPayload): Promise<ScanParticipantResponse> => {
  const { data } = await api.post<ScanParticipantResponse>('/participant-campaign-balance/scan-participant', payload);
  return data;
};

export const useScanParticipant = () => {
  return useMutation({
    mutationFn: scanParticipant,
  });
};

// Generate Code (Offline Earn)
const generateCode = async (payload: GenerateCodePayload): Promise<GenerateCodeResponse> => {
  const { data } = await api.post<GenerateCodeResponse>('/participant-campaign-balance/generate-code', payload);
  return data;
};

export const useGenerateCode = () => {
  return useMutation({
    mutationFn: generateCode,
  });
};

// Dual Scan (Remote Earn)
const dualScan = async (payload: DualScanPayload): Promise<DualScanResponse> => {
  const { data } = await api.post<DualScanResponse>('/participant-campaign-balance/dual-scan', payload);
  return data;
};

export const useDualScan = () => {
  return useMutation({
    mutationFn: dualScan,
  });
};
