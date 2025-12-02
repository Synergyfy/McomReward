import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { QrPlaquesResponse, QrPlaqueQueryDto } from './types';

const QR_PLAQUES_QUERY_KEY = 'qrPlaques';

const fetchQrPlaquesData = async (params: QrPlaqueQueryDto): Promise<QrPlaquesResponse> => {
  // Assuming a single API endpoint that returns all QR plaques data
  const { data } = await api.get<QrPlaquesResponse>('/business/qr-plaques', { params });
  return data;
};

export const useGetQrPlaquesData = (params: QrPlaqueQueryDto = {}) => {
  return useQuery({
    queryKey: [QR_PLAQUES_QUERY_KEY, params.businessId, params.status, params.dateRange],
    queryFn: () => fetchQrPlaquesData(params),
  });
};
