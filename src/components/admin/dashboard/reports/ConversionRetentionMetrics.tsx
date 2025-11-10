"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { exportToCsv } from "@/lib/utils";

interface ConversionRetention {
  registrationToJoinRate: string;
  joinToRedeemRate: string;
  monthlyRetentionRate: string;
}

export function ConversionRetentionMetrics() {
  const [metrics, setMetrics] = useState<ConversionRetention | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch("/src/mock/reports/conversion-retention.json");
      const data: ConversionRetention = await response.json();
      setMetrics(data);
    };

    fetchMetrics();
  }, []);

  const handleDownloadCsv = () => {
    if (metrics) {
      const dataToExport = [
        { Metric: "Registration to Campaign Join Rate", Value: metrics.registrationToJoinRate },
        { Metric: "Campaign Join to Redemption Rate", Value: metrics.joinToRedeemRate },
        { Metric: "Monthly Retention Rate", Value: metrics.monthlyRetentionRate },
      ];
      exportToCsv(dataToExport, "conversion_retention.csv");
    }
  };

  if (!metrics) {
    return <div>Loading Conversion & Retention Metrics...</div>;
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conversion and Retention Reports</CardTitle>
        <Button onClick={handleDownloadCsv} size="sm" className="h-8 gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Download CSV
          </span>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{metrics.registrationToJoinRate}</p>
          <p className="text-sm text-muted-foreground text-center">Registration to Campaign Join Rate</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{metrics.joinToRedeemRate}</p>
          <p className="text-sm text-muted-foreground text-center">Campaign Join to Redemption Rate</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{metrics.monthlyRetentionRate}</p>
          <p className="text-sm text-muted-foreground text-center">Monthly Retention Rate</p>
        </div>
      </CardContent>
    </Card>
  );
}
