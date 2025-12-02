import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  ScanParticipantPayload,
  GenerateCodePayload,
  DualScanPayload,
  TransactionResponse,
  GeneratedCodeResponse,
} from './types';

const BALANCE_QUERY_KEY = 'participant-campaign-balance';

// Method A: Direct Scan
const scanParticipant = async (payload: ScanParticipantPayload): Promise<TransactionResponse> => {
  const { data } = await api.post<TransactionResponse>('/participant-campaign-balance/scan-participant', payload);
  return data;
};

export const useScanParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scanParticipant,
    onSuccess: () => {
      // Invalidate relevant queries if needed, e.g., campaign analytics or recent activities
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics'] });
    },
  });
};

// Method B: Generate Code
const generateCode = async (payload: GenerateCodePayload): Promise<GeneratedCodeResponse> => {
  const { data } = await api.post<GeneratedCodeResponse>('/participant-campaign-balance/generate-code', payload);
  return data;
};

export const useGenerateCode = () => {
  return useMutation({
    mutationFn: generateCode,
  });
};

// Method C: Dual Scan
const dualScan = async (payload: DualScanPayload): Promise<TransactionResponse> => {
  const { data } = await api.post<TransactionResponse>('/participant-campaign-balance/dual-scan', payload);
  return data;
};

export const useDualScan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dualScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics'] });
    },
  });
};
