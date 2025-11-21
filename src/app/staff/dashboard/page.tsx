"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Flame, Info } from "lucide-react";
import { motion } from "framer-motion";

// Dummy data for ongoing campaigns
const ongoingCampaigns = [
  {
    id: 1,
    name: "Summer Sale Bonanza",
    description: "Get 20% off on all summer collections. Share with your friends to earn points!",
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    participants: 1250,
    status: "Active",
    type: "Discount",
  },
  {
    id: 2,
    name: "Back to School Drive",
    description: "Earn double points on all stationery items.",
    startDate: "2023-08-15",
    endDate: "2023-09-15",
    participants: 850,
    status: "Active",
    type: "Points Multiplier",
  },
  {
    id: 3,
    name: "Coffee Loyalty Program",
    description: "Buy 9 coffees, get the 10th one free!",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    participants: 3400,
    status: "Active",
    type: "Loyalty",
  },
  {
    id: 4,
    name: "Refer a Friend",
    description: "Refer a friend and both get $10 credit.",
    startDate: "2023-05-01",
    endDate: "Indefinite",
    participants: 560,
    status: "Active",
    type: "Referral",
  },
];

export default function StaffDashboard() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ongoing Campaigns</h1>
        <p className="text-gray-500">View details of all active campaigns for your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ongoingCampaigns.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold text-gray-800">
                  {campaign.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  {campaign.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {campaign.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{campaign.type}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Start Date
                    </span>
                    <span className="text-sm font-medium text-gray-700">{campaign.startDate}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> End Date
                    </span>
                    <span className="text-sm font-medium text-gray-700">{campaign.endDate}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{campaign.participants.toLocaleString()}</span>
                    <span>participants</span>
                  </div>
                  {/* Placeholder for action button if needed later */}
                  <div className="text-gray-400 cursor-pointer hover:text-orange-500">
                     <Info className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
