'use client';

import React from 'react';
import Link from 'next/link';
import { useGetParticipantProfile, useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';
import { useGetCreditsBalance } from '@/services/cashback/hook';
import { Search, Sparkles, Wallet, Lock, MoreVertical, SlidersHorizontal, Store, Gamepad2, Gift, Ticket, ChevronRight, Award, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export default function ParticipantDashboard() {
  const { data: profile, isLoading: isProfileLoading } = useGetParticipantProfile();
  const { data: balance, isLoading: isBalanceLoading } = useGetParticipantGlobalBalance();
  const { data: cashbackData } = useGetCreditsBalance();

  const userName = profile?.name || 'Gold Member';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const globalPoints = balance?.globalTotalPoints ?? 12500;
  const cashbackVal = cashbackData?.availableCashback ?? 45.20;

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 pb-32 pt-4 max-w-6xl mx-auto px-4 md:px-8 space-y-8">
      
      {/* Top Welcome Header */}
      <header className="flex items-center justify-between w-full py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-orange-500 shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{userName}</h1>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 duration-200 transition-all shadow-sm">
          <Search size={18} />
        </button>
      </header>

      {/* Wallet Snapshot Widget */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-gray-200/80 shadow-md group">
        {/* Glow Decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary opacity-5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Points</p>
              <h2 className="text-5xl font-extrabold tracking-tight mt-1 text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff843a] leading-none">
                {isBalanceLoading ? (
                  <Skeleton className="h-12 w-32 bg-gray-200" />
                ) : (
                  globalPoints.toLocaleString()
                )}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cashback</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                £{cashbackVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          
          {/* Progress to next tier */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500">Platinum Progress</span>
              <span className="text-primary">75%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                style={{ width: "75%" }} 
                className="h-full bg-gradient-to-r from-primary to-[#ff843a] rounded-full shadow-[0_0_8px_rgba(245,73,0,0.2)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rewards */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Featured Rewards</h3>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-primary font-bold text-xs uppercase hover:underline flex items-center gap-1 cursor-pointer outline-none select-none">
              See All <ChevronDown size={14} className="text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-2xl p-1.5 z-[100] mt-1">
              <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1">Rewards Directory</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 my-1" />
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <Link href="/reward" className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center">
                  All Rewards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <Link href="/participant/market" className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center">
                  Online Brands
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <Link href="/participant/local-discovery" className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center">
                  Local Brands
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-orange-50 focus:text-primary rounded-xl cursor-pointer">
                <Link href="/participant/gift-cards" className="w-full h-full px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-primary flex items-center">
                  Gift Cards
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {/* Reward Card 1 */}
          <div className="flex-shrink-0 w-72 h-44 rounded-3xl bg-white border border-gray-200 relative overflow-hidden group shadow-sm cursor-pointer transition-transform hover:-translate-y-1">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4Bq1NQQlVF34L2wxiQq-q7CK1LqHJMI-VETbxKKAf3x1-uqQ-rqaPL-uSoSKWNgKWAENgGrXPgpTgNg8qHgL_3k6GHsMRqJL3JM6170ZOL5rAf7zg69fDqSJl7nqcjddxfAbJH3loD_6ZsOp20twyeT_sCw95-SBehxm44jgx-cW5preS0sgqy4ZuIiMJyj3RzF0lXmooMl6hduUflqEmN8bLJiIxTWpDzWecyatJcHMoorUHoK8PJ_yjTmGbBRmJ5l7D8A_k8cQ')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-5 w-full">
              <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">20% OFF</span>
              <h4 className="font-bold text-lg text-white">Nike Store</h4>
            </div>
          </div>
          {/* Reward Card 2 */}
          <div className="flex-shrink-0 w-72 h-44 rounded-3xl bg-white border border-gray-200 relative overflow-hidden group shadow-sm cursor-pointer transition-transform hover:-translate-y-1">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKCd9JtsAit8Z_VK9QAVpun75v1jQ4hfeBUFxACXMLlAQ8ONYJqZB-S6dWClc1QVEeW4oa9nsJuwAtx7dew1qAeXKaCTFsgiJWekK5R26Rt8j4ynUPXoWpRL5mpO5jXetiOmqm0xEUfufoUGFKXmJbPM5CPx1qO4MxN48WZjK44MCwjMNCmhfNhM4Ww_citPVQv_cA6EtLoyphn6Pedsb-PjD_LWn1lIkMTFQBsq2UBi63M_GTl2a3vzNfTZGKdn2uqcyYDD47-TM')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-5 w-full">
              <span className="bg-green-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">£10 CREDIT</span>
              <h4 className="font-bold text-lg text-white">Local Brew Coffee</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="space-y-4">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Explore Categories</h3>
        <div className="grid grid-cols-3 gap-6">
          <Link href="/brands" className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center gap-3 hover:bg-gray-50 hover:border-primary/20 transition-all shadow-sm active:scale-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/5 text-primary border border-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">checkroom</span>
            </div>
            <span className="text-xs font-bold text-gray-600">Fashion</span>
          </Link>
          <Link href="/brands" className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center gap-3 hover:bg-gray-50 hover:border-primary/20 transition-all shadow-sm active:scale-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 bg-opacity-5 border border-green-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">devices</span>
            </div>
            <span className="text-xs font-bold text-gray-600">Tech</span>
          </Link>
          <Link href="/brands" className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center gap-3 hover:bg-gray-50 hover:border-primary/20 transition-all shadow-sm active:scale-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 bg-opacity-5 border border-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">flight</span>
            </div>
            <span className="text-xs font-bold text-gray-600">Travel</span>
          </Link>
        </div>
      </section>

      {/* Play & Win (MCOMSpin Banner) */}
      <section>
        <Link href="/play-win" className="block">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 h-48 flex items-center justify-between p-8 group shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="absolute inset-0 opacity-10 bg-radial-gradient"></div>
            <div className="relative z-10 space-y-2 w-2/3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#f54900] text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Live Now</span>
              </div>
              <h3 className="text-3xl font-black leading-none text-gray-900 font-sans">MCOM<span className="text-[#f54900] bg-gradient-to-r from-[#f54900] to-[#ff843a] bg-clip-text text-transparent">Spin</span></h3>
              <p className="text-gray-600 text-xs md:text-sm">Spin the wheel for a chance to win 50,000 bonus points.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-[#f54900] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#f54900]/90 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
              </div>
              <p className="mt-2 text-[#f54900] font-bold text-[10px] uppercase tracking-wider">Spin Now</p>
            </div>
          </div>
        </Link>
      </section>

      {/* Near You Section */}
      <section className="space-y-4 pb-12">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Near You</h3>
        <div className="flex flex-col gap-4">
          {/* Local Business 1 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-4 flex gap-4 items-center group cursor-pointer hover:bg-gray-50 hover:border-primary/20 transition-all shadow-sm">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA80Kg3kKrrtE9bYf0CxcBmlukSNK-nJGC9f_xi3C_ytikW6NY0UPgM8zfGyCRsaGQHplq3FdsKr1hn8UXzWyWO6-9HhSFd5SqJ9IH5fitm-e5LQh3bTb0qvn-bOeOacqzN6w01JmDG8OsELSir90jacnatxtVg3OP0hGra6lcjKRdPvSfCcUOd3biqpa00yu5FTEEdstQI3gNDJgnrNlP0ZUO6lu59X_h3hKHVf8lIjbzYgmzjF6ZqiZGPdkq2DRzPIHAFdFW3QQU" alt="Green Fork Bistro" />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-base text-gray-900">The Green Fork Bistro</h4>
              <p className="text-gray-400 text-xs mt-0.5">0.4 miles away</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-gray-450 text-[10px] font-bold">4.9 (1.2k reviews)</span>
              </div>
            </div>
            <div className="text-right pr-2">
              <p className="text-primary font-black text-lg leading-none">5x</p>
              <p className="text-gray-400 text-[8px] uppercase tracking-wider font-extrabold mt-0.5">Points</p>
            </div>
          </div>
          {/* Local Business 2 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-4 flex gap-4 items-center group cursor-pointer hover:bg-gray-50 hover:border-primary/20 transition-all shadow-sm">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZd75m-liUjawitOLLGr8hWgNb2yPH44hWZRkPSSr3sDmr1v06zTz9Q8oRdhyoF_KNlke31If6ch_UH6hBCOlxYwwSDOaXAAnXn1Ty1U6KAGMj7GWFpdE02K4SvlS969gRJLBq0MBtV5IyRoQC52cH3M6DATdZlsFiCulrwCHWjdyzA9B4EOAWnpEJv68RhgcaMLXgYzFSRs9eFgCm_txx7-Y3D8ZudPzUS-_Tz6zu7SWzj4FbNvaJK92GNNfTRlOmv_AfW-IqO3M" alt="Elite Performance Gym" />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-base text-gray-900">Elite Performance Gym</h4>
              <p className="text-gray-400 text-xs mt-0.5">1.2 miles away</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-gray-450 text-[10px] font-bold">4.7 (850 reviews)</span>
              </div>
            </div>
            <div className="text-right pr-2">
              <p className="text-primary font-black text-lg leading-none">10x</p>
              <p className="text-gray-400 text-[8px] uppercase tracking-wider font-extrabold mt-0.5">Points</p>
            </div>
          </div>
        </div>
      </section>

      {/* BottomNavBar Section */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
        <Link href="/participant" className="flex flex-col items-center justify-center bg-orange-100 text-orange-600 rounded-full px-4 py-1 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/participant/market" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">storefront</span>
          <span className="text-[10px] font-bold mt-0.5">Market</span>
        </Link>
        <Link href="/participant/wallet" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span className="text-[10px] font-bold mt-0.5">Wallet</span>
        </Link>
        <Link href="/play-win" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">casino</span>
          <span className="text-[10px] font-bold mt-0.5">Games</span>
        </Link>
        <Link href="/participant/settings" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
