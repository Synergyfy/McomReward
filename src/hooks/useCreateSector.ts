import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreateSectorRequest, SectorResponse } from '@/types/sectors';

export const useCreateSector = () => {
  return useMutation<SectorResponse, Error, CreateSectorRequest>({
    mutationFn: async (sectorData: CreateSectorRequest) => {
      const response = await api.post<SectorResponse>('/sectors', sectorData);
      return response.data;
    },
  });
};
