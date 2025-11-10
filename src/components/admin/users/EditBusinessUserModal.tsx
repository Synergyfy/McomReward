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
import { BusinessUser } from '@/lib/mock-data/users';

interface EditBusinessUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: BusinessUser) => void;
  user: BusinessUser | null;
}

export function EditBusinessUserModal({
  isOpen,
  onClose,
  onSave,
  user,
}: EditBusinessUserModalProps) {
  const [editedUser, setEditedUser] = useState<BusinessUser | null>(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  if (!editedUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedUser((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSelectChange = (id: keyof BusinessUser, value: string) => {
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
          <DialogTitle>Edit Business User&#58; {editedUser.name}</DialogTitle>
          <DialogDescription>
            Make changes to the business user profile here. Click save when you're done.
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
            <Label htmlFor="tier" className="text-right">
              Tier
            </Label>
            <Select value={editedUser.tier} onValueChange={(value) => handleSelectChange('tier', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Tier" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {['Starter', 'Active', 'Trusted', 'Partner'].map((tier) => (
                  <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sector" className="text-right">
              Sector
            </Label>
            <Input id="sector" value={editedUser.sector} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activityStatus" className="text-right">
              Status
            </Label>
            <Select value={editedUser.activityStatus} onValueChange={(value) => handleSelectChange('activityStatus', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {['Active', 'Suspended', 'Inactive'].map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
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