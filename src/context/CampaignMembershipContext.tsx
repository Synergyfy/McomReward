"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParticipantLogin, useParticipantSignUp, useJoinCampaign } from '@/services/participant/hook';
import { ParticipantLoginDto, ParticipantSignUpDto, ParticipantUser } from '@/services/participant/types';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { removeBearerToken, setBearerToken } from '@/services/api';

interface CampaignMembershipContextType {
  user: ParticipantUser | null;
  isAuthenticated: boolean;
  isMemberOfCampaign: (campaignId: string) => boolean;
  login: (data: ParticipantLoginDto) => Promise<void>;
  signup: (data: ParticipantSignUpDto) => Promise<void>;
  joinCampaign: (campaignId: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const CampaignMembershipContext = createContext<CampaignMembershipContextType | undefined>(undefined);

export const CampaignMembershipProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ParticipantUser | null>(null);
  const [joinedCampaigns, setJoinedCampaigns] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const { mutateAsync: loginMutate } = useParticipantLogin();
  const { mutateAsync: signupMutate } = useParticipantSignUp();
  const { mutateAsync: joinCampaignMutate } = useJoinCampaign();

  // Load initial state
  useEffect(() => {
    const token = Cookies.get('access');
    const storedUser = localStorage.getItem('participantUser');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setBearerToken(token);

        // Load joined campaigns for this user
        const storedCampaigns = localStorage.getItem(`joinedCampaigns_${parsedUser.id}`);
        if (storedCampaigns) {
          setJoinedCampaigns(new Set(JSON.parse(storedCampaigns)));
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: ParticipantLoginDto) => {
    try {
      const response = await loginMutate(data);
      handleAuthSuccess(response);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data: ParticipantSignUpDto) => {
    try {
      const response = await signupMutate(data);
      handleAuthSuccess(response);
    } catch (error) {
      throw error;
    }
  };

  const handleAuthSuccess = (response: any) => { // Typing 'any' because response structure might vary based on API impl
     // Assuming response has user and tokens as defined in types
     if (response.user) {
         setUser(response.user);
         localStorage.setItem('participantUser', JSON.stringify(response.user));

         // Load joined campaigns for this user
         const storedCampaigns = localStorage.getItem(`joinedCampaigns_${response.user.id}`);
         if (storedCampaigns) {
           setJoinedCampaigns(new Set(JSON.parse(storedCampaigns)));
         } else {
           setJoinedCampaigns(new Set());
         }
     }
  };

  const joinCampaign = async (campaignId: string) => {
    if (!user) return;
    try {
      await joinCampaignMutate({ campaignId });

      const newJoined = new Set(joinedCampaigns);
      newJoined.add(campaignId);
      setJoinedCampaigns(newJoined);

      localStorage.setItem(`joinedCampaigns_${user.id}`, JSON.stringify(Array.from(newJoined)));
      toast.success("Successfully joined the campaign!");
    } catch (error) {
      console.error("Failed to join campaign", error);
      toast.error("Failed to join campaign. Please try again.");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setJoinedCampaigns(new Set());
    Cookies.remove('access');
    Cookies.remove('refresh');
    localStorage.removeItem('participantUser');
    removeBearerToken();

    // We don't remove the joinedCampaigns cache so it persists for next login

    if (typeof window !== 'undefined') {
        window.location.reload();
    }
  };

  const isMemberOfCampaign = (campaignId: string) => {
    return joinedCampaigns.has(campaignId);
  };

  return (
    <CampaignMembershipContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isMemberOfCampaign,
        login,
        signup,
        joinCampaign,
        logout,
        isLoading
      }}
    >
      {children}
    </CampaignMembershipContext.Provider>
  );
};

export const useCampaignMembership = () => {
  const context = useContext(CampaignMembershipContext);
  if (context === undefined) {
    throw new Error('useCampaignMembership must be used within a CampaignMembershipProvider');
  }
  return context;
};
