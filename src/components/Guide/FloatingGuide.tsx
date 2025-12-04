'use client';

import React from 'react';
import { useGuide } from '@/context/GuideContext';
import { GUIDE_CONTENT } from '@/lib/guide-content';
import { X } from 'lucide-react';

export const FloatingGuide = () => {
  const { currentStep, isLoading } = useGuide();
  const [isVisible, setIsVisible] = React.useState(true);

  if (isLoading || !isVisible || currentStep === 'COMPLETED') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-orange-100 rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-orange-600 font-bold text-lg flex items-center gap-2">
          <span className="bg-orange-100 p-1 rounded-md text-orange-600 text-xs uppercase tracking-wide">Guide</span>
          Setup Assistant
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close guide"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-gray-700 leading-relaxed text-sm">
        {GUIDE_CONTENT[currentStep]}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-1">
          {(['PROFILE', 'REWARD', 'CAMPAIGN', 'STAFF'] as const).map((step) => (
             <div
               key={step}
               className={`h-1.5 w-6 rounded-full ${
                 currentStep === step ? 'bg-orange-500' :
                 // If the step is "before" the current step, it's done (green/gray).
                 // Simple logic: checking index in array
                 (['PROFILE', 'REWARD', 'CAMPAIGN', 'STAFF'].indexOf(step) < ['PROFILE', 'REWARD', 'CAMPAIGN', 'STAFF'].indexOf(currentStep))
                 ? 'bg-green-400'
                 : 'bg-gray-200'
               }`}
             />
          ))}
        </div>
        <span className="text-xs text-gray-400 font-medium">
          Step {['PROFILE', 'REWARD', 'CAMPAIGN', 'STAFF'].indexOf(currentStep) + 1} of 4
        </span>
      </div>
    </div>
  );
};
