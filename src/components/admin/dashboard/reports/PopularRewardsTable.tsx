"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { exportToCsv } from "@/lib/export";

interface PopularReward {
  title: string;
  redemptionCount: number;
  [key: string]: string | number | boolean; // Add index signature
}

export function PopularRewardsTable() {
  const [rewards, setRewards] = useState<PopularReward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const response = await fetch("/src/mock/reports/popular-rewards.json");
      const data: PopularReward[] = await response.json();
      setRewards(data);
    };

    fetchRewards();
  }, []);

  const handleDownloadCsv = () => {
    exportToCsv(rewards, "popular_rewards.csv");
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Most Popular Rewards</CardTitle>
        <Button onClick={handleDownloadCsv} size="sm" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Download CSV
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reward Title</TableHead>
              <TableHead>Redemption Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{reward.title}</TableCell>
                <TableCell>{reward.redemptionCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
