"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, Sparkles, Award, MapPin, Calendar, Clock, Users, ArrowRight, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpoEventsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    setRegistered(true);
    toast.success("Successfully registered for MCOM Global Summit 2024!", {
      icon: <Sparkles className="w-4 h-4 text-orange-600" />,
      className: "rounded-2xl border-gray-200 bg-white text-gray-800",
    });
  };

  return (
    <div className="bg-[#f9fafb] text-gray-800 min-h-screen py-2 sm:py-8 max-w-7xl mx-auto px-2 sm:px-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 sm:py-4 border-b border-gray-150">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/play-win')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-orange-600 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm shrink-0">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYtuo8JP8eXM4xwvwYsgxOYF_e3GnA4h_LHiPNKjTczbGaFoRraCgbJtaabDi9VpGkAfHbRlSCbJ3V_eVx1nyeIBcd1fVR0gWuFd4msYttiOGgkVu3XRsKpYGzy5l7l54B9pSndoAazcxJ8tUPMb9Uq5hWLAlhxCVa6jyvR_ghF3C6MeOaeHbzdvbjo0Mpf-5HLPeJ-NfluFm9LcQas0Z3gQmHwYf4-tmjYOhj08QwlMjOs5nqynF_2ZK46XN2fKqw4rCl2Jd6VRg"
                alt="Gold Member Avatar"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                Expo Events <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-500/20">Gold Member</span>
              </h1>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 duration-200 transition-all shadow-sm">
          <Search size={18} />
        </button>
      </header>

      {/* Hero Section: Featured Expo Experience */}
      <section className="relative rounded-[2rem] overflow-hidden h-[360px] sm:h-[420px] group shadow-md border border-gray-200">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-102"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrPs6UlSvpPSvCmJjURjeWwMeCPm0ZoCIAoe2n0s_Tcjxek196xwZXHxzEQt8F1sftQqXfGbtOFSBXXqR7HFX-cDwaRGo74_ZOZ2b7kUJAyoQcg924fcmVyX20VejkuF49gccYiXkbi7jr8OffKEXN1gj_vvQSUVeDjSS6hPoHNXIYCxS4Lk_4o8a6qXXBa62NByFubFCJbyC_rO7jBGO9VUiZaFMFPdhJgfaX476CpXSOihYE4azNYAPwaZ97LPiL00YB6BLztaI')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full space-y-3 relative z-10 text-white">
          <div className="inline-flex items-center px-3 py-1 bg-orange-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-orange-500/30">
            <span className="material-symbols-outlined text-[12px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            EXPO FEATURED
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">MCOM Global Summit 2024</h2>
          <p className="text-xs sm:text-sm text-gray-200 max-w-md leading-relaxed line-clamp-2">
            Join the most exclusive technology and loyalty exhibition of the decade. Connect with pioneers and unlock secret rewards.
          </p>
          <div className="flex items-center gap-3 pt-3">
            <button 
              onClick={handleRegister}
              disabled={registered}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 disabled:text-gray-300 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              {registered ? "Registered" : "Register Now"}
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2.5 rounded-xl flex items-center justify-center border border-white/20 active:scale-95 transition-all">
              <QrCode size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Category Quick Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {["All Events", "Community", "Local", "Rewards"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-shrink-0 px-5 py-2 rounded-full font-bold text-xs transition-all duration-200 border ${
              activeFilter === filter
                ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Upcoming Events: Asymmetric Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Upcoming Events</h3>
          <button className="text-orange-600 font-bold text-xs flex items-center gap-0.5 hover:gap-1 transition-all">
            See All <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Large Vertical Card */}
          <div className="col-span-1 row-span-2 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="h-28 sm:h-48 relative">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKXQ_m03ljtQYdzA21jxj0968wut4yuPhM1tHK3EO0O0yvIQ53gUNsK578bFfJIv7onaSk3-7oeeyFyXR-qqFexiS_dVaOFR7CveJK1W79CB2Obj5aHl9SgX7TiP9J_Kq4qlwbxIlN7uI16Q1z-Jx_g5rejYPIniGE02Q6wz90RIk9acXjiksF_D99GjW9xd-I5s-VtuyqrR5HkZDuW0r6p0qO7J-VcoV0hYlsk1PbXy3GS6vRPnwf8Yf6p1kn6uxVnvsk_Qcxcy0" 
                alt="Gold Circle Gala" 
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-center min-w-[36px] shadow-sm">
                <span className="block font-black text-orange-600 text-xs sm:text-sm">24</span>
                <span className="block text-[8px] uppercase font-bold text-gray-500">OCT</span>
              </div>
            </div>
            <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-base font-extrabold text-gray-900 leading-snug">Gold Circle Gala</h4>
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={12} className="text-orange-600" />
                  <span className="truncate">Grand Ballroom</span>
                </p>
              </div>
              <button className="w-full py-1.5 sm:py-2 bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100/70 rounded-xl text-[10px] sm:text-xs font-bold transition-all">
                Register
              </button>
            </div>
          </div>

          {/* Horizontal Small Card 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 flex p-2 gap-2 items-center hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-150">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuATH1TVxWdGpy3EySZh_Ixbz7jjNkpfJxlBrb9YU_fYI1u9MoXTJUdpXnyS8RdLAzXN-JhMOfmiRYNlKc9lnJtwKbk3zyFfj8Sp3mloLPrGJKCgUL_6g_tM1IHNGZzuR4Zwops5fRgw2roSHvpPpa23vvODLItt1CgPASF5grKk64OIcH0yw0Iqb8JBZD38cjiwyBosli_rY-lLM9aAkS0y5LDsM4pFttz_GvdhkkXssxma2sULxn1bK_JiXyO4qqOl4CvOFTnS9n0" 
                alt="Web3 Workshop" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">Web3 Workshop</h4>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">Tomorrow, 10:00 AM</p>
              <div className="mt-2 flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full border border-white bg-gray-300 shadow-sm"></div>
                <div className="w-5 h-5 rounded-full border border-white bg-gray-400 shadow-sm"></div>
                <div className="w-5 h-5 rounded-full border border-white bg-orange-100 text-orange-600 flex items-center justify-center text-[8px] font-bold shadow-sm">
                  +12
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Small Card 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 flex p-2 gap-2 items-center hover:shadow-md transition-all duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-150">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD3a3tA13AgYBARE9mu2wX-f40nozuc8OjaeK4TCso14K64pI5VeYuziBVABWawySsDlrgSCYD1taZxJwxfLYH39F418gtO0TP3JI-z5TxYFeck-rY9nZoPvW__-gr-YTcwlPbpeiOy2TPYPe4Seq3zRlx6dbY6LR301h4IbbtUTBwBWnYjAClXCXobKhTpmryBAa9Rf97Rzul6jTcmt-ZQd4vE9F2ANw7J_1wKTrCeV2aVW-rSQz7xWh5S7tosvqaRtkUgCXtkhE" 
                alt="Local Mixer" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">Local Mixer</h4>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">Fri, Oct 26</p>
              <button className="mt-2 bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                Attend
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions: Horizontal Carousel */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Member Promotions</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {/* Promo Card 1 */}
          <div className="flex-shrink-0 w-72 sm:w-80 h-36 sm:h-40 rounded-2xl relative overflow-hidden shadow-sm border border-gray-150">
            <img 
              className="absolute inset-0 w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBib308zJcxZh4RzlEFjGKAHvPGVMsvL3F0aP0eUPk2gN_xsT3-yDiq2eKUF-093TSpe9rcH6GllkEnRo6j72EAVyVU3eMZhhj1xN_06hN_e5nXFu-VE7LvVmncKOvm6y8q4DBSwpHcpwafkaZTYC8cYKS8cMaMLMp5C_nDUJrzxLrygho36ngwAwOFffGxRyPcVLKVmt_CRVeKh_6xEB_VEk0MiO0inkvx9LDtR2LVMIXIS84KI1jvaeZWP8j_OlTK20hXM14QVV4" 
              alt="Promo 1" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <p className="text-orange-500 text-[9px] sm:text-[10px] uppercase font-black">Limited Time</p>
              <h4 className="font-bold text-sm sm:text-base">Double Points Weekend</h4>
            </div>
          </div>
          
          {/* Promo Card 2 */}
          <div className="flex-shrink-0 w-72 sm:w-80 h-36 sm:h-40 rounded-2xl relative overflow-hidden shadow-sm border border-gray-150">
            <img 
              className="absolute inset-0 w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQfuDtHoyDl662a2QGn_vaH9-bLFA8ZZB_qcDnqtTa8RRU3u5_biythnwUSQy5mfCv89Cjny5hNdbS-9zxpJg1Xj3ExfX7f7g_fI8Gfqk50JkwJSkZg-bA35gjzap3odF1T72pDOUDfxvTeN9xiDqspldTvZvIj3Eia8xwxoeLdsNfUFGhpcZmUoWlYQh_hz1GEPAtZ_-IFf9PCHAYXjasyJ2ZvyE5LwTOhT1YqbCZFt9OrMtUirJyYNG7LsyZQJ4BHEg2F4htfRk" 
              alt="Promo 2" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <p className="text-green-400 text-[9px] sm:text-[10px] uppercase font-black">Exclusive Access</p>
              <h4 className="font-bold text-sm sm:text-base">Early Bird VIP Tickets</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Reward Events: Bento Style */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Reward Events</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 flex flex-col justify-between min-h-[120px] shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <span className="material-symbols-outlined text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
              <h4 className="text-sm sm:text-base font-extrabold text-gray-900 mt-1">MCOMSpin Live</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Spin to win 1M points</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[100px] text-orange-600">casino</span>
            </div>
          </div>
          
          <div className="col-span-1 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <span className="material-symbols-outlined text-lg sm:text-xl font-bold">qr_code_2</span>
            </div>
            <h4 className="text-[10px] sm:text-xs font-black text-gray-900 leading-tight">Scan & Earn</h4>
            <p className="text-[8px] sm:text-[10px] text-gray-500">Find 10 codes</p>
          </div>
          
          <div className="col-span-3 bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <span className="material-symbols-outlined text-lg">local_activity</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">Redeem Raffle</h4>
                <p className="text-[9px] sm:text-xs text-gray-500">Ends in 2h 45m</p>
              </div>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-md shadow-orange-600/10">
              ENTER
            </button>
          </div>
        </div>
      </section>

      {/* Exhibitions List */}
      <section className="space-y-4 pb-24">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Main Exhibitions</h3>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 group hover:border-orange-500/20 hover:shadow-sm transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3DIbdUfVIsSd9q_XOmmO1KSkkCwkEGbYrzntzMCHmHqAv-r0ZXljGytGUV3d6zCiQ8lPht0GOuucrxZVsAZymzgU3Vh1byKRNn28zr8C94ST8iChOwVSDyjk4ynrpjb-D3EtRU3n8xVBy-yF-2loRqYkdFOgF4MYY-lTgcqAH4aEaqqTPk19O40ib0eeUkmjgPTDtJqWgWw6YTp6Aiiqs8sa_TNs2zKebLmu5Fuog49P53C-RJ2wbs9k1fCn5XsajR_h2sTLDOOk" 
                alt="Future Tech" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-base font-extrabold text-gray-900 truncate group-hover:text-orange-600 transition-colors">Future Tech Pavillion</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Hall A • 50+ Exhibitors</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 group-hover:text-orange-600 transition-colors">chevron_right</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3 group hover:border-orange-500/20 hover:shadow-sm transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxHrPv5FfsxeBYhwDKEJyTorvhErqeATyIJg-87DedLrj02F3qjskvmqdBIg3QSOllyc46xZxGnQadAFlKs3PS8eqvAISllZNi0kHXqJ_2XV9KW4RtuJyieorcykL1xhI3RSDWXHoiAZ7iaZfFz-xEF3rAmLKmiIO5WXUW720Khxzuy_vVEHhcU3ayo8yCFlYpJupDvQBpCD0IJFnbtIBkzRI3fMGPiQdKujHv52nz006As58kc3upuDd7sUwh3lMmDrhmQenkvbA" 
                alt="Sustainability" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-base font-extrabold text-gray-900 truncate group-hover:text-orange-600 transition-colors">Sustainability Hub</h4>
              <p className="text-[10px] sm:text-xs text-gray-500">Hall B • Green Initiative</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 group-hover:text-orange-600 transition-colors">chevron_right</span>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Scan (Mobile only, safe bottom spacing) */}
      <div className="fixed bottom-24 right-4 z-50">
        <button className="w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform hover:bg-orange-700">
          <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
        </button>
      </div>

      {/* Bottom Nav Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden">
        <Link href="/participant" className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]">home</span>
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
        <Link href="/play-win" className="flex flex-col items-center justify-center bg-orange-100 text-orange-600 rounded-full px-4 py-1 scale-down duration-200 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
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
