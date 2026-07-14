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

interface BusinessPerformance {
  name: string;
  redemptions: number;
  pointsIssued: number;
  [key: string]: string | number | boolean; // Add index signature
}

export function TopBusinessesTable() {
  const [businesses, setBusinesses] = useState<BusinessPerformance[]>([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const response = await fetch("/src/mock/reports/top-businesses.json");
      const data: BusinessPerformance[] = await response.json();
      setBusinesses(data);
    };

    fetchBusinesses();
  }, []);

  const handleDownloadCsv = () => {
    exportToCsv(businesses, "top_businesses.csv");
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Performing Businesses</CardTitle>
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
              <TableHead>Business Name</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Points Issued</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{business.name}</TableCell>
                <TableCell>{business.redemptions}</TableCell>
                <TableCell>{business.pointsIssued.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
