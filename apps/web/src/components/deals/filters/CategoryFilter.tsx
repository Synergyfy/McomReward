import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DealCategory } from '@/lib/mock-data/deals';

interface CategoryFilterProps {
  categories: DealCategory[];
  onSelectCategory: (category: DealCategory | 'all') => void;
  selectedCategory: DealCategory | 'all';
}

export default function CategoryFilter({ categories, onSelectCategory, selectedCategory }: CategoryFilterProps) {
  return (
    <Select onValueChange={(value: DealCategory | 'all') => onSelectCategory(value)} value={selectedCategory}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
