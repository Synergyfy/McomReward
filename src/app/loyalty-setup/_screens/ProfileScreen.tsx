"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, User, Building2, MapPin, Phone, Globe, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetBusinessProfile } from "@/services/business/hook";

interface ProfileScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ProfileScreen({ onComplete, onBack }: ProfileScreenProps) {
  const { data: profile } = useGetBusinessProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || "");
  const [editedAddress, setEditedAddress] = useState(profile?.address || "");
  const [editedPhone, setEditedPhone] = useState(profile?.phone || "");
  const [editedWebsite, setEditedWebsite] = useState(profile?.website || "");

  const industryName = profile?.sector?.name || profile?.category?.name || "Business";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200 mb-5">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Confirm Your Profile</h1>
            <p className="text-gray-500 max-w-lg mx-auto">We&apos;ve pulled your information from M-Com Central. Review and continue.</p>
          </div>

          <Card className="p-6 md:p-8 border border-orange-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                <Edit3 className="w-4 h-4 mr-1.5" />{isEditing ? "Done" : "Edit"}
              </Button>
            </div>

            <div className="space-y-5">
              {/* Logo + Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-orange-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Business Name</p>
                  {isEditing ? (
                    <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-lg font-semibold" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 truncate">{profile?.name || "Your Business"}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Industry */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Industry</p>
                  <p className="text-sm font-medium text-gray-900">{industryName}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Address</p>
                  {isEditing ? (
                    <Input value={editedAddress} onChange={(e) => setEditedAddress(e.target.value)} className="text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 truncate">{profile?.address || "Not set"}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Phone</p>
                  {isEditing ? (
                    <Input value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} className="text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 truncate">{profile?.phone || "Not set"}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Website</p>
                  {isEditing ? (
                    <Input value={editedWebsite} onChange={(e) => setEditedWebsite(e.target.value)} className="text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 truncate">{profile?.website || "Not set"}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={onComplete} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]">
              Continue<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
