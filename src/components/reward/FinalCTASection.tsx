// src/components/reward/FinalCTASection.tsx
import React from 'react';

const FinalCTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-orange-400 to-orange-600 py-20 md:py-28 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Start Earning Rewards Today
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
          Join thousands of people saving money and supporting local businesses.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <a
            href="#"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out w-full md:w-auto text-center"
          >
            Join MCOM Reward
          </a>
          <a
            href="#"
            className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out w-full md:w-auto text-center"
          >
            Explore Rewards
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
