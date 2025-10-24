'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-gray-900 text-white">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      <Button onClick={onMenuClick} variant="ghost" size="icon">
        <Menu />
      </Button>
    </header>
  );
}