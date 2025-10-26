"use client";

import { useState } from "react";
import { CheckCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function FakeTurnstile({ onVerify }: { onVerify?: (token: string) => void }) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setVerified(true);
      setLoading(false);
      onVerify?.("mock-turnstile-token");
    }, 1500);
  };

  const reset = () => {
    setVerified(false);
    onVerify?.("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-300 bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-3 mt-3"
    >
      <div className="flex items-center gap-2">
        {verified ? (
          <ShieldCheck className="h-5 w-5 text-green-500" />
        ) : (
          <CheckCircle className="h-5 w-5 text-gray-400" />
        )}
        <span className="text-sm text-gray-700">
          {verified ? "You’re verified as human" : "Verify you’re human"}
        </span>
      </div>

      {!verified ? (
        <Button
          onClick={handleVerify}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md px-3 py-1"
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      ) : (
        <Button
          onClick={reset}
          variant="outline"
          className="text-sm text-gray-600 flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      )}
    </motion.div>
  );
}
