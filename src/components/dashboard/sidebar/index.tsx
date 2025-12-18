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
} from 'lucide-react';
import { useLinkClasses } from '@/app/hooks';
import TierBadge from '../../ui/tierBadge';
import { motion } from 'framer-motion';
import { useGetBusinessProfile } from '@/services/business/hook';
import { useGetBusinessSubscription } from '@/services/tiers/hook';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/services/auth/hook';
import { toast } from 'sonner';
import { BusinessProfile } from '@/services/business/types';

interface BusinessSidebarProps {
  isOpen: boolean;
  profile?: Partial<BusinessProfile>; // Optional prop for impersonation
  isLoading?: boolean; // Optional prop for unified loading state
}

export default function BusinessSidebar({
  isOpen,
  profile: propProfile,
  isLoading: propIsLoading,
}: BusinessSidebarProps) {
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false)
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isMyAssetsOpen, setIsMyAssetsOpen] = useState(false);
  const linkClasses = useLinkClasses();

  const { data: hookProfile, isLoading: hookIsLoadingProfile } = useGetBusinessProfile();
  const { data: subscription } = useGetBusinessSubscription();

  // Prioritize prop data if provided
  const profile = propProfile ?? hookProfile;
  const isLoading = propIsLoading ?? hookIsLoadingProfile;

  const router = useRouter();
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();

  const isFreeTier = useMemo(() => subscription?.tier === 'Free', [subscription]);

  console.log('isFreeTier', isFreeTier);

  const enhancedLinkClasses = (path: string, exact: boolean = false) => {
    let classes = linkClasses(path, exact);
    // Disable everything except subscription if on Free tier
    // We strictly check if the path is NOT subscription related
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
        // Even if server logout fails, clear client-side and redirect for better UX
        router.push('/login');
      }
    });
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-4 z-50 shadow-2xl overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Business Name*/}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-semibold text-orange-500">
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : profile?.name || 'Business'}
          </h1>
          {!isLoading && profile?.role && (
            <p className="text-sm text-gray-500 mt-1">
              {profile.role}
            </p>
          )}
        </motion.div>
      </div>

      {/* 🔗 Navigation Links */}
      <ul className="space-y-2 text-sm font-medium">
        <li>
          <Link href="/dashboard" className={enhancedLinkClasses('/dashboard', true)}>
            <LayoutDashboard className="mr-3" />
            Overview
          </Link>
        </li>

        <li>
          <Link href="/dashboard/rewards" className={enhancedLinkClasses('/dashboard/rewards')}>
            <Gift className="mr-3" />
            Rewards
          </Link>
        </li>

        <li>
          <Link href="/dashboard/stamp-rewards" className={enhancedLinkClasses('/dashboard/stamp-rewards')}>
            <Stamp className="mr-3" />
            Stamp Rewards
          </Link>
        </li>

        <li>
          <button
            className={enhancedLinkClasses('/dashboard/campaigns')}
            onClick={() => setIsCampaignsOpen(!isCampaignsOpen)}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center">
                <Megaphone className="mr-3" />
                Campaigns
              </span>
              <span className="text-gray-400 text-xs">{isCampaignsOpen ? '−' : '+'}</span>
            </span>
          </button>
          {isCampaignsOpen && (
            <ul className="ml-8 mt-2 space-y-1">
              <li>
                <Link href="/dashboard/campaigns/list" className={enhancedLinkClasses('/dashboard/campaigns/list')}>

                  View Campaigns
                </Link>
              </li>
              <li>
                <Link href="/dashboard/campaign-performance" className={enhancedLinkClasses('/dashboard/campaign-performance')}>

                  Campaign Performance
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <button
            className={enhancedLinkClasses('/dashboard/vouchers')}
            onClick={() => setIsVouchersOpen(!isVouchersOpen)}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center">
                <Ticket className="mr-3" />
                Vouchers
              </span>
              <span className="text-gray-400 text-xs">{isVouchersOpen ? '−' : '+'}</span>
            </span>
          </button>
          {isVouchersOpen && (
            <ul className="ml-8 mt-2 space-y-1">
              <li>
                <Link href="/dashboard/vouchers/list" className={enhancedLinkClasses('/dashboard/vouchers/list')}>
                  View Vouchers
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vouchers/create" className={enhancedLinkClasses('/dashboard/vouchers/create')}>
                  Create Voucher
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <Link href="/dashboard/wishlist-insights" className={enhancedLinkClasses('/dashboard/wishlist-insights')}>
            <Heart className="mr-3" />
            Wishlist Insights
          </Link>
        </li>



        <li>
          <Link href="/dashboard/customer-activities" className={enhancedLinkClasses('/dashboard/customer-activities')}>
            <Activity className="mr-3" />
            Customer Activities
          </Link>
        </li>

        <li>
          <Link href="/dashboard/matching-points" className={enhancedLinkClasses('/dashboard/matching-points')}>
            <Coins className="mr-3" />
            Matching Points
          </Link>
        </li>

        <li>
          <Link href="/dashboard/deals" className={enhancedLinkClasses('/dashboard/deals')}>
            <Tag className="mr-3" />
            Deals
          </Link>
        </li>

        {/* 👥 Staff Dropdown */}
        <li>
          <button
            className={enhancedLinkClasses('/dashboard/staff')}
            onClick={() => setIsStaffOpen(!isStaffOpen)}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center">
                <Users className="mr-3" />
                Staff Management
              </span>
              <span className="text-gray-400 text-xs">{isStaffOpen ? '−' : '+'}</span>
            </span>
          </button>

          {isStaffOpen && (
            <ul className="ml-8 mt-2 space-y-1">
              <li>
                <Link href="/dashboard/staff" className={enhancedLinkClasses('/dashboard/staff', true)}>
                  View Staff
                </Link>
              </li>
              <li>
                <Link href="/dashboard/staff/add" className={enhancedLinkClasses('/dashboard/staff/add', true)}>
                  Add Staff
                </Link>
              </li>
              <div className="border-t border-gray-100 my-1 pt-1"></div>
              <li>
                <Link href="/dashboard/staff/campaigns" className={enhancedLinkClasses('/dashboard/staff/campaigns')}>
                  Staff Campaigns
                </Link>
              </li>
              <li>
                <Link href="/dashboard/staff/customers" className={enhancedLinkClasses('/dashboard/staff/customers')}>
                  Staff Customers
                </Link>
              </li>
              <li>
                <Link href="/dashboard/staff/redeem" className={enhancedLinkClasses('/dashboard/staff/redeem')}>
                  Redeem Terminal
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>

      {/* Divider */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* 👤 Settings & Logout */}
      <div className="space-y-2">
        <button
          className={enhancedLinkClasses('/dashboard/my-assets')}
          onClick={() => setIsMyAssetsOpen(!isMyAssetsOpen)}
        >
          <span className="flex items-center justify-between w-full">
            <span className="flex items-center">
              <Award className="mr-3" />
              My Network
            </span>
            <span className="text-gray-400 text-xs">{isMyAssetsOpen ? '−' : '+'}</span>
          </span>
        </button>
        {isMyAssetsOpen && (
          <ul className="ml-8 mt-2 space-y-1">
            <li><Link href="/dashboard/my-assets" className={linkClasses('/dashboard/my-assets')}>Contacts</Link></li>
            <li><Link href="/dashboard/my-assets/group-circles" className={linkClasses('/dashboard/my-assets/group-circles')}>Group Circles</Link></li>
            <li><Link href="/dashboard/my-assets/qr-plaques" className={linkClasses('/dashboard/my-assets/qr-plaques')}>QR Plaques</Link></li>

            <Link href="/dashboard/affiliate" className={linkClasses('/dashboard/affiliate')}>
              Affiliate
            </Link>
            <li><Link href="/dashboard/my-assets/nfc-cards" className={linkClasses('/dashboard/my-assets/nfc-cards')}>NFC Cards</Link></li>
            <li>
            </li>
            {/* <li><Link href="/dashboard/my-assets/storefront-media" className={linkClasses('/dashboard/my-assets/storefront-media')}>Storefront & Media</Link></li>
            <li><Link href="/dashboard/my-assets/marketing-materials" className={linkClasses('/dashboard/my-assets/marketing-materials')}>Marketing Materials</Link></li>
            <li><Link href="/dashboard/my-assets/partner-network" className={linkClasses('/dashboard/my-assets/partner-network')}>Partner Network</Link></li>
            <li><Link href="/dashboard/my-assets/revenue-analytics" className={linkClasses('/dashboard/my-assets/revenue-analytics')}>Revenue & Analytics</Link></li> */}
          </ul>
        )}
        <Link href="/dashboard/profile" className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition ${isFreeTier ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}>
          <User className="mr-3" size={18} />
          Business Profile
        </Link>
        <Link href="/dashboard/tier" className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition ${isFreeTier ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}>
          <Star className="mr-3" size={18} />
          Tier
        </Link>
        <Link href="/dashboard/subscription" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
          <CreditCard className="mr-3" size={18} />
          Subscription
        </Link>
        <Link href="/dashboard/account" className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition ${isFreeTier ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}>
          <Settings className="mr-3" size={18} />
          Settings
        </Link>
        <Link href="/dashboard/support" className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition ${isFreeTier ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}>
          <LifeBuoy className="mr-3" size={18} />
          Support & Help
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-3 animate-spin" size={18} />
          ) : (
            <LogOut className="mr-3" size={18} />
          )}
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {/* 🧩 Bottom Badge */}
      <div className="absolute bottom-6 left-4 right-4  text-orange-600 flex items-center justify-center gap-2 font-semibold py-2 rounded-full">

        <div className="sm:block md:hidden  lg:hidden xl:hidden">
          <Link href="/dashboard/tier" className="sm:block md:hidden lg:hidden xl:hidden">

            <TierBadge tier="Gold" />
          </Link>
        </div>
      </div>
    </div>
  );
}