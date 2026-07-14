"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { exportToCsv } from "@/lib/export";

interface ConsumerData {
  month: string;
  newRegistrations: number;
  activityCount: number;
  [key: string]: string | number | boolean; // Add index signature
}

export function ConsumerGrowthChart() {
  const [data, setData] = useState<ConsumerData[]>([]);

  useEffect(() => {
    const fetchConsumerData = async () => {
      const response = await fetch("/src/mock/reports/consumer-growth.json");
      const consumerData: ConsumerData[] = await response.json();
      setData(consumerData);
    };

    fetchConsumerData();
  }, []);

  const handleDownloadCsv = () => {
    exportToCsv(data, "consumer_growth.csv");
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Consumer Growth and Activity</CardTitle>
        <Button onClick={handleDownloadCsv} size="sm" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Download CSV
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newRegistrations" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="activityCount" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
