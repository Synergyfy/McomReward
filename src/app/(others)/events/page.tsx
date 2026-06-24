"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetAllPublicCampaigns } from '@/services/campaigns/hook';
import { PublicCampaignResponse } from '@/services/campaigns/types';

const eventCategories = ["All", "qr_code", "referral", "matching_point"];

export default function EventsExperiences() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: paginatedCampaigns, isLoading } = useGetAllPublicCampaigns(1, 10);

  const campaignsList = paginatedCampaigns?.data || [];

  const filteredEvents = activeCategory === "All"
    ? campaignsList
    : campaignsList.filter(e => e.campaign_type === activeCategory);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="bg-[#101415] text-[#e0e3e5] min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-primary text-white min-h-[380px] flex flex-col justify-center px-8 md:px-12 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">near_me</span>
            EXPLORE EXPERIENCES
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-headline-lg leading-tight tracking-tight">
            Discover Experiences <br/>
            <span className="text-white italic font-medium">Near You</span>
          </h1>
          <p className="text-sm md:text-base opacity-90 leading-relaxed">
            Unlock exclusive access to premium rewards, local meetups, and high-energy business conferences curated for the MCOM community.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="bg-white text-primary px-6 py-3 rounded-full font-bold text-xs shadow hover:bg-orange-50 active:scale-95 transition-all">
              Browse All Events
            </button>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
              {eventCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-[#f54900] shadow'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {cat.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events List */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold font-headline-lg text-white">Upcoming Events</h2>
            <p className="text-xs text-gray-400 mt-1">Handpicked experiences happening this week.</p>
          </div>
          <button className="text-primary font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View Schedule <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#1d2022]/40 rounded-3xl border border-white/5">
            <span className="material-symbols-outlined text-gray-500 text-5xl mb-4">calendar_today</span>
            <p className="text-gray-400 font-bold">No events found in this category.</p>
            <p className="text-gray-500 text-xs mt-1">Check back soon for new member experiences!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#1d2022]/80 rounded-3xl overflow-hidden shadow-sm border border-white/5 group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 relative overflow-hidden bg-[#101415] border-b border-white/5">
                    {event.banner_url || event.bannerUrl ? (
                      <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                           src={event.banner_url || event.bannerUrl} alt={event.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="material-symbols-outlined text-primary text-5xl">event</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm uppercase tracking-wider">
                      {event.campaign_type || 'EVENT'}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-white line-clamp-2 leading-snug">{event.name}</h3>
                      <div className="text-right shrink-0">
                        <span className="block text-primary font-bold text-sm">{formatDate(event.start_date)}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{formatTime(event.start_date)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{event.campaign_message}</p>
                  </div>
                </div>

                <div className="p-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    {event.rewards?.[0] ? `Requires ${event.rewards[0].points_required || event.rewards[0].pointsRequired || 0} Pts` : 'Free Event'}
                  </span>
                  <button className="bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs transition active:scale-95 shadow shadow-primary/10">
                    Get Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Showcases Bento Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline-lg text-white">Featured Showcases</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Showcase Card */}
          <div className="md:col-span-8 bg-[#1d2022] text-white rounded-[32px] p-8 flex flex-col justify-between min-h-[360px] relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <span className="bg-primary text-white px-3.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow">
                EXPO 2024
              </span>
              <h3 className="text-2xl md:text-4xl font-bold font-headline-lg max-w-lg leading-tight">
                MCOM Rewards Expo
              </h3>
              <p className="text-xs md:text-sm text-gray-400 max-w-md leading-relaxed">
                Join 500+ local businesses. Complete offline quests, claim ticket rewards, and network with leading loyalty professionals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 relative z-10 pt-4">
              <button className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow shadow-primary/10 transition active:scale-95">
                Register Free
              </button>
              <div className="flex -space-x-2 text-[10px] font-bold text-white">
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-gray-650" />
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-gray-500" />
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-gray-400" />
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-primary flex items-center justify-center text-[8px]">
                  +3k
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Details Card */}
          <div className="md:col-span-4 bg-primary text-white rounded-[32px] p-8 flex flex-col justify-between min-h-[300px] shadow-md relative overflow-hidden">
            <div className="space-y-2">
              <h4 className="text-xl font-bold font-headline-lg">Exclusive Access</h4>
              <p className="text-xs opacity-90 leading-relaxed">
                Platinum & Gold members receive complimentary VIP hospitality badges.
              </p>
            </div>
            <div>
              <Link href="/membership" className="bg-neutral-900 hover:bg-neutral-850 text-white py-3 rounded-full font-bold text-xs text-center block shadow transition active:scale-95">
                Claim VIP Pass
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

    </div>
  );
}
