import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CreateSectorRequest, SectorResponse } from './types';

const SECTORS_QUERY_KEY = 'sectors';

// Create Sector
const createSector = async (sectorData: CreateSectorRequest): Promise<SectorResponse> => {
  const { data } = await api.post<SectorResponse>('/sectors', sectorData);
  return data;
};

export const useCreateSector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Get Sectors
const getSectors = async (): Promise<SectorResponse[]> => {
  const { data } = await api.get<SectorResponse[]>('/sectors');
  return data;
};

export const useGetSectors = () => {
  return useQuery({
    queryKey: [SECTORS_QUERY_KEY],
    queryFn: getSectors,
  });
};
