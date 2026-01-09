'use client';

import CustomerSidebar from '@/components/customer/sidebar';
import ModernHeader from '@/components/customer/ModernHeader';
import React, { useState, useEffect } from 'react';
import { WelcomeWishlistModal } from '@/components/customer/WelcomeWishlistModal';
import { useImpersonation } from '@/context/ImpersonationContext';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWelcomeWishlistModalOpen, setIsWelcomeWishlistModalOpen] = useState(false);
  const { isImpersonating, participantId, stopImpersonation } = useImpersonation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('hasSeenWelcomeWishlistModal');
    if (!hasSeenModal) {
      setIsWelcomeWishlistModalOpen(true);
    }
  }, []);

  const handleWelcomeWishlistModalClose = () => {
    setIsWelcomeWishlistModalOpen(false);
    localStorage.setItem('hasSeenWelcomeWishlistModal', 'true');
  };

  return (
    <>
      <div className="relative min-h-screen md:flex">

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <CustomerSidebar isOpen={isSidebarOpen} basePath="/participant" />

        {/* Main content */}
        <div className="flex-1 md:ml-64 flex flex-col">
          {/* Impersonation Banner */}
          {isImpersonating && participantId && (
            <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-between text-amber-900 sticky top-0 z-40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                <span>
                  You are currently viewing as Participant ID: <strong>{participantId}</strong>
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopImpersonation}
                className="h-8 gap-1"
              >
                <X className="h-4 w-4" />
                Exit View
              </Button>
            </div>
          )}

          {/* Header */}
          <ModernHeader onMenuClick={toggleSidebar} />
          <main className="p-4 sm:p-6 md:p-10 flex-1">
            {children}
          </main>
        </div>
      </div>
      {/* Welcome Wishlist Modal */}
      <WelcomeWishlistModal
        isOpen={isWelcomeWishlistModalOpen}
        onClose={handleWelcomeWishlistModalClose}
      />
    </>
  );
}

