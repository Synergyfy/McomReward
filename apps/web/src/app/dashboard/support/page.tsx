'use client';

import React from 'react';
import FaqAccordion from '@/components/dashboard/support/FaqAccordion';
import TrainingVideoCard from '@/components/dashboard/support/TrainingVideoCard';
import SupportTicketForm from '@/components/dashboard/support/SupportTicketForm';
import { faqData } from '@/lib/mock-data/support';
import { useGetTrainingVideos } from '@/services/training-videos/hook';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupportPage() {
  const { data: videoData, isLoading } = useGetTrainingVideos({
      page: 1,
      limit: 100,
      target_audience: 'business'
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Support & Help Center</h1>

      {/* FAQs Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqData} />
      </div>

      {/* Training Videos Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Training Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                 <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
             ))
          ) : (
             videoData?.items.map(video => (
                <TrainingVideoCard key={video.id} video={video} />
              ))
          )}

          {!isLoading && (!videoData?.items || videoData.items.length === 0) && (
             <div className="col-span-full text-center text-gray-500 py-10 border rounded-lg bg-gray-50">
                No training videos available for business owners at this time.
             </div>
          )}
        </div>
      </div>

      {/* Contact Support Section */}
      <SupportTicketForm />
    </div>
  );
}
