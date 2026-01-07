'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setBusinessRequest, clearBusinessRequest } from '@/services/api';

interface ImpersonationState {
  isImpersonating: boolean;
  businessId: string | null;
  adminId: string | null;
}

interface ImpersonationContextType extends ImpersonationState {
  startImpersonation: (businessId: string, adminId: string) => void;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const STORAGE_KEY = 'impersonation_state';

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    businessId: null,
    adminId: null,
  });
  const router = useRouter();
  const pathname = usePathname();

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.isImpersonating && parsed.businessId) {
          setState(parsed);
          // Ensure API header is set if we are reloading the page
          setBusinessRequest(parsed.businessId);
        }
      } catch (e) {
        console.error('Failed to parse impersonation state', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Ref to track if we are in the process of transitioning to dashboard
  const isTransitioningRef = React.useRef(false);

  const startImpersonation = (businessId: string, adminId: string) => {
    const newState = {
      isImpersonating: true,
      businessId,
      adminId,
    };

    // Mark as transitioning to prevent safety check from triggering immediately
    isTransitioningRef.current = true;

    // Update State
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

    // Update API
    setBusinessRequest(businessId);

    // Navigate
    router.push('/dashboard');
  };

  const stopImpersonation = () => {
    isTransitioningRef.current = false;
    // Clear State
    setState({
      isImpersonating: false,
      businessId: null,
      adminId: null,
    });
    localStorage.removeItem(STORAGE_KEY);

    // Clear API
    clearBusinessRequest();

    // Navigate back to admin list
    router.push('/admin/users/business');
  };

  // Safety Check: If we are on an admin route, we MUST NOT be impersonating.
  // This handles manual navigation via URL bar.
  useEffect(() => {
    // If we are transitioning, skip this check
    if (isTransitioningRef.current) {
        // We reset the flag if we are NO LONGER on an admin route (meaning transition succeeded)
        if (!pathname?.startsWith('/admin')) {
             isTransitioningRef.current = false;
        }
        return;
    }

    if (pathname?.startsWith('/admin') && state.isImpersonating) {
      // We don't use stopImpersonation() here because we don't want to redirect
      // (we are already in admin), we just want to clear the state/headers.

      console.warn('Detected Admin route while impersonating. Clearing impersonation state.');

      setState({
        isImpersonating: false,
        businessId: null,
        adminId: null,
      });
      localStorage.removeItem(STORAGE_KEY);
      clearBusinessRequest();
    }
  }, [pathname, state.isImpersonating]);

  return (
    <ImpersonationContext.Provider
      value={{
        ...state,
        startImpersonation,
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
