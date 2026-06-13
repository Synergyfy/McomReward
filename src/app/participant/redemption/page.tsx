"use client";
import { useState } from "react";
import RedemptionContent from "@/components/customer/redemption/RedemptionContent";

export default function CustomerRedemptionPage() {
  const [customerId] = useState("CUST-98542-ABX"); // example customer ID or fetch from context

  return <RedemptionContent participantId={customerId} isAdmin={false} />;
}
