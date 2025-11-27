'use client';

import { Bell, Coins, Menu, Shield, User } from 'lucide-react';
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
import { useGetBusinessProfile } from '@/services/business/hook';
import { Loader2 } from 'lucide-react';

interface BusinessHeaderProps {
  onMenuClick: () => void;
}

export default function BusinessHeader({ onMenuClick }: BusinessHeaderProps) {
  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription } = useGetMySubscription();
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useGetBusinessProfile();

  const tierName = subscription?.tier?.name;
  const userPoints = profile?.totalPointsEarned;
  const userBadge = profile?.role;
  const userInitials = profile?.name ? profile.name.charAt(0).toUpperCase() : '...';

  const isLoading = isLoadingSubscription || isLoadingProfile;
  const isError = isErrorSubscription || isErrorProfile;

  const notificationsCount = 3; // Leaving as mock.

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
            <span>{isLoading ? '...' : (userPoints?.toLocaleString() ?? 0)} Points</span>
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
              {notificationsCount > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New campaign launched!</DropdownMenuItem>
            <DropdownMenuItem>Your tier has been upgraded.</DropdownMenuItem>
            <DropdownMenuItem>A customer redeemed a reward.</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
           <button
            className="flex items-center  justify-centergap-2 w-full px-4 py-3 text-gray-700 hover:bg-gray-200 hover:text-orange-600 transition text-left rounded-4xl border border-transparent focus:outline-none "
            aria-label="User menu"
          >
            <User size={18} />
            {isLoading ? '...' : userInitials}
          </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

