'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignMembership } from '@/context/CampaignMembershipContext';

interface SignUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
}

export function SignUpDialog({ isOpen, onClose, campaignTitle }: SignUpDialogProps) {
  const { joinCampaign, setMemberName } = useCampaignMembership();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignUp = () => {
    if (name.trim() && email.trim()) {
      setMemberName(name);
      joinCampaign();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join {campaignTitle}</DialogTitle>
          <DialogDescription>
            Sign up to join this campaign and start earning rewards. Complete the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="john.doe@example.com" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSignUp} disabled={!name.trim() || !email.trim()}>
            Sign Up & Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
