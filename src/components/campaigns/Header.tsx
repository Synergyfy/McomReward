'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useParams } from 'next/navigation';

import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockBusiness = {
  name: 'Mcom Loyalty',
  logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG0wby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMember, memberName } = useCampaignMembership();
  const params = useParams();
  const campaignId = params?.campaignId as string;

  const navLinks = [
    { href: `/campaigns/${campaignId}/earn-points`, label: 'EARN POINTS' },
    { href: `/campaigns/${campaignId}/redeem-points`, label: 'REDEEM POINTS' },
    { href: `/campaigns/${campaignId}/contact-us`, label: 'CONTACT US' },
    { href: '/campaigns/my-points', label: 'MY POINTS' },
  ];

  return (
    <header className="relative bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src={mockBusiness.logoUrl}
            alt={mockBusiness.name + ' Logo'}
            width={50}
            height={50}
            className="rounded-full border-2 border-gray-200 shadow-sm"
          />
          <span className="text-xl font-bold text-gray-800">{mockBusiness.name}</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-600 hover:text-orange-600 transition-colors duration-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {isMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>{memberName.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          {isMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>{memberName.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg pb-4 pt-2">
          <ul className="flex flex-col items-center space-y-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-800 hover:text-orange-600 transition-colors duration-200 text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
