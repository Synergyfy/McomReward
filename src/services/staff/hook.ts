import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setBearerToken } from '../api';
import {    BusinessLoginResponse,  Sector, BusinessSignUpDto} from './types';
import Cookies from 'js-cookie';

const STAFF_QUERY_KEY = 'staff';

interface StaffLoginDto {
    email: string;
    password: string;
};

// Staff login
const staffSignIn = async (loginData: StaffLoginDto): Promise<BusinessLoginResponse> => {
  const { data } = await api.post<BusinessLoginResponse>('/auth/login', loginData);
  return data;
};



export const useStaffLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffSignIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    },
  });
};
