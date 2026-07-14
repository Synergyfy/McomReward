import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isLoading }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mt-1" />
        ) : (
          <p className="text-xl font-bold text-gray-900 break-all">{value}</p>
        )}
      </div>
      {icon}
    </div>
  );
};
