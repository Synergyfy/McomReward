"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CampaignMembershipContextType {
  isMember: boolean; // Deprecated
  joinCampaign: (id?: string) => void;
  memberName: string;
  setMemberName: (name: string) => void;
  campaignId: string; // Deprecated
  isCampaignJoined: (id: string) => boolean;
}

const CampaignMembershipContext = createContext<CampaignMembershipContextType | undefined>(undefined);

export const CampaignMembershipProvider = ({ children }: { children: ReactNode }) => {
  const [joinedCampaigns, setJoinedCampaigns] = useState<Set<string>>(new Set());
  const [memberName, setMemberNameState] = useState('');

  useEffect(() => {
    const storedJoinedCampaigns = localStorage.getItem('joinedCampaigns');
    const storedMemberName = localStorage.getItem('campaignMemberName');

    if (storedJoinedCampaigns) {
      try {
        const parsed = JSON.parse(storedJoinedCampaigns);
        if (Array.isArray(parsed)) {
          setJoinedCampaigns(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse joined campaigns", e);
      }
    }

    // Legacy support: migrate old single campaign storage
    const legacyIsMember = localStorage.getItem('isCampaignMember');
    const legacyCampaignId = localStorage.getItem('campaignId');
    if (legacyIsMember === 'true' && legacyCampaignId) {
      setJoinedCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.add(legacyCampaignId);
        return newSet;
      });
    }

    if (storedMemberName) {
      setMemberNameState(storedMemberName);
    }
  }, []);

  const joinCampaign = (id?: string) => {
    if (!id) return;
    setJoinedCampaigns(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem('joinedCampaigns', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const isCampaignJoined = (id: string) => {
    return joinedCampaigns.has(id);
  };

  const setMemberName = (name: string) => {
    localStorage.setItem('campaignMemberName', name);
    setMemberNameState(name);
  };

  return (
    <CampaignMembershipContext.Provider value={{
      isMember: false, // Deprecated, kept for temporary compatibility if needed, but should be removed
      joinCampaign,
      memberName,
      setMemberName,
      campaignId: '', // Deprecated
      isCampaignJoined
    }}>
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
