'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessHeaderProps {
  onMenuClick: () => void;
}

export default function BusinessHeader({ onMenuClick }: BusinessHeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-gray-900 text-white">
      <h1 className="text-lg font-semibold">Business Dashboard</h1>
      <Button onClick={onMenuClick} variant="ghost" size="icon">
        <Menu />
      </Button>
    </header>
  );
}
