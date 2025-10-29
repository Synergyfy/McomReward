"use client";
import { useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { Bot, QrCode, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerRedemptionPage() {
  const [method, setMethod] = useState<string | null>(null);
  const [tempNumber, setTempNumber] = useState<string | null>(null);
  const [customerId] = useState("CUST-98542-ABX"); // example customer ID

  const generateTempNumber = () => {
    const num = Math.floor(100000 + Math.random() * 900000).toString();
    setTempNumber(num);
  };

  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Diagonal Background */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-orange-600 transform -skew-y-6 origin-top-left"></div>

          {/* Foreground Content */}
    
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 text-white overflow-hidden">
              { !!method ? (
                      <motion.h1
          initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
            
          className="text-4xl font-bold mb-8 text-center"
        >
          Redeem Your Reward
        </motion.h1>
                
    ) :(
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Choose How You’d Like to Redeem Your Reward
        </motion.h1>
      )}
        {!method ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {/* QR Code Option */}
            <Card
              onClick={() => setMethod("qr")}
              className="bg-white/90 text-gray-800 rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <QrCode className="w-12 h-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Redeem via QR Code</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Scan your unique customer QR code to redeem instantly.
                </p>
              </CardContent>
            </Card>

            {/* Customer Number Option */}
            <Card
              onClick={() => setMethod("number")}
              className="bg-white/90 text-gray-800 rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Hash className="w-12 h-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Redeem via Customer Number</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Generate a temporary customer number for redemption.
                </p>
              </CardContent>
            </Card>

            {/* Bot / Avatar Option */}
            <Card
              onClick={() => setMethod("bot")}
              className="bg-white/90 text-gray-800 rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Bot className="w-12 h-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Redeem via Bot</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Chat with our loyalty bot to claim your rewards easily.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full mt-4 text-center"
          >
            {method === "qr" && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-orange-600">Your QR Code</h2>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <QRCode value={customerId} size={180} />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Show this QR code at the counter to redeem your rewards.
                </p>
              </>
            )}

            {method === "number" && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-orange-600">
                  Temporary Customer Number
                </h2>
                {tempNumber ? (
                  <div className="text-4xl font-bold text-orange-500 bg-orange-100 py-3 px-6 rounded-xl inline-block">
                    {tempNumber}
                  </div>
                ) : (
                  <Button
                    onClick={generateTempNumber}
                    className="bg-orange-500 hover:bg-orange-600 mt-4"
                  >
                    Generate Number
                  </Button>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  Use this number to redeem rewards within 5 minutes.
                </p>
              </>
            )}

            {method === "bot" && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-orange-600">Chat with our Bot</h2>
                <div className="bg-gray-100 rounded-xl p-4 h-60 overflow-y-auto text-left">
                  <p className="text-gray-700 mb-2">🤖 Bot: Hi there! Ready to redeem a reward?</p>
                  <p className="text-gray-700 mb-2">
                    💬 You: Yes, I’d like to redeem my coffee reward!
                  </p>
                  <p className="text-gray-700 mb-2">
                    🤖 Bot: Great! I’ve confirmed your points. Your reward is ready for pickup 🎁
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  (A real chat interface can be integrated later.)
                </p>
              </>
            )}

            <Button
              onClick={() => {
                setMethod(null);
                setTempNumber(null);
              }}
              variant="outline"
              className="mt-6"
            >
              ← Back
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
