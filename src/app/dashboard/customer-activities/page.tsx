'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ActivitiesTable from '@/components/dashboard/customer-activities/ActivitiesTable';
import CustomerDetailsModal from '@/components/dashboard/customer-activities/CustomerDetailsModal';
import { customerActivitiesData, CustomerActivity } from '@/lib/mock-data/activities';

export default function CustomerActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<CustomerActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredActivities = useMemo(() => {
    return customerActivitiesData
      .filter(activity => 
        activity.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(activity => 
        activityTypeFilter === 'all' || activity.activityType === activityTypeFilter
      );
  }, [searchTerm, activityTypeFilter]);

  const handleViewDetails = (activity: CustomerActivity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Customer Activities</h1>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Redemption">Redemption</SelectItem>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="Wishlist">Wishlist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ActivitiesTable activities={filteredActivities} onViewDetails={handleViewDetails} />

      <CustomerDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activity={selectedActivity}
      />
    </div>
  );
}
