'use client';

import React from 'react';
import { Loader2, Bell, Coins, Menu, Shield, User, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetMySubscription } from '@/services/tiers/hook';
import { useGetBusinessProfile, useGetBusinessMonthlyBalance } from '@/services/business/hook';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/services/auth/hook'; // Import useLogout hook
import { toast } from 'sonner';
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/services/notifications/hook';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { BusinessProfile } from '@/services/business/types';

interface SubscriptionType {
  tier?: { name: string };
  // Add other relevant properties from your Subscription type
}

interface MonthlyBalanceType {
  remaining?: number;
  monthlyLimit?: number;
  used?: number;
  // Add other relevant properties from your MonthlyBalance type
}

interface BusinessHeaderProps {
  onMenuClick: () => void;
  // Optional props for impersonation mode
  profile?: Partial<BusinessProfile>;
  subscription?: SubscriptionType;
  monthlyBalance?: MonthlyBalanceType;
  isLoading?: boolean; // Unified loading prop for impersonation
  isError?: boolean; // Unified error prop for impersonation
}

export default function BusinessHeader({
  onMenuClick,
  profile: propProfile,
  subscription: propSubscription,
  monthlyBalance: propMonthlyBalance,
  isLoading: propIsLoading,
  isError: propIsError,
}: BusinessHeaderProps) {
  const router = useRouter();

  // Conditionally use hooks or props
  const { data: hookSubscription, isLoading: hookIsLoadingSubscription, isError: hookIsErrorSubscription } = useGetMySubscription();
  const { data: hookProfile, isLoading: hookIsLoadingProfile, isError: hookIsErrorProfile } = useGetBusinessProfile();
  const { data: hookMonthlyBalance, isLoading: hookIsLoadingMonthlyBalance, isError: hookIsErrorMonthlyBalance } = useGetBusinessMonthlyBalance();
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();

  // Notification hooks
  const { data: notificationsData, isLoading: isNotificationsLoading } = useGetNotifications({ limit: 5 });
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: markRead } = useMarkNotificationRead();

  // Prioritize props data if provided
  const subscription = propSubscription ?? hookSubscription;
  const profile = propProfile ?? hookProfile;
  const monthlyBalance = propMonthlyBalance ?? hookMonthlyBalance;

  // Unify loading and error states
  const isLoading = propIsLoading ?? (hookIsLoadingSubscription || hookIsLoadingProfile || hookIsLoadingMonthlyBalance);
  const isError = propIsError ?? (hookIsErrorSubscription || hookIsErrorProfile || hookIsErrorMonthlyBalance);

  const tierName = subscription?.tier?.name;
  const userBadge = profile?.role;
  const userInitials = profile?.name ? profile.name.charAt(0).toUpperCase() : '...';

  const unreadCount = notificationsData?.unreadCount ?? 0;
  const notifications = notificationsData?.data ?? [];

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

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    markAllRead(undefined, {
        onSuccess: () => toast.success('All notifications marked as read')
    });
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
        markRead(id);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button onClick={onMenuClick} variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Placeholder for search or title on larger screens */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>
      </div>

      {/* Right-side elements */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-600">
          {/* Points Balance */}
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            {isLoading ? (
              <span>...</span>
            ) : isError ? (
              <span className='text-red-500'>Error</span>
            ) : (
              <span className='whitespace-nowrap'>
                {monthlyBalance?.remaining?.toLocaleString() ?? 0} / {monthlyBalance?.monthlyLimit?.toLocaleString() ?? 0}
              </span>
            )}
          </div>

          {/* Used Points */}
          <div className="flex items-center gap-2">
             <TrendingDown className="h-5 w-5 text-orange-500" />
             <span>Used: {isLoading ? '...' : isError ? 'N/A' : monthlyBalance?.used?.toLocaleString() ?? 0}</span>
          </div>

          {/* Badge Status */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isError ? (
                <Badge variant="destructive">Error</Badge>
            ) : (
                <>
                    <Badge variant="secondary">{userBadge || 'N/A'}</Badge>
                    <Badge variant="secondary">{tierName || 'N/A'}</Badge>
                </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700"
                        onClick={handleMarkAllRead}
                    >
                        Mark all read
                    </Button>
                )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
                {isNotificationsLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                            onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                        >
                            <div className="flex items-start justify-between w-full">
                                <div className="font-medium truncate pr-2">{notification.title || 'Notification'}</div>
                                {!notification.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">{notification.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
           <button
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-gray-700 hover:bg-gray-200 hover:text-orange-600 transition text-left rounded-4xl border border-transparent focus:outline-none "
            aria-label="User menu"
          >
            {profile?.profileImage ? (
                <Image
                    src={profile.profileImage}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                />
            ) : (
                <User size={18} />
            )}
            <span className="truncate max-w-[100px]">{isLoading ? '...' : userInitials}</span>
          </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/subscription')}>Billing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Logout'
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
