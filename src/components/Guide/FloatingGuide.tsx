'use client';

import React from 'react';
import { useGuide } from '@/context/GuideContext';
import { GUIDE_CONTENT, GuideStep } from '@/lib/guide-content';
import { X, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function FloatingGuide() {
  const { currentStep, isGuideOpen, skipGuide, completeStep } = useGuide();
  const router = useRouter();

  if (!isGuideOpen || currentStep === GuideStep.COMPLETED) {
    return null;
  }

  const content = GUIDE_CONTENT[currentStep];

  if (!content) return null;

  const handleAction = () => {
    router.push(content.targetRoute);
  };

  const handleManualComplete = () => {
      completeStep(currentStep);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Card className="shadow-2xl border-orange-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-gray-400 hover:text-gray-600" onClick={skipGuide}>
                <X size={14} />
            </Button>
        </div>

        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Guide
             </span>
             <span className="text-xs text-gray-400 font-medium ml-auto">
                Step {Object.values(GuideStep).indexOf(currentStep) + 1} of 4
             </span>
          </div>
          <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
            {content.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-3 text-sm text-gray-600">
          {content.description}
        </CardContent>

        <CardFooter className="pt-0 flex justify-between gap-2">
            <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={handleManualComplete}
            >
                Skip Step
            </Button>
            <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8 gap-1 shadow-sm"
                onClick={handleAction}
            >
                {content.actionLabel}
                <ChevronRight size={12} />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
