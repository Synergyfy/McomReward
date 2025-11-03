"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CampaignMembershipContextType {
  isMember: boolean;
  joinCampaign: () => void;
  memberName: string;
  setMemberName: (name: string) => void;
}

const CampaignMembershipContext = createContext<CampaignMembershipContextType | undefined>(undefined);

export const CampaignMembershipProvider = ({ children }: { children: ReactNode }) => {
  const [isMember, setIsMember] = useState(false);
  const [memberName, setMemberNameState] = useState('');

  useEffect(() => {
    const storedIsMember = localStorage.getItem('isCampaignMember');
    const storedMemberName = localStorage.getItem('campaignMemberName');
    if (storedIsMember === 'true') {
      setIsMember(true);
      setMemberNameState(storedMemberName || '');
    }
  }, []);

  const joinCampaign = () => {
    localStorage.setItem('isCampaignMember', 'true');
    setIsMember(true);
  };

  const setMemberName = (name: string) => {
    localStorage.setItem('campaignMemberName', name);
    setMemberNameState(name);
  };

  return (
    <CampaignMembershipContext.Provider value={{ isMember, joinCampaign, memberName, setMemberName }}>
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
