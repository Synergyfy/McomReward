'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsContent({ isAdmin = false }) {
  const [isWishlistMarketingEnabled, setIsWishlistMarketingEnabled] = useState(true);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Settings</h1>
        <p className="mt-4 text-lg text-gray-600">
             {isAdmin ? "View user preferences." : "Manage your account preferences."}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Wishlist Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="wishlist-marketing" className="flex flex-col space-y-1">
              <span>Wishlist Marketing</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Allow businesses to send you offers based on your wishlist items.
              </span>
            </Label>
            <Switch
              id="wishlist-marketing"
              checked={isWishlistMarketingEnabled}
              onCheckedChange={setIsWishlistMarketingEnabled}
              disabled={isAdmin} // Disable for admin
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
