'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { participantLoginSchema, participantSignUpSchema } from '@/lib/validators/participantSchemas';
import { ParticipantLoginDto, ParticipantSignUpDto } from '@/services/participant/types';
import { toast } from 'sonner';

interface SignUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignId: string; // Added campaignId prop
}

export function SignUpDialog({ isOpen, onClose, campaignTitle, campaignId }: SignUpDialogProps) {
  const { login, signup, joinCampaign } = useCampaignMembership();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin },
    reset: resetLogin
  } = useForm<ParticipantLoginDto>({
    resolver: zodResolver(participantLoginSchema)
  });

  // Signup Form
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: errorsSignup, isSubmitting: isSubmittingSignup },
    reset: resetSignup
  } = useForm<ParticipantSignUpDto>({
    resolver: zodResolver(participantSignUpSchema)
  });

  const onLogin = async (data: ParticipantLoginDto) => {
    try {
      await login(data);
      toast.success("Logged in successfully!");
      await handleJoin();
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const onSignup = async (data: ParticipantSignUpDto) => {
    try {
      await signup(data);
      toast.success("Account created successfully!");
      await handleJoin();
    } catch (error) {
      console.error(error);
      toast.error("Sign up failed. Please try again.");
    }
  };

  const handleJoin = async () => {
    try {
      await joinCampaign(campaignId);
      onClose();
      resetLogin();
      resetSignup();
    } catch (error) {
      // Error already handled in context
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'signup' ? `Join ${campaignTitle}` : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'signup'
              ? "Sign up to join this campaign and start earning rewards."
              : "Log in to your account to join this campaign."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center space-x-4 border-b pb-4 mb-4">
          <button
            className={`pb-2 text-sm font-medium ${activeTab === 'signup' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
          <button
            className={`pb-2 text-sm font-medium ${activeTab === 'login' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('login')}
          >
            Log In
          </button>
        </div>

        {activeTab === 'signup' ? (
          <form onSubmit={handleSubmitSignup(onSignup)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Name</Label>
              <Input id="signup-name" {...registerSignup('name')} placeholder="John Doe" />
              {errorsSignup.name && <p className="text-xs text-red-500">{errorsSignup.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" {...registerSignup('email')} placeholder="john@example.com" />
              {errorsSignup.email && <p className="text-xs text-red-500">{errorsSignup.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" {...registerSignup('password')} placeholder="••••••" />
              {errorsSignup.password && <p className="text-xs text-red-500">{errorsSignup.password.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmittingSignup}>
                {isSubmittingSignup ? "Creating Account..." : "Sign Up & Join"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" {...registerLogin('email')} placeholder="john@example.com" />
              {errorsLogin.email && <p className="text-xs text-red-500">{errorsLogin.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input id="login-password" type="password" {...registerLogin('password')} placeholder="••••••" />
              {errorsLogin.password && <p className="text-xs text-red-500">{errorsLogin.password.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmittingLogin}>
                {isSubmittingLogin ? "Logging In..." : "Log In & Join"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
