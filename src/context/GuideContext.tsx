'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GuideStep, GUIDE_STEPS_ORDER, GUIDE_CONTENT } from '@/lib/guide-content';

interface GuideContextType {
  currentStep: GuideStep;
  isGuideOpen: boolean;
  startGuide: () => void;
  completeStep: (step: GuideStep) => void;
  skipGuide: () => void;
  toggleGuide: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<GuideStep>(GuideStep.PROFILE);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem('guide_step') as GuideStep;
    const savedStatus = localStorage.getItem('guide_status');

    if (savedStep && Object.values(GuideStep).includes(savedStep)) {
      setCurrentStep(savedStep);
    }

    // Auto-open guide if not completed and not explicitly closed
    if (savedStatus !== 'skipped' && savedStep !== GuideStep.COMPLETED) {
        setIsGuideOpen(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('guide_step', currentStep);
  }, [currentStep]);

  const startGuide = () => {
    setCurrentStep(GuideStep.PROFILE);
    setIsGuideOpen(true);
    localStorage.removeItem('guide_status');
    router.push(GUIDE_CONTENT[GuideStep.PROFILE]!.targetRoute);
  };

  const completeStep = (step: GuideStep) => {
    if (step !== currentStep) return;

    const currentIndex = GUIDE_STEPS_ORDER.indexOf(step);
    const nextStep = GUIDE_STEPS_ORDER[currentIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep);

      // If the guide was closed, re-open it for the next step
      setIsGuideOpen(true);

      // Optionally redirect to the next route (as requested by user preference to "Instruct" but auto-redirect is often smoother)
      // The user said: "Or should the guide just say 'Now click on Rewards in the sidebar'?"
      // But then in the clarified plan I wrote: "Logic to automatically redirect the user to the next route when a step is completed."
      // I will implement auto-redirect as it feels more "automated" which was requested.
      if (nextStep !== GuideStep.COMPLETED) {
         const content = GUIDE_CONTENT[nextStep];
         if (content) {
             // We can optionally delay this or just do it.
             // Let's do it immediately for a smooth flow.
             router.push(content.targetRoute);
         }
      }
    }
  };

  const skipGuide = () => {
    setIsGuideOpen(false);
    localStorage.setItem('guide_status', 'skipped');
  };

  const toggleGuide = () => {
    setIsGuideOpen((prev) => !prev);
  };

  return (
    <GuideContext.Provider
      value={{
        currentStep,
        isGuideOpen,
        startGuide,
        completeStep,
        skipGuide,
        toggleGuide,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};
