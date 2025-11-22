"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Flame, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useGetStaffOngoingCampaigns } from "@/services/campaigns/hook";
import Loader from "@/components/ui/loader";
import Link from "next/link";

export default function StaffDashboard() {
  const { data, isLoading, isError } = useGetStaffOngoingCampaigns();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-red-500 font-medium">Failed to load campaigns.</p>
        <p className="text-gray-500 text-sm">Please check your connection and try again.</p>
      </div>
    );
  }

  const campaigns = data?.data || [];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ongoing Campaigns</h1>
        <p className="text-gray-500">View details of all active campaigns for your business.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Flame className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">No ongoing campaigns</h3>
            <p className="text-gray-500">There are currently no active campaigns available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/staff/dashboard/campaigns/${campaign.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500 flex flex-col cursor-pointer">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold text-gray-800 line-clamp-1" title={campaign.name}>
                      {campaign.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 whitespace-nowrap ml-2">
                      {campaign.disabled ? "Inactive" : "Active"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]" title={campaign.campaignMessage}>
                      {campaign.campaignMessage}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium capitalize">{campaign.campaignType.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Start Date
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> End Date
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                           {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{campaign.participantCount.toLocaleString()}</span>
                        <span>participants</span>
                      </div>
                      {/* Placeholder for action button if needed later */}
                      <div className="text-gray-400 cursor-pointer hover:text-orange-500">
                         <Info className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
