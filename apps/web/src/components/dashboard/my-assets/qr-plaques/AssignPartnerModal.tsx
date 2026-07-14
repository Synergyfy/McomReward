'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RelationshipTag, LocationTag } from '@/services/network-contacts/types';

interface AssignPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (partnerDetails: {
    name: string;
    email: string;
    businessName: string;
    relationshipTag: RelationshipTag;
    locationTag: LocationTag;
  }) => void;
  plaqueId: string | null;
}

export default function AssignPartnerModal({ isOpen, onClose, onAssign, plaqueId }: AssignPartnerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [relationshipTag, setRelationshipTag] = useState<RelationshipTag | ''>('');
  const [locationTag, setLocationTag] = useState<LocationTag | ''>('');

  const handleAssign = () => {
    // Basic validation
    if (!name || !email || !businessName || !relationshipTag || !locationTag) {
      alert('Please fill out all fields.');
      return;
    }
    onAssign({
      name,
      email,
      businessName,
      relationshipTag: relationshipTag as RelationshipTag,
      locationTag: locationTag as LocationTag
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Plaque {plaqueId}</DialogTitle>
          <DialogDescription>
            Enter the partner's details below. An invitation will be sent to them to accept the assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="businessName" className="text-right">
              Business Name
            </Label>
            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Contact Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationshipTag" className="text-right">
              Relationship
            </Label>
            <Select value={relationshipTag} onValueChange={(val) => setRelationshipTag(val as RelationshipTag)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="affiliate">Referral</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="locationTag" className="text-right">
              Location
            </Label>
            <Select value={locationTag} onValueChange={(val) => setLocationTag(val as LocationTag)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                <SelectItem value="nearby">Nearby</SelectItem>
                <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                <SelectItem value="national">National</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign}>Send Invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
