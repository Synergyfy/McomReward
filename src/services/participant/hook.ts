import api, { setBearerToken } from '../api';
import { ParticipantSignUpDto, ParticipantLoginDto, ParticipantLoginResponse, JoinCampaignDto } from './types';
import Cookies from 'js-cookie';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const PARTICIPANT_QUERY_KEY = 'participant';

// Participant Sign-up
const participantSignUp = async (signUpData: ParticipantSignUpDto): Promise<ParticipantLoginResponse> => {
  const { data } = await api.post<ParticipantLoginResponse>('/api/v1/participant/signup', signUpData);
  return data;
};

export const useParticipantSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: participantSignUp,
    onSuccess: (data) => {
      // Note: The prompt says "Register a new participant".
      // Usually signup returns the user or tokens. If it just returns success, we might need to login.
      // Assuming it returns tokens like login for seamless experience, or we handle login after.
      // If the API returns the same as login, we can set tokens.
      // Based on typical flows in this project (business signup then login),
      // I will assume we might need to auto-login or if the signup returns tokens.
      // For now, let's assume it returns the same as login or we handle it.
      // Actually, looking at the task: "User completes authentication."

      // If the response has tokens:
      if (data.accessToken) {
        Cookies.set('access', data.accessToken);
        Cookies.set('refresh', data.refreshToken);
        setBearerToken(data.accessToken);
        queryClient.setQueryData([PARTICIPANT_QUERY_KEY], data.user);
      }
    },
  });
};

// Participant Login
const participantLogin = async (loginData: ParticipantLoginDto): Promise<ParticipantLoginResponse> => {
  const { data } = await api.post<ParticipantLoginResponse>('/api/v1/participant/login', loginData);
  return data;
};

export const useParticipantLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: participantLogin,
    onSuccess: (data) => {
      Cookies.set('access', data.accessToken);
      Cookies.set('refresh', data.refreshToken);
      setBearerToken(data.accessToken);
      queryClient.setQueryData([PARTICIPANT_QUERY_KEY], data.user);
    },
  });
};

// Join Campaign
const joinCampaign = async (joinData: JoinCampaignDto): Promise<void> => {
  await api.post('/api/v1/participant/join-campaign', joinData);
};

export const useJoinCampaign = () => {
  return useMutation({
    mutationFn: joinCampaign,
  });
};
