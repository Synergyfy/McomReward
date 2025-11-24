'use client';

import CustomerSidebar from '@/components/customer/sidebar';
import ModernHeader from '@/components/customer/ModernHeader';
import React, { useState, useEffect } from 'react';
import { WelcomeWishlistModal } from '@/components/customer/WelcomeWishlistModal';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWelcomeWishlistModalOpen, setIsWelcomeWishlistModalOpen] = useState(false);

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
    <html lang="en">
      <body>
        <div className="relative min-h-screen md:flex">

          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={toggleSidebar}
            ></div>
          )}

          {/* Sidebar */}
          <CustomerSidebar isOpen={isSidebarOpen} />

          {/* Main content */}
          <div className="flex-1 md:ml-64">
            {/* Header */}
            <ModernHeader onMenuClick={toggleSidebar} />
            <main className="p-4 sm:p-6 md:p-10">
              {children}
            </main>
          </div>
        </div>
        {/* Welcome Wishlist Modal */}
        <WelcomeWishlistModal
          isOpen={isWelcomeWishlistModalOpen}
          onClose={handleWelcomeWishlistModalClose}
        />
      </body>
    </html>
  );
}

