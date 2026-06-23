"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const eventCategories = ["All", "Music", "Culinary", "Wellness", "Business"];

const initialEvents = [
  {
    id: "sunset-rhythm-2024",
    name: "Sunset Rhythm Festival 2024",
    category: "Music",
    date: "Oct 12",
    time: "7:00 PM",
    desc: "Experience the soul of the city under the glowing horizon with international headliners.",
    price: 45.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCO7LxLP6yAKQ5RVrh5K8epFVHVOkw_4j1OuJilYD-D7YfiinKm-98uNXtGf-vMgqc0yJKqmQ0n3XQlwXBOpEtVA6KWfK8KleV7ecI1bVOfpgOG2khtCaPx8k9NJc7y9LmdDF1Xz5kAne3tEiRnS9ZPDtmSDvIrJJsXdiUWa6np8jGbJ6IdKOcKL-ivfL1JixIWe-utX7vTaToMDgnH3VcDReR7Tj0ZzhCDabYe46u2HyzRmsHW12gfpnbQaaDkEAq5F41WEpr9YusL"
  },
  {
    id: "artisan-pastry-masterclass",
    name: "Masterclass: Artisan Pastry",
    category: "Culinary",
    date: "Oct 15",
    time: "10:00 AM",
    desc: "Join Chef Julian for an intimate session on the delicate art of French pastry making.",
    price: 89.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNlxOIqeZYi-ddlhVcHqrsYpiC5w2sEPm1OQHq7sbEK0ZeR-k9jk47_qKH-qwYOJNXyCXLYMYI_Ke2wZwQZOvlmIthFQymVGH90rHl773nacRx74Z7L1RSxZ9OAPz0n21r8J00yukG_NbWMY5iAvFDcHhvqPTBl9kiNHxRiM6wbQRjBE77tChgJ7SU-DEFO88t-jSzQacFeZ0NOH0gTq8rKkEl7OfvyYM4IUf9mGWK80mYgfyBsOtzVImwZ_2jsjk9RhxOUPWJnlA1"
  },
  {
    id: "morning-zen-retreat",
    name: "Morning Zen Retreat",
    category: "Wellness",
    date: "Oct 18",
    time: "6:30 AM",
    desc: "Reconnect with your inner self through guided meditation and sunrise yoga flow.",
    price: 25.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMyVYbwCZd3GrCFDgjhFezfuxEozsdE2PwNlh5tiQkxJcRyWFe_-fWIvDvzjqJ6iMeJ-aUUfoBpz9Fo_zbVR7Gc3hvv8FTwv3uz6RuIIQwBviWQC7pDM0m_H6q2eS-LdWoZmRilZ6lJgtDjjc84E1rXS-dvXWjRPGCYiycTPvlXRrXrDMM7qoRLCfEO9MoNLgowz3vvqSM_9NSpcxg7X5scR0XF-YaEuhCHO-wukrOEnQJVUUJwLqVvy4zGIM53Z_lCcmea1Oae5ht"
  }
];

export default function EventsExperiences() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredEvents = activeCategory === "All"
    ? initialEvents
    : initialEvents.filter(e => e.category === activeCategory);

  return (
    <div className="bg-surface-bright text-on-surface min-h-screen py-8 max-w-7xl mx-auto px-6 space-y-12">
      
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-orange-500 text-white min-h-[380px] flex flex-col justify-center px-8 md:px-12 shadow-lg">
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
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold text-xs shadow hover:bg-orange-50 active:scale-95 transition-all">
              Browse All Events
            </button>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
              {eventCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-orange-600 shadow'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
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
            <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Upcoming Events</h2>
            <p className="text-xs text-gray-500 mt-1">Handpicked experiences happening this week.</p>
          </div>
          <button className="text-orange-500 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
            View Schedule <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={event.id}
                className="min-w-[300px] md:min-w-[360px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 relative overflow-hidden bg-gray-50">
                    <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                         src={event.image} alt={event.name} />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-orange-600 shadow-sm uppercase tracking-wider">
                      {event.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-gray-800 line-clamp-2 leading-snug">{event.name}</h3>
                      <div className="text-right shrink-0">
                        <span className="block text-orange-500 font-bold text-sm">{event.date}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{event.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{event.desc}</p>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-850">£{event.price.toFixed(2)}</span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs transition active:scale-95 shadow shadow-orange-500/10">
                    Get Tickets
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Featured Showcases Bento Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline-lg text-gray-900">Featured Showcases</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Showcase Card */}
          <div className="md:col-span-8 bg-neutral-900 text-white rounded-[32px] p-8 flex flex-col justify-between min-h-[360px] relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <span className="bg-orange-500 text-white px-3.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow">
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
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow shadow-orange-500/10 transition active:scale-95">
                Register Free
              </button>
              <div className="flex -space-x-2 text-[10px] font-bold text-white">
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-gray-600" />
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-gray-500" />
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-gray-400" />
                <div className="w-7 h-7 rounded-full border border-neutral-900 bg-orange-500 flex items-center justify-center text-[8px]">
                  +3k
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Details Card */}
          <div className="md:col-span-4 bg-orange-500 text-white rounded-[32px] p-8 flex flex-col justify-between min-h-[300px] shadow-md relative overflow-hidden">
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
