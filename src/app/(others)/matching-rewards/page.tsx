'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Sparkles,
    Zap,
    Gift,
    TrendingUp,
    Users,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    BarChart3,
    Wallet,
    Crown,
    Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MatchingRewardsContent() {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') === 'business' ? 'business' : 'customer';

    const isBusiness = view === 'business';

    return (
        <div className="bg-white min-h-screen pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 bg-gray-900 border-b border-gray-800 overflow-hidden">
                {/* Immersive Background */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-orange-400 border border-white/10 text-sm font-bold mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-4 h-4" />
                        <span>{isBusiness ? "For Businesses & Merchants" : "For Loyalty Members"}</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 uppercase">
                        {isBusiness ? (
                            <>Scale Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Loyalty Strategy</span></>
                        ) : (
                            <>The Next Level of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Reward Points</span></>
                        )}
                    </h1>

                    <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-400 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium italic">
                        {isBusiness
                            ? "Power up your customer retention with high-impact matching points that drive repeat business and increase brand value."
                            : "Unlock unprecedented value. Every point you earn is amplified, giving you access to premium rewards that were once out of reach."}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white text-lg px-10 py-8 rounded-2xl font-bold shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
                            {isBusiness ? "Partner With Us" : "Join Free & Start Earning"}
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-lg px-10 py-8 rounded-2xl font-bold transition-all backdrop-blur-sm">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Core Concept Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 animate-in fade-in transition-all duration-1000">
                        <h2 className="text-sm font-black text-orange-600 uppercase tracking-[0.3em] mb-4">The Mechanism</h2>
                        <p className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight italic">
                            {isBusiness ? "A Win-Win ecosystem for Growth" : "Think of it as Points, but Smarter"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-gray-50 transition-colors group cursor-default">
                                <div className="w-14 h-14 shrink-0 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                        {isBusiness ? "Dynamic Attribution" : "Automatic Amplification"}
                                    </h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {isBusiness
                                            ? "Easily award matching points based on customer behavior, spending tiers, and promotional windows to maximize engagement."
                                            : "Whenever you earn base points at our partners, receive matching points that can be used for exclusive premium rewards."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-pink-50/30 transition-colors group cursor-default">
                                <div className="w-14 h-14 shrink-0 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                                        {isBusiness ? "Viral Loops" : "Premium Redemption"}
                                    </h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {isBusiness
                                            ? "Encourage customers to refer friends by rewarding them with matching points, creating a sustainable growth cycle."
                                            : "Our matching point catalog features rewards you can't get anywhere else—from VIP events to luxury electronics."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-purple-50/30 transition-colors group cursor-default">
                                <div className="w-14 h-14 shrink-0 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                                        {isBusiness ? "Secure API Integration" : "Absolute Security"}
                                    </h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {isBusiness
                                            ? "Seamlessly connect your existing checkout system with our robust API to issue points instantly and securely."
                                            : "Your points are protected with bank-grade security. Track your balance and history in real-time within your mobile wallet."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-in slide-in-from-right-10 duration-1000">
                            <div className="absolute -inset-4 bg-orange-100/50 rounded-[40px] blur-3xl opacity-50" />
                            <div className="relative bg-gray-900 rounded-[32px] p-8 shadow-2xl overflow-hidden border border-gray-800">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Users className="w-40 h-40 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <Badge text={isBusiness ? "Business Console" : "Member Dashboard"} />
                                    <h4 className="text-3xl font-bold text-white mt-6 mb-8 underline decoration-orange-500 decoration-4 underline-offset-8">
                                        {isBusiness ? "Real-time Analytics" : "Points Multiplier"}
                                    </h4>

                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
                                                    <div className="w-24 h-2 bg-white/20 rounded-full" />
                                                </div>
                                                <div className="w-12 h-2 bg-orange-500/50 rounded-full" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-6 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-[24px] border border-orange-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-bold text-gray-400">Projected Growth</span>
                                            <span className="text-orange-400 font-black">+240%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full w-4/5 bg-gradient-to-r from-orange-400 to-pink-500 animate-in slide-in-from-left duration-1000" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Steps */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-2xl mb-20">
                        <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.5em] mb-4">The Implementation</h2>
                        <p className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Simple to {isBusiness ? "Deploy" : "Earn"}, Impossible to Ignore.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {isBusiness ? (
                            <StepCard
                                number="01"
                                title="Onboard & Configure"
                                description="Register your business and set your matching point ratio. Decide how many points customers earn for every dollar spent."
                                icon={<Store className="w-6 h-6" />}
                            />
                        ) : (
                            <StepCard
                                number="01"
                                title="Join the Ecosystem"
                                description="Create your profile and connect your wallet. It takes less than 60 seconds to start your journey."
                                icon={<Users className="w-6 h-6" />}
                            />
                        )}

                        {isBusiness ? (
                            <StepCard
                                number="02"
                                title="Issue & Automate"
                                description="Points are automatically calculated and issued at checkout. Use our API or Dashboard to trigger rewards instantly."
                                icon={<Zap className="w-6 h-6" />}
                            />
                        ) : (
                            <StepCard
                                number="02"
                                title="Shop & Earn"
                                description="Spend at our growing network of partners. Watch your base points and matching points grow simultaneously."
                                icon={<Wallet className="w-6 h-6" />}
                            />
                        )}

                        {isBusiness ? (
                            <StepCard
                                number="03"
                                title="Analyze & Retain"
                                description="Track redemption rates and customer behavior via our advanced dashboard. Adjust rules to optimize retention."
                                icon={<BarChart3 className="w-6 h-6" />}
                            />
                        ) : (
                            <StepCard
                                number="03"
                                title="Claim Luxury"
                                description="Redeem your matching points for high-end rewards. Experience the true value of your brand loyalty."
                                icon={<Crown className="w-6 h-6" />}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="relative bg-orange-600 rounded-[48px] p-12 md:p-24 overflow-hidden shadow-2xl shadow-orange-600/30">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500 rounded-full -mr-[300px] -mt-[300px] blur-[100px] opacity-40" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500 rounded-full -ml-[200px] -mb-[200px] blur-[80px] opacity-30" />

                        <div className="relative z-10 text-center">
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
                                Ready to {isBusiness ? "Grow Your Business?" : "Level Up Your Perks?"}
                            </h2>
                            <p className="text-xl text-orange-50/80 mb-12 max-w-2xl mx-auto font-medium">
                                {isBusiness
                                    ? "Join over 500+ merchants who are already using Matching Points to revolutionize their customer experience."
                                    : "Thousands of members are already unlocking premium rewards every day. Don't leave value on the table."}
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button className="bg-white text-orange-600 hover:bg-orange-50 text-xl px-12 py-8 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95 border-none">
                                    Get Started Now
                                </Button>
                                <Button variant="ghost" className="text-white hover:bg-white/10 text-xl px-12 py-8 rounded-2xl font-bold transition-all">
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Badge({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 text-orange-400 border border-white/20 text-xs font-black uppercase tracking-widest">
            {text}
        </span>
    );
}

function StepCard({ number, title, description, icon }: { number: string; title: string, description: string, icon: React.ReactNode }) {
    return (
        <div className="group p-10 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all duration-500">
            <div className="flex justify-between items-start mb-10">
                <span className="text-4xl font-black text-gray-100 group-hover:text-orange-100 transition-colors duration-500">{number}</span>
                <div className="w-14 h-14 bg-gray-50 text-gray-400 group-hover:bg-orange-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner">
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-500">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-lg font-medium">{description}</p>
        </div>
    );
}

export default function MatchingRewardsShowcase() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold text-2xl animate-pulse italic">MCOM Matching Point...</div>}>
            <MatchingRewardsContent />
        </Suspense>
    );
}
