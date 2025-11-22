"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParticipantCampaigns } from "@/services/campaigns/hook";
import { ParticipantCampaignSearchResponse } from "@/services/campaigns/types";
import { Loader2, Search, AlertCircle, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<ParticipantCampaignSearchResponse[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { mutateAsync: searchCampaigns, isPending } = useSearchParticipantCampaigns();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const data = await searchCampaigns(searchQuery);
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setHasSearched(true);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Participant</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter participant email or unique code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isPending || !searchQuery.trim()} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </form>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Search Results {results && `(${results.length})`}
          </h3>

          {results && results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((campaign) => (
                <Link href={`/staff/dashboard/campaigns/${campaign.id}`} key={campaign.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500 h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1">
                          {campaign.name}
                        </CardTitle>
                        <Badge variant={campaign.disabled ? "destructive" : "secondary"} className="ml-2">
                          {campaign.disabled ? "Inactive" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{campaign.business.name}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rewards Available</p>
                          <div className="flex flex-wrap gap-2">
                            {campaign.rewards.slice(0, 3).map((reward) => (
                              <Badge key={reward.id} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {reward.title} ({reward.points_required} pts)
                              </Badge>
                            ))}
                            {campaign.rewards.length > 3 && (
                              <Badge variant="outline" className="text-gray-500">
                                +{campaign.rewards.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto font-medium">
                            View Details <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
              <h4 className="text-lg font-medium text-gray-900">No campaigns found</h4>
              <p className="text-gray-500 max-w-md">
                No active campaigns found for this participant within your business. Please check the email or unique code.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
