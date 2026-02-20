'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';
import {
  Bell,
  ShieldCheck,
  User,
  Mail,
  Smartphone,
  Zap,
  Globe,
  Lock,
  Heart,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SettingsContent({ isAdmin = false }) {
  const [isWishlistMarketingEnabled, setIsWishlistMarketingEnabled] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          <Settings className="w-3 h-3" /> System Preferences
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Account Settings</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          {isAdmin ? "Global administrative overrides for user preferences and privacy controls." : "Customize your MCOM experience, manage reward notifications, and control data sharing."}
        </p>
      </motion.div>

      <div className="grid gap-8">
        {/* Wishlist Marketing Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden outline outline-1 outline-slate-100">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                  <Heart className="w-5 h-5 fill-pink-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-800">Reward Personalization</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-tight text-slate-400">Marketing & Offer Engine</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-between gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:shadow-md">
                <div className="flex-1">
                  <Label htmlFor="wishlist-marketing" className="flex flex-col space-y-2">
                    <span className="text-base font-black text-slate-900">Wishlist Offer Injections</span>
                    <span className="font-medium text-sm text-slate-500 leading-relaxed">
                      Allow business partners to send you exclusive credit offers based on items in your wishlist. We never share your email directly.
                    </span>
                  </Label>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Switch
                    id="wishlist-marketing"
                    checked={isWishlistMarketingEnabled}
                    onCheckedChange={setIsWishlistMarketingEnabled}
                    disabled={isAdmin}
                    className="data-[state=checked]:bg-pink-600"
                  />
                  <Badge variant="outline" className="text-[9px] font-black uppercase truncate">
                    {isWishlistMarketingEnabled ? 'Optimized' : 'Standard'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Global Notifications */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-xl bg-white border border-slate-100 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Email Reward Alerts</span>
                  </div>
                  <Switch checked={notifEmail} onCheckedChange={setNotifEmail} disabled={isAdmin} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                  </div>
                  <Switch checked={notifPush} onCheckedChange={setNotifPush} disabled={isAdmin} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-xl bg-slate-900 text-white h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Trust & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
                  MCOM uses end-to-end encryption for all internal credit transactions. Your data is protected by industry-standard protocols.
                </p>
                <Button variant="outline" className="w-full h-10 border-slate-700 bg-transparent text-white hover:bg-white hover:text-slate-900 font-bold transition-all text-xs">
                  View Security Audit
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Account Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-none shadow-lg bg-white border border-slate-100 overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-6 text-center space-y-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-slate-900">Regional Sync</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Mall Active: UK</p>
              </div>
              <div className="p-6 text-center space-y-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-slate-900">Express Mode</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Fast Checkout Enabled</p>
              </div>
              <div className="p-6 text-center space-y-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="p-3 bg-green-50 text-green-600 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-slate-900">2FA Status</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Protected</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">MCOM Loyalty Infrastructure v1.2.4</p>
      </div>
    </div>
  );
}
