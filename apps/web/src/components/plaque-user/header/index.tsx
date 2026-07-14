'use client';

import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function PlaqueUserHeader({ onMenuClick }: HeaderProps) {
    return (
        <header className="flex items-center justify-between p-4 bg-white border-b md:px-8">
            <div className="flex items-center md:hidden">
                <Button onClick={onMenuClick} variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-6 w-6" />
                </Button>
                <span className="font-bold text-lg">Plaque Dashboard</span>
            </div>

            {/* Spacer for desktop to push user menu to right */}
            <div className="hidden md:block flex-1"></div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-gray-500">Business Name</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
                            <User className="h-5 w-5" />
                            <span className="sr-only">User menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/plaque-user/settings">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/plaque-user/settings">Billing</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
