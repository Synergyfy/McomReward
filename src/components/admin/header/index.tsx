'use client';

import React from 'react';
import { Menu, Bell, Search, User, LogOut, Settings, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/services/notifications/hook';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();

  // Notification hooks
  const { data: notificationsData, isLoading } = useGetNotifications({ limit: 5 });
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: markRead } = useMarkNotificationRead();

  const handleLogout = () => {
    // Clear any auth tokens/session data
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    // Redirect to login page
    router.push('/login');
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

  const unreadCount = notificationsData?.unreadCount ?? 0;
  const notifications = notificationsData?.data ?? [];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left Section - Mobile Menu & Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search rewards, campaigns, users..."
                className="pl-10 pr-4 w-full bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Icon - Mobile Only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
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
                {isLoading ? (
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

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 md:px-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-gray-500">admin@mcom.com</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">Admin User</span>
                  <span className="text-xs text-gray-500 font-normal">admin@mcom.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
