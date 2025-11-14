// app/(customer)/components/ClaimedRewardCard.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, Download } from "lucide-react";
import QRCode from "react-qr-code";

interface ClaimedRewardCardProps {
  reward: {
    id: number;
    title: string;
    code: string;
    type: string;
    claimedDate: string;
    expiryDate: string;
  };
}

export default function ClaimedRewardCard({ reward }: ClaimedRewardCardProps) {
  return (
    <Card className="group relative border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-white">
      <CardHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {reward.title}
            </h3>
            <p className="text-xs text-gray-500">{reward.type}</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 text-xs border-none">
          Claimed
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-sm text-gray-700">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-orange-600">
            {reward.code}
          </p>
          <p className="text-xs text-gray-500">Voucher Code</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-2">
          <div className="bg-white p-3 rounded-xl shadow-inner">
            <QRCode value={reward.code} size={90} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" /> Claimed:{" "}
            {reward.claimedDate}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <Calendar className="w-3 h-3" /> Expires: {reward.expiryDate}
          </span>
        </div>

        {/* Download / Save */}
        <Button
          className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
          onClick={() =>
            alert(`Voucher ${reward.code} downloaded successfully!`)
          }
        >
          <Download className="w-4 h-4 mr-2" /> Save Voucher
        </Button>
      </CardContent>
    </Card>
  );
}
