// src/components/reward/BusinessConsumerCTASection.tsx
import React from 'react';

interface CTACardProps {
  title: string;
  bullets: string[];
  buttonText: string;
  buttonVariant: 'orange' | 'black';
  bgColor: string;
}

const CTACard: React.FC<CTACardProps> = ({ title, bullets, buttonText, buttonVariant, bgColor }) => {
  const buttonClasses =
    buttonVariant === 'orange'
      ? 'bg-orange-500 hover:bg-orange-600 text-white'
      : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white';

  return (
    <div className={`p-8 rounded-lg shadow-md flex flex-col h-full ${bgColor}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <ul className="list-disc list-inside text-gray-700 mb-6 flex-grow space-y-2">
        {bullets.map((bullet, idx) => (
          <li key={idx}>{bullet}</li>
        ))}
      </ul>
      <a
        href="#"
        className={`mt-auto py-3 px-8 rounded-full transition duration-300 ease-in-out text-center font-bold ${buttonClasses}`}
      >
        {buttonText}
      </a>
    </div>
  );
};

const BusinessConsumerCTASection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CTACard
            title="Grow Your Business With Rewards"
            bullets={[
              'Attract more customers',
              'Increase loyalty',
              'Run unlimited reward campaigns',
            ]}
            buttonText="Create a Reward"
            buttonVariant="orange"
            bgColor="bg-white"
          />
          <CTACard
            title="Save Money Every Day"
            bullets={[
              'Claim local offers',
              'Earn stamps & points',
              'Join fun events',
            ]}
            buttonText="Browse Rewards"
            buttonVariant="black"
            bgColor="bg-gray-50"
          />
        </div>
      </div>
    </section>
  );
};

export default BusinessConsumerCTASection;
