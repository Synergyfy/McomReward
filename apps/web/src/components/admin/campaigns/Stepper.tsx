'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

export default function Stepper({ steps, currentStep, completedSteps }: StepperProps) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = completedSteps.includes(stepNumber);
        const isCurrent = stepNumber === currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-orange-600 text-white scale-110' : 'bg-gray-200 text-gray-500'}
                `}
              >
                {isCompleted ? <Check /> : stepNumber}
              </div>
              <p className={`mt-2 text-sm font-semibold ${isCurrent ? 'text-orange-600' : 'text-gray-500'}`}>
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: isCompleted || isCurrent ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
