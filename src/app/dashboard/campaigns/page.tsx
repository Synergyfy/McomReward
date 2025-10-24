'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateCampaign } from '@/services/campaigns/hook';
import { CreateCampaignRequest } from '@/services/campaigns/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Stepper from '@/components/dashboard/campaigns/Stepper';
import Step1Details from '@/components/dashboard/campaigns/Step1Details';
import Step2Dates from '@/components/dashboard/campaigns/Step2Dates';
import Step3Images from '@/components/dashboard/campaigns/Step3Images';
import Step4Review from '@/components/dashboard/campaigns/Step4Review';
import Step3Reward from '@/components/dashboard/campaigns/Step3Reward';

const steps = ['Details', 'Dates', 'Images', 'Reward', 'Review'];

export default function CampaignsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [subImageUrls, setSubImageUrls] = useState<string[]>([]);
  const [rewardId, setRewardId] = useState('');
  
  const { mutate: createCampaign, isPending: isCreatingCampaign } = useCreateCampaign();

  const handleNext = () => {
    if (currentStep === 3) {
      if (!thumbnailUrl) {
        alert('Please upload a thumbnail image.');
        return;
      }
      if (subImageUrls.filter(url => url).length === 0) {
        alert('Please upload at least one sub-image.');
        return;
      }
    }

    if (currentStep < steps.length) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCompletedSteps(completedSteps.filter(step => step !== currentStep - 1));
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const campaignData: CreateCampaignRequest = {
      title,
      description,
      startDate: startDate || '',
      endDate: endDate || '',
      thumbnailUrl,
      subImageUrls: subImageUrls.filter(url => url), // Ensure only valid URLs are sent
      rewardId,
    };
    createCampaign(campaignData, {
      onSuccess: () => {
        alert('Campaign created successfully!');
        setCurrentStep(1);
        setCompletedSteps([]);
        setTitle('');
        setDescription('');
        setStartDate(undefined);
        setEndDate(undefined);
        setThumbnailUrl('');
        setSubImageUrls([]);
        setRewardId('');
      },
      onError: (error) => {
        alert(`Error creating campaign: ${error.message}`);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Create a New Campaign</h1>
        <p className="mt-2 text-lg text-muted-foreground">Engage your customers with exciting new offers.</p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-2xl rounded-2xl">
        <CardHeader>
          <Stepper steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
        </CardHeader>
        <CardContent className="px-8 py-10">
          <div className="min-h-[300px]">
            {currentStep === 1 && (
              <Step1Details
                title={title}
                description={description}
                setTitle={setTitle}
                setDescription={setDescription}
              />
            )}
            {currentStep === 2 && (
              <Step2Dates
                startDate={startDate}
                endDate={endDate}
                setStartDate={(date) => setStartDate(date?.toISOString())}
                setEndDate={(date) => setEndDate(date?.toISOString())}
              />
            )}
            {currentStep === 3 && (
              <Step3Images
                thumbnailUrl={thumbnailUrl}
                subImageUrls={subImageUrls}
                setThumbnailUrl={setThumbnailUrl}
                setSubImageUrls={setSubImageUrls}
              />
            )}
            {currentStep === 4 && <Step3Reward rewardId={rewardId} setRewardId={setRewardId} />}
            {currentStep === 5 && (
              <Step4Review
                title={title}
                description={description}
                startDate={startDate}
                endDate={endDate}
                thumbnailUrl={thumbnailUrl}
                subImageUrls={subImageUrls}
                rewardId={rewardId}
              />
            )}
          </div>
          <div className="flex justify-between mt-12 border-t pt-6">
            <Button onClick={handlePrev} variant="outline" disabled={currentStep === 1}>
              Back
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isCreatingCampaign} className="bg-green-600 hover:bg-green-700">
                {isCreatingCampaign ? 'Creating...' : 'Finish & Create Campaign'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
