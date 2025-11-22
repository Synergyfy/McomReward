'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import { useSignUp } from '@/services/customer-campaigns/hook';
import { isAxiosError } from 'axios';

interface SignUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
}

export function SignUpDialog({ isOpen, onClose, campaignTitle }: SignUpDialogProps) {
  const { joinCampaign, setMemberName, campaignId } = useCampaignMembership();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutate: signUp, isPending } = useSignUp();

  const handleSignUp = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    signUp({
      name,
      email,
      password,
      confirmPassword,
      campaignId: campaignId || '', // Ensure campaignId is available
    }, {
      onSuccess: (data) => {
        setMemberName(name);
        joinCampaign(campaignId); // Update context
        alert('Sign up successful!');
        onClose();
      },
      onError: (error: Error) => {
        console.error('Sign up failed:', error);
        let errorMessage = 'Failed to sign up. Please try again.';
        if (isAxiosError(error)) {
          errorMessage = (error.response?.data as { message: string })?.message || errorMessage;
        }
        alert(errorMessage);
      }
    });
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder="******" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right">
              Confirm Password
            </Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="col-span-3" placeholder="******" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSignUp} disabled={!name.trim() || !email.trim() || !password || !confirmPassword || isPending}>
            {isPending ? 'Signing Up...' : 'Sign Up & Join'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
