'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setBusinessRequest, clearBusinessRequest, setParticipantRequest, clearParticipantRequest } from '@/services/api';

interface ImpersonationState {
  isImpersonating: boolean;
  businessId: string | null;
  participantId: string | null;
  adminId: string | null;
}

interface ImpersonationContextType extends ImpersonationState {
  startImpersonation: (businessId: string, adminId: string) => void;
  startParticipantImpersonation: (participantId: string, adminId: string) => void;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const BUSINESS_STORAGE_KEY = 'impersonation_state';
const PARTICIPANT_STORAGE_KEY = 'impersonation_participant_state';

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    businessId: null,
    participantId: null,
    adminId: null,
  });
  const router = useRouter();
  const pathname = usePathname();

  // Load state from localStorage on mount
  useEffect(() => {
    const storedBusiness = localStorage.getItem(BUSINESS_STORAGE_KEY);
    if (storedBusiness) {
      try {
        const parsed = JSON.parse(storedBusiness);
        if (parsed.isImpersonating && parsed.businessId) {
          setState({ ...parsed, participantId: null });
          setBusinessRequest(parsed.businessId);
          return;
        }
      } catch (e) {
        console.error('Failed to parse business impersonation state', e);
        localStorage.removeItem(BUSINESS_STORAGE_KEY);
      }
    }

    const storedParticipant = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
    if (storedParticipant) {
      try {
        const parsed = JSON.parse(storedParticipant);
        if (parsed.isImpersonating && parsed.participantId) {
          setState({ ...parsed, businessId: null });
          setParticipantRequest(parsed.participantId);
          return;
        }
      } catch (e) {
        console.error('Failed to parse participant impersonation state', e);
        localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
      }
    }
  }, []);

  // Ref to track if we are in the process of transitioning to dashboard
  const isTransitioningRef = React.useRef(false);

  const startImpersonation = (businessId: string, adminId: string) => {
    const newState = {
      isImpersonating: true,
      businessId,
      participantId: null,
      adminId,
    };

    // Mark as transitioning to prevent safety check from triggering immediately
    isTransitioningRef.current = true;

    // Update State
    setState(newState);
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(newState));
    // Ensure we clear any participant state
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
    clearParticipantRequest();

    // Update API
    setBusinessRequest(businessId);

    // Navigate
    router.push('/dashboard');
  };

  const startParticipantImpersonation = (participantId: string, adminId: string) => {
    const newState = {
      isImpersonating: true,
      businessId: null,
      participantId,
      adminId,
    };

    // Mark as transitioning
    isTransitioningRef.current = true;

    // Update State
    setState(newState);
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(newState));
    // Ensure we clear any business state
    localStorage.removeItem(BUSINESS_STORAGE_KEY);
    clearBusinessRequest();

    // Update API
    setParticipantRequest(participantId);

    // Navigate
    router.push('/participant/wallet');
  };

  const stopImpersonation = () => {
    isTransitioningRef.current = false;
    
    // Determine where to redirect based on what we were impersonating
    const wasParticipant = !!state.participantId;

    // Clear State
    setState({
      isImpersonating: false,
      businessId: null,
      participantId: null,
      adminId: null,
    });
    localStorage.removeItem(BUSINESS_STORAGE_KEY);
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY);

    // Clear API
    clearBusinessRequest();
    clearParticipantRequest();

    // Navigate back to appropriate list
    if (wasParticipant) {
        router.push('/admin/users/consumer');
    } else {
        router.push('/admin/users/business');
    }
  };

  // Safety Check: If we are on an admin route, we MUST NOT be impersonating.
  useEffect(() => {
    // If we are transitioning, skip this check
    if (isTransitioningRef.current) {
        if (!pathname?.startsWith('/admin')) {
             isTransitioningRef.current = false;
        }
        return;
    }

    if (pathname?.startsWith('/admin') && state.isImpersonating) {
      console.warn('Detected Admin route while impersonating. Clearing impersonation state.');

      setState({
        isImpersonating: false,
        businessId: null,
        participantId: null,
        adminId: null,
      });
      localStorage.removeItem(BUSINESS_STORAGE_KEY);
      localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
      clearBusinessRequest();
      clearParticipantRequest();
    }
  }, [pathname, state.isImpersonating]);

  return (
    <ImpersonationContext.Provider
      value={{
        ...state,
        startImpersonation,
        startParticipantImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
}
