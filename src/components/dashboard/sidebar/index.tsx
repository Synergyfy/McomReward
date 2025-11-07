'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useLinkClasses } from '@/app/hooks';
import TierBadge from '../../ui/tierBadge';
import { motion } from 'framer-motion';
import {mockBusinessData as data} from '../../../app/data';


interface BusinessSidebarProps {
  isOpen: boolean;
}

export default function BusinessSidebar({ isOpen }: BusinessSidebarProps) {
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false)
  const [ isVouchersOpen, setIsVouchersOpen] = useState (false);
  const [isMyAssetsOpen, setIsMyAssetsOpen] = useState(false);
  const linkClasses = useLinkClasses();

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-4 z-50 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Business Name*/}
      <div className="flex items-center justify-between mb-3">
         <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-semibold text-orange-500 mb-6"
              >
                {data.businessName} 
              </motion.h1>
      </div>

      {/* 🔗 Navigation Links */}
      <ul className="space-y-2 text-sm font-medium">
        <li>
          <Link href="/dashboard" className={linkClasses('/dashboard', true)}>
            <LayoutDashboard className="mr-3" />
            Overview
          </Link>
        </li>

        <li>
          <Link href="/dashboard/rewards" className={linkClasses('/dashboard/rewards')}>
            <Gift className="mr-3" />
            Rewards
          </Link>
        </li>

        <li>
          <button
            className={linkClasses('/dashboard/campaigns')}
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
              <Link href="/dashboard/campaigns/list" className={linkClasses('/dashboard/campaigns/list')}>
              
                View Campaigns
              </Link>
            </li>
               <li>
                <Link href="/dashboard/campaign-performance" className={linkClasses('/dashboard/campaign-performance')}>
                
                  Campaign Performance
                </Link>
               </li>
            </ul>
          )}
        </li>
        <li>
          <button
            className={linkClasses('/dashboard/vouchers')}
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
                <Link href="/dashboard/vouchers/list" className={linkClasses('/dashboard/vouchers/list')}>
                  View Vouchers
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vouchers/create" className={linkClasses('/dashboard/vouchers/create')}>
                  Create Voucher
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <Link href="/dashboard/wishlist-insights" className={linkClasses('/dashboard/wishlist-insights')}>
            <Heart className="mr-3" />
            Wishlist Insights
          </Link>
        </li>

        <li>
          <Link href="/dashboard/affiliate" className={linkClasses('/dashboard/affiliate')}>
            <Users className="mr-3" />
            Affiliate
          </Link>
        </li>

        <li>
          <Link href="/dashboard/customer-activities" className={linkClasses('/dashboard/customer-activities')}>
            <Activity className="mr-3" />
            Customer Activities
          </Link>
        </li>

        <li>
          <Link href="/dashboard/matching-points" className={linkClasses('/dashboard/matching-points')}>
            <Coins className="mr-3" />
            Matching Points
          </Link>
        </li>

        <li>
          <Link href="/dashboard/deals" className={linkClasses('/dashboard/deals')}>
            <Tag className="mr-3" />
            Deals
          </Link>
        </li>

        {/* 👥 Staff Dropdown */}
        <li>
          <button
            className={linkClasses('/dashboard/staff')}
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
                <Link href="/dashboard/staff" className={linkClasses('/dashboard/staff', true)}>
                  View Staff
                </Link>
              </li>
              <li>
                <Link href="/dashboard/staff/add" className={linkClasses('/dashboard/staff/add', true)}>
                  Add Staff
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
            className={linkClasses('/dashboard/my-assets')}
            onClick={() => setIsMyAssetsOpen(!isMyAssetsOpen)}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center">
                <Award className="mr-3" />
                My Assets
              </span>
              <span className="text-gray-400 text-xs">{isMyAssetsOpen ? '−' : '+'}</span>
            </span>
          </button>
          {isMyAssetsOpen && (
            <ul className="ml-8 mt-2 space-y-1">
              <li><Link href="/dashboard/my-assets" className={linkClasses('/dashboard/my-assets')}>Overview</Link></li>
              <li><Link href="/dashboard/my-assets/qr-plaques" className={linkClasses('/dashboard/my-assets/qr-plaques')}>QR Plaques</Link></li>
              <li><Link href="/dashboard/my-assets/nfc-cards" className={linkClasses('/dashboard/my-assets/nfc-cards')}>NFC Cards</Link></li>
              <li><Link href="/dashboard/my-assets/storefront-media" className={linkClasses('/dashboard/my-assets/storefront-media')}>Storefront & Media</Link></li>
              <li><Link href="/dashboard/my-assets/marketing-materials" className={linkClasses('/dashboard/my-assets/marketing-materials')}>Marketing Materials</Link></li>
              <li><Link href="/dashboard/my-assets/partner-network" className={linkClasses('/dashboard/my-assets/partner-network')}>Partner Network</Link></li>
              <li><Link href="/dashboard/my-assets/revenue-analytics" className={linkClasses('/dashboard/my-assets/revenue-analytics')}>Revenue & Analytics</Link></li>
            </ul>
          )}
        <Link href="/dashboard/profile" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
          <User className="mr-3" size={18} />
          Business Profile
        </Link>
        <Link href="/dashboard/tier" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
            <Star className="mr-3" size={18}/>
            Tier
        </Link>
        <Link href="/dashboard/subscription" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
            <CreditCard className="mr-3" size={18}/>
            Subscription
        </Link>
        <Link href="/dashboard/account" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
            <Settings className="mr-3" size={18}/>
            Settings
        </Link>
                <Link href="/dashboard/support" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
                    <LifeBuoy className="mr-3" size={18}/>
                    Support & Help
                </Link>
        <button
          onClick={() => console.log('Logging out...')}
          className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-red-600 transition"
        >
          <LogOut className="mr-3" size={18} />
          Logout
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
