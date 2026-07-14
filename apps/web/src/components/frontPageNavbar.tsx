"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { Menu, X, CircleUserRound, User, Settings, CreditCard, LayoutDashboard, ChevronDown } from 'lucide-react';
import Image from "next/image";
import { useGetBusinessProfile } from '@/services/business/hook';
import { useLogout } from '@/services/auth/hook';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

const FrontPageNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [matchingDropdownOpen, setMatchingDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('access'));
    setUserRole(localStorage.getItem('userRole'));
  }, []);

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
        // Fallback to client-side cleanup
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

  const isSpecialPage = pathname === '/pricing' || pathname.startsWith('/deals') || pathname === '/reward' || pathname === '/features' || pathname === '/checkout' || pathname === '/faq' || pathname.startsWith('/matching-rewards') || pathname === '/privacy' || pathname === '/about' || pathname === '/contact' || pathname.startsWith('/campaigns') || pathname === '/terms';

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;

    if (isSpecialPage) {
      return "text-orange-600 hover:text-orange-700 transition-colors";
    } else {
      return `hover:text-orange-600 transition-colors ${isActive
        ? "text-orange-600"
        : scrolled
          ? "text-orange-500"
          : "text-white"
        }`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || isSpecialPage ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/">
          <span className={`  justify-center items-center text-2xl font-bold text-orange-500 ${scrolled || isSpecialPage ? "" : "text-white"}`}>
            <span className={`absolute top-4 h-8 w-8 rounded-2xl flex items-center justify-center  ${scrolled || isSpecialPage ? "bg-orange-500 text-white" : "bg-white text-orange-500"}`}>
              <span className={` relative left-1.5 pt-0.5 pb-6  h-8 w-8 rounded-2xl text-xl  ${scrolled || isSpecialPage ? " text-white" : " text-orange-500"}`}>M

              </span>
            </span>

            <span className="relative left-10"> MCOM REWARD</span>
          </span>
        </Link>
        <div className="hidden md:flex gap-8 font-medium">
          <Link href="/" className={getLinkClass("/")}>Home</Link>
          <Link href="/pricing" className={getLinkClass("/pricing")}>Pricing</Link>
          <Link href="/deals" className={getLinkClass("/deals")}>Deals</Link>
          <Link href="/reward" className={getLinkClass("/reward")}>Rewards</Link>
          <Link href="/campaigns" className={getLinkClass("/campaigns")}>Campaigns</Link>

          <div
            className="relative group h-full flex items-center"
            onMouseEnter={() => setMatchingDropdownOpen(true)}
            onMouseLeave={() => setMatchingDropdownOpen(false)}
          >
            <button className={cn(
              "flex items-center gap-1 transition-colors h-full",
              getLinkClass("/matching-rewards")
            )}>
              Matching Point <ChevronDown size={14} className={cn("transition-transform duration-200", matchingDropdownOpen ? "rotate-180" : "")} />
            </button>

            {matchingDropdownOpen && (
              <div className="absolute top-full left-0 w-48 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                  <Link
                    href="/matching-rewards?view=customer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={() => setMatchingDropdownOpen(false)}
                  >
                    For Customers
                  </Link>
                  <Link
                    href="/matching-rewards?view=business"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={() => setMatchingDropdownOpen(false)}
                  >
                    For Businesses
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden md:flex gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold cursor-pointer overflow-hidden border border-orange-100">
                  {userRole === 'Business' && businessProfile?.profileImage ? (
                    <Image
                      src={businessProfile.profileImage}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <CircleUserRound size={24} />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span className="flex items-center">
                    Dashboard
                  </span>
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

                {userRole === 'Admin' && (
                  <>
                    {/* Admin only has Logout which is common below */}
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
                  <span className="flex items-center">
                    Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <span className={`px-5 py-2 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition ${scrolled || isSpecialPage ? "" : "bg-white"}`}>
                  Login
                </span>
              </Link>
              <Link href="/signup">
                <span className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                  Get Started
                </span>
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden text-orange-500" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-md px-6 py-4 flex flex-col gap-3 text-gray-700">
          <Link href="/" className={getLinkClass("/")}>Home</Link>
          <Link href="/pricing" className={getLinkClass("/pricing")}>Pricing</Link>
          <Link href="/deals" className={getLinkClass("/deals")}>Deals</Link>
          <Link href="/reward" className={getLinkClass("/reward")}>Rewards</Link>
          <Link href="/campaigns" className={getLinkClass("/campaigns")}>Campaigns</Link>
          <div className="border-t my-2"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Matching Points</p>
          <Link href="/matching-rewards?view=customer" className={getLinkClass("/matching-rewards")} onClick={() => setMenuOpen(false)}>For Customers</Link>
          <Link href="/matching-rewards?view=business" className={getLinkClass("/matching-rewards")} onClick={() => setMenuOpen(false)}>For Businesses</Link>
          <div className="border-t my-3"></div>
          {!isAuthenticated && (
            <Link href="/business/signup">
              <span className="text-orange-500 font-semibold">Get Started</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default FrontPageNavbar;
