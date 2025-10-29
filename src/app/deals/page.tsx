"use client";

import React, { useState, useMemo } from 'react';
import DealCard from '@/components/deals/DealCard';
import SearchBar from '@/components/deals/filters/SearchBar';
import CategoryFilter from '@/components/deals/filters/CategoryFilter';
import { dealsData, DealCategory } from '@/lib/mock-data/deals';

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<DealCategory | 'all'>('all');

  const uniqueCategories = useMemo(() => {
    const categories = new Set<DealCategory>();
    dealsData.forEach(deal => categories.add(deal.category));
    return Array.from(categories);
  }, []);

  const filteredDeals = useMemo(() => {
    const activeDeals = dealsData.filter(deal => deal.status === 'Active' || deal.status === 'Scheduled');

    return activeDeals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.businessName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Find Your Next Deal</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
        <SearchBar onSearch={setSearchTerm} />
        <CategoryFilter
          categories={uniqueCategories}
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeals.length > 0 ? (
          filteredDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No deals found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
