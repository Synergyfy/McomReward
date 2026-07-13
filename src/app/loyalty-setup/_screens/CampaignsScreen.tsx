"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Pencil, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TemplateCampaignEditor from "./TemplateCampaignEditor";
import type { SectorTemplate, TemplateCampaign, TemplateReward } from "@/services/loyalty-setup/types";

interface CampaignCardProps {
  campaign: TemplateCampaign;
  onEdit: (campaign: TemplateCampaign) => void;
  index: number;
}

function CampaignCard({ campaign, onEdit, index }: CampaignCardProps) {
  const gradients = [
    "from-orange-400 to-pink-500",
    "from-purple-400 to-indigo-500",
    "from-green-400 to-blue-500",
    "from-rose-400 to-amber-500",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden group">
      <CardContent className="p-0">
        <div className={`relative h-32 w-full bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(campaign); }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-orange-600 hover:bg-white transition-colors shadow-md"
              title="Edit campaign"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <Award className="w-8 h-8 text-white/80" />
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-bold text-lg text-gray-800 truncate group-hover:text-purple-600 transition-colors duration-300">
            {campaign.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">
            {campaign.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface CampaignsScreenProps {
  template: SectorTemplate;
  templateRewards: TemplateReward[];
  onComplete: (campaigns: TemplateCampaign[]) => void;
  onBack: () => void;
  onCampaignsChange?: (campaigns: TemplateCampaign[]) => void;
}

export default function CampaignsScreen({ template, templateRewards, onComplete, onBack, onCampaignsChange }: CampaignsScreenProps) {
  const [localCampaigns, setLocalCampaigns] = useState<TemplateCampaign[]>(template.campaigns);
  const [editingCampaign, setEditingCampaign] = useState<TemplateCampaign | null>(null);

  const handleEditCampaign = useCallback((campaign: TemplateCampaign) => {
    setEditingCampaign(campaign);
  }, []);

  const handleCampaignSave = useCallback((updated: TemplateCampaign) => {
    setLocalCampaigns((prev) => {
      const updatedList = prev.map((c) => (c.key === updated.key ? { ...c, ...updated, id: c.id, key: c.key } : c));
      onCampaignsChange?.(updatedList);
      return updatedList;
    });
    setEditingCampaign(null);
  }, [onCampaignsChange]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-200 mb-5">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Campaign Templates</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Admin has prepared campaigns for your template. You can <span className="font-semibold text-gray-700">edit</span> each one or continue with the defaults.
            </p>
          </div>

          {/* Campaign Cards */}
          {localCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {localCampaigns.map((c, i) => (
                <CampaignCard key={c.id} campaign={c} onEdit={handleEditCampaign} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-10">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No campaigns in this template.</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={() => onComplete(localCampaigns)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all min-w-[280px]"
            >
              Continue<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Campaign Edit Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={(open) => { if (!open) setEditingCampaign(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e: Event) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit Campaign: {editingCampaign?.name}</DialogTitle>
          </DialogHeader>
          {editingCampaign && (
            <TemplateCampaignEditor
              campaign={editingCampaign}
              templateRewards={templateRewards}
              onSave={handleCampaignSave}
              onClose={() => setEditingCampaign(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
