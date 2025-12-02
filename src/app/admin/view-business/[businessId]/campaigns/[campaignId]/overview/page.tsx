'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import {
    Calendar, Tag, Info, Gift, Users, Trophy,
    LayoutTemplate, Palette, Phone, Mail, Globe,
    CreditCard, Coins, Type
} from "lucide-react";
import LoadingSpinner from '@/components/ui/Loading';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function CustomerCampaignOverviewPage() {
    const params = useParams();
    const { campaignId } = params;

    const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError || !campaign) {
        return <p className="text-center text-lg text-red-500 py-20">Campaign not found.</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden group">
                <Image
                    src={campaign.bannerUrl || 'https://via.placeholder.com/1920x600?text=No+Banner'}
                    alt={campaign.name}
                    layout="fill"
                    objectFit="cover"
                    className="brightness-50 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end pb-12 px-6 md:px-16">
                    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end md:items-center gap-8">
                        {/* Logo Overlay */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 bg-white">
                            {campaign.logoUrl ? (
                                <Image
                                    src={campaign.logoUrl}
                                    alt="Campaign Logo"
                                    layout="fill"
                                    objectFit="cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <span className="text-xs font-bold uppercase">No Logo</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-white">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-sm uppercase tracking-wide">
                                    {campaign.campaignType?.replace('_', ' ')}
                                </Badge>
                                {campaign.disabled && (
                                    <Badge variant="destructive" className="px-3 py-1 text-sm uppercase tracking-wide">
                                        Disabled
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3 drop-shadow-xl">
                                {campaign.name}
                            </h1>
                            <p className="text-lg text-gray-200 max-w-2xl line-clamp-2">
                                {campaign.campaignMessage}
                            </p>
                        </div>

                        {/* CTA Preview */}
                        <div className="hidden md:block shrink-0">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                <p className="text-white/80 text-xs mb-2 uppercase font-semibold tracking-wider text-center">CTA Preview</p>
                                <Button
                                    className="shadow-lg text-lg px-8 py-6 transition-transform hover:scale-105 bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {campaign.ctaText || 'Claim Reward'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 space-y-8">

                {/* Quick Stats / Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white shadow-lg border-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Start Date</p>
                                <p className="text-sm font-semibold text-gray-900">{new Date(campaign.startDate).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-lg border-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">End Date</p>
                                <p className="text-sm font-semibold text-gray-900">{new Date(campaign.endDate).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-lg border-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Audience</p>
                                <p className="text-sm font-semibold text-gray-900 capitalize">{campaign.audienceType}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-lg border-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full text-green-600">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Quantity</p>
                                <p className="text-sm font-semibold text-gray-900">{campaign.quantity > 0 ? campaign.quantity : 'Unlimited'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Configuration Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Points Configuration */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-orange-600" />
                                    <CardTitle className="text-lg font-bold text-gray-800">Points Configuration</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Reward Type</p>
                                    <p className="font-medium text-gray-900 capitalize">{campaign.rewardType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Sign Up Bonus</p>
                                    <p className="font-medium text-gray-900">{campaign.signUpPoint} Points</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Regular Threshold</p>
                                    <p className="font-medium text-gray-900">{campaign.regularPointsThreshold} Points</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Matching Threshold</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{campaign.matchingPointsThreshold} Points</p>
                                        {campaign.matchingPointsDisabledByAdmin && (
                                            <Badge variant="outline" className="text-xs text-red-500 border-red-200">Disabled by Admin</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Campaign Pages */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <LayoutTemplate className="w-5 h-5 text-blue-600" />
                                    <CardTitle className="text-lg font-bold text-gray-800">Campaign Pages</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 divide-y divide-gray-100">
                                {/* Earn Points Page */}
                                <div className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-yellow-500" /> Earn Points Page
                                        </h4>
                                        <Link href={`/dashboard/campaigns/${campaignId}/earn-points`}>
                                            <Button variant="outline" size="sm" className="text-xs h-8">
                                                View Page
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Title</p>
                                            <p className="text-sm text-gray-800">{campaign.earnPointPageTitle || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Description</p>
                                            <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.earnPointPageDescription || '-' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Redeem Rewards Page */}
                                <div className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-pink-500" /> Redeem Rewards Page
                                        </h4>
                                        <Link href={`/dashboard/campaigns/${campaignId}/redeem-points`}>
                                            <Button variant="outline" size="sm" className="text-xs h-8">
                                                View Page
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Title</p>
                                            <p className="text-sm text-gray-800">{campaign.redeemRewardPageTitle || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Description</p>
                                            <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.redeemRewardPageDescription || '-' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Us Page */}
                                <div className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-500" /> Contact Us Page
                                        </h4>
                                        <Link href={`/dashboard/campaigns/${campaignId}/contact-us`}>
                                            <Button variant="outline" size="sm" className="text-xs h-8">
                                                View Page
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Title</p>
                                            <p className="text-sm text-gray-800">{campaign.contactUsPageTitle || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Description</p>
                                            <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.contactUsPageDescription || '-' }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {campaign.contactEmail || 'No Email'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {campaign.contactPhoneNumber || 'No Phone'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Theme & Rewards */}
                    <div className="lg:col-span-1 space-y-8">

                        {/* Theme Preview */}
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-purple-600" />
                                    <CardTitle className="text-lg font-bold text-gray-800">Theme Settings</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Background Color</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: campaign.backgroundColor }}></div>
                                        <span className="text-xs font-mono text-gray-500">{campaign.backgroundColor}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Text Color</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: campaign.textColor }}></div>
                                        <span className="text-xs font-mono text-gray-500">{campaign.textColor}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Footer Text</p>
                                    <p className="text-sm text-gray-700 italic">"{campaign.footerText || 'No footer text'}"</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rewards List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-orange-600" /> Rewards ({campaign.rewards?.length || 0})
                            </h3>
                            {campaign.rewards && campaign.rewards.length > 0 ? (
                                <div className="space-y-4">
                                    {campaign.rewards.map((reward, index) => (
                                        <Card key={index} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex h-24">
                                                <div className="w-24 relative shrink-0 bg-gray-100">
                                                    <Image
                                                        src={reward.image}
                                                        alt={reward.title}
                                                        layout="fill"
                                                        objectFit="cover"
                                                    />
                                                </div>
                                                <div className="p-3 flex flex-col justify-center flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate">{reward.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-xs font-normal">
                                                            {reward.points_required} Pts
                                                        </Badge>
                                                        {reward.value > 0 && (
                                                            <span className="text-xs text-green-600 font-medium">£{reward.value}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-auto pt-1">Qty: {reward.quantity}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No rewards configured.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
