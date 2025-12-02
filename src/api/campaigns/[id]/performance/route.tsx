import { NextResponse } from "next/server";
import mockData from "@/mock/campaignPerformance.json";

export async function GET() {
  return NextResponse.json(mockData);
}
