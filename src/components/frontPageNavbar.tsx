"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FrontPageNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

        useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
      setIsAuthenticated(!!Cookies.get('access'));
    }, []);

    const handleLogout = () => {
      Cookies.remove('access');
      Cookies.remove('refresh');
      router.push('/login');
    };

    return (
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <Link href="/">
            <span className={`  justify-center items-center text-2xl font-bold text-orange-500 ${scrolled ? "" : "text-white"}`}>
              <span className={`absolute top-4 h-8 w-8 rounded-2xl flex items-center justify-center  ${scrolled ? "bg-orange-500 text-white" : "bg-white text-orange-500"}`}>
                <span className={` relative left-1.5 pt-0.5 pb-6  h-8 w-8 rounded-2xl text-xl  ${scrolled ? " text-white" : " text-orange-500"}`}>M

                </span>
              </span>
              
              <span className="relative left-10"> MCOM REWARD</span>
            </span>
          </Link>
          <div className={`hidden md:flex gap-8  font-medium ${scrolled ? "text-orange-500" : "text-white"}`}>
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/reward">Rewards</Link>
            <Link href="/campaigns">Campaigns</Link>
          </div>
          <div className="hidden md:flex gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold cursor-pointer">
                    A
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <span className={`px-5 py-2 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition ${scrolled ? "" : "bg-white"}`}>
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <span className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                    Get Started
                  </span>
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden text-orange-500" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t shadow-md px-6 py-4 flex flex-col gap-3 text-gray-700">
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/reward">Rewards</Link>
            <Link href="/campaigns">Campaigns</Link>
            <div className="border-t my-3"></div>
            {!isAuthenticated && (
              <Link href="/business/signup">
                <span className="text-orange-500 font-semibold">Get Started</span>
              </Link>
            )}
          </div>
        )}
      </nav>
    );
};

export default FrontPageNavbar;
