'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BusinessUser, ConsumerUser } from '@/lib/mock-data/users';

interface ViewUserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: BusinessUser | ConsumerUser | null;
}

export function ViewUserDetailsModal({
  isOpen,
  onClose,
  user,
}: ViewUserDetailsModalProps) {
  if (!user) return null;

  const isBusinessUser = (u: BusinessUser | ConsumerUser): u is BusinessUser => {
    return 'tier' in u;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Details for {user.name}</DialogTitle>
          <DialogDescription>
            Comprehensive overview of {user.name}'s profile and activities.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">ID:</div>
            <div>{user.id}</div>
            <div className="font-medium">Name:</div>
            <div>{user.name}</div>
            <div className="font-medium">Email:</div>
            <div>{user.email}</div>
            {isBusinessUser(user) ? (
              <>
                <div className="font-medium">Tier:</div>
                <div>{user.tier}</div>
                <div className="font-medium">Sector:</div>
                <div>{user.sector}</div>
                <div className="font-medium">Activity Status:</div>
                <div>{user.activityStatus}</div>
                <div className="font-medium">Campaigns Created:</div>
                <div>{user.campaignsCreated}</div>
                <div className="font-medium">Rewards Attached:</div>
                <div>{user.rewardsAttached}</div>
                <div className="font-medium">Points Balance:</div>
                <div>{user.pointsBalance}</div>
                <div className="font-medium">Member Since:</div>
                <div>{user.memberSince.toLocaleDateString()}</div>
              </>
            ) : (
              <>
                <div className="font-medium">Badge Level:</div>
                <div>{user.badgeLevel}</div>
                <div className="font-medium">Location:</div>
                <div>{user.location}</div>
                <div className="font-medium">Activity:</div>
                <div>{user.activity}</div>
                <div className="font-medium">Campaigns Joined:</div>
                <div>{user.campaignsJoined}</div>
                <div className="font-medium">Rewards Redeemed:</div>
                <div>{user.rewardsRedeemed}</div>
                <div className="font-medium">Points:</div>
                <div>{user.points}</div>
                <div className="font-medium">Matching Points:</div>
                <div>{user.matchingPoints}</div>
                <div className="font-medium">Joined Date:</div>
                <div>{user.joinedDate.toLocaleDateString()}</div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
