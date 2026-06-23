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
        router.push('/participant/wallet');
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

  return (
    <header
      className={`fixed top-0 left-0 w-full h-16 z-50 flex justify-between items-center px-6 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm'
          : 'bg-white/30 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        {isDetailPage && (
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200/50 text-gray-700 hover:bg-gray-50 active:scale-95 duration-100"
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
        <Link
          href="/"
          className={`text-sm tracking-wide transition-colors ${
            pathname === '/' ? 'text-orange-500 font-bold' : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          Home
        </Link>
        <Link
          href="/reward"
          className={`text-sm tracking-wide transition-colors ${
            pathname === '/reward' ? 'text-orange-500 font-bold' : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          Rewards
        </Link>
        <Link
          href="/brands"
          className={`text-sm tracking-wide transition-colors ${
            pathname === '/brands' ? 'text-orange-500 font-bold' : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          Brands
        </Link>
        <Link
          href="/gift-cards"
          className={`text-sm tracking-wide transition-colors ${
            pathname === '/gift-cards' ? 'text-orange-500 font-bold' : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          Gift Cards
        </Link>
        <Link
          href="/business"
          className={`text-sm tracking-wide transition-colors ${
            pathname === '/business' ? 'text-orange-500 font-bold' : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          Businesses
        </Link>
      </nav>

      {/* Desktop Authentication Section */}
      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold cursor-pointer overflow-hidden border border-orange-100 active:scale-95 duration-100 shadow-sm">
                {userRole === 'Business' && businessProfile?.profileImage ? (
                  <Image
                    src={businessProfile.profileImage}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <CircleUserRound size={22} className="text-gray-500" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>

              {userRole === 'Business' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              {userRole === 'Participant' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/participant/wallet')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>My Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/participant/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              {userRole === 'Staff' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/staff/dashboard/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link
              href="/login"
              className="px-5 py-1.5 text-sm font-semibold border border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 active:scale-95 duration-100 transition-all bg-white"
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
        className="md:hidden flex items-center justify-center w-10 h-10 text-orange-500 hover:bg-orange-50 rounded-full transition-colors active:scale-95 duration-100"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg px-6 py-5 flex flex-col gap-4 text-gray-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <Link href="/" className="font-semibold py-1 hover:text-orange-500" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/reward" className="font-semibold py-1 hover:text-orange-500" onClick={() => setMenuOpen(false)}>Rewards</Link>
          <Link href="/brands" className="font-semibold py-1 hover:text-orange-500" onClick={() => setMenuOpen(false)}>Brands</Link>
          <Link href="/gift-cards" className="font-semibold py-1 hover:text-orange-500" onClick={() => setMenuOpen(false)}>Gift Cards</Link>
          <Link href="/business" className="font-semibold py-1 hover:text-orange-500" onClick={() => setMenuOpen(false)}>Businesses</Link>
          
          <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
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
                  className="w-full text-center py-2 border border-red-200 text-red-500 font-semibold rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2 border border-orange-500 text-orange-500 font-semibold rounded-xl"
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
