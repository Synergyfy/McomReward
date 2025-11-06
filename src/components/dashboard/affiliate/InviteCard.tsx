'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InviteCardProps {
  referralLink: string;
  qrCodeUrl: string;
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
        <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6 mt-6 md:mt-0">
          <Image src={qrCodeUrl} alt="Referral QR Code" width={120} height={120} />
        </div>
      </CardContent>
    </Card>
  );
}
