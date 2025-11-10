"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { exportToCsv } from "@/lib/utils";

interface PointsDistribution {
  standardPoints: number;
  matchingPoints: number;
}

export function PointsDistributionChart() {
  const [data, setData] = useState<{ name: string; points: number; fill: string }[]>([]);
  const [rawDistribution, setRawDistribution] = useState<PointsDistribution | null>(null);

  useEffect(() => {
    const fetchPointsDistribution = async () => {
      const response = await fetch("/src/mock/reports/points-distribution.json");
      const distribution: PointsDistribution = await response.json();
      setRawDistribution(distribution);

      setData([
        { name: "Standard Points", points: distribution.standardPoints, fill: "#8884d8" },
        { name: "Matching Points", points: distribution.matchingPoints, fill: "#82ca9d" },
      ]);
    };

    fetchPointsDistribution();
  }, []);

  const handleDownloadCsv = () => {
    if (rawDistribution) {
      const dataToExport = [
        { Type: "Standard Points", Value: rawDistribution.standardPoints },
        { Type: "Matching Points", Value: rawDistribution.matchingPoints },
      ];
      exportToCsv(dataToExport, "points_distribution.csv");
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Points Distributed (Standard vs Matching)</CardTitle>
        <Button onClick={handleDownloadCsv} size="sm" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Download CSV
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="points" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
