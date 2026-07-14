"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { CircleUserRound, User, Settings, CreditCard, LayoutDashboard, ChevronDown, Menu, X, ArrowLeft } from 'lucide-react';
import { useGetBusinessProfile } from '@/services/business/hook';
import { useLogout } from '@/services/auth/hook';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('access'));
    setUserRole(localStorage.getItem('userRole'));
  }, [pathname]);

  const { data: businessProfile } = useGetBusinessProfile({
    enabled: isAuthenticated && userRole === 'Business'
  });

  const { mutate: logoutMutation } = useLogout();

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        toast.success('Logged out successfully');
        router.push('/login');
      },
      onError: () => {
        Cookies.remove('access');
        Cookies.remove('refresh');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        router.push('/login');
      }
    });
  };

  const handleDashboardClick = () => {
    const role = localStorage.getItem('userRole');
    switch (role) {
      case 'Admin':
        router.push('/admin/dashboard');
        break;
      case 'Participant':
        router.push('/participant');
        break;
      case 'Staff':
        router.push('/staff/dashboard');
        break;
      default:
        router.push('/dashboard');
        break;
    }
  };

  // Determine if we show a back button (on details pages)
  const isDetailPage = pathname.includes('/reward/') || 
                       pathname.includes('/brands/') || 
                       pathname.includes('/gift-cards/') || 
                       pathname.includes('/deals/') || 
                       pathname.includes('/merchants/');

  const handleBackClick = () => {
    router.back();
  };

  const isLightPath = true;

  const headerBgClass = isLightPath
    ? scrolled
      ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'
      : 'bg-[#f9fafb]/45 backdrop-blur-sm'
    : scrolled
      ? 'bg-[#101415]/90 backdrop-blur-md border-b border-white/5 shadow-sm'
      : 'bg-[#101415]/40 backdrop-blur-sm';

  const navLinkClass = (path: string) => {
    const active = pathname === path;
    if (isLightPath) {
      return `text-sm tracking-wide transition-colors ${
        active ? 'text-orange-500 font-bold' : 'text-gray-600 hover:text-orange-500'
      }`;
    } else {
      return `text-sm tracking-wide transition-colors ${
        active ? 'text-orange-500 font-bold' : 'text-[#e0e3e5]/70 hover:text-orange-500'
      }`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full h-16 z-50 flex justify-between items-center px-6 transition-all duration-300 ${headerBgClass}`}
    >
      <div className="flex items-center gap-4">
        {isDetailPage && (
          <button
            onClick={handleBackClick}
            className={`flex items-center justify-center w-9 h-9 rounded-full border active:scale-95 duration-100 ${
              isLightPath
                ? 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                : 'bg-[#1d2022] border-white/5 text-[#e0e3e5] hover:bg-white/5'
            }`}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold font-headline-lg text-lg">M</span>
          </div>
          <span className="text-xl font-headline-lg font-bold text-orange-500 tracking-tight">MCOM</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 font-medium">
        <Link href="/" className={navLinkClass('/')}>
          Home
        </Link>
        <Link href="/reward" className={navLinkClass('/reward')}>
          Rewards
        </Link>
        <Link href="/brands" className={navLinkClass('/brands')}>
          Brands
        </Link>
        <Link href="/gift-cards" className={navLinkClass('/gift-cards')}>
          Gift Cards
        </Link>
        <Link href="/business" className={navLinkClass('/business')}>
          Businesses
        </Link>
      </nav>

      {/* Desktop Authentication Section */}
      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold cursor-pointer overflow-hidden border active:scale-95 duration-100 shadow-sm ${
                isLightPath
                  ? 'bg-white border-gray-250 text-orange-500'
                  : 'bg-[#1d2022] border-white/5 text-orange-500'
              }`}>
                {userRole === 'Business' && businessProfile?.profileImage ? (
                  <Image
                    src={businessProfile.profileImage}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <CircleUserRound size={22} className={isLightPath ? 'text-gray-500' : 'text-[#e0e3e5]/70'} />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#1d2022] border border-white/5 text-[#e0e3e5]" align="end">
              <DropdownMenuLabel className="text-[#e0e3e5]">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>

              {userRole === 'Business' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              {userRole === 'Participant' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/participant')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/participant/settings')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              {userRole === 'Staff' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/staff/dashboard/settings')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-[#e0e3e5]">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 hover:bg-white/5 focus:bg-white/5">
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link
              href="/login"
              className="px-5 py-1.5 text-sm font-semibold border border-orange-500 text-orange-500 rounded-full hover:bg-orange-500/10 active:scale-95 duration-100 transition-all bg-transparent"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-1.5 text-sm font-semibold bg-orange-500 text-white rounded-full hover:bg-orange-600 active:scale-95 duration-100 transition-all shadow-md shadow-orange-500/10"
            >
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 text-orange-500 hover:bg-orange-500/10 rounded-full transition-colors active:scale-95 duration-100"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className={`md:hidden absolute top-16 left-0 w-full border-b shadow-lg px-6 py-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200 ${
          isLightPath
            ? 'bg-white border-gray-200 text-gray-800'
            : 'bg-[#101415] border-white/5 text-[#e0e3e5]'
        }`}>
          <Link href="/" className={`font-semibold py-1 ${isLightPath ? 'hover:text-orange-500 text-gray-700' : 'hover:text-orange-500'}`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/reward" className={`font-semibold py-1 ${isLightPath ? 'hover:text-orange-500 text-gray-700' : 'hover:text-orange-500'}`} onClick={() => setMenuOpen(false)}>Rewards</Link>
          <Link href="/brands" className={`font-semibold py-1 ${isLightPath ? 'hover:text-orange-500 text-gray-700' : 'hover:text-orange-500'}`} onClick={() => setMenuOpen(false)}>Brands</Link>
          <Link href="/gift-cards" className={`font-semibold py-1 ${isLightPath ? 'hover:text-orange-500 text-gray-700' : 'hover:text-orange-500'}`} onClick={() => setMenuOpen(false)}>Gift Cards</Link>
          <Link href="/business" className={`font-semibold py-1 ${isLightPath ? 'hover:text-orange-500 text-gray-700' : 'hover:text-orange-500'}`} onClick={() => setMenuOpen(false)}>Businesses</Link>
          
          <div className={`border-t my-2 pt-4 flex flex-col gap-3 ${isLightPath ? 'border-gray-150' : 'border-white/5'}`}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { handleDashboardClick(); setMenuOpen(false); }}
                  className="w-full text-center py-2 bg-orange-500 text-white font-semibold rounded-xl"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full text-center py-2 border border-red-500/30 text-red-500 font-semibold rounded-xl bg-transparent"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2 border border-orange-500 text-orange-500 font-semibold rounded-xl bg-transparent hover:bg-orange-500/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center py-2 bg-orange-500 text-white font-semibold rounded-xl shadow-md shadow-orange-500/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
