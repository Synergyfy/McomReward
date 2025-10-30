'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, Gift, CheckCircle, Users, Trophy, Menu, X } from "lucide-react";
import { JoinConfirmationDialog } from "@/components/customer/JoinConfirmationDialog";

interface PageProps {
  params: Promise<{ campaignId: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Expanded mock data for a single campaign
const mockCampaign = {
  id: '1',
  title: 'Exclusive Summer Rewards Extravaganza!',
  tagline: 'Unlock amazing benefits and discounts all summer long!',
  description: 'Dive into a season of unparalleled rewards with our Summer Extravaganza campaign! Earn double points on all purchases, get exclusive access to flash sales, and stand a chance to win a grand summer getaway. This campaign is designed to give back to our most loyal customers, offering a blend of immediate gratification and long-term value. Don\'t miss out on making your summer shopping more rewarding than ever before!',
  heroImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
  businessLogoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG0wby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example logo
  businessName: 'Mcom Loyalty Store',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-08-31T23:59:59.000Z',
  category: 'Retail & Lifestyle',
  campaignType: 'special_occasion',
  rewardsAvailable: 500,
  audienceType: ['members', 'badge_level'],
  badgeLevel: 'GOLD',
  wishlistItemId: '',
  stopAfterClaims: 100,
  rewards: [
    {
      id: 'reward-summer-getaway',
      title: 'Luxury Weekend Getaway for Two!',
      description: 'Win an all-expenses-paid luxury weekend getaway to a destination of your choice. Includes flights, 5-star accommodation, and exclusive experiences. A truly unforgettable reward for our top earners!',
      points_required: 10000,
      value: '£2,500',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      quantity: 5,
    },
    {
      id: 'reward-double-points',
      title: 'Double Points on All Purchases',
      description: 'Earn twice the loyalty points on every purchase you make throughout the campaign period. Accelerate your way to exclusive rewards and benefits!',
      points_required: 0,
      value: 'N/A',
      image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      quantity: 0,
    },
    {
      id: 'reward-flash-sale-access',
      title: 'Exclusive Flash Sale Access',
      description: 'Get early and exclusive access to our special flash sales, featuring deep discounts on popular products. Be the first to grab the best deals!',
      points_required: 0,
      value: 'N/A',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      quantity: 0,
    },
  ],
  howToEarn: [
    'Earn 2x points on all purchases made in June.',
    'Earn 1.5x points on all purchases made in July.',
    'Refer a friend and get 500 bonus points when they make their first purchase.',
    'Participate in our weekly challenges to earn extra points.',
  ],
  termsAndConditions: [
    'Campaign valid from June 1st to August 31st, 2025.',
    'Points are awarded automatically upon qualifying transactions.',
    'The Luxury Weekend Getaway reward is subject to availability and booking terms.',
    'Referral bonus points are credited after the referred friend\'s first successful transaction.',
    'Mcom Loyalty Store reserves the right to modify or cancel the campaign at any time.',
  ],
};

export default function CampaignDetailPage({}: PageProps) {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinedCampaignTitle, setJoinedCampaignTitle] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const campaign = mockCampaign;
  const isLoading = false;

  const handleJoin = () => {
    setJoinedCampaignTitle(campaign.title);
    setIsJoinDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {isLoading ? (
        <p className="text-center text-lg py-20">Loading campaign details...</p>
      ) : campaign ? (
        <div className="relative">
          <header className="relative bg-white shadow-md z-50 fixed top-0 left-0 right-0">
            <div className="container mx-auto flex justify-between items-center p-4">
              {/* Logo Section */}
              <div className="flex items-center space-x-3">
                {campaign.businessLogoUrl && (
                  <Image
                    src={campaign.businessLogoUrl}
                    alt={campaign.businessName + ' Logo'}
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-gray-200 shadow-sm"
                  />
                )}
                <span className="text-xl font-bold text-gray-800">{campaign.businessName}</span>
              </div>

              {/* Desktop Menu */}
              <nav className="hidden md:flex">
                <ul className="flex space-x-6">
                  <li><a href="/campaigns/earn-points" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">EARN POINTS</a></li>
                  <li><a href="/campaigns/redeem-points" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">REDEEM POINTS</a></li>
                  <li><a href="/campaigns/contact-us" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">CONTACT US</a></li>
                  <li><a href="/my-points" className="text-gray-600 hover:text-orange-600 transition-colors duration-200">MY POINTS</a></li>
                </ul>
              </nav>

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg pb-4 pt-2">
                <ul className="flex flex-col items-center space-y-4">
                  <li><a href="/campaigns/earn-points" className="text-gray-800 hover:text-orange-600 transition-colors duration-200 text-lg" onClick={() => setIsMobileMenuOpen(false)}>EARN POINTS</a></li>
                  <li><a href="/campaigns/redeem-points" className="text-gray-800 hover:text-orange-600 transition-colors duration-200 text-lg" onClick={() => setIsMobileMenuOpen(false)}>REDEEM POINTS</a></li>
                  <li><a href="/campaigns/contact-us" className="text-gray-800 hover:text-orange-600 transition-colors duration-200 text-lg" onClick={() => setIsMobileMenuOpen(false)}>CONTACT US</a></li>
                  <li><a href="/my-points" className="text-gray-800 hover:text-orange-600 transition-colors duration-200 text-lg" onClick={() => setIsMobileMenuOpen(false)}>MY POINTS</a></li>
                </ul>
              </div>
            )}
          </header>

          {/* Hero Section - Title and Headline */}
          <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
            <Image
              src={campaign.heroImageUrl}
              alt={campaign.title}
              layout="fill"
              objectFit="cover"
              className="brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-16 px-4 md:px-8 lg:px-16">
              <div className="max-w-4xl mx-auto text-white text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                  {campaign.title}
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
                  {campaign.tagline}
                </p>
                <Button
                  onClick={handleJoin}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Join Campaign & Get Reward
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto py-12 px-4 md:px-8 lg:px-16 relative z-10">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 -mt-20">
              {/* Campaign Description */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Campaign</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {campaign.description}
                </p>
              </section>

              {/* Key Information */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 shadow-md border-l-4 border-orange-600">
                  <CardHeader className="!p-0 mb-3">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                      Campaign Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0 text-gray-700 text-lg">
                    <p>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card className="p-6 shadow-md border-l-4 border-orange-600">
                  <CardHeader className="!p-0 mb-3">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Tag className="w-5 h-5 mr-2 text-orange-600" />
                      Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0 text-gray-700 text-lg">
                    <p>{campaign.category}</p>
                  </CardContent>
                </Card>
              </section>

              {/* Eligibility & Limits */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Eligibility & Limits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 shadow-md border-l-4 border-orange-600">
                    <CardHeader className="!p-0 mb-3">
                      <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                        <Users className="w-5 h-5 mr-2 text-orange-600" />
                        Target Audience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="!p-0 text-gray-700 text-lg">
                      {campaign.audienceType.length > 0 ? (
                        <p>
                          {campaign.audienceType.map((type, index) => {
                            let audienceText = '';
                            if (type === 'members') audienceText = 'All Members';
                            if (type === 'badge_level') audienceText = `Members with ${campaign.badgeLevel} Badge`;
                            if (type === 'wishlist_target') audienceText = `Wishlist for "${campaign.wishlistItemId}"`;
                            return (
                              <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-1">
                                {audienceText}
                              </span>
                            );
                          })}
                        </p>
                      ) : (
                        <p>All Customers</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="p-6 shadow-md border-l-4 border-orange-600">
                    <CardHeader className="!p-0 mb-3">
                      <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                        <Info className="w-5 h-5 mr-2 text-orange-600" />
                        Campaign Limits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="!p-0 text-gray-700 text-lg">
                      {campaign.rewardsAvailable > 0 && <p>Rewards Available: {campaign.rewardsAvailable}</p>}
                      {campaign.stopAfterClaims > 0 && <p>Stops After: {campaign.stopAfterClaims} Claims</p>}
                      {campaign.rewardsAvailable === 0 && campaign.stopAfterClaims === 0 && <p>Unlimited Rewards/Claims</p>}
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Multiple Rewards Display */}
              {campaign.rewards && campaign.rewards.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Rewards in this Campaign</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaign.rewards.map((rewardItem, index) => (
                      <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <div className="relative h-48 w-full">
                          <Image
                            src={rewardItem.image}
                            alt={rewardItem.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{rewardItem.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{rewardItem.description}</p>
                          <div className="flex justify-between items-center text-md font-semibold text-gray-700">
                            <p className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-blue-500" /> {rewardItem.points_required > 0 ? `${rewardItem.points_required} Points` : 'No Points Req.'}</p>
                            {rewardItem.value && <p>{rewardItem.value}</p>}
                          </div>
                          {rewardItem.quantity > 0 && (
                            <p className="text-xs text-gray-500 mt-2">Limited: {rewardItem.quantity} available</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* How to Earn */}
              {campaign.howToEarn && campaign.howToEarn.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">How to Participate & Earn</h2>
                  <ul className="space-y-3 text-lg text-gray-700">
                    {campaign.howToEarn.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Terms and Conditions */}
              {campaign.termsAndConditions && campaign.termsAndConditions.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
                  <ul className="space-y-3 text-base text-gray-600 list-disc pl-5">
                    {campaign.termsAndConditions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Sticky Join Button */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
            <div className="max-w-4xl mx-auto flex justify-center">
              <Button
                onClick={handleJoin}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Join Campaign & Get Reward
              </Button>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="container mx-auto text-center">
              <p>&copy; 2025 Mcom Loyalty Store. All rights reserved.</p>
              <div className="flex justify-center space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <p className="text-center text-lg text-red-500 py-20">Campaign not found.</p>
      )}
      <JoinConfirmationDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        campaignTitle={joinedCampaignTitle}
      />
    </div>
  );
}
