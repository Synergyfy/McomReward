// src/components/reward/InteractiveRewardFlowSection.tsx
import React from 'react';
import { QrCode, Gift, Award, Store } from 'lucide-react';

interface FlowStepProps {
  stepNumber: number;
  title: string;
  illustration: React.ElementType; // Now accepts a React component
}

const FlowStep: React.FC<FlowStepProps> = ({ stepNumber, title, illustration: Icon }) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-4">
        <Icon className="text-4xl text-orange-600" /> {/* Render Lucide icon */}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Step {stepNumber}: {title}</h3>
    </div>
  );
};

const InteractiveRewardFlowSection: React.FC = () => {
  const flowSteps = [
    {
      stepNumber: 1,
      title: 'Create A Business Account',
      illustration: QrCode, // Use Lucide QrCode icon
    },
    {
      stepNumber: 2,
      title: 'See Active Rewards',
      illustration: Gift, // Use Lucide Gift icon
    },
    {
      stepNumber: 3,
      title: 'Claim/Create Reward',
      illustration: Award, // Use Lucide Award icon
    },
    {
      stepNumber: 4,
      title: 'Attach Reward to Campaign',
      illustration: Store, // Use Lucide Store icon
    },
  ];

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">How It Works.</h2>
        <div className="relative flex flex-col md:flex-row justify-between items-center">
          {flowSteps.map((step, index) => (
            <React.Fragment key={index}>
              <FlowStep {...step} />
              {index < flowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 transform -translate-y-1/2 h-1 w-full bg-gray-300 z-0">
                  <div
                    className="absolute left-0 right-0 h-full bg-orange-400"
                    style={{ width: `${(index + 0.5) / (flowSteps.length - 1) * 100}%` }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveRewardFlowSection;
