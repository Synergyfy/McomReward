"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Edit, Star, Shield, Gift, User, Settings, LogOut } from "lucide-react";
import TierBadge from "@/components/ui/tierBadge";
import { toast } from "sonner";

export default function MyAccountPage() {
  type Tier = "Gold" | "Bronze" | "Silver" | "Platinum";
  type User = {
    name: string;
    email: string;
    phone: string;
    tier: Tier;
    joinDate: string;
    points: number;
    rewardsClaimed: number;
  };

  const [user] = useState<User>({
    name: "Oyelakin Tobiloba",
    email: "tobiloba@loyaltycardx.com",
    phone: "+234 802 123 4567",
    tier: "Gold",
    joinDate: "March 2023",
    points: 2450,
    rewardsClaimed: 8,
  });

  const handleLogout = () => {
    toast.info("Logging out...");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 md:pt-10 space-y-8">
      <h1 className="text-3xl font-bold text-orange-600">My Account</h1>
      <p className="text-gray-600">Manage your account, loyalty tier, and preferences.</p>

      {/* Profile Card */}
      <Card className="shadow-md border border-gray-100 rounded-2xl">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-orange-200 shadow-sm">
              <AvatarImage src="/avatars/user-avatar.png" alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-400 mt-1">Member since {user.joinDate}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <TierBadge tier={user.tier} />
            <p className="text-gray-500 text-sm mt-1">Loyalty Tier</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">Points</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{user.points}</p>
            <p className="text-sm text-gray-500 mt-1">Total Earned Points</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">Rewards</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{user.rewardsClaimed}</p>
            <p className="text-sm text-gray-500 mt-1">Rewards Claimed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">Security</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Keep your account protected with strong passwords and 2FA.
            </p>
            <Button
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={() => (window.location.href = "/account-security")}
            >
              Manage Security
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Personal Info */}
      <Card className="shadow-md border border-gray-100 rounded-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <User className="w-5 h-5 text-orange-500" /> Personal Information
          </h2>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tier Level</p>
              <p className="font-medium">{user.tier}</p>
            </div>
          </div>

          <Button
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => (window.location.href = "/account-security")}
          >
            <Edit className="w-4 h-4 mr-2" /> Edit Account Info
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-md border border-gray-100 rounded-2xl bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Settings className="w-5 h-5 text-orange-500" /> Quick Actions
          </h2>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => (window.location.href = "/wishlist")}
          >
            View Wishlist
          </Button>
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => (window.location.href = "/rewards")}
          >
            My Rewards
          </Button>
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => (window.location.href = "/support-help")}
          >
            Support & Help
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Logout */}
      <div className="flex justify-center">
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-xl"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
