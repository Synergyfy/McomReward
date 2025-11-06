'use client';

import React from 'react';
import FaqAccordion from '@/components/dashboard/support/FaqAccordion';
import TrainingVideoCard from '@/components/dashboard/support/TrainingVideoCard';
import SupportTicketForm from '@/components/dashboard/support/SupportTicketForm';
import { faqData, trainingVideos } from '@/lib/mock-data/support';

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Support & Help Center</h1>

      {/* FAQs Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqData} />
      </div>

      {/* Training Videos Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Training Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingVideos.map(video => (
            <TrainingVideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <SupportTicketForm />
    </div>
  );
}
