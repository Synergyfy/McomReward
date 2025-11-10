'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConsumerUser } from '@/lib/mock-data/users';

interface EditConsumerUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: ConsumerUser) => void;
  user: ConsumerUser | null;
}

export function EditConsumerUserModal({
  isOpen,
  onClose,
  onSave,
  user,
}: EditConsumerUserModalProps) {
  const [editedUser, setEditedUser] = useState<ConsumerUser | null>(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  if (!editedUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedUser((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSelectChange = (id: keyof ConsumerUser, value: string) => {
    setEditedUser((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSave = () => {
    if (editedUser) {
      onSave(editedUser);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Consumer User: {editedUser.name}</DialogTitle>
          <DialogDescription>
            Make changes to the consumer user profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={editedUser.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={editedUser.email} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="badgeLevel" className="text-right">
              Badge Level
            </Label>
            <Select value={editedUser.badgeLevel} onValueChange={(value) => handleSelectChange('badgeLevel', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Badge Level" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {['None', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input id="location" value={editedUser.location} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity" className="text-right">
              Activity
            </Label>
            <Select value={editedUser.activity} onValueChange={(value) => handleSelectChange('activity', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Activity" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {['Low', 'Medium', 'High'].map((activity) => (
                  <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
