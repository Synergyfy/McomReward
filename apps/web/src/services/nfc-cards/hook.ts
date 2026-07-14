import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { NfcCardsResponse, NfcCardQueryDto } from './types';

const NFC_CARDS_QUERY_KEY = 'nfcCards';

const fetchNfcCards = async (params: NfcCardQueryDto): Promise<NfcCardsResponse> => {
  const { data } = await api.get<NfcCardsResponse>('/business/nfc-cards', { params });
  return data;
};

export const useGetNfcCards = (params: NfcCardQueryDto = {}) => {
  return useQuery({
    queryKey: [NFC_CARDS_QUERY_KEY, params.businessId],
    queryFn: () => fetchNfcCards(params),
  });
};
