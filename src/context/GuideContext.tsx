
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { GUIDE_CONTENT } from '@/lib/guide-content';

interface GuideContextType {
    activeGuideId: string | null;
    currentStepIndex: number;
    isGuideVisible: boolean;
    startGuide: (guideId: string) => void;
    endGuide: () => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    toggleVisibility: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider = ({ children }: { children: ReactNode }) => {
    const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isGuideVisible, setIsGuideVisible] = useState(false);

    // Load state from localStorage on mount (for persistence across navigations)
    useEffect(() => {
        const savedGuideId = localStorage.getItem('mcom_active_guide_id');
        const savedStepIndex = localStorage.getItem('mcom_guide_step_index');
        const savedVisibility = localStorage.getItem('mcom_guide_visible');

        if (savedGuideId) {
            setActiveGuideId(savedGuideId);
            setIsGuideVisible(savedVisibility === 'true');
            if (savedStepIndex) {
                setCurrentStepIndex(parseInt(savedStepIndex, 10));
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (activeGuideId) {
            localStorage.setItem('mcom_active_guide_id', activeGuideId);
            localStorage.setItem('mcom_guide_step_index', currentStepIndex.toString());
            localStorage.setItem('mcom_guide_visible', isGuideVisible.toString());
        } else {
            localStorage.removeItem('mcom_active_guide_id');
            localStorage.removeItem('mcom_guide_step_index');
            localStorage.removeItem('mcom_guide_visible');
        }
    }, [activeGuideId, currentStepIndex, isGuideVisible]);

    const startGuide = useCallback((guideId: string) => {
        if (GUIDE_CONTENT[guideId]) {
            setActiveGuideId(guideId);
            setCurrentStepIndex(0);
            setIsGuideVisible(true);
        } else {
            console.warn(`Guide with ID ${guideId} not found.`);
        }
    }, []);

    const endGuide = useCallback(() => {
        setActiveGuideId(null);
        setCurrentStepIndex(0);
        setIsGuideVisible(false);
    }, []);

    const nextStep = useCallback(() => {
        if (activeGuideId) {
            const steps = GUIDE_CONTENT[activeGuideId];
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                // Optionally end guide or stay on last step
                // endGuide();
            }
        }
    }, [activeGuideId, currentStepIndex]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const goToStep = useCallback((index: number) => {
        if (activeGuideId) {
            const steps = GUIDE_CONTENT[activeGuideId];
            if (index >= 0 && index < steps.length) {
                setCurrentStepIndex(index);
            }
        }
    }, [activeGuideId]);

    const toggleVisibility = useCallback(() => {
        setIsGuideVisible(prev => !prev);
    }, []);

    return (
        <GuideContext.Provider value={{
            activeGuideId,
            currentStepIndex,
            isGuideVisible,
            startGuide,
            endGuide,
            nextStep,
            prevStep,
            goToStep,
            toggleVisibility
        }}>
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
