"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, User, Shield, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AccountSecurityPage() {
  const [userInfo, setUserInfo] = useState({
    name: "Oyelakin Tobiloba",
    email: "tobiloba@loyaltycardx.com",
    phone: "+234 802 123 4567",
    birthday: "1999-03-12",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    rememberDevice: false,
  });

  const handleProfileSave = () => {
    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleSecurityUpdate = () => {
    toast.success("Security settings updated!");
  };

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate your account?")) {
      toast.warning("Your account has been deactivated.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 md:pt-10 space-y-8">
      <h1 className="text-3xl font-bold text-orange-600">Account & Security</h1>
      <p className="text-gray-600 mb-8">
        Manage your personal information and account security preferences.
      </p>

      {/* Profile Info */}
      <Card className="shadow-md border border-gray-100 rounded-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <User className="w-5 h-5 text-orange-500" /> Profile Information
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={userInfo.name}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userInfo.email}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={userInfo.phone}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                value={userInfo.birthday}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, birthday: e.target.value })
                }
              />
            </div>
          </div>
          <Button
            onClick={handleProfileSave}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-3"
          >
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-md border border-gray-100 rounded-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Lock className="w-5 h-5 text-orange-500" /> Change Password
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>
          </div>
          <Button
            onClick={handlePasswordChange}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-3"
          >
            <Shield className="w-4 h-4 mr-2" /> Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-md border border-gray-100 rounded-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Shield className="w-5 h-5 text-orange-500" /> Security Settings
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="2fa">Two-Factor Authentication</Label>
            <Switch
              id="2fa"
              checked={security.twoFactor}
              onCheckedChange={(checked) =>
                setSecurity({ ...security, twoFactor: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="rememberDevice">Remember This Device</Label>
            <Switch
              id="rememberDevice"
              checked={security.rememberDevice}
              onCheckedChange={(checked) =>
                setSecurity({ ...security, rememberDevice: checked })
              }
            />
          </div>
          <Button
            onClick={handleSecurityUpdate}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-3"
          >
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-md border border-gray-100 rounded-2xl bg-red-50">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-3">
            Deactivating your account will disable all loyalty tracking and access
            to your campaigns. You can reactivate later by logging back in.
          </p>
          <Button
            onClick={handleDeactivate}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Deactivate Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
