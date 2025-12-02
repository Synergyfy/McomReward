"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { exportToCsv } from "@/lib/export";

interface TierDistribution {
  [key: string]: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function BusinessTierPieChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [rawDistribution, setRawDistribution] = useState<TierDistribution | null>(null);

  useEffect(() => {
    const fetchTierDistribution = async () => {
      const response = await fetch("/src/mock/reports/business-tier-distribution.json");
      const distribution: TierDistribution = await response.json();
      setRawDistribution(distribution);

      const formattedData = Object.keys(distribution).map((tier) => ({
        name: tier,
        value: distribution[tier],
      }));
      setData(formattedData);
    };

    fetchTierDistribution();
  }, []);

  const handleDownloadCsv = () => {
    if (rawDistribution) {
      const dataToExport = Object.keys(rawDistribution).map((tier) => ({
        Tier: tier,
        Count: rawDistribution[tier],
      }));
      exportToCsv(dataToExport, "business_tier_distribution.csv");
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Business Tier Distribution</CardTitle>
        <Button onClick={handleDownloadCsv} size="sm" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Download CSV
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
