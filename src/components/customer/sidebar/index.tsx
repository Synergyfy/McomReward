
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Megaphone, Heart, Settings, HandCoins, Stamp, Ticket } from 'lucide-react';

interface CustomerSidebarProps {
  isOpen: boolean;
  activePath?: string;
  basePath?: string;
}

export default function CustomerSidebar({ isOpen, activePath, basePath = '' }: CustomerSidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;

  const linkClasses = (path: string) => {
    // If we have a basePath (e.g., /admin/users/consumer/123), check if currentPath starts with basePath + path
    // OR if we are in customer view, check exact match or starts with.
    // Simplifying: construct the full target path.
    const fullPath = `${basePath}${path}`;

    // Check if the current path matches the target path.
    // For exact matching like /wallet vs /mall-rewards, exact match is usually better,
    // but sometimes nested routes exist.
    const isActive = currentPath === fullPath || currentPath?.startsWith(fullPath + '/');

    return `flex items-center p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`;
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-4 z-40 shadow-lg
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Menu</h2>
      <ul className="space-y-2">
        <li className="mb-2">
          <Link href={`${basePath}/wallet`} className={linkClasses("/wallet")}>
            <Wallet className="mr-3" />
            Wallet
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/mall-rewards`} className={linkClasses("/mall-rewards")}>
            <Ticket className="mr-3" />
            My Mall Rewards
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/my-campaigns`} className={linkClasses("/my-campaigns")}>
            <Megaphone className="mr-3" />
            My Campaigns
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/wishlist`} className={linkClasses("/wishlist")}>
            <Heart className="mr-3" />
            My Wishlist
          </Link>
        </li>
        <li className="mb-2">
          <Link href={`${basePath}/stamp-rewards`} className={linkClasses("/stamp-rewards")}>
            <Stamp className="mr-3" />
            Stamp Rewards
          </Link>
        </li>
        {/* <li className="mb-2">
          <Link href={`${basePath}/points`} className={linkClasses("/points")}>
            <Wallet className="mr-3" />
            Point
          </Link>
        </li> */}
        <li className="mb-2">
          <Link href={`${basePath}/redemption`} className={linkClasses("/redemption")}>
            <HandCoins className="mr-3" />
            Redemption
          </Link>
        </li>
        <li className="mt-8">
          <Link href={`${basePath}/settings`} className={linkClasses("/settings")}>
            <Settings className="mr-3" />
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}
