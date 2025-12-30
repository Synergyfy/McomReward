'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';

interface InviteCardProps {
  referralLink: string;
  qrCodeUrl: string; // Keeping for compatibility, though we'll use dynamic QR
  inviteCode: string;
}

export default function InviteCard({ referralLink, qrCodeUrl, inviteCode }: InviteCardProps) {
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const copyReferralLinkToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 2000);
    });
  };

  const copyInviteCodeToClipboard = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Invite Link</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-grow w-full">
          <p className="text-sm text-gray-600 mb-2">
            Share this link with other businesses to earn rewards.
          </p>
          <div className="flex items-center space-x-2">
            <Input type="text" value={referralLink} readOnly className="flex-grow" />
            <Button onClick={copyReferralLinkToClipboard} variant="outline" size="icon">
              {hasCopiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex-grow w-full">
          <p className="text-sm text-gray-600 mb-2">
            Or share this invite code:
          </p>
          <div className="flex items-center space-x-2">
            <Input type="text" value={inviteCode} readOnly className="flex-grow" />
            <Button onClick={copyInviteCodeToClipboard} variant="outline" size="icon">
              {hasCopiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6 mt-6 md:mt-0 bg-white p-2 rounded-lg shadow-sm">
          <QRCode 
            value={referralLink} 
            size={120}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
