'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ChangePasswordModal from '@/components/dashboard/account/ChangePasswordModal';
import DeactivateAccountModal from '@/components/dashboard/account/DeactivateAccountModal';
import { accountData } from '@/lib/mock-data/account';

export default function AccountPage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={accountData.email} disabled />
          </div>
          <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Logout</h3>
              <p className="text-sm text-gray-600">You will be logged out of your account.</p>
            </div>
            <Button variant="outline">Logout</Button>
          </div>
          <div className="flex justify-between items-center p-4 border border-red-200 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-red-700">Deactivate Account</h3>
              <p className="text-sm text-red-600">Permanently delete your account and all associated data.</p>
            </div>
            <Button variant="destructive" onClick={() => setIsDeactivateModalOpen(true)}>
              Deactivate
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <DeactivateAccountModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={() => {
          // Handle deactivation logic here
          setIsDeactivateModalOpen(false);
        }}
      />
    </div>
  );
}
