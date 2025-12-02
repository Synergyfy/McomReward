import React from 'react';
import { useGetParticipantProfile, useGetParticipantGlobalBalance } from '@/services/customer-campaigns/hook';
import type { ParticipantGlobalBalanceResponse, ParticipantProfileResponse } from '@/services/customer-campaigns/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernHeaderProps {
    onMenuClick?: () => void;
    // Optional overrides for impersonation/admin view
    profile?: ParticipantProfileResponse;
    balanceData?: ParticipantGlobalBalanceResponse;
    isLoading?: boolean;
}

export default function ModernHeader({ onMenuClick, profile: propsProfile, balanceData: propsBalance, isLoading: propsLoading }: ModernHeaderProps) {
    const { data: fetchedProfile, isLoading: isProfileLoading } = useGetParticipantProfile();
    const { data: fetchedBalance, isLoading: isBalanceLoading } = useGetParticipantGlobalBalance();

    // Use props if provided (admin view), otherwise use fetched data (customer view)
    // We check if props are specifically undefined to allow passing null if needed, but usually we just check presence
    const isUsingProps = propsProfile !== undefined || propsBalance !== undefined;

    const profile = isUsingProps ? propsProfile : fetchedProfile;
    const balanceData = isUsingProps ? propsBalance : fetchedBalance;
    const isLoading = isUsingProps ? propsLoading : (isProfileLoading || isBalanceLoading);

    const userName = profile?.name || 'Guest';
    const userInitials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const globalPoints = balanceData?.globalTotalPoints || 0;

    return (
        <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-gray-500 hover:text-gray-700"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>

                    {/* Logo or Brand Name could go here if needed, but sidebar usually handles it */}
                    <div className="hidden md:block">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {/* Points Display */}
                    <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">Balance</span>
                        {isLoading ? (
                            <Skeleton className="h-5 w-16 bg-orange-200" />
                        ) : (
                            <span className="text-sm font-bold text-orange-700">{globalPoints.toLocaleString()} pts</span>
                        )}
                    </div>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    </Button>

                    {/* User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} />
                                    <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{userName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {profile?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="sm:hidden">
                                <span className="flex-1">Points Balance</span>
                                <span className="font-bold text-orange-600">{globalPoints.toLocaleString()}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="sm:hidden" />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
