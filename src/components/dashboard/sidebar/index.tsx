'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Megaphone,
  Heart,
  Users,
  Ticket,
  User,
  LogOut,
  CreditCard,
  Star,
  Coins,
  LifeBuoy,
  Settings,
  Gift,
  Activity,
  Tag,
  LayoutDashboard,
  Loader2,
  Stamp,
  ChevronLeft,
  ChevronRight,
  Store,
  Image
} from 'lucide-react';
import { useLinkClasses } from '@/app/hooks';
import TierBadge from '../../ui/tierBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetBusinessProfile } from '@/services/business/hook';
import { useGetBusinessSubscription } from '@/services/tiers/hook';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/services/auth/hook';
import { toast } from 'sonner';
import { BusinessProfile } from '@/services/business/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BusinessSidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  profile?: Partial<BusinessProfile>;
  isLoading?: boolean;
}

const StoreIcon = ({ isCollapsed }: { isCollapsed?: boolean }) => (
  <Store className={isCollapsed ? "w-6 h-6" : "w-5 h-5"} />
);

export default function BusinessSidebar({
  isOpen,
  isCollapsed = false,
  toggleCollapse,
  profile: propProfile,
  isLoading: propIsLoading,
}: BusinessSidebarProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const linkClasses = useLinkClasses();

  const { data: hookProfile, isLoading: hookIsLoadingProfile } = useGetBusinessProfile();
  const { data: subscription } = useGetBusinessSubscription();

  const profile = propProfile ?? hookProfile;
  const isLoading = propIsLoading ?? hookIsLoadingProfile;

  const router = useRouter();
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();

  const isFreeTier = useMemo(() => subscription?.tier === 'Free', [subscription]);

  const enhancedLinkClasses = (path: string, exact: boolean = false) => {
    let classes = linkClasses(path, exact);
    if (isFreeTier && !path.includes('/dashboard/subscription')) {
      classes += ' opacity-50 pointer-events-none cursor-not-allowed';
    }
    return classes;
  };

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        toast.success('Logged out successfully.');
        router.push('/login');
      },
      onError: (error) => {
        console.error('Logout failed:', error);
        toast.error('Logout failed. Please try again.');
        router.push('/login');
      }
    });
  };

  // Helper for consistent link rendering
  const SidebarItem = ({
    icon: Icon,
    label,
    href,
    activePath,
    hasSubmenu = false,
    submenuKey = '',
    children
  }: {
    icon: any,
    label: string,
    href?: string,
    activePath?: string,
    hasSubmenu?: boolean,
    submenuKey?: string,
    children?: React.ReactNode
  }) => {

    const Content = () => (
      <div className={`flex items-center w-full px-3 py-2 rounded-lg transition-all ${!hasSubmenu && href ? enhancedLinkClasses(href!, activePath === href) : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer'} ${isCollapsed ? 'justify-center' : ''}`}>
        <Icon className={`${isCollapsed ? 'mr-0' : 'mr-3'} shrink-0`} size={20} />
        {!isCollapsed && (
          <div className="flex-1 flex justify-between items-center overflow-hidden">
            <span className="truncate">{label}</span>
            {hasSubmenu && <span className="text-gray-400 text-xs ml-2">{openSubmenus[submenuKey] ? '−' : '+'}</span>}
          </div>
        )}
      </div>
    );

    // Wrapper for tooltip
    const TooltipWrapper = ({ children }: { children: React.ReactNode }) => (
      isCollapsed ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="right" className="font-semibold">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : <>{children}</>
    );

    if (hasSubmenu) {
      return (
        <li>
          <TooltipWrapper>
            <button className="w-full text-left focus:outline-none" onClick={() => !isCollapsed && toggleSubmenu(submenuKey)}>
              <Content />
            </button>
          </TooltipWrapper>
          {/* Only show submenu if NOT collapsed and OPEN */}
          <AnimatePresence>
            {!isCollapsed && openSubmenus[submenuKey] && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-8 mt-1 space-y-1 overflow-hidden"
              >
                {children}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      );
    }

    return (
      <li>
        <TooltipWrapper>
          <Link href={href!} className="block focus:outline-none">
            <Content />
          </Link>
        </TooltipWrapper>
      </li>
    );
  }

  // Helper method for sub-links to avoid prop drilling madness
  const SubItem = ({ href, label }: { href: string, label: string }) => (
    <li>
      <Link href={href} className={enhancedLinkClasses(href)}>
        {label}
      </Link>
    </li>
  );

  return (
    <div
      className={`
        fixed top-0 left-0 h-full bg-white text-gray-800 p-4 z-50 shadow-2xl 
        transform transition-all duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Collapse Toggle (Desktop Only) */}
      <div className="hidden md:flex absolute -right-3 top-10 z-50">
        <button
          onClick={toggleCollapse}
          className="bg-orange-600 text-white p-1 rounded-full shadow-md hover:bg-orange-700 transition-colors border-2 border-white hover:scale-110 active:scale-95 transform duration-200"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Business Name Header */}
      <div className={`flex items-center gap-3 mb-8 flex-none ${isCollapsed ? 'justify-center' : 'px-1'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg text-white shrink-0">
          <StoreIcon isCollapsed={isCollapsed} />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="font-bold text-xl tracking-tight text-zinc-800 whitespace-nowrap overflow-hidden"
          >
            Mcom Reward
          </motion.div>
        )}
      </div>

      {/* Profile Summary (Only if Expanded) */}
      <div className={`mb-6 flex-none transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
        <h1 className="text-2xl font-semibold text-orange-500 truncate">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : profile?.name || 'Business'}
        </h1>
        {!isLoading && profile?.role && (
          <p className="text-sm text-gray-500 mt-1 truncate">{profile.role}</p>
        )}
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        <ul className="space-y-1 text-sm font-medium pb-20">
          <SidebarItem icon={LayoutDashboard} label="Overview" href="/dashboard" />

          {/* <SidebarItem icon={Gift} label="Rewards" href="/dashboard/rewards" /> */}

          <SidebarItem icon={Gift} label="All Rewards" href="/dashboard/stamp-rewards" />

          <SidebarItem icon={Megaphone} label="Campaigns" hasSubmenu submenuKey="campaigns">
            <SubItem href="/dashboard/campaigns/list" label="View Campaigns" />
            <SubItem href="/dashboard/campaign-performance" label="Performance" />
          </SidebarItem>

          <SidebarItem icon={Ticket} label="Vouchers" hasSubmenu submenuKey="vouchers">
            <SubItem href="/dashboard/vouchers/list" label="View Vouchers" />
            <SubItem href="/dashboard/vouchers/create" label="Create Voucher" />
          </SidebarItem>

          <SidebarItem icon={Heart} label="Wishlist Insights" href="/dashboard/wishlist-insights" />



          <SidebarItem icon={Coins} label="Matching Points" href="/dashboard/matching-points" />

          <SidebarItem icon={Tag} label="Deals" href="/dashboard/deals" />

          <SidebarItem icon={Users} label="Staff Management" hasSubmenu submenuKey="staff">
            <SubItem href="/dashboard/staff" label="View Staff" />
            <SubItem href="/dashboard/staff/add" label="Add Staff" />
            <div className="border-t border-gray-100 my-1"></div>
            <SubItem href="/dashboard/staff/campaigns" label="Staff Campaigns" />
            <SubItem href="/dashboard/staff/customers" label="Staff Customers" />
            <SubItem href="/dashboard/staff/redeem" label="Redeem Terminal" />
          </SidebarItem>

          <div className="my-4 border-t border-gray-200"></div>

          <SidebarItem icon={Award} label="My Network" hasSubmenu submenuKey="myassets">
            <SubItem href="/dashboard/my-assets" label="Contacts" />
            <SubItem href="/dashboard/my-assets/group-circles" label="Group Circles" />
            <SubItem href="/dashboard/my-assets/qr-plaques" label="QR Plaques" />
            <SubItem href="/dashboard/affiliate" label="Affiliate" />
            <SubItem href="/dashboard/my-assets/nfc-cards" label="NFC Cards" />
            <SubItem href="/dashboard/customer-activities" label="Customer Activities" />
          </SidebarItem>

          <SidebarItem icon={User} label="Business Profile" href="/dashboard/profile" />

          <SidebarItem icon={Star} label="Tier" href="/dashboard/tier" />

          <SidebarItem icon={CreditCard} label="Subscription" href="/dashboard/subscription" />

          <SidebarItem icon={Settings} label="Settings" href="/dashboard/account" />

          <SidebarItem icon={Image} label="Media Library" href="/dashboard/media-library" />

          <SidebarItem icon={LifeBuoy} label="Support & Help" href="/dashboard/support" />

          <li>
            <TooltipProvider>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-red-600 transition disabled:opacity-50"
                    >
                      {isLoggingOut ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-red-600 transition disabled:opacity-50"
                >
                  {isLoggingOut ? <Loader2 className="mr-3 animate-spin" size={20} /> : <LogOut className="mr-3" size={20} />}
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              )}
            </TooltipProvider>
          </li>
        </ul>
      </div>

      {/* Bottom Badge (Hide if collapsed) */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-4 right-4 flex items-center justify-center pointer-events-none">
          {/* Badge or promos can go here */}
        </div>
      )}
    </div>
  );
}