'use client';

import { Bell, Coins, Menu, Shield, UserIcon } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BusinessHeaderProps {
  onMenuClick: () => void;
}

// Mock data for prototype
const userData = {
  name: 'Business Owner',
  initials: 'BO',
  points: 1250,
  badge: 'Partner',
  tier: 'Bronze',
  notifications: 3,
};

export default function BusinessHeader({ onMenuClick }: BusinessHeaderProps) {
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
            <span>{userData.points.toLocaleString()} Points</span>
          </div>

          {/* Badge Status */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <Badge variant="secondary">{userData.badge}</Badge>
            <Badge variant="secondary">{userData.tier}</Badge>
          </div>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {userData.notifications > 0 && (
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
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
              </Avatar>
            </Button>
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
