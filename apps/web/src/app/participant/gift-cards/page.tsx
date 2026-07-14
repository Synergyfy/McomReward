"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Gift,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const initialMyGiftCards = [
  {
    id: "claim-1",
    name: "Global Retailer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsNgsje8gMWjiOMSdItVLc9AHavXQNmVYGmB7suPtOn6EQCiPpSp77Yfc4hRoLM6VuwHL-KYzPReseHlWXrckPxWqSJvC2UH4onnVnv6Fy7K0gnh5skaMi_wbRvDlf0UJleixVi6_WqRBbwvgH8t38dd_XVp-jJkGMKXb1DlFYIcIBQ0mR1to0mUCO-VaMHO1H9JwTrCQQVJ6ns2K9UslRzUN16Noi7JWk2CaRoftRFJJyMhLJeE7z_NXQk4G8a9fm8bInwzV71wID",
    denom: 50,
    code: "GRET-9923-8812-4012",
    status: "ACTIVE",
    expiry: "2027-12-31"
  },
  {
    id: "claim-2",
    name: "Brew & Co.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrC6gNoz4Z0B-gQ2iHyPQjltS46yeC_vuuaFxADMT8Wpev09Gac0D3xrUkla4mRfG_XI1K_nCA5YFEGg1Q2d1gUM-5rbS132Rhw6FdMuPFpzB5wJ2zk8ZJHefCVKUI2kNGXlQv7kT97vAKX8n4Y_QzKo_ztugJNZ4B59VQwbtLcsgLo8lNnGiVqQx2DWqIeHn3VY_sMAPi5GItbJD9fFXEUsIPBesLJhFBnWwaKHG7rPyjW5shpJpPVmU5z-mNMQuG7Wr-RmukQTGU",
    denom: 25,
    code: "BREW-1102-4952-1924",
    status: "ACTIVE",
    expiry: "2027-06-15"
  },
  {
    id: "claim-3",
    name: "Cinema Plus",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWGu5EXBb6MDC-eCMMSvagtYxwpiNpGVJ5D_MLQRyD1-mmfBPSw-li67jFWxT8BDf3qswGhodvKLmLqUEwOZlSDaLSCmoH6_bPp8Hw65Hp08M7xNoApdEUYaaz7F_z27IrJ5v2CJzGcKUhEcnnbzH-QsAsNFSUo12QMhLp6NC5BTBeDJYEywTwK-ZE3QsVtGwvCWrnZNuZO0k1bz-EMZCGvRWhT79ZoxrlgDELHTeFAR1Ixn2boJH38KS_kUCgDVUgJFwvyx_e662U",
    denom: 20,
    code: "CINE-8824-1124-7712",
    status: "REDEEMED",
    expiry: "Expired"
  }
];

export default function MyGiftCardsManager() {
  const router = useRouter();
  const [giftCards, setGiftCards] = useState(initialMyGiftCards);
  const [activeTab, setActiveTab] = useState("ACTIVE");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Card code copied to clipboard!", {
      icon: <Sparkles className="w-4 h-4 text-[#f54900]" />,
      className: "rounded-2xl border-gray-200 bg-white text-gray-800",
    });
  };

  const filteredCards = giftCards.filter(card => card.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 py-4 sm:py-8 px-2 sm:px-4 bg-[#f9fafb] text-gray-800 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border-b border-gray-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/participant/settings')}
            className="text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all duration-200 shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              My Gift Cards <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#f54900] shrink-0" />
            </h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Manage and redeem your claimed digital gift cards.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-[#f54900] text-white font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
            {giftCards.filter(c => c.status === "ACTIVE").length} ACTIVE CARDS
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 pb-2 gap-6">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-2 text-lg font-black tracking-tight transition-all relative ${
            activeTab === "ACTIVE" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          Active Cards
          {activeTab === "ACTIVE" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f54900] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("REDEEMED")}
          className={`pb-2 text-lg font-black tracking-tight transition-all relative ${
            activeTab === "REDEEMED" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          Redeemed / History
          {activeTab === "REDEEMED" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f54900] rounded-full" />
          )}
        </button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCards.map((card) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={card.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              {/* Glossy sweep */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-pulse" />
              </div>

              <div>
                <div className="relative aspect-[1.58/1] mb-2 sm:mb-4 overflow-hidden rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-150 flex items-center justify-center">
                  <img className="w-full h-full object-cover" src={card.image} alt={card.name} />
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="bg-[#f54900] text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow">
                      £{card.denom}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-bold text-xs sm:text-lg text-gray-900 line-clamp-1">{card.name} Gift Card</h3>
                  
                  {/* Access code box */}
                  <div className="p-2 sm:p-3.5 bg-gray-50 border border-dashed border-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] uppercase font-black text-gray-400 tracking-wider sm:tracking-[0.2em] mb-0.5 truncate">Claim Code</p>
                      <code className="text-[10px] sm:text-sm font-mono font-bold text-gray-800 tracking-tight sm:tracking-wider block truncate">
                        {card.code}
                      </code>
                    </div>
                    {card.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-gray-250 text-gray-500 hover:text-[#f54900] transition-all shrink-0"
                        onClick={() => copyToClipboard(card.code)}
                      >
                        <Copy size={10} className="sm:w-3 sm:h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-xs font-bold mt-4 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-200 text-gray-400 gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <Clock size={10} className="text-gray-400 shrink-0" />
                  <span className="truncate">{card.status === "ACTIVE" ? `${card.expiry}` : "Redeemed"}</span>
                </div>
                {card.status === "ACTIVE" ? (
                  <Badge className="bg-green-50 text-green-600 border border-green-200 py-0.5 px-1.5 sm:px-2 text-[8px] sm:text-[10px] shrink-0">Ready</Badge>
                ) : (
                  <Badge className="bg-gray-50 text-gray-400 border border-gray-150 py-0.5 px-1.5 sm:px-2 text-[8px] sm:text-[10px] shrink-0">Inactive</Badge>
                )}
              </div>
            </motion.div>
          ))}
          {filteredCards.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-full inline-block mb-4 border border-gray-100">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold">No cards found in this category.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
