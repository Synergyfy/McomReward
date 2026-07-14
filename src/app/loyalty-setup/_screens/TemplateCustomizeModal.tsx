"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Gift, Stamp, Filter, Pencil, CheckCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectorTemplate, TemplateReward } from "@/services/loyalty-setup/types";

type RewardFilterType = "all" | "point" | "stamp" | "hybrid";

function getRewardCategory(r: TemplateReward): "point" | "stamp" | "hybrid" {
  if (r.pointsRequired > 0 && (r.stampsRequired || 0) > 0) return "hybrid";
  if ((r.stampsRequired || 0) > 0) return "stamp";
  return "point";
}

function rewardTypeBadge(category: "point" | "stamp" | "hybrid") {
  if (category === "hybrid") return <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200">Hybrid</Badge>;
  if (category === "stamp") return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200">Stamp</Badge>;
  return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200">Point</Badge>;
}

const FILTER_TABS: { key: RewardFilterType; label: string; icon: React.ElementType | null; activeClass: string }[] = [
  { key: "all", label: "All Rewards", icon: null, activeClass: "bg-white text-gray-900 shadow-sm" },
  { key: "point", label: "Point Rewards", icon: Gift, activeClass: "bg-white text-blue-600 shadow-sm" },
  { key: "stamp", label: "Stamp Rewards", icon: Stamp, activeClass: "bg-white text-orange-600 shadow-sm" },
  { key: "hybrid", label: "Hybrid Rewards", icon: Filter, activeClass: "bg-white text-purple-600 shadow-sm" },
];

interface TemplateCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: SectorTemplate;
  onSave: (template: SectorTemplate) => void;
  onRewardsChanged?: (template: SectorTemplate) => void;
  onEditReward?: (reward: TemplateReward) => void;
}

export default function TemplateCustomizeModal({
  isOpen,
  onClose,
  template,
  onSave,
  onRewardsChanged,
  onEditReward,
}: TemplateCustomizeModalProps) {
  const [activeFilter, setActiveFilter] = useState<RewardFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(template.rewards.map((r) => r.id)));
  const [localRewards, setLocalRewards] = useState<TemplateReward[]>(template.rewards);

  const filteredRewards = useMemo(() => {
    let filtered = localRewards;
    if (activeFilter === "point") filtered = localRewards.filter((r) => getRewardCategory(r) === "point");
    else if (activeFilter === "stamp") filtered = localRewards.filter((r) => getRewardCategory(r) === "stamp");
    else if (activeFilter === "hybrid") filtered = localRewards.filter((r) => getRewardCategory(r) === "hybrid");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [localRewards, activeFilter, searchQuery]);

  const toggleReward = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEditReward = (reward: TemplateReward) => {
    onEditReward?.(reward);
  };

  const handleSave = () => {
    const selectedRewards = localRewards.filter((r) => selectedIds.has(r.id));
    const updatedTemplate = { ...template, rewards: selectedRewards };
    onSave(updatedTemplate);
  };

  const hasSelected = selectedIds.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col" onInteractOutside={(e: Event) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-500" />
            Customise: {template.name}
          </DialogTitle>
          <p className="text-sm text-gray-500">Select the rewards you want and customise them as needed.</p>
        </DialogHeader>

        <div className="flex flex-col gap-3 mb-4">
          <div className="w-full overflow-x-auto">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-max min-w-full md:w-auto">
              {FILTER_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={cn(
                      "px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap",
                      activeFilter === tab.key ? tab.activeClass : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{selectedIds.size} of {localRewards.length} rewards selected</span>
        </div>

        <div className="flex-grow overflow-y-auto p-1 min-h-[300px]">
          {filteredRewards.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rewards match your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRewards.map((r) => {
                const category = getRewardCategory(r);
                const isSelected = selectedIds.has(r.id);
                return (
                  <Card
                    key={r.id}
                    className={`flex flex-col hover:shadow-md transition-shadow cursor-pointer ${
                      isSelected ? "ring-2 ring-orange-400 border-orange-300" : ""
                    }`}
                    onClick={() => toggleReward(r.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="relative w-full h-32 rounded-t-lg overflow-hidden bg-gray-100 mb-3 flex items-center justify-center">
                        {r.image?.startsWith("http") || r.image?.startsWith("/") ? (
                          <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl">{r.image || "🎁"}</span>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          {rewardTypeBadge(category)}
                        </div>
                        <div className="absolute top-2 left-2">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"
                          }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight flex items-center gap-2">
                        <span>{r.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow pb-2">
                      <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden line-clamp-2">{r.description}</p>
                      <div className="space-y-1.5 bg-gray-50 p-2 rounded-md">
                        {r.pointsRequired > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-600">Points Required:</span>
                            <span className="font-semibold text-blue-600">{r.pointsRequired}</span>
                          </div>
                        )}
                        {(r.stampsRequired || 0) > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-600">Stamps Required:</span>
                            <span className="font-semibold text-orange-600">{r.stampsRequired}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-gray-200">
                          <span className="font-medium text-gray-500">Type:</span>
                          <span className="text-gray-700 font-medium">{r.rewardType}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={(e) => { e.stopPropagation(); handleEditReward(r); }}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="px-8 py-6 text-lg rounded-xl"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={!hasSelected}
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-200 min-w-[280px]"
          >
            <Save className="mr-2 w-5 h-5" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
