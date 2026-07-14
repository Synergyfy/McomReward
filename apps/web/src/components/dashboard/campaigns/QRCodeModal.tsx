import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string | null;
    campaignName: string;
}

export default function QRCodeModal({
    isOpen,
    onClose,
    campaignId,
    campaignName,
}: QRCodeModalProps) {
    if (!campaignId) return null;

    const campaignUrl = `${window.location.origin}/campaigns/${campaignId}`;
    // Using a robust free API for QR generation
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(campaignUrl)}&margin=10`;

    const handleDownload = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${campaignName.replace(/\s+/g, '_')}_QR.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Campaign QR Code</DialogTitle>
                    <DialogDescription className="text-center">
                        Scan this code to view the campaign page.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <div className="relative h-64 w-64 border-4 border-white shadow-lg rounded-xl overflow-hidden bg-white">
                        {/* Displaying the QR Code */}
                        <Image
                            src={qrCodeUrl}
                            alt={`QR Code for ${campaignName}`}
                            layout="fill"
                            objectFit="contain"
                            unoptimized // Important for external API images if domain not configured in next.config.js
                        />
                    </div>

                    <div className="bg-gray-50 px-4 py-2 rounded-md border border-gray-200 w-full text-center">
                        <p className="text-xs text-gray-500 break-all" title={campaignUrl}>
                            {campaignUrl}
                        </p>
                    </div>

                    <Button onClick={handleDownload} className="w-full bg-orange-600 hover:bg-orange-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
