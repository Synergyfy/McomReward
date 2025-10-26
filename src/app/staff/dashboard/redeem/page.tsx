"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { allCustomers } from "../customerData";

// ✅ Dynamic QR Scanner
const QrReader = dynamic(() => import("react-qr-reader-es6"), { ssr: false });



const mockRewards = [
  { id: "RWD001", title: "Free Coffee", pointsRequired: 100 },
  { id: "RWD002", title: "Discount Voucher", pointsRequired: 200 },
  { id: "RWD003", title: "Exclusive Gift", pointsRequired: 300 },
];
type CustomerType = {
  id: string;
  name: string;
  email: string;
  points: number;
};
export default function StaffRedeemPage() {
  const form = useForm<{ searchId: string }>({ defaultValues: { searchId: "" } });
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [openScanner, setOpenScanner] = useState(false);
  const [notify, setNotify] = useState<{
    type: "success" | "error" | "warning" | null;
    title?: string;
    message?: string;
  }>({ type: null });

  const showNotify = (type: "success" | "error" | "warning", title: string, message: string) => {
    setNotify({ type, title, message });
    setTimeout(() => setNotify({ type: null }), 3000);
  };

  const handleSearch = (data: { searchId: string }) => {
    const found = allCustomers.find(
      (c) =>
        c.id.toLowerCase() === data.searchId.toLowerCase() ||
        c.email.toLowerCase() === data.searchId.toLowerCase()
    );
    if (found) {
      setCustomer(found);
      showNotify("success", "Customer Found", `Welcome back, ${found.name}!`);
    } else {
      setCustomer(null);
      showNotify("error", "Not Found", "No customer matches that ID or email.");
    }
  };

  const handleScan = (data: string | undefined) => {
    if (data) {
      const found = allCustomers.find((c) => c.id === data);
      if (found) {
        setCustomer(found);
        showNotify("success", "QR Scan Successful", `Loaded customer: ${found.name}`);
      } else {
        showNotify("error", "Invalid QR Code", "This QR code does not match any customer.");
      }
      setOpenScanner(false);
    }
  };

  const handleRedeem = (rewardId: string) => {
    if (!rewardId || !customer) return;
    const reward = mockRewards.find((r) => r.id === rewardId);
    if (customer.points < reward!.pointsRequired) {
      showNotify(
        "warning",
        "Not Enough Points",
        `You need ${reward!.pointsRequired - customer.points} more points for this reward.`
      );
      return;
    }
    setCustomer({
      ...customer,
      points: customer.points - reward!.pointsRequired,
    });
    showNotify("success", "Reward Redeemed 🎉", `${reward!.title} successfully redeemed!`);
  };

  return (
    <div className="min-h-screen bg-white py-10 px-5">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-800">
          Scan a customer QR code or search manually to redeem rewards.
          </h1>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notify.type && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                variant={
                  notify.type === "success"
                    ? "default"
                    : notify.type === "warning"
                    ? "warning"
                    : "destructive"
                }
                className="border-l-4 border-orange-500 shadow-sm"
              >
                {notify.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                )}
                {notify.type === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
                {notify.type === "error" && (
                  <XCircle className="h-5 w-5 text-orange-500" />
                )}
                <AlertTitle>{notify.title}</AlertTitle>
                <AlertDescription>{notify.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Section */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle>Find Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={form.handleSubmit(handleSearch)}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                placeholder="Enter Customer ID or Email"
                {...form.register("searchId")}
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenScanner(true)}
              >
                Scan QR
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <AnimatePresence>
          {customer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-md border-orange-200">
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{customer.name}</p>
                      <p className="text-gray-500 text-sm">{customer.email}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                      {customer.points} pts
                    </Badge>
                  </div>

                  {/* Redeem Buttons */}
                  <div className="space-y-3">
                    <label className="font-medium text-gray-700">
                      Available Rewards
                    </label>

                    <div className="grid gap-3">
                      {mockRewards.map((reward) => {
                        const canRedeem = customer.points >= reward.pointsRequired;
                        return (
                          <div
                            key={reward.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                {reward.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                Requires{" "}
                                <Badge
                                  variant={
                                    canRedeem ? "success" : "destructive"
                                  }
                                >
                                  {reward.pointsRequired} pts
                                </Badge>
                              </p>
                            </div>

                            <Button
                              size="sm"
                              disabled={!canRedeem}
                              onClick={() => handleRedeem(reward.id)}
                              className={
                                canRedeem
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }
                            >
                              Redeem
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanner Modal */}
      <Dialog open={openScanner} onOpenChange={setOpenScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Customer QR Code</DialogTitle>
            <DialogDescription>
              Align the QR code within the frame below.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-lg overflow-hidden border border-orange-200">
            <QrReader
              facingMode="environment"
              onScan={(data: string | null) => {
                if (data) handleScan(data);
              }}
              onError={(err) => console.error(err)}
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setOpenScanner(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
