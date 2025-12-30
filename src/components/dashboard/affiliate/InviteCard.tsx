'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2, Link as LinkIcon, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface InviteCardProps {
  referralLink: string;
  qrCodeUrl: string; // Keeping for compatibility
  inviteCode: string;
}

export default function InviteCard({ referralLink, qrCodeUrl, inviteCode }: InviteCardProps) {
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'link') {
        setHasCopiedLink(true);
        setTimeout(() => setHasCopiedLink(false), 2000);
      } else {
        setHasCopiedCode(true);
        setTimeout(() => setHasCopiedCode(false), 2000);
      }
      toast.success(`${type === 'link' ? 'Referral link' : 'Invite code'} copied to clipboard`);
    });
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Share2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Your Invite Link</CardTitle>
        </div>
        <CardDescription className="text-base text-gray-500">
          Invite other businesses to join Mcom and earn rewards for every successful referral.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Sharing Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Referral Link */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              Referral Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-white border rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="border-none focus-visible:ring-0 bg-transparent text-sm h-10 truncate"
              />
              <Button
                onClick={() => copyToClipboard(referralLink, 'link')}
                variant={hasCopiedLink ? "default" : "secondary"}
                className={`flex-shrink-0 rounded-lg font-medium transition-all ${hasCopiedLink ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-gray-200'}`}
              >
                {hasCopiedLink ? (
                  <><Check className="mr-2 h-4 w-4" /> Copied</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy Link</>
                )}
              </Button>
            </div>
          </div>

          {/* Invite Code */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">#</div>
              Invite Code
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-white border rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm">
              <Input
                type="text"
                value={inviteCode}
                readOnly
                className="border-none focus-visible:ring-0 bg-transparent font-mono text-base tracking-wider h-10"
              />
              <Button
                onClick={() => copyToClipboard(inviteCode, 'code')}
                variant={hasCopiedCode ? "default" : "secondary"}
                className={`flex-shrink-0 rounded-lg font-medium transition-all ${hasCopiedCode ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-gray-200'}`}
              >
                {hasCopiedCode ? (
                  <><Check className="mr-2 h-4 w-4" /> Copied</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy Code</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center lg:border-l lg:pl-8 py-2">
          <div className="relative group p-4 bg-white rounded-2xl shadow-md border border-gray-100 mb-4 transition-transform hover:scale-105 duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
            <QRCode
              value={referralLink}
              size={140}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
              level="H"
            />
          </div>
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">
            <QrCode className="h-3 w-3" />
            Scan to invite
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
