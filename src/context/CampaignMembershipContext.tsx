"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CampaignMembershipContextType {
  isMember: boolean;
  joinCampaign: (id?: string) => void;
  memberName: string;
  setMemberName: (name: string) => void;
  campaignId: string;
}

const CampaignMembershipContext = createContext<CampaignMembershipContextType | undefined>(undefined);

export const CampaignMembershipProvider = ({ children }: { children: ReactNode }) => {
  const [isMember, setIsMember] = useState(false);
  const [memberName, setMemberNameState] = useState('');
  const [campaignId, setCampaignIdState] = useState('');

  useEffect(() => {
    const storedIsMember = localStorage.getItem('isCampaignMember');
    const storedMemberName = localStorage.getItem('campaignMemberName');
    const storedCampaignId = localStorage.getItem('campaignId');
    if (storedIsMember === 'true') {
      setIsMember(true);
      setMemberNameState(storedMemberName || '');
      setCampaignIdState(storedCampaignId || '');
    }
  }, []);

  const joinCampaign = (id?: string) => {
    localStorage.setItem('isCampaignMember', 'true');
    setIsMember(true);
    if (id) {
      localStorage.setItem('campaignId', id);
      setCampaignIdState(id);
    }
  };

  const setMemberName = (name: string) => {
    localStorage.setItem('campaignMemberName', name);
    setMemberNameState(name);
  };

  return (
    <CampaignMembershipContext.Provider value={{ isMember, joinCampaign, memberName, setMemberName, campaignId }}>
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
