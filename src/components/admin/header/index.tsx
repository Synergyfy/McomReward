import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="md:hidden bg-white dark:bg-gray-800 shadow-md p-4 flex items-center">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu />
      </Button>
      <h1 className="text-lg font-semibold ml-4">Admin Dashboard</h1>
    </header>
  );
}
