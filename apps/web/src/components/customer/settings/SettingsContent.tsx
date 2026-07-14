'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Bell,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  Verified,
  Gift,
  Copy,
  Briefcase,
  Award,
  Search,
  Check,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useGetParticipantProfile, useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';
import { toast } from 'sonner';

export default function SettingsContent({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const { data: profile } = useGetParticipantProfile();
  const { data: balance } = useGetParticipantGlobalBalance();
  
  const [copied, setCopied] = useState(false);
  const [communicationEnabled, setCommunicationEnabled] = useState(true);

  const userName = profile?.name || 'Julian Sterling';
  const userEmail = profile?.email || 'j.sterling@exclusive.com';
  const globalPoints = balance?.globalTotalPoints !== undefined ? balance.globalTotalPoints.toLocaleString() : '12,450';
  const tierName = 'Gold';

  const handleCopyCode = () => {
    navigator.clipboard.writeText('GOLD-JUL-88');
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 pb-20 sm:pb-32 pt-2 sm:pt-4 px-2 sm:px-4 max-w-md md:max-w-6xl mx-auto font-sans">
      {/* TopAppBar Section */}
      <header className="flex items-center justify-between w-full py-2 sm:py-4 border-b border-gray-200 bg-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => router.push('/participant')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden">
            <Avatar className="h-full w-full">
              <AvatarImage 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByn4bD2TxUuyfrLwPSNVyhQyOYnku1WrpjaNjL3WHu1Fcw5Tnplm6HI_ZEdKRuLeqP6ngMpFqaICV5yCA6oTb3vtlJVcRpFcFv4asTVyJeP2Ngi3kMBEvcZmLQE-g4W-anwkdQx6aPYhYyp51HJ4zPVeHjpOaHIfYE6AMZlF4tYpCdU0O5DGA97I-o5fg_0JtWxi7K0tf5orIYViyu5dnOfJB_BUHgVQ5mScxsCeXrDYauRhrA8K87jUFZLogHYC1scqcjynBBUBo" 
                alt="Profile Avatar"
              />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                JS
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="font-extrabold text-lg text-gray-900">{tierName} Member</span>
        </div>
        <button className="text-gray-505 hover:text-gray-800 active:scale-95 duration-200 transition-all">
          <Search className="w-6 h-6" />
        </button>
      </header>

      <main className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column on Desktop */}
        <div className="space-y-6">
          {/* Profile Hero Card (Bento Pattern) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-md"
          >
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-orange-500 p-1 overflow-hidden bg-gray-55 bg-gray-50">
                <Avatar className="w-full h-full">
                  <AvatarImage 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz4pJwpL1rk-0A_vGGLKjmu-ffxp8v8sR0tM5mxDwDBG8Acu64zHfZysdixB3gybKoQ69G10ervhmTkJNdVowv1VIyKZV9XCNLIXk5Hk5OBnGS5Kx9ysMCt7VFx38Cooj7UJwP4g8eK-4Dg_IfmKee2ZagF_yWP4c31Ms4UIBS2E27DzGkIsfnIXYAk7gUkSFiADuQehFBnYuF_Gc6xv_xJ326hXr63CWPogeKvL-MxSdNIh-ACw21J1cx1yeWpDVRmQoWbpcmAm4" 
                    alt={userName}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600">JS</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1 border-2 border-white">
                <Verified className="w-4 h-4 text-white fill-current" />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-gray-900 mb-1">{userName}</h2>
            <p className="text-sm text-gray-550 mb-4">Member since Dec 2023</p>

            <div className="flex gap-3 w-full">
              <div 
                onClick={() => router.push('/participant/progression')}
                className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <span className="text-[10px] text-gray-550 block uppercase tracking-widest mb-1">Points</span>
                <span className="text-xl font-extrabold text-orange-600">{globalPoints}</span>
              </div>
              <div 
                onClick={() => router.push('/participant/progression')}
                className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <span className="text-[10px] text-gray-550 block uppercase tracking-widest mb-1">Tier</span>
                <span className="text-xl font-extrabold text-green-600">{tierName}</span>
              </div>
            </div>
          </motion.div>

          {/* Referral Code Bento Section */}
          <section>
            <div 
              onClick={() => router.push('/refer')}
              className="bg-orange-50 border border-orange-255 border-orange-200 text-orange-950 rounded-2xl p-5 flex items-center justify-between shadow-md cursor-pointer hover:bg-orange-100/60 transition-all"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-orange-900">Invite & Earn</h3>
                <p className="text-sm text-orange-800 font-medium">Get 500 points per friend.</p>
                <div className="mt-3 flex items-center bg-white rounded-xl px-4 py-2 border border-orange-200/60">
                  <code className="text-base font-black tracking-wider text-orange-705 text-orange-700">GOLD-JUL-88</code>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode();
                    }}
                    className="ml-6 text-orange-600 hover:text-orange-850 hover:text-orange-800 active:scale-90 transition-transform"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-orange-600/40">
                <Gift className="w-12 h-12" />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column on Desktop */}
        <div className="space-y-6">
          {/* Section: Personal Information */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 px-1">Personal Account</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-150 shadow-sm">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-550 font-semibold uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-555 font-semibold uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-semibold text-gray-800">{userEmail}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div 
                onClick={() => router.push('/participant/activity')}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-555 font-semibold uppercase tracking-wider">Activity History</p>
                    <p className="text-sm font-semibold text-gray-800">View points logs, redemptions & scans</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div 
                onClick={() => router.push('/refer')}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-555 font-semibold uppercase tracking-wider">Referral Hub</p>
                    <p className="text-sm font-semibold text-gray-800">Invite friends & track invites</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div 
                onClick={() => router.push('/participant/notifications')}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-555 font-semibold uppercase tracking-wider">Notification Center</p>
                    <p className="text-sm font-semibold text-gray-800">System updates & rewards alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </section>

          {/* Favorites Section (Asymmetric Cards) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-gray-900">Interests & Favorites</h3>
              <button className="text-orange-600 text-xs font-bold uppercase tracking-wider hover:underline">Edit All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <span className="text-[10px] text-gray-550 font-semibold">8 Saved</span>
                </div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Favorite Businesses</p>
                <div className="flex -space-x-2 mt-2">
                  <div className="w-6 h-6 rounded-full border border-white bg-slate-500"></div>
                  <div className="w-6 h-6 rounded-full border border-white bg-slate-400"></div>
                  <div className="w-6 h-6 rounded-full border border-white bg-slate-300"></div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="text-[10px] text-gray-550 font-semibold">12 Saved</span>
                </div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Favorite Brands</p>
                <div className="flex -space-x-2 mt-2">
                  <div className="w-6 h-6 rounded-full border border-white bg-yellow-500"></div>
                  <div className="w-6 h-6 rounded-full border border-white bg-yellow-400"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Settings Section */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 px-1">Preferences & Privacy</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-150 shadow-sm">
              {/* Toggle Item */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-800">Communication Settings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={communicationEnabled}
                    onChange={(e) => setCommunicationEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              {/* Selection Item */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-800">Member Preferences</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-bold">Custom</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {/* Action Item */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 text-red-650">
                  <LogOut className="w-5 h-5" />
                  <p className="text-sm font-semibold">Sign Out of Account</p>
                </div>
              </div>
            </div>
          </section>

          {/* Versioning Info */}
          <div className="text-center py-4 opacity-40 space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-gray-600">GOLD MEMBER APP v4.2.0-ELITE</p>
            <p className="text-[10px] font-bold tracking-widest text-green-700">Secured by Biometric Trust</p>
          </div>
        </div>
      </main>
    </div>
  );
}
