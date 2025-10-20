'use client';

import React, { useState } from 'react';
import Step1Details from '@/components/dashboard/campaigns/Step1Details';
import Step2Dates from '@/components/dashboard/campaigns/Step2Dates';
import Step3Reward from '@/components/dashboard/campaigns/Step3Reward';
import Step4Review from '@/components/dashboard/campaigns/Step4Review';
import { Button } from '@/components/ui/button';
import { useCreateCampaign } from '@/services/campaigns/hook';
import { CreateCampaignRequest } from '@/services/campaigns/types';

export default function CampaignsPage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [rewardId, setRewardId] = useState('');
  const { mutate: createCampaign, isPending: isCreatingCampaign } = useCreateCampaign();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = () => {
    const campaignData: CreateCampaignRequest = {
      title,
      description,
      startDate: startDate?.toISOString() || '',
      endDate: endDate?.toISOString() || '',
      rewardId,
    };
    createCampaign(campaignData, {
      onSuccess: () => {
        alert('Campaign created successfully!');
        setStep(1);
        setTitle('');
        setDescription('');
        setStartDate(undefined);
        setEndDate(undefined);
        setRewardId('');
      },
      onError: (error) => {
        alert(`Error creating campaign: ${error.message}`);
      },
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-primary">Create Campaign</h1>
      <div className="max-w-md">
        {step === 1 && (
          <Step1Details
            title={title}
            description={description}
            setTitle={setTitle}
            setDescription={setDescription}
          />
        )}
        {step === 2 && (
          <Step2Dates
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        )}
        {step === 3 && <Step3Reward rewardId={rewardId} setRewardId={setRewardId} />}
        {step === 4 && (
          <Step4Review
            title={title}
            description={description}
            startDate={startDate}
            endDate={endDate}
            rewardId={rewardId}
          />
        )}
        <div className="flex justify-between mt-10">
          {step > 1 && <Button onClick={prevStep}>Back</Button>}
          {step < 4 && <Button onClick={nextStep}>Next</Button>}
          {step === 4 && (
            <Button onClick={handleSubmit} disabled={isCreatingCampaign}>
              {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
